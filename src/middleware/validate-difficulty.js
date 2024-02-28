import { response } from 'express';
import { DifficultyEnum } from '../enums/DifficultyEnum.js';

export const validateGender = (req, res = response, next) => {
    const difficulty = req.body.difficulty;
    
    if(difficulty && Object.values(DifficultyEnum).includes(difficulty)){
        return res.status(400).json({
            ok: false,
            error:'Invalid difficulty'
        });
    }
    next();
}