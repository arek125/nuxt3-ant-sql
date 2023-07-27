
import { sendError } from 'h3'

import Flow from '../../models/flow'
import Stage from '../../models/stage'
import User from '../../models/user'
import sequelize from '~~/server/db';


export default defineEventHandler(async (event:any) => {
    if (!event.context.auth) {
        return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
    }
    const adminMode = event.context.auth.roles.includes('Admin')
    if (!adminMode) {
        return sendError(event, createError({statusCode: 403, statusMessage: 'Forbidden'}));
    }
    if(isMethod(event, 'GET')) {
        const flow:any = await Flow.findOne({where: {id: event.context.params.id}})
       
        return flow
    }
    else if (isMethod(event, 'POST')) {
        const input = await readBody(event);
        const t = await sequelize.transaction();
        let {stages,createdAt, updatedAt,key,id, ...flowInput} = input
        try{
            console.log(flowInput,event.context.params.id)
            //let flowUp = await Flow.update({flowInput}, {where: { id: parseInt(event.context.params.id)} }) // { where: {id: input.id} }

            let flow:any = await Flow.findOne({where: {id: event.context.params.id},include: [Stage]})
            //console.log(flowUp)
            //console.log(flow)
            if(flow){
                //await flow.update({flowInput})
                //flow= flowInput.name
                for (const [key, value] of Object.entries(flowInput)) {
                    flow[key] = value
                }
                flow = await flow.save({transaction: t})
            }

            for(let stage of stages){
                //let {users, createdAt, updatedAt, flowId, ...stage_} = stage
                //console.log(stage_)
                Object.keys(stage).forEach(key=> {
                    if(stage[key] === '') stage[key] = null
                })
                if(stage.id){
                    let stageI:any = await Stage.findOne({where: {id: stage.id},include: [User]})
                    // stageI.index = stage.index
                    // stageI.name = stage.name
                    // stageI.type = stage.type
                    // stageI = await stageI.save({transaction: t})
                    stageI = await stageI.update(stage,{transaction: t})
                    await stageI.setUsers(stage.users,{transaction: t})
                }
                // if(stage.id) await Stage.update({stage_},{ where: {
                //     id: stage.id,
                // }, transaction: t})
                else {
                    console.log(stage)
                    let newStage:any = await Stage.create(stage,{ transaction: t})
                    await flow.addStage(newStage,{transaction: t})
                    await newStage.setUsers(stage.users,{transaction: t})
                }
            }
            if(await flow.countStages() != stages.length){
                let currentStages = await flow.getStages()
                for(const cstage of currentStages){
                    let stageEx = await stages.find((x:any)=>x.id == cstage.id)
                    if(!stageEx)await Stage.destroy({
                        where: {
                          id: cstage.id
                        },
                        transaction: t
                    });
                }
            }
            await t.commit()
            return flow
        }catch(err:any){
            console.log(err)
            //await t.rollback();
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }
    }
    else if (isMethod(event, 'DELETE')) {
        //await User.findByIdAndDelete(event.context.params.id)
        const t = await sequelize.transaction();
        try{
            let stages:any = await Stage.findAll({where: {flowId: event.context.params.id},include: [User]})
            for(let stage of stages){
                await stage.setUsers([],{transaction: t})
                await stage.destroy({transaction: t})
            }
            //let flow:any = await Flow.findOne({where: {id: event.context.params.id},include: [Stage]})
            //await flow.removeStages({transaction: t})
            // await Stage.destroy({
            //     where: {
            //       flowId: event.context.params.id
            //     }
            //   });
            await Flow.destroy({
                where: {
                id: event.context.params.id
                },transaction: t
            });
            await t.commit()
            return { success: true };
        }catch(err:any){
            console.log(err)
            await t.rollback();
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }
    }
    else return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
})