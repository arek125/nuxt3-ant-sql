import { DataTypes } from 'sequelize';
import sequelize from '../db';

const Role = sequelize.define('role',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

})

export default Role;