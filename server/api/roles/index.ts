
import { sendError } from 'h3'
import Role from '../../models/role';

export default defineEventHandler(async (event) => {
    if (!event.context.auth) {
        return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
    }

    /* /api/roles */
    
    if (isMethod(event, 'GET')) {
        const roles:any = await Role.findAll()
        return roles
    }
    else if (isMethod(event, 'POST')) {
        if (!event.context.auth.roles.includes('Admin')) {
            return sendError(event, createError({statusCode: 403, statusMessage: 'Forbidden'}));
        }
        let input = await useBody(event);
        try{
            delete input.id
            let role:any = await Role.create(input)
            return role
        }catch(err){
            console.log(err)
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }

    }
    else return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
})