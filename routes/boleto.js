const express = require("express");
const router = express.Router();
const Boleto = require("../controllers/boleto");
const check = require("../middlewares/auth");

//Definir rutas
router.get("/prueba", Boleto.pruebaBoleto);
router.post("/register", check.auth, Boleto.register);
router.post("/update", Boleto.updateBol);
router.post("/getNext", Boleto.getNextBol);
router.post("/getNumberBol", Boleto.getNumberBol);
router.post("/getAllByIdF", Boleto.getAllByIdFalse);
router.post("/getAllByIdT", Boleto.getAllByIdTrue);
router.post("/sendEmailFolios", Boleto.sendEmailFolios);

//Exportar el router
module.exports = router;