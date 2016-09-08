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

router.get ('/', ctrlHomepage.homepageUser); //No access control for homepage at all

router.get ('/user-register', common.checkPermission(['guest']), ctrlRegister.registerUser);
router.post('/user-register',  common.checkPermission(['guest']), ctrlRegister.doRegisterUser);
router.get ('/getPositions', ctrlRegister.getPositions);

router.get ('/confirmation', common.checkPermission(['user']), ctrlRegister.confirmation);
router.get ('/my-account', common.checkPermission(['user']), ctrlUser.myAccount);
router.get ('/interview/:interviewId', common.checkPermission(['user']), ctrlUser.interview);
router.get ('/personal-information',  common.checkPermission(['user']), ctrlUser.personalInformations);
router.get ('/my-messages',  common.checkPermission(['user']), ctrlUser.myMessages);
router.get ('/change-language/:language', ctrlHomepage.changeLanguage);


router.get ('/user-login', common.checkPermission(['guest']), ctrlRegister.identification);
router.post('/user-login', common.checkPermission(['guest']), ctrlRegister.doIdentification);
router.get ('/user-logout', ctrlRegister.doLogout);
router.get ('/password-reset', common.checkPermission(['guest']), ctrlRegister.passwordReset);
router.post('/password-reset', common.checkPermission(['guest']), ctrlRegister.doPasswordReset);
router.get ('/change-password/:code', common.checkPermission(['guest']), ctrlRegister.changePassword);
router.post('/change-password/:code', common.checkPermission(['guest']),  ctrlRegister.doChangePassword);
router.get ('/change-password-confirmation', common.checkPermission(['guest']),  ctrlRegister.changePasswordConfirmation);

router.get ('/offers', common.checkPermission(['guest', 'user']), ctrlUser.offers);
router.post('/offers', common.checkPermission(['guest', 'user']), ctrlUser.doOffers);

router.get ('/apply/:offerId', common.checkPermission(['guest', 'user']), ctrlUser.applyOffer);
router.post('/apply/:offerId', common.checkPermission(['guest', 'user']), ctrlUser.doApplyOffer);

router.get ('/simulation', common.checkPermission(['user']), ctrlUser.simulation);
router.post('/simulation', common.checkPermission(['user']), ctrlUser.doSimulation);

router.get ('/information', ctrlInformation.information);
router.get('/about', ctrlHomepage.about);

router.post('/contactForm', ctrlHomepage.doContactForm);



module.exports = router;
