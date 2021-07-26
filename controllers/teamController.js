const config = require('../config/app')
const express = require('express');
const app=express()
const mongoose = require('mongoose')
const helper = require('../helpers/response');
const {Validator} = require('node-input-validator');
const bcrypt= require('bcrypt');
const sportTable = require('../model/sport')
 const teamTable = require('../model/team')
const { render } = require('ejs');
const { findByIdAndUpdate, find } = require('../model/admin');
let saltRounds= 10;

const ObjectId = mongoose.Types.ObjectId
var empty = require('is-empty');
var tmpMsg = '';


exports.getAddTeam = async(req,res)=>{
    let sport = await sportTable.find()
    if(sport){
        // console.log(sport)
        // res.render('addTeam')
        res.render('addTeam',{msg:tmpMsg,data:sport ,adminData:req.session.admin});
        tmpMsg = '';
    }
    else{
          console.log("no sports found")
          // res.render('addTeam')
     res.render('addTeam',{msg:'There is a Problem in displaying Sports.',data:[] ,adminData:req.session.admin});
          tmpMsg = '';
    }
}

exports.getUpdateTeam = async(req,res)=>{
 console.log("inside getupdateTeam"+ ObjectId(req.params.teamID));
    let team = await teamTable.findOne({'_id':ObjectId(req.params.teamID)})
    if(team){
      let sport = await sportTable.find()
         console.log(sport , team)
        res.render('updateTeam',{msg:tmpMsg,data1:team,data2:sport,adminData:req.session.admin});
        tmpMsg = '';
    }
    else{
          // console.log("no sports found")
     res.render('updateTeam',{msg:'There is a Problem in displaying Sports.',data:[] ,adminData:req.session.admin});
          tmpMsg = '';
    }
}

exports.getTeam = async(req,res)=>{

  if(empty(req.session.sortTeam) || (req.query.reset == 1) || (req.query.sort==''))
  {
    req.session.sortTeam ={"output.name": 1,name:1};
  }
  if(empty(req.session.searchTeam) || (req.query.reset == 1) || (req.query.search==''))
  {
    req.session.searchTeam = '';
  } 
  if(empty(req.session.filterTeam) || (req.query.reset == 1) || (req.query.filter==''))
  {
    req.session.filterTeam = {};
  } 
  if(!empty(req.session.filterTeam))
  {
    req.session.filterTeam.sports = mongoose.Types.ObjectId(req.session.filterTeam.sports);
  } 
    
    if(req.query.search)
    {
      req.session.searchTeam = req.query.search;
    }
    if(req.query.sort == 'OtoN'){
      req.session.sortTeam = {createdAt : 1};
    }
    if(req.query.sort == 'NtoO'){
      req.session.sortTeam = {createdAt : -1};
    }
    if(req.query.filter)
  {
    req.session.filterTeam = { sports : mongoose.Types.ObjectId(req.query.filter)};
  }
  let sports = await sportTable.find({})
   if(sports){
    let result=await teamTable.aggregate([
      {"$match":{ $and: [ {"name":{'$regex' : req.session.searchTeam, '$options' : 'i'}},req.session.filterTeam ] }},
      { "$lookup": {
          from: "sports",
          localField: "sports",
          foreignField:"_id",    
           as:"output"
       }},
       {$sort: req.session.sortTeam}
       
 ])
 // console.log(result)
   if(result){
    res.render('manageTeam',{msg:tmpMsg,data1:sports,data2:result,preferences:{search:req.session.searchTeam,sort:req.session.sortTeam ,filter:req.session.filterTeam},adminData:req.session.admin});
    tmpMsg = '';
   }
   else{
    res.render('manageTeam',{msg:'There is a Problem in displaying Team.',data1:[],data2:[],preferences:{search:req.session.searchTeam,sort:req.session.sortTeam ,filter:req.session.filterTeam} ,adminData:req.session.admin});
      tmpMsg = '';
   }
  // })

   }
else{
  res.render('manageTeam',{msg:'There is a Problem in displaying Team.',data1:[],data2:[],preferences:{search:req.session.searchTeam,sort:req.session.sortTeam ,filter:req.session.filterTeam} ,adminData:req.session.admin});
  tmpMsg = '';
}
   
}

