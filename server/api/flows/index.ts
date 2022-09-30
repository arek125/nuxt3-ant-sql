
import { sendError } from 'h3'
import Flow from '../../models/flow';

export default defineEventHandler(async (event) => {
    if (!event.context.auth) {
        return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
    }

    /* /api/flows */
    
    if (isMethod(event, 'GET')) {
        const roles:any = await Flow.findAll()
        return roles
    }
    else if (isMethod(event, 'POST')) {
        if (!event.context.auth.roles.includes('Admin')) {
            return sendError(event, createError({statusCode: 403, statusMessage: 'Forbidden'}));
        }
        let input = await useBody(event);
        try{
            delete input.id
            let flow:any = await Flow.create(input)
            return flow
        }catch(err){
            console.log(err)
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }

    }
    else return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
})