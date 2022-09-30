
import { sendError } from 'h3'
import Outcome from '../../models/outcome';

export default defineEventHandler(async (event) => {
    if (!event.context.auth) {
        return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
    }

    /* /api/outcomes */
    
    if (isMethod(event, 'GET')) {
        const items:any = await Outcome.findAll()
        return items
    }
    else if (isMethod(event, 'POST')) {
        if (!event.context.auth.roles.includes('Admin')) {
            return sendError(event, createError({statusCode: 403, statusMessage: 'Forbidden'}));
        }
        let input = await useBody(event);
        try{
            delete input.id
            let item:any = await Outcome.create(input)
            return item
        }catch(err){
            console.log(err)
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }

    }
    else return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
})