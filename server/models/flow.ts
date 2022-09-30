import { DataTypes } from 'sequelize';
import sequelize from '../db';

const Flow = sequelize.define('flow',{
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

export default Flow;