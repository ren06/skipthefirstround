var request = require('request');

var apiOptions = {
    server: 'http://localhost:3000'
};

if(process.env.NODE_ENV === 'production'){
    apiOptions.server = 'https://agile-garden-32942.herokuapp.com';
}

var renderHomepage = function(req, res) {

    res.render('user/homepage', {
        title:  res.__('Hello'),
        catchphrase: res.__('CatchPhrase'),
        authenticated: req.session.authenticated,
        pageHeader: {
            title: 'Neris',
            strapline: 'Find places to work with wifi near you',
        },
        sidebar: "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for",
    });

}

var renderDetailPage = function(req, res, locDetails){
    res.render('location-info', {
        title: locDetails.name,
        authenticated: req.session.authenticated,
        pageHeader: {title: locDetails.name},
        sidebar: {
            context:' is on Loc8r because it has accessible wifi',
            callToAction: "If you've been and you like it leave a review",
        },
        location: locDetails
    }
    );
};

var renderReviewForm = function(req, res, locDetails){
    console.log('render review form');
    res.render('location-review-form', {
        title: 'Review ' + locDetails.name + ' on Loc8r',
        pageHeader: { title: 'Review '  + locDetails.name },
        error: req.query.err
    });
};

var _showError = function(req, res, status){
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
    res.render('generic-text', {
            title: title,
            content: content
        }
    );
}

module.exports.homepage = function(req, res){
    
    res.setLocale(req.cookies.locale);

    console.log("cookie language value: " + req.cookies.locale);

    var authenticated = req.session.authenticated;

    console.log('authenticated: ' + authenticated );

    if (authenticated) {
        res.redirect('/information');
    }
    else {
        console.log('render homepage');
        renderHomepage(req, res);
    }

};

var _formatDistance = function(distance){
    var numDistance, unit;
    if(distance > 1){
        numDistance = parseFloat(distance).toFixed(1);
        unit = 'km';
    }
    else{
        numDistance = parseFloat(distance * 1000,10);
        unit = 'm';
    }
    return numDistance + unit;
};

var getLocationInfo = function(req, res, callback){
    var requestOptions, path;
    path = '/api/locations/' + req.params.locationid;
    requestOptions = {
        url: apiOptions.server + path,
        method: 'GET',
        json: {},
    };
    request(
        requestOptions,
        function(err, response, body){
            var  data = body;
            if(response.statusCode === 200) {
                data.coords = {
                    lng: body.coords[0],
                    lat: body.coords[1]
                };
                callback(req, res, data);
            }
            else{
                _showError(req, res, response.statusCode);
            }
        }
    );
}

module.exports.locationInfo = function(req, res){
    getLocationInfo(req, res, function(req, res, responseData){
        renderDetailPage(req, res, responseData);
    });
};

module.exports.addReview = function(req, res){
    console.log('add Review');
    getLocationInfo(req, res, function(req, res, responseData){
        renderReviewForm(req, res, responseData);
    });
};

module.exports.doAddReview = function(req, res){

    var requestOptions, path, locationid, postdata;
    locationid = req.params.locationid;
    console.log(locationid);
    path = '/api/locations/' + locationid + '/reviews';

    postdata = {
        author: req.body.name,
        rating: parseInt(req.body.rating, 10),
        reviewText: req.body.review
    };

    requestOptions = {
        url: apiOptions.server + path,
        method: 'POST',
        json: postdata
    };

    if(!postdata.author || !postdata.rating || !postdata.reviewText){
        res.redirect('/location/' + locationid + '/reviews/new?err=val');
    } else {
        request(requestOptions, function (err, response, body) {
            
            console.log('create user status code' + response.statusCode);

            if (response.statusCode === 201) {
                res.redirect('/location/' + locationid);
            } else if (response.statusCode === 400) {
                res.redirect('/location/' + locationid + '/reviews/new?err=val');
            }
            else {
                _showError(req, res, response.statusCode);
            }
        });
    }
};