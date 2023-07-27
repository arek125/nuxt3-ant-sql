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
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "OneByOne",
        validate: {
            customValidator: (value) => {
                const enums = ['OneByOne','AllAtOnce']
                if (!enums.includes(value)) {
                    throw new Error('not a valid option! Vaid are '+ enums.join(';'))
                }
            }
        }
    },
})

export default Flow;