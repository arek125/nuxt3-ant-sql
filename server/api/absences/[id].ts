//import { IncomingMessage, ServerResponse } from 'http'
import { sendError } from 'h3'
import Absence from '~~/server/models/absence';
import User from '~~/server/models/user';
//import sequelize from '~~/server/db';

export default defineEventHandler(async (event:any) => {
    if (!event.context.auth) {
        return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
    }
    const adminMode = event.context.auth.roles.includes('Admin')

    /* /api/users */
    
    if (isMethod(event, 'GET')) {
        try{
            return await Absence.findOne({where: {id: event.context.params.id},include: [
                { 
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['password'] },
                    required: true,
                },
                { 
                    model: User,
                    as: 'deputy',
                    attributes: { exclude: ['password'] },
                    required: true,
                }
            ]
            })
        }
        catch(err:any){
            console.log(err)
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }
    }
    else if (isMethod(event, 'POST')) {
        // if (!adminMode) {
        //     return sendError(event, createError({statusCode: 403, statusMessage: 'Forbidden'}));
        // }
        let {id, ...input} = await readBody(event);
        let allow = false
        if (adminMode) {
            allow = true
        }
        else if(event.context.auth.id == input.user.id){
            allow = true
        }
        if(!allow)return sendError(event, createError({statusCode: 403, statusMessage: 'Forbidden'}));
        //const t = await sequelize.transaction();
        try{
            let abs:any = await Absence.update({...input}, { where: { id: event.context.params.id, }})
            return abs
        }catch(err:any){
            console.log(err)
            //await t.rollback();
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }

    }
    else if (isMethod(event, 'DELETE')){
        let allow = false
        let absDoc:any = await Absence.findOne({where: {id: event.context.params.id}})
        if (adminMode) {
            allow = true
        }
        else if(absDoc && event.context.auth.id == absDoc.userId){
            allow = true
        }
        if(!allow)return sendError(event, createError({statusCode: 403, statusMessage: 'Forbidden'}));
        try{
            let abs:any = await Absence.destroy( { where: { id: event.context.params.id, }})
            return abs
        }catch(err:any){
            console.log(err)
            //await t.rollback();
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }
    }
    else return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
})