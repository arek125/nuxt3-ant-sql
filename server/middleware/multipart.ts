import {parse} from "then-busboy"

export default defineEventHandler(async (event) => {
    if(isMethod(event, 'POST' ) || isMethod(event, 'PUT' )){
        const contentHeaderType = getHeader(event,'Content-Type') 
        if(contentHeaderType && contentHeaderType.includes("multipart/form-data")){
            const body = await parse(event.node.req)
            event.context.multipart = body.json()
        }
    }

})