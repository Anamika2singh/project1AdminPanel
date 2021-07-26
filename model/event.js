const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const event = new Schema({
    tmEventId:{type:String,default:''},
    groupId:{type:String,required:true},
    title:{type:String,required:true},
    subTitle:{type:String,required:true},
    image:{type:String,required:true},
    description:{type:String,required:true},
    type:{type:Number,default:0},//0 for free and 1 for paid
    url:{type:String,default:''},
    price:{type:String,default:'0'},
    teams:{type:[mongoose.Types.ObjectId],required:true},
    sports:{type:[mongoose.Types.ObjectId],required:true},
    eventDate:{type:Date,required:true},
    popularity:{type:Number,default:0},
    attendanceRequired:{type:Number,default:0},//0 for no 1 for yes
    eventSharableUrl:{type:String,default:''},
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
   
    status:{type:Number,default:0},//1 for deactivate event and 0 for Activate event
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now}
})
module.exports = mongoose.model('events',event)