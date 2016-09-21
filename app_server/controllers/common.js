var config = require('config');
var request = require('request');
var common = require('./common');
var queryString = require('query-string');
var acl = require('acl');
var validator = require('validator');
var encryptor = require('simple-encryptor')('demande au finaud');
var moment = require('moment');

module.exports.checkParametersPresent = function(parameterString, data){

    parameterString = parameterString.replace(/\s/g, '');

    var array = parameterString.split(',');

    for (var i = 0; i < array.length; i++){

        var paramName = array[i];
        var value = data[paramName];
        console.log('checked param: ' + paramName + ' value:' + value);

        if(!value || 0 === value.length || value == ' '){
            console.log('Front end missing param' + paramName );
            return false;
        }
    }

    return true;

}


module.exports.showError =  function(req, res, status){

    console.log('showError');

    var title, content;
    if(status === 404){
        title = '404, page not found';
        content = 'Oh dear. Looks like we cannot find this page. Sorry';
    }
    else{
        title = status + ' something went wrong';
        content = 'Something somewhere went wrong. Sorry';
    }
    res.status(status);
    res.render('user/generic-text', {
            title: title,
            content: content
        }
    );
}

module.exports.getApiOptions =  function(){

    var apiOptions = {
        server: config.get('Website.apiServer'),
    };

    return apiOptions;
}

module.exports.getRequestOptions = function(req, path, method, json, qs){

    var apiOptions = this.getApiOptions();

    if(!json){
        json = {};
    }

    var requestOptions = {
        url: apiOptions.server + path,
        method: method,
        json: json,
        qs: qs
    };

    console.log(requestOptions);

    var userId = req.session.userId;
    var token = req.session.token;

    requestOptions['headers'] = {
        'Authorization': 'Bearer ' + token,
        'Accept-Language': req.getLocale(),
    };

    console.log('API call locale: ' + req.getLocale());

    return requestOptions;

}

//person can be user or recruiter
module.exports.setSessionData = function(req, res, person, role, token, callback){

    req.session.email = person.email;
    req.session.userId = person.id;
    req.session.firstName = person.firstName;
    req.session.lastName = person.lastName;
    req.session.fullName = person.firstName + ' ' + person.lastName;
    req.session.role = role;
    req.session.authenticated = true;
    req.session.token = token;
    req.session.language = person.language;

    common.setLanguage(res, person.language);

    if(role === 'user'){
        req.session.active = true;
    }
    else{
        req.session.active = person.active;
    }

    if(callback) {
        callback();
    }
};

module.exports.addAll = function(array){

    //i18n.__('All')
    array['0'] = 'All';

    return array;
}

module.exports.jsonToQueryString = function (json) {

    console.log('json:');
    console.log(json);
    var result = queryString.stringify(json);
    console.log(result);
    return result;
}

module.exports.readUser = function(req, userId, callback){

    var userId = req.session.userId;

    var requestOptions = common.getRequestOptions(req, '/api/user/' + userId, 'GET', null);

    request(requestOptions, function (err, response, body) {

        if(response.statusCode === 200){

            callback(true, body.data[0]);
        }
        else{
            callback(false, null);
        }
    });

};

var renderNotAuthenticated = function(res) {

    res.render('user/not-authenticated', { });
};

var checkRole = function(req, res, roles, next){

    var currentRole = req.session.role;
    var active = req.session.active;

    console.log('User is active: ' + active);

    if (currentRole) {

        if (roles.indexOf(currentRole) > -1) {

            if(active) {
                console.log("Role '" + currentRole + "' found in array of roles, Access Granted");
                next();
            }
            else{

                var requestOptions = common.getRequestOptions(req, '/api/recruiter/' + req.session.userId + '/isActive', 'GET');

                request(requestOptions, function (err, response, body) {

                    if(body.data.active == true){
                        req.session.active = true;
                        next();
                    }
                    else{
                        res.render('user/not-active');
                    }

                });
            }
        }
        else {
            renderNotAuthenticated(res);
        }
    }
    else {
        renderNotAuthenticated(res);
    }

};

module.exports.checkPermission = function(roles){

    return function(req, res, next) {

        var authenticated = req.session.authenticated;

        console.log('Checking roles: ' + roles);
        console.log('Authenticated? ' + authenticated);
        console.log("Current Role: '" + req.session.role + "'");
        var currentRole = req.session.role;

        var isGuest = true;
        var roleOk = false;

        //Check if current action is available gor Guest
        if (roles.indexOf('guest') > -1) {

            if(currentRole == 'guest' || !authenticated){ //after a logout the role is not set yet

                console.log('Action available to Guest, User is Guest, Access Granted');
                next();
            }
            else{

                //User is not guest, check if action has access to roles
                checkRole(req, res, roles, next);
            }

        }
        else if(authenticated) {

            checkRole(req, res, roles, next);
        }
        else{
            //Current action does not allowed Guest, and the user is not authenticated
            renderNotAuthenticated(res);
        }

    }
};

module.exports.setLanguage = function(res, language){

    res.cookie('locale', language);
    res.setLocale(language);

    console.log('Language set to ' + language);

};


module.exports.encryptResetPasswordUrl = function(email){

    var validity = moment().add(30, 'minutes').format();

    var data = email + '---' + validity;

    var encrypted = encryptor.encrypt(data);

    encrypted = encodeURIComponent(encrypted);
    // var buffer = new Buffer(encrypted);
    // var toBase64 = buffer.toString('base64');
    //
    // console.log(toBase64);

    return encrypted;

};

module.exports.decryptResetPasswordUrl = function(encryptedData){

    encryptedData = decodeURIComponent(encryptedData);

    var data = encryptor.decrypt(encryptedData);

    console.log(data);

    var res = data.split("---");

    var email = res[0];
    var validity = res[1];

    console.log(res);

    var now =  moment().format();
    var success = moment(validity).isAfter(now);

    return {'email': email, 'success': success};

};



module.exports.validator = validator;
