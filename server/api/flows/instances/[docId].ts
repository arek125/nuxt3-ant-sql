import { sendError } from 'h3'
import Flow from '~~/server/models/flow';
import User from '~~/server/models/user';
import Stage from '~~/server/models/stage';
import FlowInstance from '~~/server/models/flowInstance';
import Document from '~~/server/models/document';
import Task from '~~/server/models/task';
import TaskAction from '~~/server/models/taskAction';
import { getCurrentUserAbsences } from '~~/server/models/absence';
import sequelize from '~~/server/db';
import transporter from '~~/server/mailbox';
const runtimeConfig = useRuntimeConfig()


export default defineEventHandler(async (event:any) => {
    if (!event.context.auth) {
        return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
    }

    /* get flow inctances */
    if (isMethod(event, 'GET')) {
        const stages:any = await FlowInstance.findAll({where: {documentId: event.context.params.docId}, 
            include: [{
                    model: User,
                    attributes: { exclude: ['password'] }
                },
                {
                    model: Flow,
                    include: [{
                        model: Stage,
                        include: [{
                            model: User,
                            attributes: { exclude: ['password'] }
                        }]
                    }]
                },
                Document,
                {
                    model: Task,
                    include: [{
                        model: User,
                        attributes: { exclude: ['password'] }
                    },
                    {
                        model: TaskAction,
                        include: [
                            {
                                model: User,
                                attributes: { exclude: ['password'] }
                            }
                        ]
                    }
                    ]
                }
            ],
            order:[[Task,'index','ASC']]
        })
        return stages
    }
    // init Flow
    else if (isMethod(event, 'POST')) {
        // if (!event.context.auth.roles.includes('Admin')) {
        //     return sendError(event, createError({statusCode: 403, statusMessage: 'Forbidden'}));
        // }
        let input = await readBody(event);
        const t = await sequelize.transaction();
        try {

            //new way - create all tasks at once
            let flow:any = await Flow.findOne({where: {id: input.flowId}})
            let flowInstance:any = await FlowInstance.create({flowId: input.flowId, userId: event.context.auth.id, documentId: event.context.params.docId, status: 'In progress', currentIndex: 0, type: flow.type}, { transaction: t })
            let stages:any = await Stage.findAll({where:{flowId: flowInstance.flowId},order:[['index','ASC']]})
            //let stages = input.flowStages
            let mailsOptions:any = []

            for(const stage of stages){
                let task:any = await Task.create({
                    title: stage.name, 
                    status: stage.index == 0 || flow.type == 'AllAtOnce'?'New':'Pending', 
                    flowInstanceId: flowInstance.id, 
                    index: stage.index,
                    type: stage.type,
                    notificationTitle: stage.notificationTitle,
                    notificationBody: stage.notificationBody,
                    percentToComplete: stage.percentToComplete,
                    assignType: stage.assignType,
                    assignBeforeIndex: stage.assignBeforeIndex
                }, { transaction: t })
                // let taskUsers = await stage.getUsers()
                // await task.setUsers(taskUsers, { transaction: t })
                let taskUsers:any = []
                let stageForm = input.flowStages.find(x=>x.index==stage.index)
                if(stageForm.usersId.length){
                    for(const userId of stageForm.usersId){
                        const user:any = await User.findOne({where:{id: userId}})
                        taskUsers.push(user)
                    }
                }else taskUsers = await stage.getUsers()
                //check abcances:
                if(stage.index == 0 || flow.type == 'AllAtOnce')
                    for(const taskUser of taskUsers){
                        const absences:any = await getCurrentUserAbsences(taskUser.id)
                        for(const absence of absences){
                            if(!taskUsers.find(x=>x.id == absence.deputyId)){
                                const deputy = await User.findOne({where:{id: absence.deputyId}})
                                taskUsers.push(deputy)
                                if(stage.type == 'PercentAction')taskUsers = taskUsers.filter(x=>x.id !== absence.userId)
                            }else if(stage.type == 'PercentAction')taskUsers = taskUsers.filter(x=>x.id !== absence.userId)
                        }
                    }
                await task.setUsers(taskUsers, { transaction: t })
                if(stage.index == 0 || flow.type == 'AllAtOnce'){
                    let mails = taskUsers.map(x=>x.email)
                    mailsOptions.push({
                        to: mails.join(';'),
                        subject: stage.notificationTitle.replaceAll('[name]',stage.name),
                        html: stage.notificationBody.replaceAll('[link]',runtimeConfig.HOST+'/docs/doc-'+event.context.params.docId+'?taskId='+task.id)
                    })
                }
            }
            await Document.update({send: true,status: 'In progress'}, { where: {id: event.context.params.docId}, transaction: t })
            await t.commit();
            for(const mailOptions of mailsOptions)
                transporter.sendMail(mailOptions)
            return flowInstance

        } catch (err:any) {
            console.log(err)
            await t.rollback();
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }

    }
    else return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
})