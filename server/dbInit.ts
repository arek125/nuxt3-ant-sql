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

export default async (_nitroApp: Nitro) => {
    try {
        await sequelize.authenticate();
        
        console.log('DB Connection has been established successfully.');

        await User.sync()
        await Role.sync()

        await Role.findOrCreate({ where: { name: 'Admin' } })
        await Role.findOrCreate({ where: { name: 'User' } })

        await Flow.sync()
        await Stage.sync()
        await FlowInctance.sync()

        await Document.sync()
        await Task.sync()
        await Outcome.sync()
        await TaskAction.sync()

        await Outcome.findOrCreate({ where: { name: 'Approve' } })
        await Outcome.findOrCreate({ where: { name: 'Reject' } })

        User.belongsToMany(Role, { through: 'UserRoles' });
        Role.belongsToMany(User, { through: 'UserRoles' });

        Flow.hasMany(Stage)
        Stage.belongsTo(Flow)

        // Flow.hasMany(Document)
        // Document.belongsTo(Flow)

        Flow.hasMany(FlowInctance)
        FlowInctance.belongsTo(Flow)

        User.hasMany(FlowInctance)
        FlowInctance.belongsTo(User)

        User.belongsToMany(Stage, { through: 'UserStages' });
        Stage.belongsToMany(User, { through: 'UserStages' });

        Document.hasMany(FlowInctance)
        FlowInctance.belongsTo(Document)

        // Document.hasMany(Task)
        // Task.belongsTo(Document)

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

        await sequelize.sync({ alter: true })

        console.log('DB has been Sync.');
    } catch (error) {
        console.error('DB ERROR', error);
    }
};

