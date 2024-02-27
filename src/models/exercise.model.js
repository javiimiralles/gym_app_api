import { Schema, model } from 'mongoose';
import { DifficultyEnum } from '../enums/DifficultyEnum';

const ExerciseSchema = Schema(
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
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        }
    }, { collection: 'exercises' }
)

ExerciseSchema.method('toJSON', function(){
    const { __v, _id, ...object } = this.toObject();
    
    object.uid = _id;
    return object;
});

export default model('Exercise', ExerciseSchema);