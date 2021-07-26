const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const signup = new Schema({
    name:{type:String,required:true},
    emailId:{type:String,required:true},
       password : {type:String,required:true},
       ageGroup :{type:Number,required:true},//"1" for 18-30 "2" for 31-40 "3" for  41-50 "5" for  51-64 "6" for above 65+
       address:{type:String,default:''},
       lat:{type:String,default:''},
       long:{type:String,default:''},
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
       deviceType:{type:String,default:''},
       deviceToken:{type:String,default:''},
       
         image:{type:String,default:''},
       favEvents:{type:[mongoose.Types.ObjectId],default:[]},
       
        teams:{type:[mongoose.Types.ObjectId],default:[]},
     
       
    status:{type:Number,default:0},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now}
})
module.exports = mongoose.model('users',signup)