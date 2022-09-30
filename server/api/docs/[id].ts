
import { sendError } from 'h3'

import { Op } from "sequelize";
import Document from '~~/server/models/document'
import sequelize from '~~/server/db';

export default defineEventHandler(async (event) => {
    if (!event.context.auth) {
        return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
    }
    const adminMode = event.context.auth.roles.includes('Admin')
    if(isMethod(event, 'GET')) {
        const doc:any = await Document.findOne({where: {id: event.context.params.id}})
       
        return doc
    }
    else if (isMethod(event, 'POST')) {
        const input = await useBody(event);
        //const t = await sequelize.transaction();
        try{
            // const {id, send, ...input_} = input
            // const currDoc:any = await Document.findOne({where: {id: event.context.params.id}})
            // let doc:any = await Document.update({...input_}, { where: {
            //     id: event.context.params.id,
            // }, transaction: t })
            
            // if(send && !currDoc.send){
            //     await initFlow(input,doc,t)
            // }
            // await t.commit();

            let doc:any = await Document.update({input}, { where: {
                id: event.context.params.id,
            }})
            return doc
        }catch(err){
            console.log(err)
            //await t.rollback();
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }
    }
    else if (isMethod(event, 'DELETE')) {
        //await User.findByIdAndDelete(event.context.params.id)
        await Document.destroy({
            where: {
              id: event.context.params.id
            }
          });
        return { success: true };
    }
    else return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
})