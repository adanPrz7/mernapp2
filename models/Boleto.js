const {Schema, model} = require("mongoose");

const BoletoSchema = Schema({
    numSpheres: {
        type: String,
        default: "0X"
    },
    folio: {
        type: String,
        require: true
    },
    isFull: {
        type: Boolean,
        default: false
    },
    created_at:{
        type: Date,
        default: Date.now
    },
    update_at:{
        type: Date,
        default: Date.now
    },
    parti:{
        type: Schema.ObjectId,
        ref: "Participante"
    },
    namePart: String,
    surname: String,
    email:{
        type: String,
        require: true
    },
    phone:String,
});

module.exports = model("Boleto", BoletoSchema,"boletos");