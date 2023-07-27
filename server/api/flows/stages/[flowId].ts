import { sendError } from 'h3'
import Flow from '~~/server/models/flow';
import User from '~~/server/models/user';
import Stage from '~~/server/models/stage';

export default defineEventHandler(async (event:any) => {
    if (!event.context.auth) {
        return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
    }

    /* /api/flows */
    if (isMethod(event, 'GET')) {
        const stages:any = await Stage.findAll({where: {flowId: event.context.params.flowId}, 
            include: [{
                    model: User,
                    attributes: { exclude: ['password'] }
                },
                Flow
            ],
            order: [['index', 'ASC']]
        })
        return stages
    }
    else if (isMethod(event, 'POST')) {
        if (!event.context.auth.roles.includes('Admin')) {
            return sendError(event, createError({statusCode: 403, statusMessage: 'Forbidden'}));
        }
        let input = await readBody(event);
        try{
            delete input.id
            let stage:any = await Stage.create({...input, flowId: event.context.params.flowId})
            return stage
        }catch(err:any){
            console.log(err)
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }

    }
    else return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
})