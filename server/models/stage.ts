import { DataTypes } from 'sequelize';
import sequelize from '../db';

const Stage = sequelize.define('stage',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    index: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    notificationTitle: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'New task: [name]'
    },
    notificationBody: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '<p><b>New task has been assigned to You.</b></p> <p>Click <a href="[link]">here</a> to open.</p>'
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


export default Stage;