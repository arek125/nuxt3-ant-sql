import { DataTypes } from 'sequelize';
import sequelize from '../db';

const User = sequelize.define('user',{
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
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    type:{
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'credentials'
    }
    
})



export default User;