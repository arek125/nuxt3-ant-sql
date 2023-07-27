import { DataTypes } from 'sequelize';
import sequelize from '../db';

const OcrArea = sequelize.define('ocrArea',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    label: {
        type: DataTypes.STRING,
        allowNull: false
    },
    left: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    top:  {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    width:  {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    height:  {
        type: DataTypes.FLOAT,
        allowNull: false
    },
})

export default OcrArea;