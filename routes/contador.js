const express = require("express");
const router = express.Router();
const Contador = require("../controllers/contador");
const check = require("../middlewares/auth");

//Definir rutas
router.get("/prueba", Contador.pruebaContador);
router.post("/add", check.auth, Contador.addContador);
router.get("/getContador", check.auth, Contador.getContador);
router.post("/update", check.auth, Contador.updateContador);
//router.post("/register", check.auth, Participante.register);

//Exportar el router
module.exports = router;