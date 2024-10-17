//Importar dependecias y modulos
const mongoosePagination = require("mongoose-pagination");
const nodemailer = require('nodemailer');

//Importar modelo
const Boleto = require("../models/Boleto");
const Participante = require("../models/Participante");

const fs = require("fs");
const PDFDocument = require("../libs/pdftable");
const path = require("path");

//Acciones de prueba
const pruebaBoleto = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/boleto.js",
        usuario: req.user
    });
}

//Registro de boleto
const register = async (req, res) => {
    //Obtener los datos
    let params = req.body;

    //Comprobador que llegan los datos bien
    if (!params.userId) {
        return res.status(400).json({
            message: "Es necesario el usuario",
            status: "error"
        });
    }

    let total = "0000000".concat((await Boleto.countDocuments() + 1));
    let auxFolio = total.substring(total.length - 6);

    Boleto.find({ folio: auxFolio }).then(async (boleto) => {
        if (boleto && boleto.length >= 1) return res.status(400).send({ status: "error", message: "Ya existe un folio" });

        /* return res.status(200).send({
            status: "Success",
            message: "Boleto was saved",
            folio: auxFolio,
            params,
            boleto
        }); */
        params.folio = auxFolio;
        let newBoleto = new Boleto(params);
        newBoleto.parti = params.userId;

        newBoleto.save().then((boletoStore) => {
            if (!boletoStore) return res.satus(400).send({ status: "error", message: "No se pudo guardar el cupon electronico" });

            return res.status(200).send({
                status: "Success",
                message: "cupon electronico guardado",
                boletoStore,
                folio: auxFolio,
                params
            });
        }).catch((error) => {
            return res.status(500).send({
                status: "error",
                message: "error en la consulta"
            });
        });
    });
}

const updateBol = (req, res) => {
    let params = req.body;

    if (!params.bolId || !params.numSpheres) {
        return res.status(400).send({
            status: "error",
            message: "faltan datos"
        });
    }

    //Participante.findByIdAndUpdate({ _id: params.userId }, params, { new: true }).then(async (partiUpdate) => {
    params.isFull = true;
    Boleto.findOneAndUpdate({
        $and: [
            { _id: params.bolId },
            { isFull: false }
        ]
    }, params, { new: true }).then(async (boletoStore) => {
        if (!boletoStore) return res.status(400).send({ status: "error", message: "Error al actualizar" });

        return res.status(200).send({
            status: "success",
            message: "Bol was update",
            boletoStore
        });
    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
        });
    });
}

const getNextBol = (req, res) => {
    let params = req.body;

    if (!params.userId) {
        return res.status(400).send({
            status: "error",
            message: "falta el dato"
        });
    }

    Boleto.findOne({
        $and: [
            { parti: params.userId },
            { isFull: false }
        ]
    }).then(async (boletoStore) => {
        if (!boletoStore) return res.status(200).send({ status: "error", message: "No hay" });

        return res.status(200).send({
            status: "success",
            message: "it was finded",
            boletoStore
        })
    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
        });
    });
}

const getNumberBol = async (req, res) => {
    let params = req.body;
    if (!params.userId) {
        return res.status(400).send({
            status: "error",
            message: "falta el dato"
        });
    }
    let parti = await Participante.findById({ _id: params.userId }).select("-created_at -__v -money -ticketCount -ticketsAssigned");
    let bolList = await Boleto.find({ parti: params.userId });
    let bolTrue = bolList.filter(x => x.isFull == true).length;
    let bolFalse = bolList.filter(x => x.isFull == false).length;


    return res.status(200).send({
        status: "success",
        message: "lista",
        parti,
        true: bolTrue,
        false: bolFalse,
        total: bolList.length

    });
}

const getAllByIdFalse = async (req, res) => {
    let params = req.body;
    if (!params.userId) {
        return res.status(400).send({
            status: "error",
            message: "falta el dato"
        });
    }

    await Boleto.find({
        $and: [
            { parti: params.userId },
            { isFull: false }
        ]
    }).then((listBol) => {
        if (!listBol) return res.status(200).send({ status: "error", message: "No hay" });

        let auxList = listBol.length > 10 ? listBol.slice(0, 10) : listBol;
        return res.status(200).send({
            status: "success",
            message: "Lista",
            bolList: auxList
        });
    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
        });
    });
}

const getAllByIdTrue = async (req, res) => {
    let params = req.body;
    if (!params.userId) {
        return res.status(400).send({
            status: "error",
            message: "falta el dato"
        });
    }

    Boleto.find({
        $and: [
            { parti: params.userId },
            { isFull: true }
        ]
    }).then(async (listBol) => {
        if (!listBol) return res.status(200).send({ status: "error", message: "No hay" });

        return res.status(200).send({
            status: "success",
            message: "Lista",
            bolList: await listBol
        });
    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
        });
    });
}

