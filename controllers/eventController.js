const config = require('../config/app')
const express = require('express');
const app=express()
const mongoose = require('mongoose')
const helper = require('../helpers/response');
const {Validator} = require('node-input-validator');
const bcrypt= require('bcrypt');
const sportTable = require('../model/sport')
 const teamTable = require('../model/team')
 const eventTable = require('../model/event')
 const utility = require("../helpers/utility");
const { render } = require('ejs');
const { findByIdAndUpdate, find, events } = require('../model/admin');
let saltRounds= 10;
let ObjectId = mongoose.Types.ObjectId;
var empty = require('is-empty');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios').default;
var tmpMsg = '';


exports.getTicketMasterEventPrice = async(req,res)=>{
   try{
     //vvG1YZplk423aA
     if(!empty(req.body.tmEventId)){
          const URL = "https://app.ticketmaster.com/discovery/v2/events/"+req.body.tmEventId+".json?apikey="+config.TICKET_MASTER_API_KEY
          const response = await axios.get(URL);
          if(response.status == 200){
          res.json({
            "status":200,
            "message":"Event Price Fetched Successfully",
            "price":response.data.priceRanges[0].min
          })
        }else{
          res.json({
            "status":400,
            "message":"Unable to find price with this Ticket Master Event ID",
            "price":0
          })
        }
     }
     else{
        
      res.json({
        "status":400,
        "message":"Unable to find price with this Ticket Master Event ID",
        "price":0
      })
     }
     
   }
  catch(e){
    res.json({
      "status":400,
      "message":"Unable to find price with this Ticket Master Event ID",
      "price":0
    })
  }
}



exports.getAllTeams = async(req,res)=>{
   try{
     console.log(req.body.selectedSports)
     if(req.body.selectedSports){
       let sportArr = JSON.parse(req.body.selectedSports)
      let allTeams = await teamTable.find( { sports : { $in: sportArr } }).sort({name:1})
        res.json({
          data:allTeams
        })
     }
     else{
        
  res.json({data:[]})
     }
     
   }
  catch(e){
    res.json({data:[]})
  }
}




exports.getEvent = async(req,res)=>{
  
  if(empty(req.session.sortEvent) || (req.query.reset == 1) || (req.query.sort==''))
  {
    req.session.sortEvent = {title:1};
  }
  if(empty(req.session.searchEvent) || (req.query.reset == 1) || (req.query.search==''))
  {
    req.session.searchEvent = '';
  } 
  if(empty(req.session.teamFilterEvent) || (req.query.reset == 1) || (req.query.filter1==''))
  {
    req.session.teamFilterEvent = {};
  } 
    if(empty(req.session.priceFilterEvent) || (req.query.reset == 1) || (req.query.filter2=='') )
  {
    req.session.priceFilterEvent = {};
  }
    if(empty(req.session.attendanceFilterEvent) || (req.query.reset == 1) || (req.query.filter3==''))
  {
    req.session.attendanceFilterEvent = {};
  }
  if(!empty(req.session.teamFilterEvent))
  {
    req.session.teamFilterEvent.teams.$in[0] = ObjectId(req.session.teamFilterEvent.teams.$in[0]);
  } 
    
    if(req.query.search)
    {
      req.session.searchEvent = req.query.search;
    }
    if(req.query.sort == 'OtoN'){
      req.session.sortEvent = {eventDate : 1};
    }
    if(req.query.sort == 'NtoO'){
      req.session.sortEvent = {eventDate : -1};
    }
    if(req.query.filter1)
  {
    req.session.teamFilterEvent = {teams:{$in:[ ObjectId(req.query.filter1) ]}} 
  }
  if(req.query.filter2)
  {
    req.session.priceFilterEvent = {type:parseInt(req.query.filter2)};
  }
  if(req.query.filter3)
  {
    req.session.attendanceFilterEvent = {attendanceRequired: parseInt(req.query.filter3)};
  }

     let teams = await teamTable.find().sort({sports:1,name:1})
     if(teams){
      let result = await eventTable.aggregate([
        {"$match": { $and: [ {"title":{'$regex' : req.session.searchEvent, '$options' : 'i'}},req.session.teamFilterEvent,req.session.priceFilterEvent,req.session.attendanceFilterEvent] } },
        { "$lookup": {
        "from": "teams",
        "let": { "teams": "$teams" },
        "pipeline": [
        { "$match": { "$expr": { "$in": [ "$_id", "$$teams" ] } } }
        ],
        "as": "output"
        }},
        {
                 $group:
                   {
                    _id: "$groupId",
                    eventDate: { $push: "$eventDate" },
                    subTitle: { $push: "$subTitle" },
                     "data" : {"$first" : "$$ROOT"}
                   }
               },
               {
                $project:{
                            "_id" : "$data._id",
                            "title" : "$data.title",
                            "subTitle" : "$subTitle",
                            "eventDate" : "$eventDate",
                            "image":"$data.image",
                            "type":"$data.type",
                            "groupId":"$data.groupId",
                            "teams":"$data.teams",
                            "sports":"$data.sports",
                            "attendanceRequired":"$data.attendanceRequired",
                            "address":"$data.address",
                            "status":"$data.status",
                            "output":"$data.output"
                }
               },
        {$sort: req.session.sortEvent}
        ])
     var preferences = {
      search:req.session.searchEvent,
      sort:req.session.sortEvent ,
      filter1:(!empty(req.session.teamFilterEvent))?(req.session.teamFilterEvent.teams.$in[0]):'',
      filter2:req.session.priceFilterEvent,
      filter3:req.session.attendanceFilterEvent
    }
       if(result){
          res.render('manageEvent',{msg:tmpMsg,data1:teams,data2:result,preferences,adminData:req.session.admin});
          tmpMsg = '';
         }
         else{
          res.render('manageEvent',{msg:'There is a Problem in displaying Event.',data1:[],data2:[] ,preferences ,adminData:req.session.admin});
            tmpMsg = '';
         }

     }
     else{
      res.render('manageEvent',{msg:'There is a Problem in displaying Event.',data1:[],data2:[] ,preferences ,adminData:req.session.admin});
      tmpMsg = '';

     }
   

  }
