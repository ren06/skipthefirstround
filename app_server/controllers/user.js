var request = require('request');
var common = require('./common');
var emails = require('../common/emails');
var cloudinary = require('cloudinary');

var register = require('./register');

module.exports.myAccount = function(req, res){

    var userId = req.session.userId;

    console.log('User language in main menu: ' + req.getLocale());
    console.log('id: ' + req.session.userId);
    var language = req.getLocale();

    request(common.getRequestOptions(req, '/api/user/' + userId + '/interviewsPast', 'GET'), function (err, response, body) {

        if (err) {
            console.log('call error ' + err);
        }
        else {

            if (response.statusCode === 200) {

                var interviewsPast = body.data;

                request(common.getRequestOptions(req, '/api/user/' + userId + '/interviewsUpcoming', 'GET'), function (err, response, body) {

                    if (err) {
                        console.log('call error ' + err);
                    }
                    else {
                        if (response.statusCode === 200) {

                            var interviewsFuture = body.data;

                            var options = req.app.locals.options[language];

                            var userFirstName = req.session.firstName;

                            res.render('user/my-account', {
                                welcome: res.__('Welcome %s', userFirstName),
                                interviewsPast: interviewsPast,
                                interviewsFuture: interviewsFuture,
                                options: options,
                            });
                        }
                        else{
                            console.log(response.statusCode);
                        }
                    }
                });
            }
            else{
                console.log(response.statusCode);
            }
        }
    });

};

var renderInterview = function(req, res, interview){

    res.render('user/interview', {
        title: res.__('Interview'),
        interview: interview,
    });

};

module.exports.interview = function(req, res){

    var interviewId = req.params.interviewId;

    request(common.getRequestOptions(req, '/api/interview/' + interviewId, 'GET'), function (err, response, body) {

        if(response.statusCode === 200) {

            var interview = body.data[0];

            console.log(body.data);

            renderInterview(req, res, interview);
        }
    });


};

var renderPersonalInformation = function(req, res, formData, error, editMode){

    res.render('user/personal-information', {
        title: res.__('My information'),
        pageHeader: {
            title: '',
        },
        formData: formData,
        editMode: editMode,
    });
};

module.exports.personalInformations = function(req, res){

    var userId = req.session.userId;

    request(common.getRequestOptions(req, '/api/user/' + userId, 'GET', null, null ), function (err, response, body) {

        var formData = body.data[0];

        renderPersonalInformation(req, res, formData, null, false);

    });

};

module.exports.myMessages = function(req, res){

    res.render('user/my-messages', {
        title: res.__('My messages'),
        pageHeader: {
            title: '',
        },
    });

};



var renderBrowseOffers = function(req, res, formData, results, message){

    //get all cities
    var requestOptions = common.getRequestOptions(req, '/api/offers/locations', 'GET', null);

    request(requestOptions, function (err, response, body) {

        var language = req.getLocale();

        console.log('user language: ' + language);

        var sectorOptions = req.app.locals.options[language].sectorOptions;
        sectorOptions['0'] = {"label" : "All", positions: {'0' : 'All'}};

        var jobTypeOptions =  req.app.locals.options[language].jobTypeOptions;
        jobTypeOptions['0'] = 'All';

        res.render('user/offers', {
            sectorOptions: sectorOptions,
            jobTypeOptions: jobTypeOptions,
            offerTypeOptions: common.addAll(req.app.locals.options[language].offerTypeOptions),
            companyTypeOptions: common.addAll(req.app.locals.options[language].companyTypeOptions),
            languageOptions: common.addAll(req.app.locals.options[language].languageOptions),
            locations: common.addAll(body.data),
            message: message,
            formData: formData,
            offers: results
        });
    });


};

module.exports.offer = function(req, res){

    var offerId = req.params.offerId;
    var userId = req.session.userId;

    //update view count
    //@@@ means no quotes in the SQL SET VALUE
    request(common.getRequestOptions(req, '/api/offer/' + offerId, 'PUT', {'view_count': "@@@view_count + 1"}), function (err, response, body) {

        var path = '/api/offer/' + offerId;

        //if user is logged in, check if he or she has applied before
        if(userId){
            path+= '/user/' + userId;
        }

        request(common.getRequestOptions(req, path, 'GET'), function (err, response, body) {

            var offer = body.data[0];

            res.render('user/offer', {offer: offer});

        });
    });

};

module.exports.offers = function(req, res){

    var formData = {
        sector: '0', //All
        offerType: '0',
        language: '',
        companyType: '0',
        location: '0',
    };

    renderBrowseOffers(req, res, formData, {}, null);

};