const sendEmailFolios = async (req, res) => {
    let params = req.body;
    if (!params.userId) {
        return res.status(400).send({
            status: "error",
            message: "falta el dato"
        });
    }

    Boleto.find({
        $and: [
            { parti: params.userId },
            { isFull: true }
        ]
    }).then(async (listBol) => {
        if (!listBol) return res.status(200).send({ status: "error", message: "No hay" });

        let auxList = await listBol;
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

        let html = `<div>Registro de tus cupones electronicos</div><br/>`
        for(let i = 0; i < auxList.length; i++){
            html+= `<p>Folio: ${auxList[i].folio} / Numero de pelotas: ${auxList[i].numSpheres}</p>`
        }

        const info = await transporter.sendMail({
            from: "'Folios' <folios@compraygana2024pds.com>",
            to: 'adan.prz.7@gmail.com',
            subject: 'Tus cupones digitales de compra y gana - Plaza del Sol',
            html: html
        });

        return res.status(200).send({
            status: "success",
            message: "Lista",
            info: info.messageId
        });
    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
        });
    });
}

const sendEmailFolios2 = async (req, res) => {
    let params = req.body;
    if (!params.userId) {
        return res.status(400).send({
            status: "error",
            message: "falta el dato"
        });
    }

    Boleto.find({
        $and: [
            { parti: params.userId },
            { isFull: true }
        ]
    }).then(async (listBol) => {
        if (!listBol) return res.status(200).send({ status: "error", message: "No hay" });

        let auxList = await listBol;
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

        let html = `<div>Registro de tus cupones electronicos</div><br/>`
        for(let i = 0; i < auxList.length; i++){
            html+= `<p>Folio: ${auxList[i].folio} / Numero de pelotas: ${auxList[i].numSpheres}</p>`
        }

        const info = await transporter.sendMail({
            from: "'Folios' <folios@compraygana2024pds.com>",
            to: 'adan.prz.7@gmail.com',
            subject: 'Tus cupones digitales de compra y gana - Plaza del Sol',
            html: html
        });

        return res.status(200).send({
            status: "success",
            message: "Lista",
            info: info.messageId
        });
    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
        });
    });
}

const createPDFDinamic = (req, res) => {
    let params = req.body;
    if (!params.email) {
        return res.status(400).send({
            status: "error",
            message: "falta el dato"
        });
    }
    // Create The PDF document
    const doc = new PDFDocument();
    // Pipe the PDF into a patient's file
    doc.pipe(fs.createWriteStream(`PDF/${params.email}.pdf`));

    // Add the header - https://pspdfkit.com/blog/2019/generate-invoices-pdfkit-node/
    doc
        .image("logo.png", 50, 45, { width: 50 })
        .fillColor("#444444")
        .fontSize(20)
        .text("Tus cupones digitales de compra y gana Plaza del Sol.", 110, 57)
        .fontSize(10)
        .moveDown();

    // Create the table - https://www.andronio.me/2017/09/02/pdfkit-tables/
    const table = {
        headers: ["Folio", "#"],
        rows: []
    };

    /* Participante.find({email: params.email}).select("email isFull qrCode namePart phone surname").then(async (auxPart) => {
        if (!auxPart) return res.status(404).send({ status: "error", message: "No encontrado" });

        return res.status(200).send({
            status: "success",
            message: "Econtrado",
            part,
            auxPart
        });

    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
        });
    }); */

    Boleto.find({
        $and: [
            { parti: params.userId },
            { isFull: true }
        ]
    }).then(async (listBol) => {
        if (!listBol) return res.status(200).send({ status: "error", message: "No hay" });

        // Add the patients to the table
        for (const bol of listBol) {
            table.rows.push([bol.folio, bol.numSpheres])
        }

        // Draw the table
        doc.moveDown().table(table, 10, 125, { width: 590 });

        // Finalize the PDF and end the stream
        doc.end();
        return res.status(200).send({
            status: "success",
            message: "Hecho"
        });
    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
        });
    });
}

const getPDF = (req, res) => {
    /* let params = req.body;
    if (!params.email) {
        return res.status(400).send({
            status: "error",
            message: "falta el dato"
        });
    } */
    const filePath = `PDF/adan.prz.7@gmail.com.pdf`;
    fs.stat(filePath, (error, exists) => {
        if (!exists) return res.status(404).send({ status: "error", message: "No existe el archivo" });
        //Devolver un file
        return res.sendFile(path.resolve(filePath));
    })
}

module.exports = {
    pruebaBoleto,
    register,
    updateBol,
    getNextBol,
    getNumberBol,
    getAllByIdFalse,
    getAllByIdTrue,
    sendEmailFolios,
    getPDF,
    createPDFDinamic
}