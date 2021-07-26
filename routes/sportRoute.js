const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middlewares/verifyAdmin')
const sportController = require('../controllers/sportController')
var multer = require("multer");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/images/" , function(err , succ) {
            if(err)
                throw err

        });
    },
    filename: function (req, file, cb) {        
        var name  = (Date.now()+ Date.now() +file.originalname);
        name = name.replace(/ /g,'-');       
        cb(null, name , function(err , succ1) {
            if(err)
                throw err

        });
    }
});
const upload = multer({ storage: storage, limits: 1000000});

router.get('/getSport',verifyAdmin,sportController.getSport)

router.post('/addSport',verifyAdmin,upload.single('sportImage'),sportController.addSport)

router.post('/updateSport/:image/:sportID',verifyAdmin,upload.single('sportImage'),sportController.updateSport)

router.get('/deleteSport/:image/:sportID',verifyAdmin,sportController.deleteSport)

module.exports = router;