//import { IncomingMessage, ServerResponse } from 'http'
import { sendError } from 'h3'
import Document from '../../models/document';
import sequelize from '~~/server/db';
import { Op } from "sequelize";

export default defineEventHandler(async (event) => {
    if (!event.context.auth) {
        return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
    }
    const adminMode = event.context.auth.roles.includes('Admin')

    /* /api/users */
    
    if (isMethod(event, 'GET')) {
        // const query = useQuery(event)
        // let pageSize = parseInt(query.pageSize.toString())

        const query = useQuery(event)

        let pageSize = query.pageSize?parseInt(query.pageSize.toString()):10
        let page = query.page?parseInt(query.page.toString()):0
        // let sortObject = {};
        // sortObject[query.stype?query.stype.toString():'name'] = query.sdir?query.sdir.toString():'asc';
        let orderCol = query.sortField?query.sortField.toString():'title';
        let orderDir = query.sortOrder=='ascend'?'ASC':'DESC';
        //const users = await User.find().select('_id name email role active').limit(pageSize).skip(pageSize * page).sort(sortObject)
        let whereObj = {}
        for (const key in query){
            if(key.startsWith('filter_')){
                whereObj[key.split('_')[1]] = {[Op.like]: '%' + query[key] + '%'}
            }
        }
        try{
            if(query.count)return await Document.count({where: whereObj})
            return await Document.findAll({limit: pageSize,offset: pageSize * page,order:[[orderCol,orderDir]],where: whereObj})
        }
        catch(err){
            console.log(err)
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }
    }
    else if (isMethod(event, 'POST')) {
        // if (!adminMode) {
        //     return sendError(event, createError({statusCode: 403, statusMessage: 'Forbidden'}));
        // }
        let input = await useBody(event);
        const t = await sequelize.transaction();
        try{
            // const {id, send, ...input_} = input
            // let doc:any = await Document.create({...input_,send: false, userId: event.context.auth.id, status: 'In progress'}, { transaction: t })
            // if(send){
            //     await initFlow(input,doc,t)
            // }
            // await t.commit();

            delete input.id
            let doc:any = await Document.create({...input, userId: event.context.auth.id, status: 'In progress'})
            return doc
        }catch(err){
            console.log(err)
            await t.rollback();
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }

    }
    else return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
})