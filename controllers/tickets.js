const Ticket = require("../models/Ticket");

//Acciones de prueba
const pruebaTickets = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/tickets.js",
        usuario: req.user
    });
}

const addTicket = (req, res) =>{
    //Obtener los datos
    let params = req.body;

    //Comprobador que llegan los datos bien
    if (!params.userId || !params.money || !params.dateBuy || !params.category, !params.store) {
        return res.status(400).json({
            message: "Faltan datos por ingresar",
            status: "error"
        });
    }

    let newTicket = new Ticket(params);
    newTicket.parti = params.userId;

    newTicket.save().then((ticketStore) => {
        if (!ticketStore) return res.satus(400).send({ status: "error", message: "No se pudo guardar el ticket" });

        return res.status(200).send({
            status: "Success",
            message: "Ticket guardado"
        });
    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
        });
    });
}

const getTicketsByUId = (req, res) =>{
    let params = req.body;

    if(!params.userId){
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por ingresar"
        })
    }

    Ticket.find({parti: params.userId}).then(async (tickets) =>{
        return res.status(200).send({
            status: "success",
            message: "OK",
            tickets
        })
    })
}

module.exports = {
    pruebaTickets,
    addTicket,
    getTicketsByUId
}