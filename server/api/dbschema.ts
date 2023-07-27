// @ts-ignore
import sequelizeErd from 'sequelize-erd'
import sequelize from '../db';
//const rC = useRuntimeConfig()

export default defineEventHandler(async (event) => {
  //console.log(getCookie(event,'authStateStorage'))
  if (!event.context.auth) {
    return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated, Cookies are required here!'}));
  }
  
  try {
    const svg = await sequelizeErd({ source: sequelize });
    setHeader(event, 'content-type', 'image/svg+xml')
    return send(event, svg)
  } catch(err:any) {
    console.error(err)
    return sendError(event, createError({statusCode: 500, statusMessage: err.toString()}));
  }
})