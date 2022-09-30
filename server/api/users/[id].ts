//import { IncomingMessage, ServerResponse } from 'http'
import User from '../../models/user'
import Role from '../../models/role';
import { sendError } from 'h3'
import argon2 from 'argon2'

import { Op } from "sequelize";


export default defineEventHandler(async (event) => {
    if (!event.context.auth) {
        return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
    }
    const adminMode = event.context.auth.roles.includes('Admin')
    if(isMethod(event, 'GET')) {
        console.log(event.context.params.id)
        //const user = await User.findById(event.context.params.id).select('_id name email role active');
        const user:any = await User.findOne({where: {id: event.context.params.id}, attributes: { exclude: ['password'] }, include: Role})
       
        return user
    }
    else if (isMethod(event, 'POST')) {
        const input = await useBody(event);
        let allow = false
        if (adminMode) {
            allow = true
        }
        else if(event.context.auth.id == input.id){
            allow = true
        }
        if(!allow)return sendError(event, createError({statusCode: 403, statusMessage: 'Forbidden'}));

        if(input.newPassword){
            if(!adminMode){
                //const user = await User.findOne({email: input.email});
                const user:any = await User.findOne({where: {email: input.email}})
                if (!user || !await argon2.verify(user.password, input.currentPassoword)) {
                    return sendError(event, createError({statusCode: 401, statusMessage: 'Wrong password !'}));
                }
            }
            input.password = await argon2.hash(input.newPassword)
        }
        delete input.currentPassoword
        delete input.newPassword

        try{
            //const updatedUser = await User.findByIdAndUpdate(input._id,input)
            const selectedRoles = await Role.findAll({where: {id:{[Op.in]: input.roles}}})
            if(!selectedRoles.length)return sendError(event, createError({statusCode: 400, statusMessage: 'Pick at lest 1 role !'}));
            const updatedUser = await User.update(input, { where: {id: input.id} });
            const user:any = await User.findOne({where: {id: input.id}})
            await user.setRoles(selectedRoles)
            return updatedUser;
        }catch(err){
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }
    }
    else if (isMethod(event, 'DELETE')) {
        //await User.findByIdAndDelete(event.context.params.id)
        await User.destroy({
            where: {
              id: event.context.params.id
            }
          });
        return { success: true };
    }
    else return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
})