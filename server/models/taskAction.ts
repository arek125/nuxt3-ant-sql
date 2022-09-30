import { DataTypes } from 'sequelize';
import sequelize from '../db';

const TaskAction = sequelize.define('taskAction',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    comment: {
        type: DataTypes.STRING,
        allowNull: true
    },

})

export default TaskAction;