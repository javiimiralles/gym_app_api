import { Router } from 'express';
import { check } from 'express-validator';
import { validateJWT } from '../middleware/validate-jwt.js';
import { validateFields } from '../middleware/validate-fields.js';
import { getRoutineById, getNextSessionByUser, createRoutine, updateRoutine, deleteRoutine } from '../controllers/routines.controller.js';

const router= Router();

router.get('/:id', [
    validateJWT,
    check('id','El identificador no es válido').isMongoId(),
    validateFields
], getRoutineById);

router.get('/next-session/:userId', [
    validateJWT,
    check('userId','El userId no es válido').isMongoId(),
    validateFields
], getNextSessionByUser);

router.post('/', [
    validateJWT,
    check('user','El userId no es válido').isMongoId(),
    validateFields
], createRoutine);

router.put('/:id', [
    validateJWT,
    check('id','El identificador no es válido').isMongoId(),
    check('user','El userId no es válido').isMongoId(),
    validateFields
], updateRoutine);

router.delete('/:id', [
    validateJWT,
    check('id','El identificador no es válido').isMongoId(),
    validateFields
], deleteRoutine);

export default router;