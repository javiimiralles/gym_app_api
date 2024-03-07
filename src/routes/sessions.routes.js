import { Router } from 'express';
import { check } from 'express-validator';
import { validateJWT } from '../middleware/validate-jwt.js';
import { validateFields } from '../middleware/validate-fields.js';
import { getSessionById, createSession, updateSession, updateSessionExercises, deleteSession } from '../controllers/sessions.controller.js';

const router= Router();

router.get('/:id', [
    validateJWT,
    check('id','El identificador no es válido').isMongoId(),
    validateFields
], getSessionById);

router.post('/', [ validateJWT ], createSession);

router.put('/:id', [
    validateJWT,
    check('id','El identificador no es válido').isMongoId(),
    validateFields
], updateSession);

router.put('/update-exercises/:id', [
    validateJWT,
    check('id','El identificador no es válido').isMongoId(),
    check('exerciseId','El exerciseId no es válido').isMongoId(),
    check('mode', 'El mode es obligatorio').notEmpty(),
    validateFields
], updateSessionExercises);

router.delete('/:id', [
    validateJWT,
    check('id','El identificador no es válido').isMongoId(),
    validateFields
], deleteSession);

export default router;