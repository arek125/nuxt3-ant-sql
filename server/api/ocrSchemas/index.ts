
//import { sendError } from 'h3'
import OcrSchema from '../../models/ocrSchema';
import OcrArea from '../../models/ocrArea'
import sequelize from '~~/server/db';

export default defineEventHandler(async (event) => {
    if (!event.context.auth) {
        return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
    }

    /* /api/ocrSchemas */
    
    if (isMethod(event, 'GET')) {
        const query = getQuery(event)
        const schamas:any = await OcrSchema.findAll({
            include: {
                model: OcrArea,
            },
            where: query.name?{name: {$iLike: '%'+query.name+'%'}}:undefined,
            limit: 30
        })
        return schamas
    }
    else if (isMethod(event, 'POST')) {
        // if (!event.context.auth.roles.includes('Admin')) {
        //     return sendError(event, createError({statusCode: 403, statusMessage: 'Forbidden'}));
        // }
        let input = await readBody(event);
        const t = await sequelize.transaction();
        try{
            delete input.id
            let {areas, ...schema} = input
            let schemaI:any = await OcrSchema.create(schema,{ transaction: t})
            for(let area of areas){
                let newArea:any = await OcrArea.create(area,{ transaction: t})
                await schemaI.addOcrArea(newArea,{transaction: t})
            }
            await t.commit()
            return schemaI
        }catch(err:any){
            console.log(err)
            await t.rollback()
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }

    }
    else return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
})