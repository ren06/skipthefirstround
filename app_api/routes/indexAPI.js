var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var config = require('config');

var authMiddleware = jwt({
    secret: config.get('Api.Secret'),//process.env.JWT_SECRET,
    userProperty: 'payload'
});

var auth = function(req, res, next){

    if(config.get('Api.authTokenOn')){
        console.log('Middleware auth Token On');
        authMiddleware(req, res, next);
    }
    else{
        console.log('Middleware auth Token Off');
        next();
    }
};

var ctrlUnitTest = require('../controllers/unitTest');

var ctrlUsers =  require('../controllers/userss');
var ctrlOptions = require('../controllers/options');
var ctrlInterviews = require('../controllers/interviews');
var ctrlInterviewers = require('../controllers/interviewers');
var ctrlRecruiters = require('../controllers/recruiters');
var ctrlOffers = require('../controllers/offers');
var ctrlAdministrator = require('../controllers/administrators');

//No auth for all options
router.get ('/options/sector', ctrlOptions.getSectorOptions);
router.get ('/options/interviewType', ctrlOptions.getInterviewTypeOptions);
router.get ('/options/interviewStatus', ctrlOptions.getInterviewStatusOptions);
router.get ('/options/all', ctrlOptions.getAllOptions);

router.post('/user/', ctrlUsers.userCreate);
router.post('/userLogin', ctrlUsers.doUserAuthenticate);
router.get ('/users', auth, ctrlUsers.usersList);
router.get ('/users/search', auth, ctrlUsers.userSearch);
router.get ('/user/:userId', auth, ctrlUsers.userReadOne);
router.put ('/user/:userId', auth, ctrlUsers.userModify);
router.post('/user/changePassword', ctrlUsers.userChangePassword); //problem, can't authenticate user but they should be

router.post('/interviewer/', ctrlInterviewers.interviewerCreate);
router.get ('/interviewers/', auth, ctrlInterviewers.interviewersList);
router.get ('/interviewer/:interviewerId', auth, ctrlInterviewers.interviewerReadOne);

router.post('/interview', ctrlInterviews.interviewCreate);
router.get ('/interviews', auth, ctrlInterviews.interviewList);
router.post('/interview/:interviewId/setDate', auth, ctrlInterviews.interviewSetDate);
router.get ('/interview/:interviewId', auth, ctrlInterviews.interviewReadOne);
router.post('/interview/:interviewId/sequences/new', auth, ctrlInterviews.interviewAddSequence);
router.put ('/interview/:interviewId', auth, ctrlInterviews.interviewModify);
router.get ('/interviews/noDate', auth, ctrlInterviews.interviewListNoDate);
router.get ('/interviews/searchMockInterviewsForRecruiter', auth, ctrlInterviews.searchMockInterviewsForRecruiter);

router.get ('/user/:userId/interviews', auth, ctrlInterviews.interviewListByUser);
router.get ('/user/:userId/interviewsUpcoming', auth, ctrlInterviews.interviewUpcomingByUser);
router.get ('/user/:userId/interviewsPast', auth, ctrlInterviews.interviewPastByUser);
router.get ('/user/:userId/newMockInterviewPossible', auth, ctrlInterviews.newMockInterviewPossible);

router.post('/recruiter', ctrlRecruiters.createRecruiter);
router.get ('/recruiters', auth, ctrlRecruiters.recruiterList);
router.get ('/recruiter/:recruiterId', auth, ctrlRecruiters.recruiterReadOne);
router.get ('/recruiter/:recruiterId/offers', auth, ctrlOffers.offersListByRecruiter);
router.put ('/recruiter/:recruiterId/toggleActiveInactive', auth, ctrlRecruiters.toggleActiveInactive);
router.get ('/recruiter/:recruiterId/isActive', auth, ctrlRecruiters.isActive);
router.post('/recruiter/login', ctrlRecruiters.doRecruiterAuthenticate);

router.post('/offer', auth, ctrlOffers.offerCreate);
router.get ('/offer/:offerId', ctrlOffers.offerReadOne); //** Available to guests **//
router.get ('/offer/:offerId/user/:userId', auth, ctrlOffers.offerReadOneForUser);
router.get ('/offers', ctrlOffers.offersList); //** Available to guests **//
router.put ('/offer/:offerId', auth, ctrlOffers.offersModifyOne);
router.get ('/offer/:offerId/videos', auth, ctrlOffers.offerReadOneVideos);
router.get ('/offers/locations', ctrlOffers.offerLocationsList); //** Available to guests **//
router.get ('/offers/searchForUser/:userId', auth, ctrlOffers.offerSearchForUser);
router.get ('/offers/searchForGuest', ctrlOffers.offerSearchForGuest);

router.post('/administrators/login', ctrlAdministrator.login);


router.get ('/testDb', ctrlUnitTest.dbConnection);
router.get ('/testLocale', ctrlUnitTest.locale);
router.get ('/test/renameEmailAddress', ctrlUnitTest.renameEmailAddress);

module.exports = router;
