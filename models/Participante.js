const {Schema, model} = require("mongoose");

const ParticipanteSchema = Schema({
    namePart: String,
    surname: String,
    email:{
        type: String,
        require: true
    },
    phone:String,
    ticketCount:Number,
    ticketsAssigned:Number,
    money:Schema.Types.Decimal128,
    qrCode:String,
    isFull: {
        type: Boolean,
        default: false
    },
    created_at:{
        type: Date,
        default: Date.now
    }
});

module.exports = model("Participante", ParticipanteSchema,"participantes");