var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var config = require('config');

var auth = jwt({
    secret: config.Api.Secret,//process.env.JWT_SECRET,
    userProperty: 'payload'
});

var ctrlUnitTest = require('../controllers/unitTest');

var ctrlUsers =  require('../controllers/userss');
var ctrlOptions = require('../controllers/options');
var ctrlInterviews = require('../controllers/interviews');
var ctrlInterviewers = require('../controllers/interviewers');
var ctrlRecruiters = require('../controllers/recruiters');
var ctrlOffers = require('../controllers/offers');

router.use(function(req, res, next) {
    // perform some sort of logic test, such as body contents in req or authentication as occurred
    //need a JSON format request with API credentials and languge
    next(); // moving on...
});

//OK and tested
router.post('/user/', ctrlUsers.userCreate);
router.post('/userLogin', ctrlUsers.doUserAuthenticate);
router.get ('/users', ctrlUsers.usersList);
router.get ('/user/:userId', ctrlUsers.userReadOne);
router.put ('/user/:userId', ctrlUsers.userModify);

router.post('/interviewer/', ctrlInterviewers.interviewerCreate);
router.get ('/interviewers/', ctrlInterviewers.interviewersList);
router.get ('/interviewer/:interviewId', ctrlInterviewers.interviewerReadOne);


router.get ('/options/sector', ctrlOptions.getSectorOptions);
router.get ('/options/interviewType', ctrlOptions.getInterviewTypeOptions);
router.get ('/options/interviewStatus', ctrlOptions.getInterviewStatusOptions);
router.get ('/options/all', ctrlOptions.getAllOptions);

//Don't forget the auth later when admin login setup
router.post('/interview', ctrlInterviews.interviewCreate);
router.get ('/interviews', ctrlInterviews.interviewList);
router.post('/interview/:interviewId/setDate', ctrlInterviews.interviewSetDate);
router.get ('/interview/:interviewId', ctrlInterviews.interviewReadOne);
router.post('/interview/:interviewId/sequences/new', ctrlInterviews.interviewAddSequence);
router.put ('/interview/:interviewId', ctrlInterviews.interviewModify);

router.get ('/interviews/noDate', ctrlInterviews.interviewListNoDate);

//router.get ('/interview/:interviewId/sequences', ctrlInterviews. );
//router.post('/interview/:interviewId/sequences/delete', ctrlInterviews. );

router.get ('/user/:userId/interviews', auth, ctrlInterviews.interviewListByUser);
router.get ('/user/:userId/interviewsUpcoming', auth, ctrlInterviews.interviewUpcomingByUser);
router.get ('/user/:userId/interviewsPast', ctrlInterviews.interviewPastByUser);

router.post('/recruiter', ctrlRecruiters.createRecruiter);
router.get ('/recruiters', ctrlRecruiters.recruiterList);
router.get ('/recruiter/:recruiterId', ctrlRecruiters.recruiterReadOne);
router.get ('/recruiter/:recruiterId/offers', ctrlOffers.offersListByRecruiter);
router.post('/recruiter/login', ctrlRecruiters.doRecruiterAuthenticate)

router.post('/offer', ctrlOffers.offerCreate);
router.get ('/offer/:offerId', ctrlOffers.offerReadOne);
router.get ('/offers/locations', ctrlOffers.offerLocationsList);
router.get ('/offers/searchForUser/:userId', ctrlOffers.offerSearchForUser);
router.get ('/offers/searchForGuest', ctrlOffers.offerSearchForGuest);
router.get ('/offers/searchForRecruiter', ctrlOffers.offerSearchForRecruiter);

//router.get ('/videos/search', ctrlOffers.searchVideos);

router.get ('/testDb', ctrlUnitTest.dbConnection);
router.get ('/testLocale', ctrlUnitTest.locale);


module.exports = router;
