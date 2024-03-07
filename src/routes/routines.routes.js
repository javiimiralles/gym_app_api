import { Router } from 'express';
import { check } from 'express-validator';
import { validateJWT } from '../middleware/validate-jwt.js';
import { validateFields } from '../middleware/validate-fields.js';
import { 
    getRoutineById, 
    getRoutines, 
    getNextSessionByUser, 
    createRoutine, 
    updateRoutine, 
    changeActiveRoutine,
    updateRoutineSessions, 
    deleteRoutine } from '../controllers/routines.controller.js';

const router= Router();

router.get('/:id', [
    validateJWT,
    check('id','El identificador no es válido').isMongoId(),
    validateFields
], getRoutineById);

router.get('/', [
    validateJWT,
    check('userId','El userId no es válido').isMongoId(),
    validateFields
], getRoutines);

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

router.put('/change-active/:id/:userId', [
    validateJWT,
    check('id','El identificador no es válido').isMongoId(),
    validateFields
], changeActiveRoutine);

router.put('/update-sessions/:id', [
    validateJWT,
    check('id','El identificador no es válido').isMongoId(),
    check('sessionId','El sessionId no es válido').isMongoId(),
    check('mode', 'El mode es obligatorio').notEmpty(),
    validateFields
], updateRoutineSessions);

router.delete('/:id', [
    validateJWT,
    check('id','El identificador no es válido').isMongoId(),
    validateFields
], deleteRoutine);

export default router;