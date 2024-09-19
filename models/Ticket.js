const {Schema, model} = require("mongoose");

const TicketSchema = Schema({
    money: {
        type: Schema.Types.Decimal128,
        require: true
    },
    dateBuy: {
        type: Date,
        require: true
    },
    category:{
        type: Number,
        require: true
    },
    store:{
        type: String,
        require: true
    },
    dateRegister:{
        type: Date,
        default: Date.now
    },
    parti:{
        type: Schema.ObjectId,
        ref: "Participante"
    }
});

module.exports = model("Ticket", TicketSchema,"tickets");