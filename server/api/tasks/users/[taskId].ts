import { sendError } from 'h3'
import Task from '~~/server/models/task'
import User from '~~/server/models/user'

export default defineEventHandler(async (event:any) => {
    if (!event.context.auth) {
        return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
    }
    if (isMethod(event, 'POST')) {
        const input = await readBody(event)
        const task:any = await Task.findOne({where: {id: event.context.params.taskId},include: [{
            model: User,
        }]})
        try{
            if(!task || task.status == 'Completed')throw "Task copleted or not found !"
            let newUsers:any = []
            for (let userId of input.task.usersId){
                if(task.users.find(x=>x.id == userId))continue
                else {
                    const user:any = await User.findOne({where: {id: userId}})
                    newUsers.push(user)
                }
            }
            if(newUsers.length)await task.setUsers(newUsers)
        }catch(err:any){
            console.log(err)
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }
        return true
    }
})