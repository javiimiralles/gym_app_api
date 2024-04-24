import { response } from 'express';
import User from '../models/user.model.js';
import Exercise from '../models/exercise.model.js';
import { HttpStatusCodeEnum } from '../enums/HttpStatusCodeEnum.js';
import { infoToken } from '../utils/infotoken.js';

export const getExerciseById = async(req, res = response) => {

    const id = req.params.id;

    try {

        const exercise = await Exercise.findById(id);

        if(!exercise) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ningún ejercicio con ese id"
            });
        }

        res.json({
            ok: true,
            msg: 'getExerciseById',
            exercise
        });

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error obteniendo ejercicio por id'
        });
    }
}

export const getExercises = async(req, res = response) => {
    const from = Number(req.query.from) || 0;
    const results = Number(req.query.results) || Number(process.env.DOCS_PER_PAGE);
    let text = req.query.text;
    const userId = req.query.userId;
    const difficulty = req.query.difficulty;
    const muscle = req.query.muscle;

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

        let filter = {};

        if(userId) {
            const user = await User.findById(userId);
    
            if (!user) {
                return res.status(HttpStatusCodeEnum.NotFound).json({
                    ok: false,
                    msg: "No existe ningún usuario para ese id"
                });
            }

            filter.$or = [{ user: userId }, { userId: null }];
        } else {
            filter.userId = null;
        }

        if(difficulty) {
            filter.difficulty = difficulty;
        }

        if(searchText) {
            filter.name = searchText;
        }

        if(muscle) {
            filter.muscles = muscle;
        }

        const [exercises, count] = await Promise.all([
            Exercise.find(filter).skip(from).limit(results).sort({ 'name': 1 }),
            Exercise.countDocuments(filter)
        ])

        //OK
        res.json({
            ok: true,
            msg: 'getExercises',
            exercises,
            count
        })

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error obteniendo ejercicios'
        });
    }
}

export const createExercise = async(req, res = response) => {

    const token = req.headers['x-token'];
    const { name, user, ...object } = req.body;
    
    if(!user && infoToken(token).role !== 'ADMIN') {
        return res.status(HttpStatusCodeEnum.Unauthorized).json({
            ok: false,
            msg: "Solo los administradores pueden crear ejercicios predeterminados"
        });
    }

    try {
        if(user) {
            const userDB = await User.findById(user);
        
            if (!userDB) {
                return res.status(HttpStatusCodeEnum.NotFound).json({
                    ok: false,
                    msg: "No existe ningún usuario para ese id"
                });
            }
        }

        const exerciseDB = await Exercise.findOne({ $or: [{ user: user }, { user: null }], name });
        if(exerciseDB) {
            return res.status(HttpStatusCodeEnum.BadRequest).json({
                ok: false,
                msg: "Ya existe un ejercicio con ese nombre"
            });
        }

        object.name = name;
        object.user = user;
        const exercise = new Exercise(object);

        await exercise.save();

        // OK
        res.json({
            ok: true,
            msg: "createExercise",
            exercise
        })

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error creando ejercicio'
        });
    }
}

export const updateExercise = async(req, res = response) => {

    const token = req.headers['x-token'];
    const { name, user, ...object } = req.body;
    const id = req.params.id;
    
    if(!user && infoToken(token).role !== 'ADMIN') {
        return res.status(HttpStatusCodeEnum.Unauthorized).json({
            ok: false,
            msg: "Solo los administradores pueden editar ejercicios predeterminados"
            
        });
    }

    try {

        if(user) {
            const userDB = await User.findById(user);
        
            if (!userDB) {
                return res.status(HttpStatusCodeEnum.NotFound).json({
                    ok: false,
                    msg: "No existe ningún usuario para ese id"
                });
            }
        }

        let exerciseDB = await Exercise.findById(id);

        if(!exerciseDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ningún ejercicio para ese id"
            });
        }

        if(user) {
            exerciseDB = await Exercise.findOne({ user: user, name });
            if(exerciseDB && exerciseDB._id.toString() !== id) {
                return res.status(HttpStatusCodeEnum.BadRequest).json({
                    ok: false,
                    msg: "Ya existe un ejercicio con ese nombre"
                });
            }
        } else {
            exerciseDB = await Exercise.findOne({ user: null, name });
            if(exerciseDB && exerciseDB._id.toString() !== id) {
                return res.status(HttpStatusCodeEnum.BadRequest).json({
                    ok: false,
                    msg: "Ya existe un ejercicio con ese nombre"
                });
            }
        }

        object.name = name;
        object.user = user;
        const exercise = await Exercise.findByIdAndUpdate(id, object, { new: true });
        
        // OK
        res.json({
            ok: true,
            msg: "updateExercise",
            exercise
        });

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error editando ejercicio'
        });
    }
}

export const deleteExercise = async(req, res = response) => {

    const token = req.headers['x-token'];
    const id = req.params.id;

    try {

        const exerciseDB = await Exercise.findById(id);

        if(!exerciseDB) {
            return res.status(HttpStatusCodeEnum.NotFound).json({
                ok: false,
                msg: "No existe ningún ejercicio para ese id"
            });
        }

        if(exerciseDB.user === null && infoToken(token) !== 'ADMIN') {
            return res.status(HttpStatusCodeEnum.Unauthorized).json({
                ok: false,
                msg: "Solo los administradores pueden borrar ejercicios predeterminados"
            });
        }

        const exercise = await Exercise.findByIdAndDelete(id);

        // OK
        res.json({
            ok: true,
            msg: 'deleteExercise',
            exercise
        })

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error eliminando ejercicio'
        });
    }

}