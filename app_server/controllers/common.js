var config = require('config');
var request = require('request');
var common = require('./common');


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

    if(process.env.NODE_ENV === 'production'){
        apiOptions.server = 'https://agile-garden-32942.herokuapp.com';
    }

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