import { response } from 'express';
import User from '../models/user.model.js';
import Session from '../models/session.model.js';
import Routine from '../models/routine.model.js';
import Workout from '../models/workout.model.js';
import { HttpStatusCodeEnum } from '../enums/HttpStatusCodeEnum.js';
import { filterDifficulty } from '../utils/filterArray.js';

export const getRoutineById = async(req, res = response) => {

    const id = req.params.id;

    try {

        const routine = await Routine.findById(id).populate('sessions');

        if(!routine) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ninguna rutina con ese id"
            });
        }

        res.json({
            ok: true,
            msg: 'getRoutineById',
            routine
        });

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error obteniendo rutina por id'
        });
    }
}

export const getRoutines = async(req, res = response) => {
    const from = Number(req.query.from) || 0;
    const results = Number(req.query.results) || Number(process.env.DOCS_PER_PAGE);
    let text = req.query.text;
    const userId = req.query.userId;

    let searchText;
    if(text) {
        // quitamos los acentos del texto
        const escapeRegExp = (string) => string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        text = escapeRegExp(text)
        .replace(/a/gi, '[aáàäâã]')
        .replace(/e/gi, '[eéèëê]')
        .replace(/i/gi, '[iíìïî]')
        .replace(/o/gi, '[oóòöôõ]')
        .replace(/u/gi, '[uúùüû]');

        searchText = new RegExp(text, 'i');
    }

    try {
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ningún usuario para ese id"
            });
        }
        
        let filter = { user: userId };

        if(searchText) {
            filter.name = searchText;
        }

        const routines = await Routine.find(filter).sort({ active: -1 }).skip(from).limit(results);

        //OK
        res.json({
            ok: true,
            msg: 'getRoutines',
            routines
        })
    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error obteniendo rutinas'
        });
    }
} 

export const getNextSessionByUser = async(req, res = response) => {
    const userId = req.params.userId;

    try {

        const user = await User.findById(userId);
        if (!user) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ningún usuario para ese id"
            });
        }

        const activeRoutine = await Routine.findOne({ user: userId, active: true });
        if(!activeRoutine) {
            // OK -> pero no hay rutina activa
            return res.json({
                ok: true,
                msg: 'getNextSessionByUser',
                routine: null
            });
        }
        
        const nextSessionId = activeRoutine.sessions[activeRoutine.iterator];
        const nextSession = await Session.findById(nextSessionId).populate('exercises.exercise');
        if(!nextSession) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No se ha encontrado la siguiente sesión"
            });
        }

        // OK
        res.json({
            ok: true,
            msg: 'getNextSessionByUser',
            nextSession
        });

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error obteniendo la siguiente sesión'
        });
    }
}

export const createRoutine = async(req, res = response) => {

    const { name, sessions, user, ...object } = req.body;

    try {

        const difficulties = await validateRoutine(name, sessions, user);

        object.difficulty = filterDifficulty(difficulties);
        object.name = name;
        object.sessions = sessions;
        object.user = user;
        object.active = false;
        const routine = new Routine(object);

        await routine.save();

        // OK
        res.json({
            ok: true,
            msg: 'createRoutine',
            routine
        });

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error creando rutina'
        });
    }
}

export const updateRoutine = async(req, res = response) => {

    const { name, sessions, user, ...object } = req.body;
    const id = req.params.id;

    try {

        const routineDB = await Routine.findById(id);
        if(!routineDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No se ha encontrado ninguna rutina con ese id"
            });
        }

        const difficulties = await validateRoutine(name, sessions, user);

        object.difficulty = filterDifficulty(difficulties);
        object.name = name;
        object.user = user;
        object.sessions = sessions;
        const routine = await Routine.findByIdAndUpdate(id, object, { new: object });

        // OK 
        res.json({
            ok: true,
            msg: 'updateRoutine',
            routine
        });

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error editando rutina'
        });
    }
}

export const deleteRoutine = async(req, res = response) => {

    const id = req.params.id;

    try {

        const routineDB = await Routine.findById(id);
        if(!routineDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No se ha encontrado ninguna rutina con ese id"
            });
        }

        const routine = await Routine.findByIdAndDelete(id);

        // borramos las sesiones y workouts de la rutina
        for(let sessionId of routine.sessions) {
            await Session.findByIdAndDelete(sessionId);
        }
        await Workout.deleteMany({ routine: id });

        // OK
        res.json({
            ok: true,
            msg: 'deleteRoutine',
            routine
        })

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error eliminando rutina'
        });
    }

}

const validateRoutine = async(name, sessions, user) => {
    if(user) {
        const userDB = await User.findById(user);
    
        if (!userDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ningún usuario para ese id"
            });
        }
    }

    const routineDB = await Routine.findOne({ user, name });
    if(routineDB) {
        return res.status(HttpStatusCodeEnum.BadRequest).json({
            ok: false,
            msg: "Ya existe una rutina con ese nombre"
        });
    }

    const difficulties = [];
    for(let sessionId of sessions) {
        const sessionDB = await Session.findById(sessionId);
        if(!sessionDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "Alguna de las sesiones no existe"
            });
        }
        difficulties.push(sessionDB.difficulty);
    }

    return difficulties;
}