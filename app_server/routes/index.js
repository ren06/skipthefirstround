var express = require('express');
var router = express.Router();

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


var ctrlRegister = require('../controllers/register');
var ctrlUser = require('../controllers/user');
var ctrlEmails = require('../common/emails');
var ctrlInformation = require('../controllers/information');
var ctrlHomepage = require('../controllers/homepage');

router.get ('/', ctrlHomepage.homepage);
router.get ('/deconnexion', ctrlRegister.deconnexion );

router.get ('/user-register', ctrlRegister.registerUser);
router.post('/user-register', ctrlRegister.doRegisterUser);
router.get ('/confirmation', ctrlRegister.confirmation);
router.get ('/my-account', isAuthenticated, ctrlUser.myAccount);
router.get ('/interview', ctrlUser.interview);
router.get ('/personal-information', ctrlUser.personalInformations);
router.get ('/change-language/:language', ctrlHomepage.changeLanguage);


router.get ('/user-login', ctrlRegister.identification);
router.post('/user-login', ctrlRegister.doIdentification);
router.get ('/user-logout', ctrlRegister.doLogout);

router.get ('/information', ctrlInformation.information);

router.get('/about', ctrlHomepage.about);


router.post('/uploadCV', ctrlRegister.doUploadCV);
router.get ('/testEmail', ctrlEmails.testEmail);

/* Locations page. */
//
// router.get('/location/:locationid', ctrlLocations.locationInfo);
// router.get('/location/:locationid/reviews/new', ctrlLocations.addReview);
// router.post('/location/:locationid/reviews/new', ctrlLocations.doAddReview);





module.exports = router;
