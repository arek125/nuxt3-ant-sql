import { Nitro } from 'nitropack'
import sequelize from './db';

import User from './models/user';
import Role from './models/role';
import Flow from './models/flow';
import Stage from './models/stage';
import FlowInctance from './models/flowInstance'
import Document from './models/document';
import Task from './models/task';
import Outcome from './models/outcome';
import TaskAction from './models/taskAction';
import DocumentFile from './models/documentFile';
import Absence from './models/absence';
import OcrSchema from './models/ocrSchema'
import OcrArea from './models/ocrArea'

export default async (_nitroApp: Nitro) => {
    try {
        await sequelize.authenticate();
        
        console.log('DB Connection has been established successfully.');

        User.belongsToMany(Role, { through: 'UserRoles' });
        Role.belongsToMany(User, { through: 'UserRoles' });

        Flow.hasMany(Stage)
        Stage.belongsTo(Flow)

        Flow.hasMany(FlowInctance)
        FlowInctance.belongsTo(Flow)

        User.hasMany(FlowInctance)
        FlowInctance.belongsTo(User)

        User.belongsToMany(Stage, { through: 'UserStages' });
        Stage.belongsToMany(User, { through: 'UserStages' });

        Document.hasMany(FlowInctance)
        FlowInctance.belongsTo(Document)

        Document.hasMany(DocumentFile)
        DocumentFile.belongsTo(Document)

        User.hasMany(Document)
        Document.belongsTo(User)

        User.belongsToMany(Task, { through: 'UserTasks' });
        Task.belongsToMany(User, { through: 'UserTasks' });

        FlowInctance.hasMany(Task)
        Task.belongsTo(FlowInctance)

        Outcome.hasMany(Task)
        Task.belongsTo(Outcome)

        Task.hasMany(TaskAction)
        TaskAction.belongsTo(Task)

        User.hasMany(TaskAction)
        TaskAction.belongsTo(User)
        
        Outcome.hasMany(TaskAction)
        TaskAction.belongsTo(Outcome)

        User.hasMany(Absence, {foreignKey: 'userId', as: 'user'});
        Absence.belongsTo(User,{foreignKey: 'userId', as: 'user'});
        User.hasMany(Absence, {foreignKey: 'deputyId', as: 'deputy'});
        Absence.belongsTo(User,{foreignKey: 'deputyId', as: 'deputy'});

        OcrSchema.hasMany(OcrArea)
        OcrArea.belongsTo(OcrSchema)

        // await Role.sync()
        // await User.sync()

        // await Flow.sync()
        // await Stage.sync()
        // await Document.sync()
        // await Outcome.sync()
        // await TaskAction.sync()
        // await Task.sync()

        // await FlowInctance.sync()
        // await DocumentFile.sync()
        // await Absence.sync()

        // await OcrSchema.sync()
        // await OcrArea.sync()
        // await User.sync({ alter: true })
        // await Role.sync({ alter: true })

        // await Role.findOrCreate({ where: { name: 'Admin' } })
        // await Role.findOrCreate({ where: { name: 'User' } })

        // await Flow.sync({ alter: true })
        // await Stage.sync({ alter: true })
        // await FlowInctance.sync({ alter: true })

        // await Document.sync({ alter: true })
        // await Task.sync({ alter: true })
        // await Outcome.sync({ alter: true })
        // await TaskAction.sync({ alter: true })

        await sequelize.sync({ force: true })

        const [adminRole] = await Role.findOrCreate({ where: { name: 'Admin' } })
        await Role.findOrCreate({ where: { name: 'User' } })

        const [supUser]:any = await User.findOrCreate({ where: {     
            name: 'Arek Goleń',
            email: 'arkadiusz.golen@petrosoft.pl',
            password: '$2a$10$XAuKotPfzoBxs9oQRzdP1O8.q7PSy9UOQ4Rwb0AZ3t02S5YvJrzoG',
            active: true,
        }
        })
        //const supUser:any = await User.findOne({where: { email: 'arkadiusz.golen@petrosoft.pl'}})
        supUser.setRoles([adminRole])

        console.log('DB has been Sync.');

    } catch (error) {
        console.error('DB ERROR', error);
    }
};

