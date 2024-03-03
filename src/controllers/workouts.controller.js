import { response } from 'express';
import User from '../models/user.model.js';
import Workout from '../models/workout.model.js';
import Exercise from '../models/exercise.model.js';
import Session from '../models/session.model.js';
import Routine from '../models/routine.model.js';
import { HttpStatusCodeEnum } from '../enums/HttpStatusCodeEnum.js';

export const getWorkoutById = async(req, res = response) => {

    const id = req.params.id;

    try {

        const workout = await Workout.findById(id).populate('exercises.exercise').populate('session');

        if(!workout) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ningún entrenamiento con ese id"
            });
        }

        res.json({
            ok: true,
            msg: 'getWorkoutById',
            workout
        });

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error obteniendo entrenamiento por id'
        });
    }
}

export const getWorkouts = async(req, res = response) => {
    const userId = req.params.userId;
    const from = Number(req.query.from) || 0;
    const results = Number(req.query.results) || Number(process.env.DOCS_PER_PAGE);
    const startDate = !isNaN(Date.parse(req.query.startDate)) ? new Date(req.query.startDate) : null;
    const endDate = !isNaN(Date.parse(req.query.endDate)) ? new Date(req.query.endDate) : null;

    try {

        const user = await User.findById(userId);
    
        if (!user) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ningún usuario para ese id"
            });
        }

        let filter = { user: userId };

        if(startDate && endDate) {
            filter.date = { $gte: startDate, $lte: endDate };
        } else if(startDate) {
            filter.date = { $gte: startDate };
        } else if(endDate) {
            filter.date = { $lte: endDate };
        }

        const workouts = await Workout.find(filter)
                        .populate('exercises.exercise')
                        .populate('session')
                        .skip(from)
                        .limit(results);

        //OK
        res.json({
            ok: true,
            msg: 'getWorkouts',
            workouts
        })

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error obteniendo entrenamientos'
        });
    }
}

export const getLastWorkout = async(req, res = response) => {

    const sessionId = req.params.sessionId;

    try {

        const sessionDB = await Session.findById(sessionId);
        if(!sessionDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ninguna sesión para ese id"
            });
        }

        const workout = await Workout.findOne({ session: sessionId }).sort({ date: -1 });
        // OK -> devolvemos OK exista o no el ultimo workout
        res.json({
            ok: true,
            msg: 'getLastWorkout',
            workout
        })

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error obteniendo el último entrenamiento'
        });
    }

}

export const createWorkout = async(req, res = response) => {

    const { user, session, exercises, routine, ...object } = req.body;

    try {

        const userDB = await User.findById(user);
        if (!userDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ningún usuario para ese id"
            });
        }

        const sessionDB = await Session.findById(session);
        if(!sessionDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ninguna sesión para ese id"
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

        // recuperamos la rutina a la que pertenece este workout
        const routine = await Routine.findOne({ sessions: { $elemMatch: { $eq: session } } });
        if(!routine) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ninguna rutina para este entrenamiento"
            });
        }

        // aumentamos en uno el iterador o lo devolvemos a 0
        if(routine.iterator < routine.sessions.length - 1) {
            routine.iterator++;
        } else {
            routine.iterator = 0;
        }

        await Routine.findByIdAndUpdate(routine._id, routine, { new: true });

        object.user = user;
        object.exercises = exercises;
        object.session = session;
        object.routine = routine._id;
        const workout = new Workout(object);

        await workout.save();

        //OK
        res.json({
            ok: true,
            msg: 'createWorkout',
            workout
        })

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error creando entrenamiento'
        });
    }
}

export const updateWorkout = async(req, res = response) => {

    const { user, session, exercises, routine, ...object } = req.body;
    const id = req.params.id;

    try {

        const workoutDB = await Workout.findById(id);
        if(!workoutDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ningún entrenamiento para ese id"
            });
        }

        const userDB = await User.findById(user);
        if (!userDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ningún usuario para ese id"
            });
        }

        const sessionDB = await Session.findById(session);
        if(!sessionDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ninguna sesión para ese id"
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

        object.user = user;
        object.exercises = exercises;
        object.session = session;
        const workout = await Workout.findByIdAndUpdate(id, object, { new: true });

        //OK
        res.json({
            ok: true,
            msg: 'updateWorkout',
            workout
        })

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error editando entrenamiento'
        });
    }
}

export const deleteWorkout = async(req, res = response) => {

    const id = req.params.id;

    try {

        const workoutDB = await Workout.findById(id);
        if(!workoutDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ningún entrenamiento para ese id"
            });
        }

        const workout = await Workout.findByIdAndDelete(id);

        //OK
        res.json({
            ok: true,
            msg: 'deleteWorkout',
            workout
        })

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error eliminando entrenamiento'
        });
    }

}