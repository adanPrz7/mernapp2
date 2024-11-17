const Contador = require("../models/Contador");

//Acciones de prueba
const pruebaContador = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/contador.js",
        usuario: req.user
    });
}

const addContador = (req, res) =>{
    //Obtener los datos
    let params = req.body;

    //Comprobador que llegan los datos bien
    if (!params.listCount) {
        return res.status(400).json({
            message: "Faltan datos por ingresar",
            status: "error"
        });
    }

    let newContador = new Contador(params);

    newContador.save().then((contadorStore) => {
        if (!contadorStore) return res.satus(400).send({ status: "error", message: "No se pudo guardar el contador" });

        return res.status(200).send({
            status: "Success",
            message: "Contador guardado"
        });
    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
        });
    });
}

const getContador = (req, res) =>{
    Contador.findOne({identityC: "67350351eae6c4d5810d546d"}).then(async (contadorStore) =>{
        if (!contadorStore) return res.satus(400).send({ status: "error", message: "No se pudo obtener el contador" });

        return res.status(200).send({
            status: "Success",
            contador: contadorStore
        });
    }).catch((error) =>{
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
        });
    });
}

const updateContador = (req, res) =>{
    let params = req.body;

    //Comprobador que llegan los datos bien
    if (!params.listCount) {
        return res.status(400).json({
            message: "Faltan datos por ingresar",
            status: "error"
        });
    }
    Contador.findOneAndUpdate({identityC: "67350351eae6c4d5810d546d"}, params, {new: true}).then(async(contadorStore) =>{
        if (!contadorStore) return res.status(500).send({ status: "error", message: "Error al actualizar" });

            return res.status(200).send({
                status: "success",
                contador: contadorStore
            });
    }).catch((error) =>{
        return res.status(500).send({
            status: "error",
            message: "error en la consulta"
        });
    });
}

module.exports = {
    pruebaContador,
    addContador,
    getContador,
    updateContador
}