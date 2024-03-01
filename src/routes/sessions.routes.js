import { Router } from 'express';
import { check } from 'express-validator';
import { validateJWT } from '../middleware/validate-jwt.js';
import { validateFields } from '../middleware/validate-fields.js';
import { getSessionById, createSession, updateSession, deleteSession } from '../controllers/sessions.controller.js';

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

router.delete('/:id', [
    validateJWT,
    check('id','El identificador no es válido').isMongoId(),
    validateFields
], deleteSession);

export default router;