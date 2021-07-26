const express = require('express');
const router = express.Router();

const verifyAdmin = require('../middlewares/verifyAdmin')
const indexController = require('../controllers/indexController')


router.get('/',indexController.homePage)
router.get('/getManageUser',verifyAdmin,indexController.getManageUser);
router.get('/deleteUser/:userID',verifyAdmin,indexController.deleteUser)
router.get('/dashboard', verifyAdmin ,indexController.dashboard);

module.exports = router;