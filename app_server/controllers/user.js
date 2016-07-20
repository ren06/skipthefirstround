var request = require('request');
var common = require('./common');

module.exports.myAccount = function(req, res){

    var language = req.cookies.locale

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

                requestOptions.url = apiOptions.server + '/api/user/' + userId + '/interviewsUpcoming',

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

module.exports.interview = function(req, res){

    console.log('user/interview');
    res.render('user/interview', {
        title: res.__('Interview'),
        pageHeader: {
            title: '',
        },
    });

};

module.exports.personalInformations = function(req, res){

    console.log('user/personal-information');
    res.render('user/personal-information', {
        title: res.__('Informations personnelles'),
        pageHeader: {
            title: '',
        },
    });

};




