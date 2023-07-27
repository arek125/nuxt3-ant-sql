
import { sendError } from 'h3'

import { Op } from "sequelize";
import Document from '~~/server/models/document'
import DocumentFile from '~~/server/models/documentFile';
import FlowInstance from '~~/server/models/flowInstance'
import Task from '~~/server/models/task'
import User from '~~/server/models/user'
import TaskAction from '~~/server/models/taskAction'
import sequelize from '~~/server/db';
import fs from 'fs-extra'
import path from 'node:path'
const rC = useRuntimeConfig()

export default defineEventHandler(async (event) => {
    if (!event.context.auth) {
        return sendError(event, createError({statusCode: 401, statusMessage: 'Unauthenticated'}));
    }
    const adminMode = event.context.auth.roles.includes('Admin')
    if(isMethod(event, 'GET')) {
        const doc:any = await Document.findOne({where: {id: event.context.params.id},include: {
            model: DocumentFile,
            //where: { ocr: false},
            required: false
        }})
       
        return doc
    }
    else if (isMethod(event, 'POST')) {
        let { newFiles, removeFiles, ...input} = await readBody(event);
        const t = await sequelize.transaction()
        try{
            let doc:any = await Document.update({input}, { where: { id: event.context.params.id, }, transaction: t })
            for(let file of newFiles){
                let ufilename = path.basename(file.tmppath)
                await fs.move(file.tmppath,  rC.DOCS_FILES_DIR+ufilename)//from temp
                await DocumentFile.create({name: file.name, type:file.type, path: ufilename, documentId: event.context.params.id, ocr: file.ocr}, { transaction: t })
            }
            for(let fileId of removeFiles){
                const fileToRem:any = await DocumentFile.findOne({where: {id: fileId}})
                await fs.remove(rC.DOCS_FILES_DIR+fileToRem.path)
                await fileToRem.destroy({transaction: t})
            }
            t.commit()
            return doc
        }catch(err){
            console.log(err)
            await t.rollback();
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }
    }
    else if (isMethod(event, 'DELETE')) {
        //await User.findByIdAndDelete(event.context.params.id)
        const t = await sequelize.transaction();

        try {
            const instances:any = await FlowInstance.findAll({where: {documentId: event.context.params.id}, 
                include: [
                    {
                        model: Task,
                        include: [User,TaskAction]
                    }
                ]
            })
            for (let instance of instances){
                for(let task of instance.tasks){
                    await task.setUsers([],{transaction: t})
                    for (let taskAction of task.taskActions)await taskAction.destroy({transaction: t})
                    await task.destroy({transaction: t})
                }
                await instance.destroy({transaction: t})
            }
            const files:any = await DocumentFile.findAll({where: {documentId: event.context.params.id}})
            for (let file of files){
                await fs.remove(rC.DOCS_FILES_DIR+file.path)
                await file.destroy({transaction: t})
            }
            await Document.destroy({
                where: {
                  id: event.context.params.id
                },
                transaction: t
            });
            t.commit()
        } catch (err) {
            console.log(err)
            await t.rollback();
            return sendError(event, createError({statusCode: 400, statusMessage: err}));
        }
        return { success: true };
    }
    else return sendError(event, createError({statusCode: 404, statusMessage: 'Not found'}));
})