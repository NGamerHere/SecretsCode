const mongoose = require('mongoose');
const {Schema} = require("mongoose");

const url= 'mongodb://127.0.0.1:27017/userdb';


async function connectDB(){
    try{
        await mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true});
        console.log('Database connected successfully');

    }catch(err){
        console.log("there was error in connecting"+err);
    }
}
exports.module=connectDB();