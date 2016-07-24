var express = require('express');
var router = express.Router();

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

function checkPermission(resource, action){


    var middleware = false;  // start out assuming this is not a middleware call

    return function(req, res, next){
        // check if this is a middleware call
        if(next){
            // only middleware calls would have the "next" argument
            middleware = true;
        }

        var uid = req.session.userId;  // get user id property from express request

        if(typeof uid === 'undefined'){
            console.log('uid undefined');
            uid = 0;
        }


        var aclInstance = res.locals.acl

        // perform permissions check
        aclInstance.isAllowed(uid, resource, action, function(err, result){
            // return results in the appropriate way
            if(middleware) {
                if (result) {
                    // user has access rights, proceed to allow access to the route
                    next();
                } else {
                    // user access denied
                     var checkError = new Error("UnauthorizedError", 401);
                    // console.log('UnauthorizedError');
                     next(checkError);  // stop access to route

                    //next(new Error({name: 'error', status : 401}));

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
router.get ('/my-account', checkPermission("my-account", "get"), ctrlUser.myAccount);
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
