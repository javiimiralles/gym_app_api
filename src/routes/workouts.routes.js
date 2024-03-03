import { Router } from 'express';
import { check } from 'express-validator';
import { validateJWT } from '../middleware/validate-jwt.js';
import { validateFields } from '../middleware/validate-fields.js';
import { getWorkoutById, getWorkouts, getLastWorkout, createWorkout, updateWorkout, deleteWorkout } from '../controllers/workouts.controller.js';

const router= Router();

router.get('/:id', [
    validateJWT,
    check('id','El identificador no es válido').isMongoId(),
    validateFields
], getWorkoutById);

router.get('/', [
    validateJWT,
    check('userId','El userId no es válido').isMongoId(),
    check('from','El argumento from debe ser numérico').optional().isNumeric(),
    check('results','El argumento results debe ser numérico').optional().isNumeric(),
    check('startDate','El argumento startDate debe ser una fecha').optional().isDate(),
    check('endDate','El argumento startDate debe ser una fecha').optional().isDate(),
    validateFields
], getWorkouts);

router.get('/last-workout/:sessionId', [
    validateJWT,
    check('sessionId','El identificador no es válido').isMongoId(),
    validateFields
], getLastWorkout);

router.post('/', [
    validateJWT,
    check('user','El user no es válido').isMongoId(),
    check('session','El session no es válido').isMongoId(),
    check('date','El argumento date debe ser una fecha').optional().isDate(),
    validateFields
], createWorkout);

router.put('/:id', [
    validateJWT,
    check('id','El identificador no es válido').isMongoId(),
    check('user','El user no es válido').isMongoId(),
    check('session','El session no es válido').isMongoId(),
    check('date','El argumento date debe ser una fecha').optional().isDate(),
    validateFields
], updateWorkout);

router.delete('/:id', [
    validateJWT,
    check('id','El identificador no es válido').isMongoId(),
    validateFields
], deleteWorkout);

export default router;