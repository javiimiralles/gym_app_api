import { response } from 'express';
import { GenderEnum } from '../enums/GenderEnum.js';

export const validateGender = (req, res = response, next) => {
    const gender = req.body.gender;
    
    if(gender && Object.values(GenderEnum).includes(gender)){
        return res.status(400).json({
            ok: false,
            error:'Invalid gender'
        });
    }
    next();
}