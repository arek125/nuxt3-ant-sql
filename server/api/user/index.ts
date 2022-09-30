//import { IncomingMessage, ServerResponse } from 'http'
import { isMethod, sendError } from 'h3'
import User from '../../models/user';

// export default async function viewProfile(req: IncomingMessage, res: ServerResponse)
// {
//   if (!isMethod(req, 'GET')) {
//     return sendError(res, createError(404));
//   }

//   if (!req.user) {
//     return sendError(res, createError(401));
//   }
//     const user = await User.findById(req.user.id).select('_id name email role active');
//     console.log(user)

//   return user
// }

export default defineEventHandler(async (event) => {
  if (!isMethod(event, 'GET')) {
    return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
  }
  const adminMode = event.context.auth.roles.includes('Admin')
  if (!event.context.auth) {
    return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
  }
    //const user = await User.findById(event.context.auth.id).select('_id name email role active');
    const user:any = await User.findOne({where: {id: event.context.auth.id}, attributes: { exclude: ['password'] }})

  return user
})