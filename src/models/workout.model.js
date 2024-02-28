import { Schema, model } from 'mongoose';

const WorkoutSchema = Schema(
    {
        date: {
            type: Date,
            required: true
        },
        session: {
            type: Schema.Types.ObjectId,
            ref: 'Session',
            required: true
        },
        exercises: [{
            exercise: {
                type: Schema.Types.ObjectId,
                ref: 'Exercise',
            },
            sets: [{
                repetitions: {
                    type: Number
                },
                weight: {
                    type: Number
                }
            }]
        }],
        note: {
            type: String
        }
    }, { collection: 'workouts' }
)

WorkoutSchema.method('toJSON', function(){
    const { __v, _id, ...object } = this.toObject();
    
    object.uid = _id;
    return object;
});

export default model('Workout', WorkoutSchema);