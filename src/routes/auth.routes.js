import { Router } from 'express';
import { check } from 'express-validator';
import { validateFields } from '../middleware/validate-fields';
import { login, renewToken } from '../controllers/auth.controller';

const router = Router();

router.get('/token', [
    check('x-token', 'El argumento x-token es obligatorio').not().isEmpty(),
    validateFields,
], renewToken);

router.post('/', [
    check('password', 'El argumento pasword es obligatorio').not().isEmpty(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    validateFields,
], login);

export default router;