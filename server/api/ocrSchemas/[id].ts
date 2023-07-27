import OcrSchema from '../../models/ocrSchema';
import OcrArea from '../../models/ocrArea'
import sequelize from '~~/server/db';


export default defineEventHandler(async (event:any) => {
    if (!event.context.auth) {
        return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
    }
    // const adminMode = event.context.auth.roles.includes('Admin')
    // if (!adminMode) {
    //     return sendError(event, createError({statusCode: 403, statusMessage: 'Forbidden'}));
    // }
    if(isMethod(event, 'GET')) {
        const ocrSchema:any = await OcrSchema.findOne({where: {id: event.context.params.id}})
        return ocrSchema
    }
    else if (isMethod(event, 'POST')) {
        const input = await readBody(event);
        const t = await sequelize.transaction();
        let {areas,createdAt, updatedAt,id, ...schemaInput} = input
        try{
            let schema:any = await OcrSchema.findOne({where: {id: event.context.params.id},include: [OcrArea]})
            if(schema){
                for (const [key, value] of Object.entries(schemaInput)) {
                    schema[key] = value
                }
                schema = await schema.save({transaction: t})
            }

            for(let area of areas){
                Object.keys(area).forEach(key=> {
                    if(area[key] === '') area[key] = null
                })
                if(area.id){
                    let areaI:any = await OcrArea.findOne({where: {id: area.id}})
                    areaI = await areaI.update(area,{transaction: t})
                }
                else {
                    let newArea:any = await OcrArea.create(area,{ transaction: t})
                    await schema.addOcrArea(newArea,{transaction: t})
                }
            }
            if(await schema.countOcrAreas() != areas.length){
                let currentAreas = await schema.getOcrAreas()
                for(const cArea of currentAreas){
                    let areaEx = await areas.find((x:any)=>x.id == cArea.id)
                    if(!areaEx)await OcrArea.destroy({
                        where: {
                          id: cArea.id
                        },
                        transaction: t
                    });
                }
            }
            await t.commit()
            return schema
        }catch(err:any){
            console.log(err)
            await t.rollback();
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }
    }
    else if (isMethod(event, 'DELETE')) {
        const t = await sequelize.transaction();
        try{
            let areas:any = await OcrArea.findAll({where: {flowId: event.context.params.id}})
            for(let area of areas){
                await area.destroy({transaction: t})
            }
            await OcrSchema.destroy({
                where: {
                    id: event.context.params.id
                },
                transaction: t
            });
            await t.commit()
            return { success: true };
        }catch(err:any){
            console.log(err)
            await t.rollback()
            return sendError(event, createError({statusCode: 400, statusMessage: err}))
        }
    }
    else return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
})