var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var config = require('config');

var auth = jwt({
    secret: config.Api.Secret,//process.env.JWT_SECRET,
    userProperty: 'payload'
});


var ctrlAdmin = require('../controllers/administrator');

router.get ('/', ctrlAdmin.homepage);
router.get ('/students-list', ctrlAdmin.usersList);
router.get ('/student-menu', ctrlAdmin.etudiant);
router.get ('/students-interviews-list', ctrlAdmin.studentsInterviewsList);
router.get ('/student-interviews-list', ctrlAdmin.studentInterviewsList);
router.get ('/student-add-interview', ctrlAdmin.ajoutEntretien);
router.get ('/interview/:interviewId', ctrlAdmin.interview);
router.get ('/interview/:interviewId/modify', ctrlAdmin.interviewModify);
router.post('/interview/:interviewId/modify', ctrlAdmin.doInterviewModify);
router.get ('/interview/:interviewId/modifyDate', ctrlAdmin.interviewModifyDate);
router.post('/interview/:interviewId/modifyDate', ctrlAdmin.doInterviewModifyDate);
router.get ('/interview/:interviewId/addSequence', ctrlAdmin.interviewAddSequence);
router.post('/interview/:interviewId/addSequence', ctrlAdmin.doInterviewAddSequence);
// router.get ('/doUploadVideo', ctrlAdmin.doUploadVideo);
router.get ('/viewUploadVideo', ctrlAdmin.viewUploadVideo);







module.exports = router;