const express = require("express");
const router = express.Router();
const Boleto = require("../controllers/boleto");
const check = require("../middlewares/auth");

//Definir rutas
router.get("/prueba", Boleto.pruebaBoleto);
router.post("/register", check.auth, Boleto.register);
router.post("/update", Boleto.updateBol);
router.post("/update2", Boleto.updateBol2);
router.post("/getNext", Boleto.getNextBol);
router.post("/getNumberBol", Boleto.getNumberBol);
router.post("/getAllByIdF", Boleto.getAllByIdFalse);
router.get("/getAllK", check.auth, Boleto.getAllK);
router.post("/getAllByIdT", Boleto.getAllByIdTrue);
router.post("/sendEmailFolios", Boleto.sendEmailFolios);
router.post("/PDF", Boleto.createPDFDinamic);
router.get("/getPDF/:email?", Boleto.getPDF);
router.delete("/deleteMany", check.auth, Boleto.deleteMany);
router.post("/getBoletosBypart", Boleto.getBoletosBypart);
router.post("/registerOne", Boleto.registerOne);

//Exportar el router
module.exports = router;