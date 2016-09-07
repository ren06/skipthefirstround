var request = require('request');
var common = require('./common');
var emails = require('../common/emails');
var cloudinary = require('cloudinary');

var register = require('./register');

module.exports.myAccount = function(req, res){

    console.log('id: ' + req.session.userId);

    var language = req.cookies.locale;

    console.log('My account current locale: ' + language);

    var apiOptions = common.getApiOptions();

    var userId = req.session.userId;
    var token = req.session.token;

    var requestOptions = {
        url: apiOptions.server + '/api/user/' + userId + '/interviewsPast',
        method: 'GET',
        headers:{
            'Authorization': 'Bearer ' + token,
            'Accept-Language': language,
        },
        json: {},
        qs: {}
    };

    request(requestOptions, function (err, response, body) {

        if (err) {
            console.log('call error ' + err);
        }
        else {

            if (response.statusCode === 200) {

                var interviewsPast = body.data;

                requestOptions.url = apiOptions.server + '/api/user/' + userId + '/interviewsUpcoming';

                request(requestOptions, function (err, response, body) {

                    if (err) {
                        console.log('call error ' + err);
                    }
                    else {
                        if (response.statusCode === 200) {

                            var interviewsFuture = body.data;

                            var options = req.app.locals.options[res.getLocale()];
 
                            console.log(interviewsPast);

                            var userFirstName = req.session.firstName;
                            console.log(userFirstName);

                            res.render('user/my-account', {
                                welcome: res.__('Welcome %s', userFirstName),
                                title: res.__('MyAccount'),
                                interviewsPast: interviewsPast,
                                interviewsFuture: interviewsFuture,
                                options: options,
                                pageHeader: {
                                    title: '',
                                },
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

    console.log('user/interview');
    res.render('user/interview', {
        title: res.__('Interview'),
        interview: interview,
    });

};

module.exports.interview = function(req, res){

    var interviewId = req.params.interviewId;

    request(common.getRequestOptions(req, '/api/interview/' + interviewId, 'GET', null, null ), function (err, response, body) {

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

        var lang = res.getLocale();

        var sectorOptions = req.app.locals.options[lang].sectorOptions;
        sectorOptions['0'] = {"label" : "All", positions: {'0' : 'All'}};

        var jobTypeOptions =  req.app.locals.options[lang].jobTypeOptions;
        jobTypeOptions['0'] = 'All';

        res.render('user/offers', {
            sectorOptions: sectorOptions,
            jobTypeOptions: jobTypeOptions,
            offerTypeOptions: common.addAll(req.app.locals.options[lang].offerTypeOptions),
            companyTypeOptions: common.addAll(req.app.locals.options[lang].companyTypeOptions),
            languageOptions: common.addAll(req.app.locals.options[lang].languageOptions),
            locations: common.addAll(body.data),
            message: message,
            formData: formData,
            offers: results
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
                message = 'Pas de résultats';
            }

            renderBrowseOffers(req, res, formData, results, message);
        }
        else{
            renderBrowseOffers(req, res, formData, body.data, err);
        }
    });

};


var renderRegisterApply = function(req, res, formData, offer, error){

    var sectorOptions = req.app.locals.options[res.getLocale()].sectorOptions;

    res.render('user/register-apply', {
        title: i18n.__('Enregistrement'),
        formData: formData,
        sectorOptions: sectorOptions,
        error: error,
        offer: offer,
       // cvLink: cvLink,
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
            sector: '0',//req.app.locals.options[res.getLocale()].sectorOptions[0],
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

    console.log(formData);

    var offerId = formData.offerId;
    var sector = formData.sector;
    var cv = formData.cv;

    //get offer data
    var requestOptions = common.getRequestOptions(req, '/api/offer/' + offerId, 'GET', null);

    request(requestOptions, function (err, response, body) {

        var offer = body.data;

        var checkParams = '';

        if(req.session.authenticated){
            checkParams = 'skypeId, sector, availability';
        }
        else{
            checkParams = 'email, firstName, lastName, password, confirmationPassword, availability, skypeId, sector';
        }
        console.log(checkParams);
        if(!common.checkParametersPresent(checkParams, formData)){

            console.log('params NOT ok');
            renderRegisterApply(req, res, formData, offer, 'Please enter all fields');
        }
        else{

            console.log('params ok');

            var interviewType = 2;

            //if user not authenticated it must be created
            if(!req.session.authenticated) {

                var language = req.cookies.locale;

                if(typeof language !== 'undefined'){
                    language = 'en';
                }

                formData.language = language;

                var requestOptions = common.getRequestOptions(req, '/api/user/', 'POST', formData);

                request(requestOptions, function (err, response, body) {

                    if (response.statusCode === 201) {

                        //authenticate user
                        var token = body.data.token;
                        console.log(token);
                        common.setSessionData(req, res, body.data.user, 'user', token, function(){

                            //send email
                            emails.to_User_Registration(req.session.email, req.session.fullName, 2);

                            //send le finaud email
                            //TODO later merge register and user
                            register.createInterview(req, body.data.user.id, interviewType, sector, offerId, null, null, function (err, response, body) {

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
                        renderRegisterApply(req, res, formData, body.userError);

                    }
                    else {
                        console.log('error unhandled ' + err);
                        common.showError(req, res, response.statusCode);
                    }
                });
            }
            else{

                var userId = req.session.userId;

                //send email
                emails.to_User_InterviewConfirmation(interviewType, req.session.email, req.session.fullName);

                //send le finaud email
                emails.to_Admin_New_Interview(interviewType, req.session.email, req.session.fullName);
                //TODO later merge register and user
                register.createInterview(req, userId, interviewType, sector, offerId, null, null, function (err, response, body) {

                    //update

                    var postData = {
                        skypeId: formData.skypeId,
                        cv: formData.cv,
                        availability: formData.availability,
                        mobilePhone: formData.mobilePhone,
                    };

                    requestOptions = common.getRequestOptions(req, '/api/user/' + userId, 'PUT', postData);

                    request(requestOptions, function (err, response, body) {

                        console.log(err);
                        console.log(body);

                        console.log('create interview executed');
                        if (response.statusCode === 204) {

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

        }


    });


};

var renderSimulation = function(req, res, formData, error){

    var sectorOptions = res.app.locals.options[res.getLocale()].sectorOptions;

    res.render('user/register-simulation', {
        formData: formData,
        sectorOptions: sectorOptions,
        error: error,
    });
};


module.exports.simulation = function(req, res){

    //could get the data of the last simulation to pre-fill the data?
    var userId = req.session.userId;

    var requestOptions = common.getRequestOptions(req, '/api/user/' + userId, 'GET', null);

    request(requestOptions, function (err, response, body) {

        var user = body.data[0];

        var formData = {
            availability: user.availability,
            sector: '1',
            skypeId: user.skypeId,
            mobilePhone: (user.mobilePhone? user.mobilePhone: '') ,
            position: '',
            company: '',
            cv: user.cv,
        };

        renderSimulation(req, res, formData, null);

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








