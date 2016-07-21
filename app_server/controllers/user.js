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

var renderBrowseOffers = function(req, res, formData, results, message){

    //get all cities
    var requestOptions = common.getRequestOptions(req, '/api/offers/locations', 'GET', null);

    request(requestOptions, function (err, response, body) {

        var lang = res.getLocale();

        res.render('user/offers', {
            title: res.__('Offers'),
            sectorOptions: common.addAll(req.app.locals.options[lang].sectorOptions),
            offerTypeOptions: common.addAll(req.app.locals.options[lang].offerTypeOptions),
            companyTypeOptions: common.addAll(req.app.locals.options[lang].companyTypeOptions),
            locations: common.addAll(body.data),
            title: i18n.__('Browse Videos'),
            formData: formData,
            results: results
        });
    });


}


module.exports.offers = function(req, res){

    var formData = {
        sector: '0',
        offerType: '0',
        language: '',
        companyType: '0',
        location: '0',

    }

    renderBrowseOffers(req, res, formData, {}, null);

};

module.exports.doOffers = function(req, res){

    var formData = req.body;
    var qs = {};

    var keys = Object.keys(formData);

    keys.forEach(function(entry){

        if(formData[entry] != 0){

                qs[entry] = formData[entry];
            
        }
    });

    request(common.getRequestOptions(req, '/api/offers/searchForUser', 'GET', null, qs ), function (err, response, body) {

        if(response.statusCode === 200) {

            var results = body.data;

            console.log(body.data);

            var message;
            if (!results || results.length == 0) {
                message = 'No results'
            }

            renderBrowseOffers(req, res, formData, results, message);
        }
        else{
            renderBrowseOffers(req, res, formData, body.data, err);
        }
    });

};






