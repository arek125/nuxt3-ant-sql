//import { IncomingMessage, ServerResponse } from 'http'
import { sendError } from 'h3'
import Absence from '~~/server/models/absence';
import User from '~~/server/models/user';
import Task from '~~/server/models/task';
import sequelize from '~~/server/db';
import { Transaction } from 'sequelize';

export default defineEventHandler(async (event) => {
    if (!event.context.auth) {
        return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
    }
    const adminMode = event.context.auth.roles.includes('Admin')

    /* /api/users */
    
    if (isMethod(event, 'GET')) {

        const query = getQuery(event)
        // let pageSize = query.pageSize?parseInt(query.pageSize.toString()):10
        // let page = query.page?parseInt(query.page.toString()):0
        // let orderCol = query.sortField?query.sortField.toString():'title';
        // let orderDir = query.sortOrder=='ascend'?'ASC':'DESC';
        // let whereObj = query.filters?qs.parse(query.filters, { delimiter: ';' }):{};
        try{
            return await Absence.findAll({include: [
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
            ],
            where: {
                to: {
                    $gte: query.from
                },
                from:{
                    $lte: query.to
                }
            }
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
        else if(event.context.auth.id == input.userId){
            allow = true
        }
        if(!allow)return sendError(event, createError({statusCode: 403, statusMessage: 'Forbidden'}));
        const t = await sequelize.transaction();
        try{
            // const {id, send, ...input_} = input
            // let doc:any = await Document.create({...input_,send: false, userId: event.context.auth.id, status: 'In progress'}, { transaction: t })
            // if(send){
            //     await initFlow(input,doc,t)
            // }
            // await t.commit();

            let abs:any = await Absence.create({...input}, { transaction: t })
            let now = new Date()
            let from = new Date(input.from)
            let to = new Date(input.to);to.setHours(24,0)
            console.log("Dates:------------------->",from,to)
            if(now >= from && now <= to){
                const tasks:any = await Task.findAll({where: {
                        status: {$ne: "Completed"},
                        "$users.id$": input.userId
                    },
                    include: User
                })
                let deputy:any = await User.findOne({where:{id: input.deputyId}})
                let user:any = await User.findOne({where:{id: input.userId}})
                for(const task of tasks){
                    if(!task.users.find((x:any)=>x.id == deputy.id)){
                        await task.addUser(deputy, { transaction: t })
                        if(task.type == 'PercentAction')
                            await task.removeUser(user, { transaction: t })
                    }else if(task.type == 'PercentAction')await task.removeUser(user, { transaction: t })
                }
            }
            await t.commit();
            return abs
        }catch(err:any){
            console.log(err)
            await t.rollback();
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }

    }
    else return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
})