exports.getAddEvent = async(req,res)=>{
    let sports = await sportTable.find()
    if(sports){
          let teams = await teamTable.find()
          if(teams){
        res.render('addEvent',{msg:tmpMsg,data1:sports,data2:teams,adminData:req.session.admin});
        tmpMsg = '';
          }
          else{
            res.render('addEvent',{msg:'There is a Problem in displaying Teams.',data1:[],data2:[],adminData:req.session.admin});
            tmpMsg = '';
          }
    }
    else{
     res.render('addEvent',{msg:'There is a Problem in displaying Sports.',data1:[],data2:[],adminData:req.session.admin});
          tmpMsg = '';
    }
}
exports.addEvent = async(req,res)=>{
    try{
        const v = new Validator(req.body,{
          title:'required',
          subTitle:'required',
     description:'required',
    sports:'required',
    eventDate:'required',
    eventSharableUrl:'required',
    teams:'required',
    address:'required',
    country:'required',
    lat:'required',
    long:'required',
    type:'required'
             })
             const matched = await v.check();
             let title=v.errors.title?v.errors.title.message:''
             let subTitle=v.errors.subTitle?v.errors.subTitle.message:'' 
             let description=v.errors.description?v.errors.description.message:'' 
             let sports=v.errors.sports?v.errors.sports.message:'' 
             let teams=v.errors.teams?v.errors.teams.message:'' 
             let address=v.errors.address?v.errors.address.message:''         
             let eventDate=v.errors.eventDate?v.errors.eventDate.message:''  
             let eventSharableUrl=v.errors.eventSharableUrl?v.errors.eventSharableUrl.message:'' 
             let type=v.errors.type?v.errors.type.message:''   
             let country=v.errors.country?v.errors.country.message:''
             let lat=v.errors.lat?v.errors.lat.message:''   
             let long=v.errors.lat?v.errors.long.message:''  
            //  if(req.body.type == 1){
            //   let price=v.errors.price?v.errors.price.message:'' 
            //   let url=v.errors.url?v.errors.url.message:'' 
            // } 
            if(!matched){
                  let err=title+subTitle+description+sports+teams+address+country+eventDate+eventSharableUrl+type+lat+long
        tmpMsg = err
            res.redirect('/event/getAddEvent')
            
            }
            
             else{        
if(!empty(req.file))
{
     //upload new  image to s3 bucket
utility.uploadFile(req.file.destination,req.file.filename,req.file.mimetype,config.S3_BUCKET_NAME+'events')
.then(async uploaded=>{
if(uploaded)
{
  // Creating new unique id
  const groupId = uuidv4()
  var insertArr = []
  for(let i =0;i<req.body.eventDate.length;i++)
  {
  var insertObj = {
    tmEventId:(req.body.tmEventId)?req.body.tmEventId:'',
    groupId:groupId,
    image:req.file.filename,
    title:req.body.title,
    subTitle:req.body.subTitle[i],
    description:req.body.description,
   sports:req.body.sports,
   teams:req.body.teams,
   address:req.body.address,
   city:req.body.city,
   state:req.body.state,
   country:req.body.country,
    type:req.body.type,
    price:(req.body.type == 1)?req.body.price:'0',
    url:(req.body.type == 1)?req.body.url:'',
    eventDate:req.body.eventDate[i],
   attendanceRequired:req.body.attendanceRequired?req.body.attendanceRequired:0,
   eventSharableUrl:req.body.eventSharableUrl,
   lat:req.body.lat,
   long:req.body.long,
   location: {
              type: "Point",
              coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)]
          }
}
insertArr.push(insertObj)

}
let inserted = await eventTable.insertMany(
   insertArr
)
if(!empty(inserted)){
tmpMsg = 'Event Added Successfully';
     res.redirect('/event/getEvent');
}
else{
  tmpMsg = "Some Problem Occured during Creating Event";
  res.redirect('/event/getAddEvent');
}

    
        }         
                    
      }).catch(upload_err=>{
        console.log(upload_err)
            tmpMsg = 'Some Problem Occured during Creating Event';
            res.redirect('/event/getAddEvent');
                 });
             }

}
}
catch (err) {
  console.log("reached")
tmpMsg = err;
res.redirect('/event/getAddEvent');
}
  }

