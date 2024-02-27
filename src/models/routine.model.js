import { Schema, model } from 'mongoose';

const RoutineSchema = Schema(
    {
        name: {
            type: String,
            required: true
        },
        sessions: [{
            type: Schema.Types.ObjectId,
            ref: 'Session',
        }],
        active: {
            type: Boolean,
            default: false
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        }
    }, { collection: 'routines' }
)

RoutineSchema.method('toJSON', function(){
    const { __v, _id, ...object } = this.toObject();
    
    object.uid = _id;
    return object;
});

export default model('Routine', RoutineSchema);