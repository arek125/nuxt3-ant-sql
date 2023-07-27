
import { sendError } from 'h3'

import Task from '~~/server/models/task'
import TaskAction from '~~/server/models/taskAction';
import User from '~~/server/models/user';
import Flow from '~~/server/models/flow';
import Stage from '~~/server/models/stage';
import FlowInstance from '~~/server/models/flowInstance';
import Document from '~~/server/models/document';
import {getCurrentUserAbsences} from '~~/server/models/absence';
import sequelize from '~~/server/db';
import transporter from '~~/server/mailbox';
const runtimeConfig = useRuntimeConfig()

async function nextOrFinish(endFlow:boolean,flowInstance:any,t:any){
    const nextIndex = flowInstance.currentIndex+=1
    //const stage = flowInstance.flow.stages[flowInstance.currentIndex]
    endFlow = flowInstance.flow.stages.length == nextIndex || endFlow
    await FlowInstance.update({status: endFlow?'Completed':undefined,currentIndex: nextIndex},{ where: {id: flowInstance.id}, transaction: t})
    if(endFlow){
        await Document.update({status: 'Completed'}, { where: {id: flowInstance.document.id}, transaction: t })
        await Task.destroy({
            where: {
                flowInstanceId: flowInstance.id,
                status: 'Pending'
            },
            transaction: t
        })
    }
    else if(flowInstance.type == 'OneByOne'){
        await Task.update({status: 'New'}, { where: {index: nextIndex, flowInstanceId: flowInstance.id}, transaction: t})
        const task:any = await Task.findOne({where: {index: nextIndex, flowInstanceId: flowInstance.id}})
        let taskUsers = await task.getUsers()
        for(const taskUser of taskUsers){
            const absences:any = await getCurrentUserAbsences(taskUser.id)
            for(const absence of absences){
                let user:any = await User.findOne({where:{id: absence.userId}})
                if(!taskUsers.find(x=>x.id == absence.deputyId)){
                    const deputy = await User.findOne({where:{id: absence.deputyId}})
                    //deputes.push(deputy)
                    await task.addUser(deputy)
                    if(task.type == 'PercentAction')
                        await task.removeUser(user, { transaction: t })
                }else if(task.type == 'PercentAction')await task.removeUser(user, { transaction: t })
            }
        }
        //if(deputes.length)await task.setUsers(deputes, { transaction: t })
        taskUsers = await task.getUsers()
        let mails = taskUsers.map(x=>x.email)
        transporter.sendMail({
            to: mails.join(';'),
            subject: task.notificationTitle.replaceAll('[name]',task.title),
            html: task.notificationBody.replaceAll('[link]',runtimeConfig.HOST+'/docs/doc-'+flowInstance.document.id+'?taskId='+task.id)                    
        });
    }
    return true
}


export default defineEventHandler(async (event:any) => {
    if (!event.context.auth) {
        return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
    }
    const adminMode = event.context.auth.roles.includes('Admin')
    if(isMethod(event, 'GET')) {
        const doc:any =await Task.findOne({where: {id: event.context.params.id},include: [{
            model: User,
            attributes: { exclude: ['password'] }
        }]})
        if(!doc)return sendError(event, createError({statusCode: 404, statusMessage: 'Item Not found'}))
        return doc
    }
    else if (isMethod(event, 'POST')) {
        const input = await readBody(event);
        const currentTask:any = await Task.findOne({where: {id: event.context.params.id},include: [{
            model: User,
            attributes: { exclude: ['password'] }
        }]})
        if(!currentTask.users.find((x:any)=>x.id == event.context.auth.id))
            return sendError(event, createError({statusCode: 403, statusMessage: 'Task not assigned to you !'}));

        const flowInstance:any = await FlowInstance.findOne({where: {id: currentTask.flowInstanceId}, 
            include: [
                {
                    model: Flow,
                    include: [{
                        model: Stage,
                    }]
                },
                Document,
                {
                    model: Task,
                    include: [{
                        model: User,
                        attributes: { exclude: ['password'] }
                    }]
                }
            ]
        })
        if(flowInstance.flow.stages.length != flowInstance.currentIndex+1){
            const nextTask:any = await Task.findOne({ where: {index: flowInstance.currentIndex+1, flowInstanceId: flowInstance.id},include: User})
            if(!nextTask.users.length)return sendError(event, createError({statusCode: 400, statusMessage: "Users for next stage not set ?!"}));
        }
        //console.log(input)
        const t = await sequelize.transaction();
        try{
            if(!input.outcomeId)throw 'Provide Outcome !'
            TaskAction.create({comment: input.comment, taskId: currentTask.id, userId: event.context.auth.id, outcomeId: input.outcomeId},{ transaction: t })
            //const stage = flowInstance.flow.stages[flowInstance.currentIndex]
            //const nextIndex = flowInstance.currentIndex+=1
            if(currentTask.type == 'OneAction'){
                const task =  await Task.update({status: 'Completed', outcomeId: input.outcomeId}, { where: {id: currentTask.id,}, transaction: t, returning: true})
                await nextOrFinish(input.outcomeId == 2,flowInstance,t)
                await t.commit()
                return task
            }else if(currentTask.type == 'PercentAction'){
                const taskActions = await TaskAction.findAll({where: {taskId: event.context.params.id}})
                if(taskActions.filter((x:any)=>x.userId == event.context.auth.id).length) throw 'You already react to this task !'
                const currentTask:any = await Task.findOne({where: {id: event.context.params.id}})
                const taskUsers = currentTask?await currentTask.getUsers():[]
                const approvedActionsCount = taskActions.filter((x:any)=>x.outcomeId == 1).length + (input.outcomeId == 1?1:0)
                const percentApprove = approvedActionsCount / taskUsers.length * 100
                let task,endFlow = false
                if(!currentTask.percentToComplete) throw 'Percent not defined !'
                //console.log('!!!!!!!!!!!',approvedActionsCount,taskUsers.length,percentApprove,stage.percentToComplete)
                if(percentApprove >= currentTask.percentToComplete)
                    task = await Task.update({status: 'Completed', outcomeId: 1}, { where: {id: currentTask.id,}, transaction: t, returning: true})
                else if ((taskActions.length + 1) == taskUsers.length){
                    task = await Task.update({status: 'Completed', outcomeId: 2}, { where: {id: currentTask.id,}, transaction: t, returning: true})
                    endFlow = true
                }
                else await Task.update({status: 'In progress'}, { where: {id: currentTask.id,}, transaction: t})
                if(task){
                    await nextOrFinish(endFlow,flowInstance,t)
                }
                await t.commit()
                return true
            }

            throw 'Stage type not defined !'
        }catch(err:any){
            console.log(err)
            await t.rollback();
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }
    }
    // else if (isMethod(event, 'DELETE')) {
    //     await Document.destroy({
    //         where: {
    //           id: event.context.params.id
    //         }
    //       });
    //     return { success: true };
    // }
    else return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
})