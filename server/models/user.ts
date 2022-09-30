import { DataTypes } from 'sequelize';
import sequelize from '../db';

// export interface IUser {
//     name: string,
//     email: string,
//     password: string,
//     role: string,
//     active: boolean
// }

// const userSchema = new mongoose.Schema<IUser>({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: { type: String, required: true, default: 'User' },
//     active: { type: Boolean, required: true, default: true },
// },
//     {
//         timestamps: {
//             createdAt: true,
//             updatedAt: true,
//         }
//     }
// );

// const User = mongoose.model<IUser>('User', userSchema);

// export default User;

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
        allowNull: false
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }

})

export default User;