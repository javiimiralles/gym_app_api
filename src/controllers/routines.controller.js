import { response } from 'express';
import User from '../models/user.model.js';
import Session from '../models/session.model.js';
import Routine from '../models/routine.model.js';
import Workout from '../models/workout.model.js';
import { HttpStatusCodeEnum } from '../enums/HttpStatusCodeEnum.js';
import { filterDifficulty } from '../utils/filterArray.js';
import { infoToken } from '../utils/infotoken.js';

export const getRoutineById = async(req, res = response) => {

    const id = req.params.id;

    try {

        const routine = await Routine.findById(id).populate({
            path: 'sessions',
            populate: { 
                path: 'exercises.exercise',
                model: 'Exercise' 
            }
        });

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

        const [routines, count] = await Promise.all([
            Routine.find(filter).populate('sessions').sort({ active: -1, 'name': 1 }).skip(from).limit(results),
            Routine.countDocuments(filter)
        ])

        //OK
        res.json({
            ok: true,
            msg: 'getRoutines',
            routines,
            count
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
            routine: activeRoutine,
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

// la rutina se crea vacia en un principio
export const createRoutine = async(req, res = response) => {

    const { user, ...object } = req.body;

    try {

        const userDB = await User.findById(user);
        if (!userDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ningún usuario para ese id"
            });
        }

        object.user = user;
        object.active = false;
        object.sessions = [];
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

// este metodo es para la crwcion de rutinas por parte de los admin
export const createRoutineByAdmin = async(req, res = response) => {

    const token = req.headers['x-token'];
    const { user, name, sessions, ...object } = req.body;

    try {

        if(infoToken(token).role !== 'ADMIN') {
            return res.status(HttpStatusCodeEnum.Unauthorized).json({
                ok: false,
                msg: "Solo los administradores tiene acceso a este servicio"
            });
        }

        const userDB = await User.findById(user);
        if (!userDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ningún usuario para ese id"
            });
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

        object.difficulty = filterDifficulty(difficulties);
        object.name = name;
        object.user = user;
        object.sessions = sessions;
        const routine = new Routine(object);

        await routine.save();

        // OK
        res.json({
            ok: true,
            msg: 'createRoutineByAdmin',
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

        let routineDB = await Routine.findById(id);
        if(!routineDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No se ha encontrado ninguna rutina con ese id"
            });
        }

        if(user) {
            const userDB = await User.findById(user);
        
            if (!userDB) {
                return res.status(HttpStatusCodeEnum.NotFound).json({
                    ok: false,
                    msg: "No existe ningún usuario para ese id"
                });
            }
        }
    
        routineDB = await Routine.findOne({ user, name });
        if(routineDB && routineDB._id != id) {
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

export const changeActiveRoutine = async(req, res = response) => {
    const id = req.params.id;
    const userId = req.params.userId;

    try {

        const user = await User.findById(userId);
        if (!user) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ningún usuario para ese id"
            });
        }

        const routineDB = await Routine.findById(id);
        if(!routineDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No se ha encontrado ninguna rutina con ese id"
            });
        }

        // si se va a activar la rutina se busca si hay otra activa y se desactiva
        if(routineDB.active == false) {
            const activeRoutine = await Routine.findOne({ user: userId, active: true });
            if(activeRoutine) {
                activeRoutine.active = false;
                await Routine.findByIdAndUpdate(activeRoutine._id, activeRoutine, { new: true });
            }
        }

        routineDB.active = !routineDB.active;
        const routine = await Routine.findByIdAndUpdate(id, routineDB, { new: true });

        // OK 
        res.json({
            ok: true,
            msg: 'changeActiveRoutine',
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

export const updateRoutineSessions = async(req, res = response) => {

    const id = req.params.id;
    const { sessionId, mode } = req.body;

    try {

        const routineDB = await Routine.findById(id);
        if(!routineDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No se ha encontrado ninguna rutina con ese id"
            });
        }

        const sessionDB = await Session.findById(sessionId);
        if(!sessionDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No se ha encontrado ninguna sesión con ese id"
            });
        }

        if(mode === 'add') {
            if(!routineDB.sessions) {
                routineDB.sessions = [];
            } 
            routineDB.sessions.push(sessionId);
        } else {
            const index = routineDB.sessions.indexOf(sessionId);
            routineDB.sessions.splice(index, 1);
            await Session.findByIdAndDelete(sessionId);
        }

        const difficulties = [];
        for(let sessionId of routineDB.sessions) {
            const sessionDB = await Session.findById(sessionId);
            if(!sessionDB) {
                return res.status(HttpStatusCodeEnum.NotFound).json({
                    ok: false,
                    msg: "Alguna de las sesiones no existe"
                });
            }
            difficulties.push(sessionDB.difficulty);
        }

        routineDB.difficulty = filterDifficulty(difficulties);
        const routine = await Routine.findByIdAndUpdate(id, routineDB, { new: true });

        // OK 
        res.json({
            ok: true,
            msg: 'updateRoutineSessions',
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

export const skipSession = async(req, res = response) => {

    const id = req.params.id;

    try {

        const routineDB = await Routine.findById(id);
        if(!routineDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No se ha encontrado ninguna rutina con ese id"
            });
        }

        if(routineDB.iterator < routineDB.sessions.length - 1) {
            routineDB.iterator++;
        } else {
            routineDB.iterator = 0;
        }

        const routine = await Routine.findByIdAndUpdate(id, routineDB, { new: true });

        // OK 
        res.json({
            ok: true,
            msg: 'skipSession',
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