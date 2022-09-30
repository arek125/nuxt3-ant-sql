
import { sendError } from 'h3'

import Task from '~~/server/models/task'
import TaskAction from '~~/server/models/taskAction';
import User from '~~/server/models/user';
import Flow from '~~/server/models/flow';
import Stage from '~~/server/models/stage';
import FlowInstance from '~~/server/models/flowInstance';
import sequelize from '~~/server/db';

export default defineEventHandler(async (event) => {
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
        const input = await useBody(event);
        const currentTask:any = await Task.findOne({where: {id: event.context.params.id},include: [{
            model: User,
            attributes: { exclude: ['password'] }
        }]})
        if(!currentTask.users.find(x=>x.id == event.context.auth.id))
            return sendError(event, createError({statusCode: 403, statusMessage: 'Task not assigned to you !'}));

        const flowInstance:any = await FlowInstance.findOne({where: {id: currentTask.flowInstanceId}, 
            include: [
                {
                    model: Flow,
                    include: [{
                        model: Stage,
                    }]
                },
                {
                    model: Task,
                    include: [{
                        model: User,
                        attributes: { exclude: ['password'] }
                    }]
                }
            ]
        })
        console.log(input)
        const t = await sequelize.transaction();
        try{
            if(!input.outcomeId)throw 'Provide Outcome !'
            TaskAction.create({comment: input.comment, taskId: currentTask.id, userId: event.context.auth.id, outcomeId: input.outcomeId},{ transaction: t })
            const stage = flowInstance.flow.stages[flowInstance.currentIndex]
            if(stage.type = 'OneAction'){
                const task =  await Task.update({status: 'Completed', outcomeId: input.outcomeId}, { where: {
                    id: currentTask.id,
                }, transaction: t})
                const nextIndex = flowInstance.currentIndex+=1
                const endFlow = flowInstance.flow.stages.length == nextIndex || input.outcomeId == 2
                await FlowInstance.update({status: endFlow?'Completed':undefined,currentIndex: nextIndex},{ where: {
                    id: flowInstance.id,
                }, transaction: t})
                if(!endFlow){
                    const nextStage = flowInstance.flow.stages[nextIndex]
                    let task:any = await Task.create({title: nextStage.name, status: 'New', flowInstanceId: flowInstance.id}, { transaction: t })
                    let taskUsers = await nextStage.getUsers()
                    await task.setUsers(taskUsers, { transaction: t })
                }
                await t.commit();
                return task
            }

            throw 'Stage type not defined !'
        }catch(err){
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