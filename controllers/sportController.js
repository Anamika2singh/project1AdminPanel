const config = require('../config/app')
const express = require('express');
const app=express()
const mongoose = require('mongoose')
const helper = require('../helpers/response');
const {Validator} = require('node-input-validator');
const bcrypt= require('bcrypt');
 const sportTable = require('../model/sport')
const { render } = require('ejs');
const { findByIdAndUpdate } = require('../model/admin');
let saltRounds= 10;
const utility = require("../helpers/utility");
var empty = require('is-empty');
var tmpMsg = '';
exports.getSport = (req,res)=>{
  if(empty(req.session.sortSport) || (req.query.reset == 1) || (req.query.sort==''))
  {
    req.session.sortSport ={name : 1};
  }
  if(empty(req.session.searchSport) || (req.query.reset == 1) || (req.query.search==''))
  {
    req.session.searchSport = '';
  }  
    
    
    if(req.query.search)
    {
      req.session.searchSport = req.query.search;
    }
    if(req.query.sort == 'OtoN'){
      req.session.sortSport = {createdAt : 1};
    }
    if(req.query.sort == 'NtoO'){
      req.session.sortSport = {createdAt : -1};
    }
  sportTable.find({name:{'$regex' : req.session.searchSport, '$options' : 'i'}},{},{sort:req.session.sortSport},(err,sport)=>{
    if(err){
      res.render('manageSport',{msg:'There is a Problem in displaying Sports.',data:[] ,preferences:{search:req.session.searchSport,sort:req.session.sortSport} ,adminData:req.session.admin});
      tmpMsg = '';
    };
    res.render('manageSport',{msg:tmpMsg,data:sport ,preferences:{search:req.session.searchSport,sort:req.session.sortSport} ,adminData:req.session.admin});
    tmpMsg = '';
  })
}

exports.addSport = async(req,res)=>{
                try{
                        const v = new Validator(req.body,{
                          sportName:'required',
                             })
                             const matched = await v.check();
                             let sportName=v.errors.sportName?v.errors.sportName.message:'' 
                            if(!matched){
                                  let err=sportName
                        //        helper.validation_error(res,err)
                        tmpMsg = err
                            res.redirect('/sport/getSport')
                            }
                             else{          

        if(!empty(req.file))
                {
                     //upload new profile image to s3 bucket
            utility.uploadFile(req.file.destination,req.file.filename,req.file.mimetype,config.S3_BUCKET_NAME+'sports')
               .then(async uploaded=>{
            if(uploaded)
               {
                sportTable.create({
                    name:req.body.sportName,
                    image:req.file.filename 
                }).then(
                    sport=>{
                        // console.log(sport)
                tmpMsg = 'Sport Added Successfully';
                     res.redirect('/sport/getSport');
                    }
                    ).catch(
                        err=>{
                  tmpMsg = 'Some problem Occured during Inserting. Please Try Again';
                  res.redirect('/sport/getSport');
                        }
                        )         
                                         }
                                     })
                  .catch(upload_err=>{
                            tmpMsg = 'Some problem occured during uploading files on our server';
                            res.redirect('/sport/getSport');
                                 });
                             }
            
                }
        }
        catch (err) {
          tmpMsg = 'Some problem Occured during Inserting. Please Try Again';
          res.redirect('/sport/getSport');
        }
            
}

exports.updateSport = async(req,res)=>{
try{
        const v = new Validator(req.body,{
              sportName:'required',
             })
             const matched = await v.check();
             let sportName=v.errors.sportName?v.errors.sportName.message:'' 
            if(!matched){
              let err=sportName
              tmpMsg = err
              res.redirect('/sport/getSport');
            }
             else{  
  
              var dataToUpdate = {
                name : req.body.sportName
              };
     if(!empty(req.file))
                  {
                dataToUpdate.image = req.file.filename; 
                              //upload new profile image to s3 bucket
      utility.uploadFile(req.file.destination,req.file.filename,req.file.mimetype,config.S3_BUCKET_NAME+'sports')
      .then(async uploaded=>{
                  if(uploaded)
                           {
     sportTable.findByIdAndUpdate({ '_id': req.params.sportID },{ $set:dataToUpdate},(updateErr,updated)=>{
      if(updateErr){
        tmpMsg = 'Some Problem Occured during updating sports';
        res.redirect('/sport/getSport');
      }
      if(updated){
        utility.deleteS3File(req.params.image, config.S3_BUCKET_NAME+'sports');
        tmpMsg = 'Sport Updated Successfully';
        res.redirect('/sport/getSport');
      }
     });                                      
         }
              })
              .catch(upload_err=>{
                                  tmpMsg = 'Some problem occured during uploading files on our server';
                                  res.redirect('/sport/getSport');
                              });
                  }else
                       {
            sportTable.findByIdAndUpdate({ _id: req.params.sportID },{ $set:dataToUpdate}  ,(updateErr,updated)=>{
                          if(updateErr){
                                          tmpMsg = 'Some Problem Occured during updating sport';
                                          res.redirect('/sport/getSport');
                                        }
                                        if(updated){
                                          tmpMsg = 'Sport Updated Successfully';
                                          res.redirect('/sport/getSport');
                                        }
                                      }) 
                       }
}
}
catch(err){
    tmpMsg = 'Some Problem Occured during adding sport';
    res.redirect('/sport/getSport');
}
}

exports.deleteSport =  (req,res)=>{
    try
    {
     if(!empty(req.params.sportID))
     {
      sportTable.deleteOne({ '_id': req.params.sportID },(error,deleted)=>{
        console.log(deleted);
        if(error)
        {
          tmpMsg = 'Some Problem Occured during Deleting Body Area';
          res.redirect('/sport/getSport');
        }
        if(deleted)
        {
          utility.deleteS3File(req.params.image,config.S3_BUCKET_NAME+'sports');
          tmpMsg = 'Sport Deleted SuccessFully'
          res.redirect('/sport/getSport');
        }
  
      })
     }else
     {
      tmpMsg = 'This Sport  Not Found';
      res.redirect('/sport/getSport');
     }
    }catch(err){
      tmpMsg = 'Some Problem Occured during Deleting Sport';
      res.redirect('/sport/getSport');
    }
  }
  