const mongoose = require("mongoose");
const connection = async() =>{
    try{
        await mongoose.connect("mongodb://localhost:27017/pdsbandw");
        console.log("Success db");
    }catch(error){
        console.log(error);
        throw new Error("Fail to conect to db!");
    }
}

module.exports = connection