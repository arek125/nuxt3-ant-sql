//import { IncomingMessage, ServerResponse } from 'http'
import { sendError } from 'h3'
import Task from '../../models/task';
import flowInctance from '../../models/flowInstance';
import outcome from '../../models/outcome';
import doc from '../../models/document';
import flow from '../../models/flow';
import user from '../../models/user';

//import sequelize from '~~/server/db';
import { Op } from "sequelize";

export default defineEventHandler(async (event) => {
    if (!event.context.auth) {
        return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
    }
    const adminMode = event.context.auth.roles.includes('Admin')

    /* /api/users */
    
    if (isMethod(event, 'GET')) {
        const query = useQuery(event)
        let pageSize = query.pageSize?parseInt(query.pageSize.toString()):10
        let page = query.page?parseInt(query.page.toString()):0
        let orderCol = query.sortField?query.sortField.toString():'title';
        let orderDir = query.sortOrder=='ascend'?'ASC':'DESC';
        let whereObj = {}
        for (const key in query){
            if(key.startsWith('filter_')){
                let whereKey = key.split('_')[1]
                if(whereKey.includes('.'))whereKey = '$'+whereKey+'$'
                whereObj[whereKey] = {[Op.iLike]: '%' + query[key] + '%'}
            }
            else if(key.startsWith('filterExt_')){
                whereObj['$'+ key.split('_')[1]+'$'] = {[Op.iLike]: '%' + query[key] + '%'}
            }
        }
        try{
            if(query.count)return await Task.count({where: whereObj,include:[{model: flowInctance, required: true,include:[{model: doc, required: true},flow]},{model: outcome, required: true},{
                model: user,
                attributes: { exclude: ['password'] },
                required: true,
                duplicating: false
            }]})
            return await Task.findAll({limit: pageSize,offset: pageSize * page,order:[[orderCol,orderDir]],where: whereObj, include:[{model: flowInctance,required: true,include:[{model: doc, required: true},flow]},{model: outcome, required: true},{
                model: user,
                attributes: { exclude: ['password'] },
                required: true,
                duplicating: false
            }]})
        }
        catch(err){
            console.log(err)
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }
    }
    // else if (isMethod(event, 'POST')) {
    //     let input = await useBody(event);
    //     const t = await sequelize.transaction();
    //     try{
    //         delete input.id
    //         let doc:any = await Document.create({...input, userId: event.context.auth.id, status: 'In progress'})
    //         return doc
    //     }catch(err){
    //         console.log(err)
    //         await t.rollback();
    //         return sendError(event, createError({statusCode: 400, statusMessage: err}));
    //     }

    // }
    else return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
})