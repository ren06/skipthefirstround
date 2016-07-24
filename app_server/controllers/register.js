var request = require('request');
var i18n = require('i18n');
var emails = require('../common/emails');
var common = require('./common');

var apiOptions = common.getApiOptions();

var renderRegister = function(req, res, formData, error){

    var sectorOptions = req.app.locals.options[res.getLocale()].sectorOptions;

    console.log(sectorOptions);

    res.render('user/register-simulation', {
        title: i18n.__('Enregistrement'),
        formData: formData,
        sectorOptions: sectorOptions,
        pageHeader: {
            title: 'DaF',
        },
        error: error,
    });
};

var renderIdentification = function(req, res, formData, error){

    res.render('user/login', {
        title: '',
        formData: formData,
        error: error,
    });
};

//GET method
var deconnexion = function(req, res){

    req.session.destroy();
    console.log('deconnexion ok');
    res.redirect('/');
};


//GET methdd
var identification = function(req, res){

    var formData = {
        email: '',
        password: '',
    };

    renderIdentification(req, res, formData, '');

};

var createInterview = function(req, userId, type, sector, offerId, callback){

    var postData = {
        userId: userId,
        type: type,
        sector: sector,
        offerId: offerId
    };

    var requestOptions = common.getRequestOptions(req, '/api/interview/', 'POST', postData, null, true);

    //Call create user API
    request(requestOptions, function (err, response, body) {

        console.log('api/interview called with ' + userId + ' ' + type + ' ' + sector);

        callback(err, response, body);

    });

};

module.exports.doRegisterUser = function(req, res){

    //collect data
    var email = req.body.email;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var availability = req.body.availability;
    var sector = req.body.sector;
    var skypeId = req.body.skypeId;
    var mobilePhone = req.body.mobilePhone;
    var password = req.body.password;
    var confirmationPassword = req.body.confirmationPassword;
    var language = req.cookies.locale;
    var position = req.body.position;
    var company = req.body.company;

    if(typeof language !== 'undefined'){
        language = 'fr';
    }

    var postData = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        availability: availability,
        sector: sector,
        skypeId: skypeId,
        mobilePhone: mobilePhone,
        password: password,
        language: language,
        company: company,
        position: position,
    };

    var formData = postData;
    formData.confirmationPassword = confirmationPassword;

    console.log(postData);
    
    //check everything is there
    if(!postData.email || !postData.password || !postData.firstName || !postData.lastName || !postData.availability || !postData.sector ){
        renderRegister(req, res, formData, 'Tous les champs doivent etre remplis');
    }
    else if(password.length < 8){
        renderRegister(req, res, formData, 'Le mot de passe doit faire au mois 8 caracteres');
    }
    else if(password !== confirmationPassword){
        renderRegister(req, res, formData, 'Le mot de passe ne correspond pas au mot de passe de verification');
    }
    else {

        var requestOptions = {
            url: apiOptions.server + '/api/user',
            method: 'POST',
            json: postData
        };

        //Call create user API
        request(requestOptions, function (err, response, body) {

            if (response.statusCode === 201) {

                //create interview

                //authenticate user
                var token = body.data.token;
                common.setSessionData(req, body.data.user, 'user', token);

                //send email
                emails.sendEmailResistration(req.session.email, req.session.fullName);

                //send le finaud email

                createInterview(req, body.data.user.id, 1, body.data.user.sector, null, function(err, response, body){

                    console.log(err);
                    console.log(body);

                    console.log('create interview executed');
                    if(response.statusCode === 201) {

                        //redirect
                        res.redirect('/confirmation');
                    }
                    else{
                        console.log('error unhandled, status code:' +  response.statusCode);
                        common.showError(req, res, response.statusCode);
                    }
                });

            }
            else if (( response.statusCode === 400 || response.statusCode === 409 || response.statusCode === 422 ) &&  body.success === false ) {

                console.log(body.internalError);
                renderRegister(req, res, formData, body.userError);

            }
            else {
                console.log('error unhandled ' + err);
                common.showError(req, res, response.statusCode);
            }
        });
    }

};

module.exports.doIdentification = function(req, res){

    //collect data
    var email = req.body.email;
    var password = req.body.password;

    var postdata = {
        email: email,
        password: password
    };

    //check everything is there
    if(!postdata.email || !postdata.password ){
        renderIdentification(req, res, postdata, 'Tous les champs doivent etre remplis');
    }
    else {

        var requestOptions = {
            url: apiOptions.server + '/api/userLogin',
            method: 'POST',
            json: postdata
        };

        //Call create user API
        request(requestOptions, function (err, response, body) {

            if (response.statusCode === 200) {

                console.log('identification ok');

                //authenticate user
                common.setSessionData(req, body.data.user, 'user', body.data.token);

                //redirect
                res.redirect('/');

            }
            else if (( response.statusCode === 401 || response.statusCode === 404 ) &&  body.success === false ) {

                console.log(body.internalError);
                renderIdentification(req, res, {email: email, password: ''}, body.userError);
            }
            else {

                console.log('error unhandled ' + response.body );
                common.showError(req, res, response.statusCode);
            }
        });
    }

};

module.exports.doLogout = function(req, res){

    console.log('user logout');
    var redirectPath;
    if(req.session.role == 'user'){
        redirectPath = '/';
    }
    else{
        redirectPath = '/recruiter';
    }

    req.session.destroy(function(err) {
        // cannot access session here
        console.log('redirecting to homepage...');
        var session = req.session;
        console.log('session after logout: ' + session);

        res.redirect(redirectPath);
    });

};

module.exports.confirmation = function(req, res){
    console.log('conf');
    res.render('user/confirmation', {
        title: i18n.__('Confirmation'),
    });

};

module.exports.registerRecruiter = function(req, res){
    console.log('conf');
    res.render('user/confirmation', {
        title: i18n.__('Confirmation'),
    });

};

module.exports.doRegisterRecruiter = function(req, res){
    console.log('conf');
    res.render('user/confirmation', {
        title: i18n.__('Confirmation'),
    });

};

module.exports.registerUser = function(req, res){

    if(req.session.authenticated){
        res.redirect('/');
    }

    var formData = {
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        availability: '',
        sector: req.app.locals.options[res.getLocale()].sectorOptions[0],
        skypeId: '',
        mobilePhone: '',
        position: '',
        company: '',
    };

    renderRegister(req, res, formData, null);

};

module.exports.createInterview = createInterview;

module.exports.identification = identification;
module.exports.deconnexion = deconnexion;