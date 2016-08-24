var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var config = require('config');


var ctrlAdmin = require('../controllers/administrator');

router.get ('/', ctrlAdmin.homepage);
router.post('/', ctrlAdmin.doLogin);

router.get ('/main-menu', ctrlAdmin.mainMenu);
router.get ('/logout', ctrlAdmin.logout);

router.get ('/students-list', ctrlAdmin.usersList);
router.get ('/student-menu', ctrlAdmin.student);
router.get ('/students-interviews-list', ctrlAdmin.studentsInterviewsList);
router.get ('/students-interviews-no-date', ctrlAdmin.studentsInterviewNoDate);


router.get ('/interview/:interviewId', ctrlAdmin.interview);
router.get ('/interview/:interviewId/modify', ctrlAdmin.interviewModify);
router.post('/interview/:interviewId/modify', ctrlAdmin.doInterviewModify);
router.get ('/interview/:interviewId/modifyDate', ctrlAdmin.interviewModifyDate);
router.post('/interview/:interviewId/modifyDate', ctrlAdmin.doInterviewModifyDate);
router.get ('/interview/:interviewId/addSequence', ctrlAdmin.interviewAddSequence);
router.post('/interview/:interviewId/addSequence', ctrlAdmin.doInterviewAddSequence);


router.get ('/interviewers/', ctrlAdmin.interviewerList);
router.get ('/interviewer-create/', ctrlAdmin.interviewerCreate);
router.post('/interviewer-create/', ctrlAdmin.doInterviewerCreate);

router.get ('/recruiters/', ctrlAdmin.recruitersList);
router.get ('/recruiter/:recruiterId/toggleActiveInactive', ctrlAdmin.toggleActiveInactive);







module.exports = router;