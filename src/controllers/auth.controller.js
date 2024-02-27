import { response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateJWT } from '../utils/jwt';
import User from '../models/user.model';
import { HttpStatusCodeEnum } from '../enums/HttpStatusCodeEnum';

export const login = async(req, res = response) => {

    const { email, password } = req.body;

    try {

        const userDB = await User.findOne({ email });
        if (!userDB) {
            return res.status(HttpStatusCodeEnum.BadRequest).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        const validPassword = bcrypt.compareSync(password, userDB.password);
        if (!validPassword) {
            return res.status(HttpStatusCodeEnum.BadRequest).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        const { _id } = userDB;
        const token = await generateJWT(userDB._id, userDB.role);

        // OK -> login correcto
        res.json({
            ok: true,
            msg: 'Login correcto',
            uid: _id,
            token
        });

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Ha ocurrido un error al iniciar sesión',
            token: ''
        });
    }
}

export const renewToken = async(req, res = response) => {

    const token = req.headers['x-token'];

    try {
        const { uid, role, ...object } = jwt.verify(token, process.env.JWTSECRET);

        const userDB = await User.findById(uid);

        if(!userDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: 'El token no es válido',
                token: ''
            });
        }

        const newToken = await generateJWT(uid, role);

        // OK -> token creado
        res.json({
            ok: true,
            msg: 'Token',
            uid: uid,
            name: userDB.name,
            email: userDB.email,
            gender: userDB.gender,
            role: userDB.role,
            token: newToken
        });

    } catch {
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'El token no es válido',
            token: ''
        });
    }
}