module.exports.doOffers = function(req, res){

    var userId = req.session.userId;
    var formData = req.body;
    var qs = {};

    var keys = Object.keys(formData);

    keys.forEach(function(entry){

        if(formData[entry] != 0){
            qs[entry] = formData[entry];
        }
    });

    var path = null;

    if(req.session.authenticated && req.session.role == 'user'){
        path = '/api/offers/searchForUser/' + userId;
    }
    else{
        path = '/api/offers/searchForGuest/';
    }
    console.log(path);
    request(common.getRequestOptions(req, path, 'GET', null, qs ), function (err, response, body) {

        if(response.statusCode === 200) {

            var results = body.data;

            console.log(body.data);

            var message;
            if (!results || results.length == 0) {
                message = 'No Results';
            }

            renderBrowseOffers(req, res, formData, results, message);
        }
        else{
            renderBrowseOffers(req, res, formData, body.data, err);
        }
    });

};


var renderRegisterApply = function(req, res, formData, offer, error){

    var sectorOptions = req.app.locals.options[req.getLocale()].sectorOptions;

    res.render('user/register-apply', {
        formData: formData,
        sectorOptions: sectorOptions,
        error: error,
        offer: offer,
    });
};


module.exports.applyOffer = function(req, res){

    var offerId = req.params.offerId;

    //get offer data
    var requestOptions = common.getRequestOptions(req, '/api/offer/' + offerId, 'GET', null);

    request(requestOptions, function (err, response, body) {

        var offer = body.data[0];
        console.log(offer);
        var formData = {
            email: '',
            firstName: '',
            lastName: '',
            password: '',
            confirmationPassword: '',
            availability: '',
            sector: '0',//req.app.locals.options[req.getLocale()].sectorOptions[0],
            skypeId: '',
            mobilePhone: '',
            position: '',
            company: '',
            cv: '',
        };

        if(req.session.authenticated){

            var userId = req.session.userId;

            //fetch user data
            common.readUser(req, userId, function(success, user){

                formData['skypeId'] = user.skypeId;
                formData['availability'] = user.availability;
                formData['mobilePhone'] = (user.mobilePhone ? user.mobilePhone: '');
                formData['cv'] = user.cv;

                renderRegisterApply(req, res, formData, offer, null);
            })
        }
        else{
            renderRegisterApply(req, res, formData, offer, null);
        }

    });

};

module.exports.doApplyOffer = function(req, res){

    var formData = req.body;
    var email = formData.email;
    var offerId = formData.offerId;
    var cv = formData.cv;

    console.log('Offer Id: ' + offerId);

    //get offer data
    var requestOptions = common.getRequestOptions(req, '/api/offer/' + offerId, 'GET', null);

    request(requestOptions, function (err, response, body) {

        var offer = body.data[0];

        var checkParams = '';

        if(req.session.authenticated){
            checkParams = 'skypeId, availability, cv';
        }
        else{
            checkParams = 'email, firstName, lastName, password, confirmationPassword, availability, skypeId, cv';
        }
        console.log(checkParams);
        if(!common.checkParametersPresent(checkParams, formData)){

            console.log('params NOT ok');
            console.log(offer);
            renderRegisterApply(req, res, formData, offer, 'Please enter all fields');
        }
        else{

            console.log('params ok');

            var interviewType = 2;

            //if user not authenticated it must be created
            if(!req.session.authenticated) {

                //TODO later uncomment this
                // var language = req.cookies.locale;
                //
                // if(typeof language !== 'undefined'){
                //     language = 'en';
                // }
                var language = 'en';

                formData.language = language;


                formData['sector'] = offer.sector;
                formData['position'] = offer.position;
                //formData['company'] = offer.company;

                request(common.getRequestOptions(req, '/api/user/', 'POST', formData), function (err, response, body) {

                    if (response.statusCode === 201) {

                        //authenticate user
                        var user = body.data.user;
                        var token = body.data.token;
                        console.log(token);
                        common.setSessionData(req, res, user, 'user', token, function(){

                            //send email
                            emails.to_User_Registration(email, {firstName: user.firstName, interviewType: 2});

                            //send le finaud email
                            //TODO later merge register and user
                            register.createInterview(req, user.id, interviewType, offer.sector, offer.id, offer.position, offer.company, function (err, response, body) {

                                console.log(err);
                                console.log(body);

                                console.log('create interview executed');
                                if (response.statusCode === 201) {

                                    //redirect
                                    res.redirect('/confirmation');
                                }
                                else {
                                    console.log('error unhandled, status code:' + response.statusCode);
                                    common.showError(req, res, response.statusCode);
                                }
                            });
                        });
                    }
                    else if (( response.statusCode === 400 || response.statusCode === 409 || response.statusCode === 422 ) && body.success === false) {

                        console.log(body.internalError);
                        console.log(offer);
                        renderRegisterApply(req, res, formData, offer, body.userError);

                    }
                    else {
                        console.log('error unhandled ' + err);
                        common.showError(req, res, response.statusCode);
                    }
                });
            }
            else{
                //***********************
                //** User already exists
                //***********************

                var userId = req.session.userId;

                //Get existing user data
                request( common.getRequestOptions(req, '/api/user/' + userId, 'GET'), function (err, response, body) {

                    var user = body.data[0];

                    //TODO later merge register and user
                    //Create interview
                    register.createInterview(req, userId, interviewType, offer.sector, offer.id, offer.position, offer.company, function (err, response, body) {

                        //Update user data if user made modifications
                        var postData = {
                            skypeId: formData.skypeId,
                            cv: formData.cv,
                            availability: formData.availability,
                            mobilePhone: formData.mobilePhone,
                        };

                        request(common.getRequestOptions(req, '/api/user/' + userId, 'PUT', postData), function (err, response, body) {

                            console.log(err);
                            console.log(body);

                            console.log('Create interview executed, user updated');

                            if (response.statusCode === 200) {

                                //send email
                                emails.to_User_InterviewConfirmation(interviewType, user.email, user.firstName + ' ' + user.lastName);

                                //send le finaud email
                                var cvLink = res.locals.cloudinary.url(formData.cv);
                                var data = { firstName: user.firstName, lastName: user.lastName ,email: user.email, mobilePhone: formData.mobilePhone,
                                    availability: formData.availability, interviewType: 1, skypeId: formData.skypeId, cvLink: cvLink};

                                emails.to_Admin_New_Interview(data);

                                //redirect
                                res.redirect('/confirmation');
                            }
                            else {
                                console.log('error unhandled, status code:' + response.statusCode);
                                common.showError(req, res, response.statusCode);
                            }
                        });
                    });
                });
            }

        }


    });


};

