import { Router } from 'express';
import { check } from 'express-validator';
import { validateJWT } from '../middleware/validate-jwt.js';
import { validateGender } from '../middleware/validate-gender.js';
import { validateFields } from '../middleware/validate-fields.js';
import { createUser, updateUser, deleteUser } from '../controllers/users.controller.js';

const router= Router();

router.post('/',[
    check('name','El argumento name es obligatorio').trim().not().isEmpty(),
    check('email','El argumento email es obligatorio').trim().not().isEmpty(),
    check('email','El argumento email debe ser un email').isEmail(),
    check('password','El argumento password es obligatorio').trim().not().isEmpty(),
    check('gender','El argumento gender es obligatorio').trim().not().isEmpty(),
    validateFields,
    validateGender
], createUser);

router.put('/:id',[
    validateJWT,
    check('id','El identificador no es válido').isMongoId(),
    check('name','El argumento name es obligatorio').trim().not().isEmpty(),
    check('email','El argumento email es obligatorio').trim().not().isEmpty(),
    check('email','El argumento email debe ser un email').isEmail(),
    check('gender','El argumento gender es obligatorio').trim().not().isEmpty(),
    validateFields,
    validateGender
], updateUser);

router.delete('/:id',[
    validateJWT,
    check('id','El identificador no es válido').isMongoId(),
    validateFields
], deleteUser);

export default router;