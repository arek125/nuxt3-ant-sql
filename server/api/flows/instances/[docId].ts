import { sendError } from 'h3'
import Flow from '~~/server/models/flow';
import User from '~~/server/models/user';
import Stage from '~~/server/models/stage';
import FlowInstance from '~~/server/models/flowInstance';
import Document from '~~/server/models/document';
import Task from '~~/server/models/task';
import sequelize from '~~/server/db';

export default defineEventHandler(async (event) => {
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
                    }]
                }
            ]
        })
        return stages
    }
    // init Flow
    else if (isMethod(event, 'POST')) {
        // if (!event.context.auth.roles.includes('Admin')) {
        //     return sendError(event, createError({statusCode: 403, statusMessage: 'Forbidden'}));
        // }
        let input = await useBody(event);
        const t = await sequelize.transaction();
        console.log('TEST')
        try {
            let flowInstance:any = await FlowInstance.create({flowId: input.flowId, userId: event.context.auth.id, documentId: event.context.params.docId, status: 'In progress', currentIndex: 0}, { transaction: t })
            let stage:any = await Stage.findOne({where:{index: flowInstance.currentIndex, flowId: flowInstance.flowId}})
            if(!stage) throw 'Initial stage not found !'
            let task:any = await Task.create({title: stage.name, status: 'New', flowInstanceId: flowInstance.id}, { transaction: t })
            let taskUsers = await stage.getUsers()
            await task.setUsers(taskUsers, { transaction: t })
            await Document.update({send: true}, { where: {id: event.context.params.docId}, transaction: t })
            await t.commit();
            return flowInstance

        } catch (err) {
            console.log(err)
            await t.rollback();
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }

    }
    else return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
})