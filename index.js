//Importar dependencias
const connection = require("./database/connection");
const express = require("express");
const cors = require("cors");

//Mensaje de bienvenida
console.log("API NODE was started");


//Conexion a bbdd
connection();

//Crear servidor node
const app = express();
const puerto = 3900;

//Configurar cors
app.use(cors());

//Convertir los datos del body a Json
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Cargar conf rutas
const UserRouter = require("./routes/user");
const ParticipanteRouter = require("./routes/participante");
const BoletoRoutes = require("./routes/boleto");
const TicketRouter = require("./routes/tickets");

app.use("/api/user", UserRouter);
app.use("/api/participante", ParticipanteRouter);
app.use("/api/boleto", BoletoRoutes);
app.use("/api/ticket", TicketRouter);

//Ruta de prueba
app.get("/ruta-prueba", (req, res) =>{
    return res.status(200).json({
        "id":1,
        "nombre":"ADAN",
        "web":"indar.mx"
    });
});


//Poner servidor a escuchar peticiones http

app.listen(puerto, () =>{
    console.log("servidor node corriendo en el puerto:", puerto);
});