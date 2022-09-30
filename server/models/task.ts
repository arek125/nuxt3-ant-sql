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
    // outcome: {
    //     type: DataTypes.STRING,
    //     allowNull: true
    // },
    // comment: {
    //     type: DataTypes.STRING,
    //     allowNull: true
    // },
})

export default Task;