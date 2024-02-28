import { Schema, model } from 'mongoose';
import { GenderEnum } from '../enums/GenderEnum.js';

const UserSchema = Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        gender: {
            type: String,
            required: true,
            enum: Object.values(GenderEnum)
        },
        role: {
            type: String,
            default: 'User'
        }
    }, { collection: 'users' }
)

UserSchema.method('toJSON', function(){
    const { __v, _id, password, ...object } = this.toObject();
    
    object.uid = _id;
    return object;
});

export default model('User', UserSchema);