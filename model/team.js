const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const team = new Schema({
    name:{type:String,required:true},
    colorCode:{type:String,default:'#ffffff'},
    sports:{type:mongoose.Types.ObjectId,required:true},
    address:{type:String,required:true},
    city:{type:String,default:''},
    state:{type:String,default:''},
    country:{type:String,default:''},
    lat:{type:String,required:true},
    long:{type:String,required:true},
    location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      default:'Point'
    },
    coordinates: {
      type: [],
      default:[]
    }
  },
    status:{type:Number,default:0},//1 for deactivate team and 0 for Activate team
    isBlocked:{type:Number,default:0},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now}
})
module.exports = mongoose.model('teams',team)