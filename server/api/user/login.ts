//import { IncomingMessage, ServerResponse } from 'http'
import { sendError } from 'h3'
//import Prisma from '@prisma/client'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import User from '../../models/user';
import Role from '../../models/role';

export default defineEventHandler(async (event) => {
  if (!isMethod(event, 'POST')) {
    return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
  }

  if (event.context.auth) {
    return sendError(event,createError({statusCode: 409, statusMessage: 'cannot login with authorized request'}));
  }

  const { email, password } = await useBody<{ email: string, password: string }>(event.req);

  if ([email, password].some(v => !v || typeof v != 'string')) {
    return sendError(event,createError({statusCode: 404, statusMessage: 'e-mail and password are required'}))
  }

  //const user = await User.findOne({email: email});
  const user:any = await User.findOne({where: {email: email, active: true}, include: {
    model: Role,
    attributes:{
      exclude: ['createdAt', 'updatedAt']
    }
  }})

  //console.log(user)

  if (!user || !await argon2.verify(user.password, password)) {
    return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
  }
  let rolesNames = user.roles.map(x=>x.name)

  const token = jwt.sign({
    userId: user.id,
    name: user.name,
    email: user.email,
    //role: user.role,
    roles: rolesNames
  }, process.env.JWT_SECRET);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    //role: user.role,
    roles: rolesNames,
    token,
  };
})