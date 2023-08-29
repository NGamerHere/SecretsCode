const mongoose = require('mongoose');
const {Schema} = require("mongoose");

const newSchema=new Schema({
    name:String,
    age:Number
});
const employ=new mongoose.model('bestUser',newSchema,'bestUser');

module.exports =employ;