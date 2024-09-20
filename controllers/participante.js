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
        <a href="https://play.google.com/store/apps/details?id=com.plazadelsol.app">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.8751 18.0571H7.08504C6.65888 18.0571 6.3125 17.7117 6.3125 17.2846V10.3463C6.3125 7.22985 8.86266 4.67969 11.9801 4.67969C15.0965 4.67969 17.6467 7.22985 17.6467 10.3463V17.2846C17.6467 17.7117 17.3013 18.0571 16.8751 18.0571Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
<path d="M6.3125 11.3047H17.6467" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
<path d="M14.0482 18.0547V20.6175M9.70312 18.0547V20.6175" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
<path d="M13.8079 8.57031V8.58031M9.91602 8.57031V8.58031" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
<path d="M16.5045 3.38281L15.1287 5.38422M7.45703 3.38281L8.77833 5.38422" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
<path d="M21 10.9961V15.679M3 10.9961V15.679" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>Android</a>
        <a href="https://apps.apple.com/mx/app/plaza-del-sol-app/id1548986329"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M18.6975 16.4199C17.8945 15.9809 17.3335 15.2129 17.1555 14.2969C16.8745 13.0639 17.3625 11.7909 18.4175 11.0419C18.5225 10.9589 18.7705 10.7659 18.7985 10.4439C18.8265 10.1279 18.6235 9.89988 18.5685 9.83888C17.5775 8.64788 16.0135 8.07288 14.4905 8.34688C13.9405 8.44188 13.3955 8.61288 12.8675 8.85688C12.3945 9.08088 11.8355 9.07088 11.3755 8.83488C9.34949 7.77588 6.84049 8.47688 5.66049 10.4339C4.99449 11.4659 4.67349 12.7149 4.75449 13.9199C4.75849 15.1069 4.98249 16.2739 5.41549 17.3789C5.90949 18.7459 6.69249 20.0169 7.64349 21.0139C8.14249 21.6629 8.90149 22.0109 9.66649 22.0099C10.1035 22.0099 10.5425 21.8969 10.9355 21.6619C11.7645 21.2269 12.7665 21.2089 13.5645 21.5819C14.8045 22.3569 16.4265 22.0229 17.2195 20.8689C18.0635 19.9059 18.7125 18.8169 19.1515 17.6199C19.3675 17.0109 19.2725 16.7539 18.6975 16.4199Z" fill="#000000"></path>
<path fill-rule="evenodd" clip-rule="evenodd" d="M12.0359 7.98834H12.0429C13.2669 7.97134 14.3339 7.48234 15.0479 6.60834C15.7559 5.74034 16.0209 4.60634 15.7949 3.41534C15.7479 3.16734 15.5179 2.98934 15.2719 3.00934C14.1329 3.08134 13.1189 3.58334 12.4179 4.42534C11.7059 5.27734 11.3909 6.38634 11.5289 7.54834C11.5589 7.79934 11.7829 7.98834 12.0359 7.98834Z" fill="#000000"></path>
</svg>IOS</a>
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