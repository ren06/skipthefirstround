var express = require('express');
var router = express.Router();
var common = require('../controllers/common');

var ctrlRegister = require('../controllers/register');
var ctrlUser = require('../controllers/user');
var ctrlEmails = require('../common/emails');
var ctrlInformation = require('../controllers/information');
var ctrlHomepage = require('../controllers/homepage');


function isAuthenticated(req, res, next){
    if(req.session.authenticated){
        next();
    }else{
        //next(new Error(401));
        res.render('user/generic-text', {
            title: res.__('Unauthorised'),
            content: 'You are not authorised, please login first',
        });
    }
}

router.get ('/', ctrlHomepage.homepageUser);

router.get ('/user-register', common.checkPermission(['guest']), ctrlRegister.registerUser);
router.post('/user-register',  common.checkPermission(['guest']), ctrlRegister.doRegisterUser);
router.get ('/getPositions', ctrlRegister.getPositions);

router.get ('/confirmation', ctrlRegister.confirmation);
router.get ('/my-account', common.checkPermission(['user']), ctrlUser.myAccount);
router.get ('/interview/:interviewId', common.checkPermission(['user']), ctrlUser.interview);
router.get ('/personal-information',  common.checkPermission(['user']), ctrlUser.personalInformations);
router.get ('/my-messages', ctrlUser.myMessages);
router.get ('/change-language/:language', ctrlHomepage.changeLanguage);


router.get ('/user-login', ctrlRegister.identification);
router.post('/user-login', ctrlRegister.doIdentification);
router.get ('/user-logout', ctrlRegister.doLogout);

router.get ('/offers', ctrlUser.offers);
router.post('/offers', ctrlUser.doOffers);

router.get ('/apply/:offerId', ctrlUser.applyOffer);
router.post('/apply/:offerId', ctrlUser.doApplyOffer);

router.get ('/simulation', ctrlUser.simulation);
router.post('/simulation', ctrlUser.doSimulation);

router.get ('/information', ctrlInformation.information);
router.get('/about', ctrlHomepage.about);

router.post('/contactForm', ctrlHomepage.doContactForm);



module.exports = router;
