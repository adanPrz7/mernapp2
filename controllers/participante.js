//Importar dependecias y modulos
const bcrypt = require("bcrypt");
const mongoosePagination = require("mongoose-pagination");
const nodemailer = require('nodemailer');

//Importar modelo
const Participante = require("../models/Participante");

//Acciones de prueba
const pruebaParticipante = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/participante.js",
        usuario: req.user
    });
}


//Registro de participante
const register = (req, res) => {
    //Obtener los datos
    let params = req.body;

    //Comprobador que llegan los datos bien
    if (!params.email) {
        return res.status(400).json({
            message: "Es necesario el email",
            status: "error"
        });
    }

    let newParti = new Participante(params);

    newParti.save().then(async (parti) => {
        if (!parti) return res.status(400).send({ status: "error", message: "No se ha podido guardar el participante" });

        return res.status(200).send({
            status: "Success",
            message: "Participante was saved",
            parti
        });
    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
        });
    });
}

const addQr = (req, res) => {
    let params = req.body;

    if (!params.qrCode || !params.money || !params.ticketsAssigned || !params.ticketCount || !params.userId) {
        return res.status(400).send({
            status: "error",
            message: "Falta informacion"
        });
    }

    Participante.find({ qrCode: params.qrCode }).then(async (partList) => {
        if (partList && partList.length >= 1) {
            return res.status(400).send({
                status: "error",
                message: "Cambia el Qr"
            });
        }
        //.select("-__v -money -ticketCount -created_at -ticketsAssigned")
        Participante.findByIdAndUpdate({ _id: params.userId }, params, { new: true }).then(async (partiUpdate) => {
            if (!partiUpdate) return res.status(500).send({ status: "error", message: "Error al actualizar" });

            return res.status(200).send({
                status: "success",
                message: "Qr was added",
                partiUpdate
            });
        }).catch((error) => {
            return res.status(500).send({
                status: "error",
                message: "error en la consulta"
            });
        });

    });
}

const getParticipante = (req, res) => {
    let params = req.body;

    if (!params.qrCode) return res.status(400).send({ status: "error", message: "Falta informacion" });

    Participante.findOne({ qrCode: params.qrCode }).select("email isFull").then(async (part) => {
        if (!part) return res.status(404).send({ status: "error", message: "No encontrado" });

        return res.status(200).send({
            status: "success",
            message: "Econtrado",
            part
        });

    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
        });
    });
}

const addNames = (req, res) => {
    let params = req.body;

    if (!params.namePart || !params.surname || !params.phone || !params.userId) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por cargar"
        });
    }
    params.isFull = true;
    Participante.findOneAndUpdate({
        $and: [
            { _id: params.userId },
            { isFull: false }
        ]
    }, params, { new: true }).select("-__v -money -ticketCount -created_at -ticketsAssigned").then(async (partiUpdate) => {
        if (!partiUpdate) return res.status(500).send({ status: "error", message: "Error al actualizar" });

        return res.status(200).send({
            status: "success",
            message: "Principal data was added",
            partiUpdate
        });
    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
        });
    });

    /* Participante.find({ qrCode: params.qrCode }).then(async (part) => {
        if (!part) return res.status(404).send({ status: "error", message: "No encontrado" });

        //return res.status(200).send({ status: "success", message: "Encontrado", part });
        let auxPart = await part._id;
        console.log(part);
        //console.log(auxPart._id);

        delete params.qrCode;
        //AQUI VA
    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
        });
    }); */
}

const getAllParticipante = (req, res) => {
    let params = req.body;

    if (!params.userId) return res.status(400).send({ status: "error", message: "Falta informacion" });

    Participante.findById(params.userId).select("email isFull qrCode namePart phone surname").then(async (part) => {
        if (!part) return res.status(404).send({ status: "error", message: "No encontrado" });

        return res.status(200).send({
            status: "success",
            message: "Econtrado",
            part
        });

    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
        });
    });
}

const getParticipantes = (req, res) => {
    let params = req.body;

    //if (!params.userId) return res.status(400).send({ status: "error", message: "Falta informacion" });

    Participante.find().select("email isFull namePart surname money ticketCount ticketsAssigned").then(async (partList) => {
        if (!partList) return res.status(404).send({ status: "error", message: "No hay participantes" });

        return res.status(200).send({
            status: "success",
            message: "Econtrado",
            partList
        });

    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
        });
    });
}

const sendEmailQr = async (req, res) => {
    let params = req.body;

    if (!params.userId) return res.status(400).send({ status: "error", message: "Falta informacion" });

    Participante.findById(params.userId).select("email").then(async (part) => {
        if (!part) return res.status(404).send({ status: "error", message: "No encontrado" });

        const transporter = nodemailer.createTransport({
            host: 'smtp.hostinger.com',
            port: 465,
            secure: true,
            auth: {
                user: 'folios@compraygana2024pds.com',
                pass: 'A|z$8ps2'
            }, tls: {
                rejectUnauthorized: false,
            }
        });
    
    
    
        const imageBase64Content = params.imgB;
        const html = `<div>Ingresa a las siguientes ligas para descargar la App de Plaza del Sol y poder leer tu codigo QR</div>
        <br/>
        <a href="https://play.google.com/store/apps/details?id=com.plazadelsol.app">Android</a>
        <a href="https://apps.apple.com/mx/app/plaza-del-sol-app/id1548986329">IOS</a>
        <br/>
        Tu código QR: <br/>
        <img src="cid:unique@nodemailer.com" alt="Red dot"/>
        `
    
        const info = await transporter.sendMail({
            from: "'Folios' <folios@compraygana2024pds.com>",
            to: part.email,
            subject: 'Tus cupones digitales de compra y gana Plaza del Sol',
            html: html,
            attachments: [{
                  cid: "unique@nodemailer.com",
                  filename: 'my-image.png',
                  content: Buffer.from(imageBase64Content, 'base64'),
                  contentDisposition: 'inline',
                },
              ],
        });

        return res.status(200).send({
            status: "success",
            message: "Econtrado",
            info: info.messageId
        });

    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
        });
    });
}

module.exports = {
    pruebaParticipante,
    register,
    addQr,
    addNames,
    getParticipante,
    getAllParticipante,
    getParticipantes,
    sendEmailQr
}