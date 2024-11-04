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

const deleteTickets = (req, res) =>{
    let params = req.body;

    if(!params.idParti){
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por ingresar"
        });
    }

    Ticket.deleteMany({"parti": params.idParti}).then((ticketsDeleted) => {
        if (!ticketsDeleted) return res.status(500).send({ status: "error", message: "No se pudo eliminar el participante" });

        return res.status(200).send({
            status: "success",
            message: "Eliminado",
            info: params
        });
    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
        });
    });
}

const deleteO = async (req, res) => {
    let params = req.body;
    console.log(params);
    if (!params._id) return res.status(400).send({ status: "error", message: "Falta informacion" });

    Ticket.deleteOne({"_id": params._id}).then((ticketDeleted) => {
        if (!ticketDeleted) return res.status(500).send({ status: "error", message: "No se pudo eliminar el ticket" });

        return res.status(200).send({
            status: "success",
            message: "Eliminado",
            info: params
        });
    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
        });
    });

}

module.exports = {
    pruebaTickets,
    addTicket,
    getTicketsByUId,
    deleteTickets,
    deleteO
}