const express = require("express");
const router = express.Router();
const Participante = require("../controllers/participante");
const check = require("../middlewares/auth");

//Definir rutas
router.get("/add", Participante.pruebaParticipante);
router.post("/register", check.auth, Participante.register);
router.post("/addQr", check.auth, Participante.addQr);
router.post("/getParticipante", Participante.getParticipante);
router.post("/addName", Participante.addNames);
router.post("/getAllParticipante", Participante.getAllParticipante);
router.post("/getAllParticipantes", Participante.getAllParticipantes);
router.get("/getParticipantes", check.auth, Participante.getParticipantes);
router.post("/sendEmailQr", check.auth, Participante.sendEmailQr);
router.post("/getParticipanteByEmail", Participante.getParticipanteByEmail);
router.delete("/deleteParti", check.auth, Participante.deleteParti);
router.post("/getCounters", Participante.getCounters);
router.post("/getParticipanteRepeat", check.auth, Participante.getParticipanteRepeat);
router.post("/sendEmail", check.auth, Participante.sendEmail);
router.get("/getParticipantesMail", check.auth, Participante.getParticipantesMail);
/* router.post("/save", check.auth, FollowController.save);
router.delete("/unfollow/:id", check.auth, FollowController.unfollow);
router.get("/following/:id?/:page?", check.auth, FollowController.following);
router.get("/followers/:id?/:page?", check.auth, FollowController.followers); */

//Exportar el router
module.exports = router;