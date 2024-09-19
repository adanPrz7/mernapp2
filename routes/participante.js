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
router.get("/getParticipantes", check.auth, Participante.getParticipantes);
router.post("/sendEmailQr", check.auth, Participante.sendEmailQr);
/* router.post("/save", check.auth, FollowController.save);
router.delete("/unfollow/:id", check.auth, FollowController.unfollow);
router.get("/following/:id?/:page?", check.auth, FollowController.following);
router.get("/followers/:id?/:page?", check.auth, FollowController.followers); */

//Exportar el router
module.exports = router;