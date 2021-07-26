var isset = require('isset');
var empty = require('is-empty');
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();
const adminTable = require('../model/admin')

  module.exports = async function(req, res, next){ 
  if (req.originalUrl!='/auth/getLogin' )
  {      // decode token
      if (isset(req.session.admin) && !empty(req.session.admin)) {
          // verifies secret and checks exp 
       let admin =  await adminTable.findOne({'_id':req.session.admin.adminID})
                    if(admin){
                      next();
                    }else{
                     
                      res.redirect('/auth/getLogin');
                    }
                //   })
                
        }
      else {
          res.redirect('/auth/getLogin');
      }
  }else{
    next();
  }    
}  