exports.getUpdateEvent = async(req,res)=>{
   
       let event = await eventTable.find({'groupId':req.params.groupId})
       if(event){
         let sports = await sportTable.find()
          if(sports){
            let teams = await teamTable.find()                       
            if(teams){
              res.render('updateEvent',{msg:tmpMsg,data1:event,data2:sports,data3:teams,adminData:req.session.admin});
              tmpMsg = '';
            }else{
              res.render('updateEvent',{msg:'There is a Problem in displaying Teams.',data1:event,data2:sports,data3:[],adminData:req.session.admin});
              tmpMsg = '';         
            }
           
          }else{
            res.render('updateEvent',{msg:'There is a Problem in displaying Sports.',data1:event,data2:[],data3:[],adminData:req.session.admin});
            tmpMsg = '';

          }
           
       }
       else{
             // console.log("no sports found")
        res.render('updateEvent',{msg:'There is a Problem in displaying Events.',data1:[],data2:[],data3:[],adminData:req.session.admin});
             tmpMsg = '';
       }
   }

exports.updateEvent = async(req,res)=>{
    try{
            const v = new Validator(req.body,{
              title:'required',
              subTitle:'required',
              description:'required',
             sports:'required',
             eventDate:'required',
             eventSharableUrl:'required',
             teams:'required',
             address:'required',
             lat:'required',
             long:'required',
             type:'required'
                 })
                 const matched = await v.check();
                 let title=v.errors.title?v.errors.title.message:''
                 let subTitle=v.errors.subTitle?v.errors.subTitle.message:'' 
                 let description=v.errors.description?v.errors.description.message:'' 
                 let sports=v.errors.sports?v.errors.sports.message:'' 
                 let teams=v.errors.teams?v.errors.teams.message:'' 
                 let address=v.errors.address?v.errors.address.message:''         
                 let eventDate=v.errors.eventDate?v.errors.eventDate.message:''  
                 let eventSharableUrl=v.errors.eventSharableUrl?v.errors.eventSharableUrl.message:''    
                 let type=v.errors.type?v.errors.type.message:''   
                 let lat=v.errors.lat?v.errors.lat.message:''   
                 let long=v.errors.lat?v.errors.long.message:''  
                
                if(!matched){
                      let err=title+subTitle+description+sports+teams+address+eventDate+eventSharableUrl+type+lat+long
            tmpMsg = err
                res.redirect('/event/getUpdateEvent/'+req.params.groupId)
                
                }
                 else{  
                  console.log("body",req.body)
                  var filtered = req.body.eventId.filter(function(value, index, arr){ 
                      return value!="new";
                  });
                  
                 let deleteEvent = await eventTable.deleteMany({$and:[{"groupId":req.params.groupId},{ '_id': { $nin: filtered } }]})
                  console.log(deleteEvent)
                  if(deleteEvent)
                  {
                  for(let i=0;i<req.body.eventId.length;i++)
                  {
                    if(req.body.eventId[i] === 'new')
                      {
                        console.log("new")
                       eventTable.create(
                         {
                              tmEventId:(req.body.tmEventId)?req.body.tmEventId:'',
                              groupId:req.params.groupId,
                              title:req.body.title,
                              image:req.params.image,
                              subTitle:req.body.subTitle[i],
                              description:req.body.description,
                              sports:req.body.sports,
                              teams:req.body.teams,
                              address:req.body.address,
                              city:req.body.city,
                              state:req.body.state,
                              country:req.body.country,
                              type:req.body.type,
                              price:(req.body.type == 1)?req.body.price:'0',
                              url:(req.body.type == 1)?req.body.url:'',
                              eventDate:req.body.eventDate[i],
                              attendanceRequired:req.body.attendanceRequired?req.body.attendanceRequired:0,
                              eventSharableUrl:req.body.eventSharableUrl,
                              lat:req.body.lat,
                              long:req.body.long,
                              location: {
                                        type: "Point",
                                        coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)]
                                    }
                          }
                        )
                      }
                      else
                      {
                        console.log("reached",req.body.title,req.body.eventId[i])
                       let update = await eventTable.update({ '_id': ObjectId(req.body.eventId[i]) },
                        { $set:
                            {
                              tmEventId:(req.body.tmEventId)?req.body.tmEventId:'',
                              groupId:req.params.groupId,
                              title:req.body.title,
                              subTitle:req.body.subTitle[i],
                              description:req.body.description,
                              sports:req.body.sports,
                              teams:req.body.teams,
                              address:req.body.address,
                              city:req.body.city,
                              state:req.body.state,
                              country:req.body.country,
                              type:req.body.type,
                              price:(req.body.type == 1)?req.body.price:'0',
                              url:(req.body.type == 1)?req.body.url:'',
                              eventDate:req.body.eventDate[i],
                              attendanceRequired:req.body.attendanceRequired?req.body.attendanceRequired:0,
                              eventSharableUrl:req.body.eventSharableUrl,
                              lat:req.body.lat,
                              long:req.body.long,
                              location: {
                                        type: "Point",
                                        coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)]
                                    }
                          }
                       })
                       console.log(update)
                      }
                  }
                }
         
         if(!empty(req.file))
          { 
            //upload new  image to s3 bucket
          utility.uploadFile(req.file.destination,req.file.filename,req.file.mimetype,config.S3_BUCKET_NAME+'events')
          .then(async uploaded=>{
            if(uploaded)
            {
          eventTable.updateMany({ 'groupId': req.params.groupId },{ $set:{image:req.file.filename}},(updateErr,updated)=>{
          if(updateErr){
            tmpMsg = 'Some Problem Occured during updating events';
            res.redirect('/event/getUpdateEvent/'+req.params.groupId);
          }
          if(updated){
            utility.deleteS3File(req.params.image, config.S3_BUCKET_NAME+'events');
            tmpMsg = 'Event Updated Successfully';
            res.redirect('/event/getEvent');
          }
         });                                      
             }
                  })
                  .catch(upload_err=>{
                                      tmpMsg = 'Some problem occured during uploading files on our server';
                                      res.redirect('/event/getUpdateEvent/'+req.params.groupId);
                                  });
                      }else
                           {
                            tmpMsg = 'Event Updated Successfully';
                            res.redirect('/event/getEvent'); 
                           }
    }
    }
    catch(err){
      console.log(err)
        tmpMsg = 'Some Problem Occured during Updating Event';
        res.redirect('/event/getUpdateEvent/'+req.params.groupId);
    }
    }
