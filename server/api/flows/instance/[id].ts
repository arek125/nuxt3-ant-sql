import FlowInstance from "~~/server/models/flowInstance";
import Document from "~~/server/models/document";
import Task from "~~/server/models/task";
import sequelize from '~~/server/db';

export default defineEventHandler(async (event:any) => {
    if (!event.context.auth) {
        return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
    }
    const adminMode = event.context.auth.roles.includes('Admin')
    //cancel flow
    if (isMethod(event, 'DELETE')) {
        const t = await sequelize.transaction();
        try{
            const flowInstance:any = await FlowInstance.findOne({where:{id: event.context.params.id}})
            if(adminMode || flowInstance.userId == event.context.auth.id){
                await FlowInstance.update({status: 'Canceled'},{ where: {id: event.context.params.id}, transaction: t})
                await Document.update({status: 'Canceled'}, { where: {id: flowInstance.documentId}, transaction: t })
                await Task.destroy({
                    where: {
                        flowInstanceId: event.context.params.id,
                        status: { $ne: 'Completed' }
                    },
                    transaction: t
                })
                t.commit()
                return {success: true}
            }
            else 
                throw "Forbiden"
            
        }catch(err:any){
            console.error(err)
            t.rollback()
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }
        
    }
})