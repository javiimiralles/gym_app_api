import { response } from 'express';
import Exercise from '../models/exercise.model.js';
import Session from '../models/session.model.js';
import { HttpStatusCodeEnum } from '../enums/HttpStatusCodeEnum.js';
import { filterDifficulty, filterMuscles } from '../utils/filterArray.js';

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

        let muscles = [];
        let difficulties = [];
        for(let item of exercises) {
            const exerciseDB = await Exercise.findById(item.exercise);
            if(!exerciseDB) {
                return res.status(HttpStatusCodeEnum.NotFound).json({
                    ok: false,
                    msg: "Alguno de los ejercicios no existe"
                });
            }
            muscles = muscles.concat(exerciseDB.muscles);
            difficulties.push(exerciseDB.difficulty);
        }

        object.muscles = filterMuscles(muscles);
        object.difficulty = filterDifficulty(difficulties);
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

        let muscles = [];
        let difficulties = [];
        for(let item of exercises) {
            const exerciseDB = await Exercise.findById(item.exercise);
            if(!exerciseDB) {
                return res.status(HttpStatusCodeEnum.NotFound).json({
                    ok: false,
                    msg: "Alguno de los ejercicios no existe"
                });
            }
            muscles.concat(exerciseDB.muscles);
            difficulties.push(exerciseDB.difficulty);
        }

        object.muscles = filterMuscles(muscles);
        object.difficulty = filterDifficulty(difficulties);
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

export const updateSessionExercises = async(req, res = response) => {

    const id = req.params.id;
    const { exerciseId, mode } = req.body;

    try {

        const sessionDB = await Session.findById(id);
        if(!sessionDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No se ha encontrado ninguna sesión con ese id"
            });
        }

        const exerciseDB = await Exercise.findById(exerciseId);
        if(!exerciseDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No se ha encontrado ningún ejercicio con ese id"
            });
        }

        if(mode === 'add') {
            if(!sessionDB.exercises) {
                sessionDB.exercises = [];
            } 
            sessionDB.exercises.push({
                exercise: exerciseId,
                sets: 3,
                repetitions: '10-12'
            });
        } else {
            sessionDB.exercises = sessionDB.exercises.filter(elem => elem.exercise !== exerciseId);
        }

        let muscles = [];
        let difficulties = [];
        for(let item of sessionDB.exercises) {
            const exerciseDB = await Exercise.findById(item.exercise);
            if(!exerciseDB) {
                return res.status(HttpStatusCodeEnum.NotFound).json({
                    ok: false,
                    msg: "Alguno de los ejercicios no existe"
                });
            }
            muscles.concat(exerciseDB.muscles);
            difficulties.push(exerciseDB.difficulty);
        }

        sessionDB.muscles = filterMuscles(muscles);
        sessionDB.difficulty = filterDifficulty(difficulties);
        const session = await Session.findByIdAndUpdate(id, sessionDB, { new: true });

        // OK 
        res.json({
            ok: true,
            msg: 'updateSessionExercises',
            session
        });

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

