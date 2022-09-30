import { DataTypes } from 'sequelize';
import sequelize from '../db';

const FlowInstance = sequelize.define('flowInstance',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    currentIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
})

export default FlowInstance;