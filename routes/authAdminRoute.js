const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middlewares/verifyAdmin')
const authAdminController = require('../controllers/authAdminController')



router.get('/getLogin',authAdminController.getLogin)
router.post('/login', authAdminController.login);
router.get('/getEditProfile',verifyAdmin,authAdminController.getEditProfile );
router.post('/editProfile',verifyAdmin,authAdminController.editProfile);
router.get('/getUpdatePassword',verifyAdmin,authAdminController.getUpdatePassword)
router.post('/updatePassword',verifyAdmin,authAdminController.updatePassword)

router.get('/getForgotPassword',authAdminController.getForgotPassword);
router.post("/sendPasswordResetEmail",authAdminController.sendPasswordResetEmail);

router.get('/getResetPassword',authAdminController.getResetPassword)
router.post("/resetPassword",authAdminController.resetPassword);

router.get("/verifyToken/:token",authAdminController.verifyToken);

router.get("/logout", verifyAdmin ,authAdminController.logout);
module.exports = router;