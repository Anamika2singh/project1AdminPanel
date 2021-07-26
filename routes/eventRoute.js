const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middlewares/verifyAdmin')
const eventController = require('../controllers/eventController')
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

router.post('/getAllTeams',verifyAdmin,eventController.getAllTeams),
router.get('/getEvent',verifyAdmin,eventController.getEvent)

router.get('/getAddEvent',verifyAdmin,eventController.getAddEvent)
router.post('/addEvent',verifyAdmin,upload.single('image'),eventController.addEvent)

router.get('/getUpdateEvent/:groupId',verifyAdmin,eventController.getUpdateEvent)
router.post('/updateEvent/:image/:groupId',verifyAdmin,upload.single('image'),eventController.updateEvent)
router.get('/deleteEvent/:image/:groupId',verifyAdmin,eventController.deleteEvent)
router.post('/getTicketMasterEventPrice',verifyAdmin,eventController.getTicketMasterEventPrice)

router.get('/setAction/:status/:groupId',verifyAdmin,eventController.setAction);
module.exports = router;