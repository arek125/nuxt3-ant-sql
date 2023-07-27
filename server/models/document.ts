import { DataTypes } from 'sequelize';
import sequelize from '../db';

const Document = sequelize.define('document',{
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
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    send: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
})

export default Document;