exports.addTeam = async(req,res)=>{
  // console.log(req.body.teamName + req.body.sports)
                try{
                  
                        const v = new Validator(req.body,{
                          teamName:'required',
                          colorCode : 'required',
                      sports: 'required',
                       address:'required',                     
                      //  city:'required',
                      //   state:'required',
                       country:'required',
                          lat:'required',
                         long:'required',
                             })
                             const matched = await v.check();
                             let teamName=v.errors.teamName?v.errors.teamName.message:'' 
                             let colorCode=v.errors.teamColor?v.errors.teamColor.message:'' 
                             let sports=v.errors.sports?v.errors.sports.message:'' 
                             let address=v.errors.address?v.errors.address.message:''                            
                            //  let city=v.errors.city?v.errors.city.message:''  
                            //  let state=v.errors.state?v.errors.state.message:''   
                             let country=v.errors.country?v.errors.country.message:''    
                             let lat=v.errors.lat?v.errors.lat.message:''
                             let long=v.errors.long?v.errors.long.message:''    
                            if(!matched){
                                  let err=teamName+colorCode+sports+address+country+lat+long
                        //        helper.validation_error(res,err)
                        tmpMsg = err
                            res.redirect('/team/getAddTeam')
                            }
                             else{          
                teamTable.create({
                    name:req.body.teamName,
                    colorCode:req.body.colorCode,
                    sports:req.body.sports,
                    address:req.body.address,                  
                    city:req.body.city,
                     state:req.body.state,
                    country:req.body.country,
                      lat:req.body.lat,
                      long:req.body.long,
                     location: {
                        type: "Point",
                        coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)]
                    }
                }).then(
                    team=>{
                        console.log("created team"+team)
                tmpMsg = 'Team Added Successfully';
                     res.redirect('/team/getTeam');
                    }
                    ).catch(
                        err=>{
                  tmpMsg = 'Some problem Occured during Team Creation Please Try Again';
                  res.redirect('/team/getAddTeam');
                        }
                        )         
                }
        }
        catch (err) {
          tmpMsg = 'Some problem Occured during Inserting. Please Try Again';
          res.redirect('/team/getAddTeam');
        }
            
}
exports.updateTeam = async(req,res)=>{
try{
        const v = new Validator(req.body,{
            teamName:'required',
            colorCode : 'required',
        sports: 'required',
         address:'required',
         city:'required',
          state:'required',
         country:'required',
            lat:'required',
       long:'required',
             })
             const matched = await v.check();
             let teamName=v.errors.teamName?v.errors.teamName.message:'' 
             let colorCode=v.errors.colorCode?v.errors.colorCode.message:'' 
             let sports=v.errors.sports?v.errors.sports.message:'' 
             let address=v.errors.address?v.errors.address.message:''   
             let city=v.errors.city?v.errors.city.message:''  
             let state=v.errors.state?v.errors.state.message:''   
             let country=v.errors.country?v.errors.country.message:''   
             let lat=v.errors.lat?v.errors.lat.message:''   
             let long=v.errors.lat?v.errors.long.message:''             
            if(!matched){
                  let err=teamName+colorCode+sports+address+city+state+country+lat+long
              tmpMsg = err
              console.log("inside valerr"+req.params.teamID)
              res.redirect('/team/getUpdateTeam/'+req.params.teamID);
            }
             else{  
              var dataToUpdate = {
                name : req.body.teamName,
                colorCode: req.body.colorCode,
                sports:req.body.sports,
                address:req.body.address,
                city:req.body.city,
                state:req.body.state,
                country:req.body.country,
                lat:req.body.lat,
                long:req.body.long,
                location: {
                        type: "Point",
                        coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)]
                    }
              };                                             
     teamTable.findByIdAndUpdate({ '_id': ObjectId(req.params.teamID)},{ $set:dataToUpdate},(updateErr,updated)=>{
      if(updateErr){
        console.log("inside updateTEAM"+req.params.teamID)
        tmpMsg = 'Some Problem Occured during updating team';
        res.redirect('/team/getUpdateTeam/'+req.params.teamID);
      }
      if(updated){
        tmpMsg = 'team Updated Successfully';
        res.redirect('/team/getTeam');
      }
     });                                      
            
}
}
catch(err){
    tmpMsg = 'Some Problem Occured during adding sport';
    res.redirect('/team/getUpdateTeam/'+req.params.teamID);
}
}

exports.deleteTeam =  (req,res)=>{
    try
    {
     if(!empty(req.params.teamID))
     {
      teamTable.deleteOne({ '_id': req.params.teamID },(error,deleted)=>{
        console.log(deleted);
        if(error)
        {
          tmpMsg = 'Some Problem Occured during Deleting Team';
          res.redirect('/team/getTeam');
        }
        if(deleted)
        {
          tmpMsg = 'team Deleted SuccessFully'
          res.redirect('/team/getTeam');
        }
  
      })
     }else
     {
      tmpMsg = 'This team  Not Found';
      res.redirect('/team/getTeam');
     }
    }catch(err){
      tmpMsg = 'Some Problem Occured during Deleting Team';
      res.redirect('/team/getTeam');
    }
  }
  
exports.setAction = async(req,res)=>{
    try
    {       
      if(req.params.status == 1){
     
        let update = await teamTable.findByIdAndUpdate({'_id':req.params.teamID},{
          $set:{
            status:0, //1 for deactivate team 0 for activate
          }
        }
        )
        if(update){
          tmpMsg = 'team Activate Successfully!';
          res.redirect('/team/getTeam');
        }
        else{
          tmpMsg = 'Some Problem Occured during Activate team!';
          res.redirect('/team/getTeam');
        }
        
    }
    else{
      let update = await teamTable.findByIdAndUpdate({'_id':req.params.teamID},{
        $set:{
          status:1, //1 for deactivate team 0 for activate
        }
      }
      )
      if(update){
        tmpMsg = 'team deactivate Successfully!';
        res.redirect('/team/getTeam');
      }
      else{
        tmpMsg = 'Some Problem Occured during deactivate Team!';
        res.redirect('/team/getTeam');
      }
    }
    }catch(err){
    console.log(err)
             tmpMsg = 'Some Problem Occured during Updating Action!';
             res.redirect('/team/getTeam');
    }
  }