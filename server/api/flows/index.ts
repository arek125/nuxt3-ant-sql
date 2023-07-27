
//import { sendError } from 'h3'
import Flow from '../../models/flow';
import Stage from '../../models/stage'
import User from '../../models/user'
import sequelize from '~~/server/db';

export default defineEventHandler(async (event) => {
    if (!event.context.auth) {
        return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
    }

    /* /api/flows */
    
    if (isMethod(event, 'GET')) {
        const query = getQuery(event)
        const flows:any = await Flow.findAll({
            include: {
                model: Stage,
                include: [{
                    model: User,
                    attributes: { exclude: ['password'] }
                }]
            },
            order: [[{model: Stage},'index', 'ASC']],
            where: query.active?{active: !!query.active}:undefined
        })
        return flows
    }
    else if (isMethod(event, 'POST')) {
        if (!event.context.auth.roles.includes('Admin')) {
            return sendError(event, createError({statusCode: 403, statusMessage: 'Forbidden'}));
        }
        let input = await readBody(event);
        const t = await sequelize.transaction();
        try{
            delete input.id
            let {stages, ...flow} = input
            let flowI:any = await Flow.create(flow,{ transaction: t})
            for(let stage of stages){
                let newStage:any = await Stage.create(stage,{ transaction: t})
                await flowI.addStage(newStage,{transaction: t})
                await newStage.setUsers(stage.users,{transaction: t})
            }
            await t.commit()
            return flowI
        }catch(err:any){
            console.log(err)
            await t.rollback()
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }

    }
    else return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
})