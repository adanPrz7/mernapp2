//Importar dependecias y modulos
const bcrypt = require("bcrypt");
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");
//Importar modelo
const User = require("../models/user");
/* const Boleto = require("../models/Boleto.js");
const Participante = require("../models/Participante.js");
const Ticket = require("../models/Ticket.js"); */

//Importar servicios
const jwt = require("../services/jwt");
//const followService = require("../services/followService");


//Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/user.js",
        usuario: req.user
    });
}

//Registro de usuarios
const register = (req, res) => {
    //Obtener los datos
    let params = req.body;

    //Comprobador que llegan los datos bien
    if (!params.nameUser || !params.surname || !params.email || !params.password) {
        return res.status(400).json({
            message: "Faltan datos por enviar",
            status: "error"
        });
    }

    //Control de usuarios duplicados
    User.find({ email: params.email.toLowerCase() }).then(async (users) => {
        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe"
            });
        }
        //Cifrar la contraseña
        params.password = await bcrypt.hash(params.password, 10);

        //Crear un objeto de usuario
        let user_to_save = new User(params);

        //Guardar usuario en la bbdd
        user_to_save.save().then((userStored) => {
            //Devolver resultado
            return res.status(200).json({
                status: "success",
                message: "User was added",
                user: userStored.email
            });
        }).catch((error) => {
            return res.status(500).json({ status: "error", message: "error en al consulta de usuarios" });
        });
    });
}

const login = (req, res) => {
    //Obtener parametros body
    let params = req.body;
    if (!params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }
    //Buscar en la bbdd si existe
    User.findOne({ email: params.email })
        //.select({"password":0})
        .then((user) => {
            if (!user) return res.status(404).send({ status: "Error", message: "No te has identificado correctamente" });
            //Comprobar su contraseña
            const pwd = bcrypt.compareSync(params.password, user.password)
            if (!pwd) {
                return res.status(400).send({
                    status: "Error",
                    message: "No te has identificado correctamente"
                })
            }
            //Devolver token
            const token = jwt.createToken(user);
            console.log(jwt.secret);

            //Devolver datos del usuario
            return res.status(200).send({
                status: "success",
                message: "Te has identificado correctamente",
                user: {
                    id: user._id,
                    name: user.name,
                },
                token
            })
        }).catch((error) => {
            return res.status(500).send({
                status: "Error",
                message: "Error de conexión",
                fail: error
            });
        });
}

const profile = (req, res) => {
    //Recibir el parametro del id del usuario por la url
    const params = req.body;
    if (!params.userId) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }
    //Consulta para obtener los datos del usuario
    User.findById(params.userId).select({ password: 0, role: 0, __v: 0 }).then(async (userProfile) => {
        if (!userProfile) return res.status(404).send({ status: "error", message: "No es posible encontrar el usuario" });

        //Devolver el resultado
        return res.status(200).send({
            status: "success",
            user: userProfile
        });
    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "No es posible encontrar el usuario"
        })
    });
}

module.exports = {
    pruebaUser,
    register,
    login,
    profile
}
