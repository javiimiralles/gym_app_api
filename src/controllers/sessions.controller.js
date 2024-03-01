import { response } from 'express';
import Exercise from '../models/exercise.model.js';
import Session from '../models/session.model.js';
import { HttpStatusCodeEnum } from '../enums/HttpStatusCodeEnum.js';

export const getSessionById = async(req, res = response) => {

    const id = req.params.id;

    try {

        const session = await Session.findById(id).populate('exercises.exercise');

        if(!session) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ninguna sesión con ese id"
            });
        }

        res.json({
            ok: true,
            msg: 'getSessionById',
            session
        });

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error obteniendo sesión por id'
        });
    }
}

export const createSession = async(req, res = response) => {

    const { exercises, ...object } = req.body;

    try {

        for(let item of exercises) {
            const exerciseDB = await Exercise.findById(item.exercise);
            if(!exerciseDB) {
                return res.status(HttpStatusCodeEnum.NotFound).json({
                    ok: false,
                    msg: "Alguno de los ejercicios no existe"
                });
            }
        }

        object.exercises = exercises;
        const session = new Session(object);
        await session.save();

        // OK
        res.json({
            ok: true,
            msg: "createSession",
            session
        })

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error creando sesión'
        });
    }
}

export const updateSession = async(req, res = response) => {

    const { exercises, ...object } = req.body;
    const id = req.params.id;

    try {

        const sessionDB = await Session.findById(id);
        if(!sessionDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ninguna sesión con ese id"
            });
        }

        for(let item of exercises) {
            const exerciseDB = await Exercise.findById(item.exercise);
            if(!exerciseDB) {
                return res.status(HttpStatusCodeEnum.NotFound).json({
                    ok: false,
                    msg: "Alguno de los ejercicios no existe"
                });
            }
        }

        object.exercises = exercises;
        const session = await Session.findByIdAndUpdate(id, object, { new: true });

        // OK
        res.json({
            ok: true,
            msg: "updateSession",
            session
        })

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error editando sesión'
        });
    }
}

export const deleteSession = async(req, res = response) => {

    const id = req.params.id;

    try {

        const sessionDB = await Session.findById(id);
        if(!sessionDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ninguna sesión con ese id"
            });
        }

        const session = await Session.findByIdAndDelete(id);

        // OK
        res.json({
            ok: true,
            msg: "deleteSession",
            session
        })

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error eliminando sesión'
        });
    }
}