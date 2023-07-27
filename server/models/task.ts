import { DataTypes } from 'sequelize';
import sequelize from '../db';

const Task = sequelize.define('task',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    index: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    notificationTitle: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    notificationBody: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    percentToComplete: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    assignType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    assignBeforeIndex: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
})

export default Task;