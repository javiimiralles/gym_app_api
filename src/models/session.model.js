import { Schema, model } from 'mongoose';
import { DifficultyEnum } from '../enums/DifficultyEnum.js';

const SessionSchema = Schema(
    {
        name: {
            type: String,
            required: true
        },
        muscles: {
            type: [String],
            required: true
        },
        difficulty: {
            type: String,
            required: true,
            enum: Object.values(DifficultyEnum)
        },
        exercises: [{
            exercise: {
                type: Schema.Types.ObjectId,
                ref: 'Exercise',
            },
            sets: {
                type: Number
            },
            repetitions: {
                type: String
            },
            dropset: {
                type: Boolean,
                default: false
            }
        }],
    }, { collection: 'sessions' }
)

SessionSchema.method('toJSON', function(){
    const { __v, _id, ...object } = this.toObject();
    
    object.uid = _id;
    return object;
});

export default model('Session', SessionSchema);