var config = require('config');
var request = require('request');
var common = require('./common');

module.exports.checkParametersPresent = function(parameterString, data){

    parameterString = parameterString.replace(/\s/g, '');

    var array = parameterString.split(',');

    for (var i = 0; i < array.length -1; i++){
        var value = data[array[i]];
        console.log(value);
        if(!value || value == ''){
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

module.exports.getRequestOptions = function(req, path, method, json, authenticatedMode){

    var apiOptions = this.getApiOptions();

    if(!json){
        json = {};
    }

    var requestOptions = {
        url: apiOptions.server + path,
        method: method,
        json: json,
        qs: {}
    };

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

module.exports.setSessionData = function(req, user, role, token){

    req.session.email = user.email;
    req.session.userId = user.id;
    req.session.firstName = user.firstName;
    req.session.lastName = user.lastName;
    req.session.fullName = user.firstName + ' ' + user.lastName;
    req.session.role = role;
    req.session.authenticated = true;
    req.session.token = token;

    console.log('session set: ' + req.session.userId + ' authenticated ' + req.session.authenticated);
};