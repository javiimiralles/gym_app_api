import { response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Exercise from '../models/exercise.model.js';
import Routine from '../models/routine.model.js';
import { HttpStatusCodeEnum } from '../enums/HttpStatusCodeEnum.js';
import { infoToken } from '../utils/infotoken.js';

export const getUsers = async(req, res = response) => {
    const from = Number(req.query.from) || 0;
    const results = Number(req.query.results) || Number(process.env.DOCS_PER_PAGE);
    let text = req.query.text;

    const token = req.headers['x-token'];

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

        if(infoToken(token).role !== 'ADMIN') {
            return  res.status(HttpStatusCodeEnum.Unauthorized).json({
                ok: false,
                msg:"Solo los administradores pueden acceder a los usuarios"
            })
        }
        
        let filter = {};
        if(searchText) {
            filter.name = searchText;
        }

        const [users, count] = await Promise.all([
            User.find(filter).skip(from).limit(results).sort({ 'name': 1 }),
            User.countDocuments(filter)
        ])

        //OK
        res.json({
            ok: true,
            msg: 'getUsers',
            users,
            count
        })

    } catch (error) {
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error obteniendo usuarios'
        });
    }
}

export const createUser = async(req, res = response) => {

    const { email, password } = req.body;

    try{
        const userDB = await User.findOne({ email });

        // KO -> existe un usuario con ese email
        if(userDB){
            return  res.status(HttpStatusCodeEnum.BadRequest).json({
                ok: false,
                msg:"Ya existe un usuario con este email"
            })
        }
    
        const salt = bcrypt.genSaltSync();
        const cpassword = bcrypt.hashSync(password, salt);

        const object = req.body;
        const user = new User(object);
        user.password = cpassword;

        await user.save();

        res.json({
            ok:true,
            msg:"createUser",
            user
        });
    }
    catch(error){
        console.log(error);
        return  res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg:'Error creando usuario'
        })
    }
}

export const updateUser = async(req, res = response) => {

    const { password, email, ...object } = req.body;
    const uid = req.params.id;

    try {
        let userDB = await User.findById(uid);
        // KO -> no existe el usuario
        if(!userDB){
            return  res.status(HttpStatusCodeEnum.NotFound).json({
                ok:false,
                msg:'El usuario no existe'
            })
        }
    
        userDB = await User.findOne({ email });
    
        // KO -> existe un usuario con ese email
        if(userDB && userDB._id != uid) {
            return  res.status(HttpStatusCodeEnum.BadRequest).json({
                ok: false,
                msg:"Ya existe un usuario con este email"
            });
        }
    
        object.email = email;
        const user = await User.findByIdAndUpdate(uid, object, { new: true }); 
    
        res.json({
            ok:true,
            msg:"updateUser",
            user
        })
    } catch(error){
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg:'Error actualizando usuario'
        })
    }
}

export const deleteUser = async(req, res = response) => {
    const uid = req.params.id;

    try {

        let userDB = await User.findById(uid);
        // KO -> no existe el usuario
        if(!userDB){
            return  res.status(HttpStatusCodeEnum.NotFound).json({
                ok:false,
                msg:'El usuario no existe'
            })
        }

        const user = await User.findByIdAndDelete(uid);

        // Eliminamos todos los registros del resto de colecciones que esten relacionadas con este usuario
        await Exercise.deleteMany({ user: uid });
        await Routine.deleteMany({ user: uid });

        // OK
        res.json({
            ok:true,
            msg:"deleteUser",
            user
        })

    } catch(error){
        console.log(error);
        return res.status(HttpStatusCodeEnum.InternalServerError).json({
            ok: false,
            msg: 'Error borrando usuario'
        })
    }
}