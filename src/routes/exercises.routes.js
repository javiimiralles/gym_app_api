import { Router } from 'express';
import { check } from 'express-validator';
import { validateJWT } from '../middleware/validate-jwt.js';
import { validateDifficulty } from '../middleware/validate-difficulty.js';
import { validateFields } from '../middleware/validate-fields.js';
import { getExerciseById, getExercises, createExercise, updateExercise, deleteExercise } from '../controllers/exercises.controller.js';

const router= Router();

router.get('/:id', [
    validateJWT,
    check('id','El identificador no es válido').isMongoId(),
    validateFields
], getExerciseById);

router.get('/', [
    validateJWT,
    check('userId','El userId no es válido').optional().isMongoId(),
    check('from','El argumento from debe ser numérico').optional().isNumeric(),
    check('results','El argumento results debe ser numérico').optional().isNumeric(),
    validateFields
], getExercises);

router.post('/', [
    validateJWT,
    check('userId','El userId no es válido').optional().isMongoId(),
    validateDifficulty,
    validateFields
], createExercise);

router.put('/:id', [
    validateJWT,
    check('userId','El userId no es válido').optional().isMongoId(),
    validateDifficulty,
    validateFields
], updateExercise);

router.delete('/:id', [
    validateJWT,
    check('id','El identificador no es válido').isMongoId(),
    validateFields
], deleteExercise);

export default router;

