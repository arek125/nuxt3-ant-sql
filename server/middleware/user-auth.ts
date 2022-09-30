// import { IncomingMessage, ServerResponse } from 'http'
import { sendError } from 'h3'
import jwt from 'jsonwebtoken'
import User from '../models/user'
import Role from '../models/role'

// export default async function userAuthMiddleware(req: IncomingMessage, res: ServerResponse)
// {
//   const authHeaderMatch = /^Bearer (?<token>.*?)$/.exec(req.headers['authorization']);
//   const token = authHeaderMatch?.groups.token;

//   if (token) {
//     try {
//       const payload = jwt.verify(token, process.env.JWT_SECRET);
//       if (payload && typeof payload == 'object') {
//         //const user = {email: 'arekgolen@gmail.com'}
//         //const user = await prisma.user.findUnique({ where: { id: payload.userId }}); todo databgease
//         const user = await User.findOne({email: payload.email});

//         if (!user) {
//           return sendError(res, createError(403));
//         }

//         req.user = {
//           id: payload.userId,
//           name: payload.name,
//           email: payload.email,
//         };
//       }
//     }
//     catch (e) {
//       if (!(e instanceof jwt.JsonWebTokenError)) {
//         throw e;
//       }
//       return sendError(res, createError(403));
//     }
//   }
// }

export default defineEventHandler(async (event) => {
  const authHeaderMatch = /^Bearer (?<token>.*?)$/.exec(event.req.headers['authorization']);
  const token = authHeaderMatch?.groups.token;

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload && typeof payload == 'object') {
        //const user:any = await User.findOne({where: {email: payload.email, active: true}})
        const user:any = await User.findOne({where: {email: payload.email, active: true}, include: {
          model: Role,
          attributes:{
            exclude: ['createdAt', 'updatedAt']
          }
        }})
        if (!user) {
          return sendError(event, createError({statusCode: 403, statusMessage: 'Forbidden'}));
        }

        event.context.auth = {
          id: payload.userId,
          name: payload.name,
          email: payload.email,
          //role: user.role,
          roles: user.roles
        };
      }
    }
    catch (e) {
      if (!(e instanceof jwt.JsonWebTokenError)) {
        throw e;
      }
      return sendError(event, createError({statusCode: 403, statusMessage: 'Forbidden'}));
    }
  }
})

// declare module 'http' {
//   interface IncomingMessage {
//     user?: {
//       id: number
//       name: string
//       email: string
//     }
//   }
// }