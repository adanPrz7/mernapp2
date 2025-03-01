const express = require("express");
const router = express.Router();
const Ticket = require("../controllers/tickets");
const check = require("../middlewares/auth");

//Definir rutas
router.get("/prueba", Ticket.pruebaTickets);
router.post("/add", check.auth, Ticket.addTicket);
router.post("/getTicketsUI", check.auth, Ticket.getTicketsByUId);
router.delete("/deleteMany", check.auth, Ticket.deleteTickets);
router.delete("/deleteO", check.auth, Ticket.deleteO);
router.get("/getTicketsList", Ticket.getTicketsList);
//router.post("/register", check.auth, Participante.register);

//Exportar el router
module.exports = router;