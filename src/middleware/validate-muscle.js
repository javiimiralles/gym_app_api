import { response } from 'express';
import { MuscleEnum } from '../enums/MuscleEnum.js';

export const validateMuscle = (req, res = response, next) => {
    const muscles = req.body.muscles;

    if(!muscles || muscles.length === 0) {
        return res.status(400).json({
            ok: false,
            error:'Invalid muscles'
        });
    }
    
    for(let muscle of muscles) {
        if(!Object.values(MuscleEnum).includes(muscle)){
            return res.status(400).json({
                ok: false,
                error:'Invalid muscles'
            });
        }
    }
    next();
}