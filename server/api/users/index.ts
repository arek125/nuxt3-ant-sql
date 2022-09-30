//import { IncomingMessage, ServerResponse } from 'http'
import { sendError } from 'h3'
//import { createError } from '~/server/error-helpers'
import User from '../../models/user';
import Role from '../../models/role';
import argon2 from 'argon2'
import { Op } from "sequelize";

// export default async function (req: IncomingMessage, res: ServerResponse)
// {

//     if (!req.user) {
//         return sendError(res, createError(401));
//     }

//     /* /api/users */
    
//     if (isMethod(req, 'GET')) {
//         const users = await User.find().select('_id name email role active')
//         console.log(users)
//         return users;
//     }
//     else if (isMethod(req, 'POST')) {

//         const input = await useBody(req);
//         try{
//             const user = await User.create(input)
//             return user;
//         }catch(err){
//             return sendError(res, createError(400, err));
//         }

//     }
//     else return sendError(res, createError(404));
// }

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
        let orderCol = query.stype?query.stype.toString():'name'
        let orderDir = query.sdir?query.sdir.toString():'ASC';
        //const users = await User.find().select('_id name email role active').limit(pageSize).skip(pageSize * page).sort(sortObject)
        const users:any = await User.findAll({limit: pageSize,offset: pageSize * page,order:[[orderCol,orderDir]], attributes: { exclude: ['password'] }, include: Role})
        return users
    }
    else if (isMethod(event, 'POST')) {
        if (!adminMode) {
            return sendError(event, createError({statusCode: 403, statusMessage: 'Forbidden'}));
        }
        let input = await useBody(event);
        try{
            delete input.id
            delete input.currentPassoword
            input.password = await argon2.hash(input.newPassword)
            delete input.newPassword
            //delete input.role
            const selectedRoles = await Role.findAll({where: {id:{[Op.in]: input.roles}}})
            if(!selectedRoles.length)return sendError(event, createError({statusCode: 400, statusMessage: 'Pick at lest 1 role !'}));
            let user:any = await User.create(input)
            await user.setRoles(selectedRoles)
            delete user.password
            return user
        }catch(err){
            console.log(err)
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }

    }
    else return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
})