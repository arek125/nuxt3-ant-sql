import { DataTypes } from 'sequelize';
import sequelize from '../db';

const Absence = sequelize.define('absence',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    from: {
        type: DataTypes.DATE,
        allowNull: false
    },
    to: {
        type: DataTypes.DATE,
        allowNull: false
    },

})

export default Absence;

export async function getCurrentUserAbsences(userId:any) {
    const now = new Date()
    return await Absence.findAll({where:{userId: userId, 
        to: {
            $gte: now.toISOString()
        },
        from:{
            $lte: now.toISOString()
        }}
    })
}