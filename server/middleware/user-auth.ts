import { getServerSession } from '#auth'
export default eventHandler(async (event) => {
  const session:any = await getServerSession(event)
  //console.log(session)
  if(session) {
    event.context.auth = session.user
  }
})
// import { sendError,getCookie } from 'h3'
// import jwt from 'jsonwebtoken'
// import User from '../models/user'
// import Role from '../models/role'
// const runtimeConfig = useRuntimeConfig()


// export default defineEventHandler(async (event) => {
//   const authHeader = getHeader(event,'authorization')
//   let token = null

//   if(authHeader){
//     const authHeaderMatch = /^Bearer (?<token>.*?)$/.exec(authHeader);
//     token = authHeaderMatch?.groups.token;
//   }
//   else {
//     const cookie = getCookie(event,'authStateStorage')
//     if(cookie) token = JSON.parse(getCookie(event,'authStateStorage')).jwt
//   }
  
//   if (token) {
//     try {
//       const payload = jwt.verify(token, runtimeConfig.JWT_SECRET);
//       if (payload && typeof payload == 'object') {
//         const user:any = await User.findOne({where: {email: payload.email, active: true}, include: {
//           model: Role,
//           attributes:{
//             exclude: ['createdAt', 'updatedAt']
//           }
//         }})
//         if (!user) {
//           return sendError(event, createError({statusCode: 403, statusMessage: 'Forbidden'}));
//         }

//         event.context.auth = {
//           id: payload.userId,
//           name: payload.name,
//           email: payload.email,
//           roles: user.roles.map(x=>x.name)
//         };
//       }
//     }
//     catch (e) {
//       if (!(e instanceof jwt.JsonWebTokenError)) {
//         throw e;
//       }
//       return sendError(event, createError({statusCode: 403, statusMessage: 'Forbidden'}));
//     }
//   }
// })