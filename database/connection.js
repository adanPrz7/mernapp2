const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const connection = async() =>{
    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/pdsbandw");
        console.log("Success db");
    }catch(error){
        console.log(error);
        throw new Error("Fail to conect to db!");
    }
}

module.exports = connection
