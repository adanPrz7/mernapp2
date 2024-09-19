const {Schema, model} = require("mongoose");
const { default: isEmail } = require("validator/lib/isEmail");
const UserSchema = Schema({
    nameUser: {
        type: String,
        require: true
    },
    surname: {
        type: String,
        require: true
    },
    email:{
        type: String,
        require: true
    },
    password:{
        type: String,
        require: true
    },
    role:{
        type: String,
        default: "Admin"
    },
    image:{
        type: String,
        default: "default.png"
    },
    created_at:{
        type: Date,
        default: Date.now
    }
});

module.exports = model("User", UserSchema,"users");