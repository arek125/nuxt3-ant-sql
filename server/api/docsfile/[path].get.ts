import fs from 'node:fs'
//import { sendStream,sendError } from 'h3'
import * as mime from 'mime-types'

const rC = useRuntimeConfig()

export default defineEventHandler(async (event:any) => {
  //console.log(getCookie(event,'authStateStorage'))
  if (!event.context.auth) {
    return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated, Cookies are required here!'}));
  }
  const filePath = decodeURI(rC.DOCS_FILES_DIR+event.context.params.path)
  try {
    if (fs.existsSync(filePath)) {
      const stream = fs.createReadStream(filePath)
      setHeader(event, 'content-type', mime.contentType(filePath))
      return sendStream(event, stream)
    }
    else throw 'File not exist !'
  } catch(err:any) {
    console.error(err)
    return sendError(event, createError({statusCode: 500, statusMessage: err.toString()}));
    // throw createError({
    //   statusCode: 500,
    //   statusMessage: err.toString(),
    // });
  }
})