exports.deleteEvent =  (req,res)=>{
        try
        {
         if(!empty(req.params.groupId))
         {
          eventTable.deleteMany({ 'groupId': req.params.groupId },(error,deleted)=>{
            if(error)
            {
              tmpMsg = 'Some Problem Occured during Deleting Event';
              res.redirect('/event/getEvent');
            }
            if(!empty(deleted))
            {
              utility.deleteS3File(req.params.image,config.S3_BUCKET_NAME+'events');
              tmpMsg = 'Event Deleted SuccessFully'
              res.redirect('/event/getEvent');
            }
      
          })
         }else
         {
          tmpMsg = 'This Event  Not Found';
          res.redirect('/event/getEvent');
         }
        }catch(err){
          tmpMsg = 'Some Problem Occured during Deleting Event';
          res.redirect('/event/getEvent');
        }
      }

exports.setAction = async(req,res)=>{
        try
        {       
          if(req.params.status == 1){
         
            let update = await eventTable.updateMany({'groupId':req.params.groupId},{
              $set:{
                status:0, //1 for deactivate event 0 for activate event
              }
            }
            )
            if(update){
              tmpMsg = 'Event Activated Successfully!';
              res.redirect('/event/getEvent');
            }
            else{
              tmpMsg = 'Some Problem Occured during Activate Event!';
              res.redirect('/event/getEvent');
            }
            
        }
        else{
          let update = await eventTable.updateMany({'groupId':req.params.groupId},{
            $set:{
              status:1, //1 for deactivate team 0 for activate
            }
          }
          )
          if(update){
            tmpMsg = 'Event deactivated Successfully!';
            res.redirect('/event/getEvent');
          }
          else{
            tmpMsg = 'Some Problem Occured during deactivate Event!';
            res.redirect('/event/getEvent');
          }
        }
        }catch(err){
        console.log(err)
                 tmpMsg = 'Some Problem Occured during Updating Action!';
                 res.redirect('/event/getEvent');
        }
      }
      