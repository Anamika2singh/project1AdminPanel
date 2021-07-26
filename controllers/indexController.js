const express = require('express');
const app=express()
var isSet = require('isset');
var empty = require('is-empty');
const { models } = require('mongoose');
const userTable = require('../model/user');
const sportTable = require('../model/sport');
const teamTable = require('../model/team');
const eventTable = require('../model/event');
var tmpMsg = ''
// const { where } = require('../model/sport');
exports.homePage = (req,res)=>{
    if(isSet(req.session.admin) && !empty(req.session.admin))
	{
		res.redirect('/dashboard');
	}else{
		res.redirect('/auth/getLogin');
	} 
}
exports.dashboard = async(req,res)=>{

	var data= {};
    let users = await userTable.count()
    if(users){
        data.users = users
    }
    else{
        data.users = ''
    }
    let sports = await sportTable.count()
    if(sports){
        data.sports = sports
    }
    else{
        data.sports = ''
    }
    let teams= await teamTable.count()
    if(teams){
        data.teams = teams
    }
    else{
        data.sports = ''
    }
    let events = await eventTable.count()
    if(events){
        data.events = events
    }
    else{
        data.events = ''
    }

  res.render('dashboard', {data:data, adminData : req.session.admin});
}
exports.getManageUser = async(req,res)=>{    //listing of registered users
	var sort ={name : 1};
    var where = {};
	var search = '';
	if(req.query.search){
		search = req.query.search;
	}

	if(req.query.filter){
		where.ageGroup = req.query.filter;
	}
    if(req.query.sort == 'OtoN'){
      sort = {createdAt : 1};
    } 
	if(req.query.sort == 'NtoO'){
		sort = {createdAt : -1};
	}
	
	userTable.find({ $and: [
		{ $or: [ {name:{'$regex' : search, '$options' : 'i'}},{emailId: {'$regex' : search, '$options' : 'i'}} ] },
		where
	]},{},{sort:sort},(err,users)=>{
	 if(err){
		tmpMsg = 'Some Error Occured during Displaying Data'
		res.render('manageUser',{msg:tmpMsg ,userData:[] ,adminData:req.session.admin});
        tmpMsg = ''
	 }
	 else{
		
		// res.render('manageUser',{message:'Error'});
		res.render('manageUser', {msg:tmpMsg, userData : users, adminData:req.session.admin});
        tmpMsg=''
	 }
	})
}


exports.deleteUser =  (req,res)=>{
    try
    {
     if(!empty(req.params.userID))
     {
      userTable.deleteOne({ '_id': req.params.userID },(error,deleted)=>{
        if(error)
        {
          tmpMsg = 'Some Problem Occured during Deleting User';
          res.redirect('/getManageUser');
        }
        if(deleted)
        {
          // utility.deleteS3File(req.params.image,config.S3_BUCKET_NAME+'sports');
          tmpMsg = 'User Deleted SuccessFully'
          res.redirect('/getManageUser');
        }
  
      })
     }else
     {
      tmpMsg = 'This User  Not Found';
      res.redirect('/getManageUser');
     }
    }catch(err){
      tmpMsg = 'Some Problem Occured during Deleting User';
      res.redirect('/getManageUser');
    }
  }
