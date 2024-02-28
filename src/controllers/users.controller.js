import { response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Exercise from '../models/exercise.model.js';
import Routine from '../models/routine.model.js';
import { HttpStatusCodeEnum } from '../enums/HttpStatusCodeEnum.js';

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

        await usuario.save();

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