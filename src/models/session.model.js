import { Schema, model } from 'mongoose';

const SessionSchema = Schema(
    {
        name: {
            type: String,
            required: true
        },
        exercises: [{
            exercise: {
                type: Schema.Types.ObjectId,
                ref: 'Exercise',
            },
            sets: [{
                repetitions: {
                    type: String
                }
            }]
        }],
    }, { collection: 'sessions' }
)

SessionSchema.method('toJSON', function(){
    const { __v, _id, ...object } = this.toObject();
    
    object.uid = _id;
    return object;
});

export default model('Session', SessionSchema);