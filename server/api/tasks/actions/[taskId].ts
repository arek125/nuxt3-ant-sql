
import { sendError } from 'h3'
import Outcome from '~~/server/models/outcome';

import TaskAction from '~~/server/models/taskAction';
import User from '~~/server/models/user';

export default defineEventHandler(async (event) => {
    if (!event.context.auth) {
        return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
    }
    const adminMode = event.context.auth.roles.includes('Admin')
    if(isMethod(event, 'GET')) {
        const doc:any = await TaskAction.findAll({where: {taskId: event.context.params.taskId},include: [{
            model: User,
            attributes: { exclude: ['password'] }
        },
        Outcome,

        ]})
       
        return doc
    }

    // else if (isMethod(event, 'DELETE')) {
    //     await TaskAction.destroy({
    //         where: {
    //             taskId: event.context.params.id
    //         }
    //       });
    //     return { success: true };
    // }
    else return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
})