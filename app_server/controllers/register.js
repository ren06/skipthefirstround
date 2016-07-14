var request = require('request');
var i18n = require('i18n');
var emails = require('../common/emails');
var common = require('./common');

var apiOptions = common.getApiOptions();

var renderRegister = function(req, res, formData, error){

    var sectorOptions = req.app.locals.options.sectorOptions;

    console.log(sectorOptions);

    res.render('user/register', {
        title: i18n.__('Enregistrement'),
        formData: formData,
        sectorOptions: sectorOptions,
        pageHeader: {
            title: 'DaF',
            strapline: 'Find places to work with wifi near you',
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
var registerUser = function(req, res){

    if(req.session.authenticated){
        res.redirect('/');
    }

    var formData = {
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        availability: '',
        sector: req.app.locals.options.sectorOptions[0],
        skypeId: '',
        mobilePhone: '',
    };

    renderRegister(req, res, formData, null);

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

var setSessionData = function(req, user, token){

    req.session.email = user.email;
    req.session.userId = user.id;
    req.session.firstName = user.firstName;
    req.session.lastName = user.lastName;
    req.session.fullName = user.firstName + ' ' + user.lastName;
    req.session.role = 'user';
    req.session.authenticated = true;
    req.session.token = token;

    console.log('session set: ' + req.session.userId);
}

var createInterview = function(userId, type, sector, token, callback){

    var requestOptions = {
        url: apiOptions.server + '/api/interview',
        method: 'POST',
        headers:{
            Authorization: 'Bearer ' + token,
        },
        json: {
            userId: userId,
            type: type,
            sector: sector
        }
    };


    //Call create user API
    request(requestOptions, function (err, response, body) {
        console.log('api/interview called with ' + userId + ' ' + type + ' ' + sector);

        callback(err, response, body);

    });

}

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
    };

    var formData = postData;
    formData.confirmationPassword = confirmationPassword;

    console.log(postData)
    
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
                console.log(token);
                setSessionData(req, body.data.user, token);

                //send email
                emails.sendEmailResistration(req.session.email, req.session.fullName);

                //send le finaud email

                createInterview(body.data.user.id, 1, body.data.user.sector, token, function(err, response, body){

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

        console.log('calling api');
        //Call create user API
        request(requestOptions, function (err, response, body) {

            if (response.statusCode === 200) {

                console.log('identification ok');

                //authenticate user
                setSessionData(req, body.data.user, body.data.token);

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

    console.log('logout');
    req.session.destroy(function(err) {
        // cannot access session here
    });

    res.redirect('/');
};

module.exports.doUploadCV = function(req, res){

    var busboy = require('connect-busboy');

// default options, no immediate parsing
    app.use(busboy());
// ...
    app.use(function(req, res) {
        req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            // ...
        });
        req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
            // ...
        });
        req.pipe(req.busboy);
        // etc ...
    });

// default options, immediately start reading from the request stream and
// parsing
    app.use(busboy({ immediate: true }));
// ...
    app.use(function(req, res) {
        req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            // ...
        });
        req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
            // ...
        });
        // etc ...
    });

// any valid Busboy options can be passed in also
    app.use(busboy({
        highWaterMark: 2 * 1024 * 1024,
        limits: {
            fileSize: 10 * 1024 * 1024
        }
    }));

};

module.exports.confirmation = function(req, res){
    console.log('conf');
    res.render('user/confirmation', {
        title: i18n.__('Confirmation'),
    });

};

module.exports.registerUser = registerUser;
module.exports.identification = identification;
module.exports.deconnexion = deconnexion;