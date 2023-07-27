//import { IncomingMessage, ServerResponse } from 'http'
import { sendError } from 'h3'

export default defineEventHandler(async (event) => {
    if (!event.context.auth) {
        return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
    }
    const adminMode = event.context.auth.roles.includes('Admin')
    
    /* /api/users */
if (isMethod(event, 'POST')) {
        try{
            const file = event.context.multipart.file
            return {name: file.name, type: file.type, tmppath: file.path}

        }catch(err:any){
            console.log(err)
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }

    }
    else return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
})