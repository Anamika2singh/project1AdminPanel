const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middlewares/verifyAdmin')
const teamController = require('../controllers/teamController')



router.get('/getTeam',verifyAdmin,teamController.getTeam)

router.get('/getAddTeam',verifyAdmin,teamController.getAddTeam)
router.post('/addTeam',verifyAdmin,teamController.addTeam)

router.get('/getUpdateTeam/:teamID',verifyAdmin,teamController.getUpdateTeam)
router.post('/updateTeam/:teamID',verifyAdmin,teamController.updateTeam)
router.get('/deleteTeam/:teamID',verifyAdmin,teamController.deleteTeam)
router.get('/setAction/:status/:teamID',verifyAdmin,teamController.setAction);


module.exports = router;