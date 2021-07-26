const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const sport = new Schema({
     name:{type:String,required:true},
     image:{type:String,required:true},
    status:{type:Number,default:0},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now}
})
module.exports = mongoose.model('sports',sport)