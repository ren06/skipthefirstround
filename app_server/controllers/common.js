var config = require('config');
var request = require('request');
var common = require('./common');
const queryString = require('query-string');
var acl = require('acl');
var validator = require('validator');

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

module.exports.getRequestOptions = function(req, path, method, json, qs, authenticatedMode){

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

    if(authenticatedMode){

        var userId = req.session.userId;
        var token = req.session.token;

        requestOptions['headers'] = {
            'Authorization': 'Bearer ' + token,
            'Accept-Language': req.getLocale(),
        };
    }
    else{
        requestOptions['headers'] = {
            'Accept-Language': req.getLocale(),
        };
    }

    return requestOptions;

}

module.exports.setSessionData = function(req, res, user, role, token, callback){

    req.session.email = user.email;
    req.session.userId = user.id;
    req.session.firstName = user.firstName;
    req.session.lastName = user.lastName;
    req.session.fullName = user.firstName + ' ' + user.lastName;
    req.session.role = role;
    req.session.authenticated = true;
    req.session.token = token;

    // var aclInstance = res.locals.acl;
    // aclInstance.addUserRoles(user.id, role, function(){});
    // console.log('Role ' + role + ' set to userId ' + user.id);
    //
    // console.log('session set: ' + req.session.userId + ' authenticated ' + req.session.authenticated);
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

}

module.exports.validator = validator;
