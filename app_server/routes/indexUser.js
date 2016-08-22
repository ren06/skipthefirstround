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

// function checkPermission(resource, action){
//
//     var middleware = false;  // start out assuming this is not a middleware call
//
//     return function(req, res, next){
//         // check if this is a middleware call
//         if(next){
//             // only middleware calls would have the "next" argument
//             middleware = true;
//         }
//
//         var uid = req.session.userId;  // get user id property from express request
//         var role = req.session.role;
//
//         if(typeof uid === 'undefined'){
//             console.log('uid undefined');
//             uid = 0;
//         }
//
//         var aclInstance = res.locals.acl;
//
//         console.log('Checking user ' + uid + ' with role ' + role + ' for resource ' + resource + ' with action ' + action);
//
//         aclInstance.allowedPermissions(uid, resource, function(err, permissions){
//             console.log('User has the following permissions for ' + resource);
//             console.log(permissions);
//         })
//
//         // perform permissions check
//         aclInstance.isAllowed(uid, resource, action, function(err, result){
//             // return results in the appropriate way
//             if(middleware) {
//                 if (result) {
//                     // user has access rights, proceed to allow access to the route
//                     console.log('User ' + uid + ' with role ' + role + ' has access to resource ' + resource + ' with action ' + action);
//                     next();
//                 } else {
//                     // user access denied
//                     console.log('User ' + uid + ' with role ' + role + ' does not have access to resource ' + resource + ' with action ' + action);
//
//
//
//                      var checkError = new Error("UnauthorizedError", 401);
//                     // console.log('UnauthorizedError');
//                      next(checkError);  // stop access to route
//
//                 }
//                 return;
//             }
//             else{
//                 if(result){
//                     // user has access rights
//                     return true;
//                 } else {
//                     // user access denied
//                     return false;
//                 }
//             }
//         });
//     }
// }


function checkPermission(roles){

    return function(req, res, next) {

        var authenticated = req.session.authenticated;
        var authOk = true;

        console.log('authenticated: ' + authenticated);
        console.log('role: ' + req.session.role);

        var isGuest = true;
        var roleOk = false;

        //check for guest
        if (roles.indexOf('guest') > 1) {

            if (!authenticated) {
                next()
            }
            else{
                res.render('user/generic-text', {
                    title: res.__('Unauthorised'),
                    content: "Only non authenticated users can see see this page, go to your <a href='/'>homepage</a>",
                });
            }
        }

        if (authenticated) {

            var currentRole = req.session.role;

            if (currentRole) {

                console.log(roles);

                if(roles.indexOf(currentRole) > -1){

                    console.log(currentRole + ' found in array of roles');
                    next();
                }
                else{
                    res.render('user/generic-text', {
                        title: res.__('Unauthorised'),
                        content: "You are not authorised to see this page, go to your <a href='/'>homepage</a>",
                    });
                }
            }
        }
        else{
            console.log('going next');
            next();
        }


    }

};


router.get ('/', ctrlHomepage.homepage);

router.get ('/user-register', checkPermission(['guest']), ctrlRegister.registerUser);
router.post('/user-register',  checkPermission(['guest']), ctrlRegister.doRegisterUser);
router.get ('/getPositions', ctrlRegister.getPositions);

router.get ('/confirmation', ctrlRegister.confirmation);
router.get ('/my-account', checkPermission(['user']), ctrlUser.myAccount);
router.get ('/interview/:interviewId', checkPermission(['user']), ctrlUser.interview);
router.get ('/personal-information',  checkPermission(['user']), ctrlUser.personalInformations);
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
