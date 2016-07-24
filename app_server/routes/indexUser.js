var express = require('express');
var router = express.Router();

var ctrlRegister = require('../controllers/register');
var ctrlUser = require('../controllers/user');
var ctrlEmails = require('../common/emails');
var ctrlInformation = require('../controllers/information');
var ctrlHomepage = require('../controllers/homepage');
var acl = require('acl');

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

function checkPermission(resource, action){
    var middleware = false;  // start out assuming this is not a middleware call

    return function(req, res, next){
        // check if this is a middleware call
        if(next){
            // only middleware calls would have the "next" argument
            middleware = true;
        }

        var uid = req.session.user.id;  // get user id property from express request

        // perform permissions check
        acl.isAllowed(uid, resource, action, function(err, result){
            // return results in the appropriate way
            if(middleware) {
                if (result) {
                    // user has access rights, proceed to allow access to the route
                    next();
                } else {
                    // user access denied
                    var checkError = new Error("user does not have permission to perform this action on this resource");
                    next(checkError);  // stop access to route
                }
                return;
            }
            else{
                if(result){
                    // user has access rights
                    return true;
                } else {
                    // user access denied
                    return false;
                }
            }
        });
    }
}


router.get ('/', checkPermission("user-register", "get"), ctrlHomepage.homepage);
router.get ('/deconnexion', ctrlRegister.deconnexion );

router.get ('/user-register', checkPermission("user-register", "get"), ctrlRegister.registerUser);
router.post('/user-register', ctrlRegister.doRegisterUser);
router.get ('/confirmation', ctrlRegister.confirmation);
router.get ('/my-account', isAuthenticated, ctrlUser.myAccount);
router.get ('/interview', ctrlUser.interview);
router.get ('/personal-information', ctrlUser.personalInformations);
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


router.get ('/testEmail', ctrlEmails.testEmail);



module.exports = router;
