import { DataTypes } from 'sequelize';
import sequelize from '../db';

const Outcome = sequelize.define('outcome',{
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

export default Outcome;