var renderSimulation = function(req, res, formData, error){

    var sectorOptions = res.app.locals.options[req.getLocale()].sectorOptions;

    res.render('user/register-simulation', {
        formData: formData,
        sectorOptions: sectorOptions,
        error: error,
    });
};


module.exports.simulation = function(req, res){

    var userId = req.session.userId;

    //check is simulation possible
    request(common.getRequestOptions(req, '/api/user/' + userId + '/newMockInterviewPossible', 'GET'), function (err, response, body) {

        if(body.data.canBook === true) {

            request(common.getRequestOptions(req, '/api/user/' + userId, 'GET'), function (err, response, body) {

                var user = body.data[0];

                var formData = {
                    canBook: body.data.canBook,
                    availability: user.availability,
                    sector: '1',
                    skypeId: user.skypeId,
                    mobilePhone: (user.mobilePhone ? user.mobilePhone : ''),
                    position: '',
                    company: '',
                    cv: user.cv,
                };

                renderSimulation(req, res, formData, null);

            });
        }
        else{
            var formData = {
                canBook: body.data.canBook,
                dateTimeText: body.data.dateTimeText
            };

            renderSimulation(req, res, formData, null);
        }
    });

};

module.exports.doSimulation = function(req, res){

    var formData = req.body;
    var userId = req.session.userId;
    var company = req.body.company;
    var position = req.body.position;

    var simulation = 1;

    if(!common.checkParametersPresent('position, sector, availability, skypeId', formData)){

        renderSimulation(req, res, formData, 'Please enter all fields');
    }
    else{

        register.createInterview(req, userId, simulation, formData.sector, null, position, company, function(err, response, body){

            console.log('create interview executed');
            if(response.statusCode === 201) {

                //send email to user
                emails.to_User_NewInterviewRequest(req.session.email, req.session.firstName, simulation);

                //send admin an email

                //first fetch required data
                request(common.getRequestOptions(req, '/api/user/' + userId, 'GET'), function (err, response, body) {

                    var user = body.data[0];

                    var cvLink = res.locals.cloudinary.url(user.cv);

                    var data = { firstName: user.firstName, lastName: user.lastName ,email: user.email, mobilePhone: user.mobilePhone,
                        availability: user.availability, interviewType: simulation, skypeId: user.skypeId, cvLink: cvLink};

                    emails.to_Admin_New_Interview(data);

                });

                //redirect
                res.redirect('/confirmation');
            }
            else{
                console.log('error unhandled: ' +  body.internalError);
                common.showError(req, res, response.statusCode);
            }
        });
    }


};








