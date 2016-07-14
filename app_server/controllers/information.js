var request = require('request');

var information = function(req, res){

    res.render('information', {
        title: 'Loc8r - find a place to work with wifi',
        authenticated: req.session.authenticated,
        pageHeader: {
            title: 'Loc8r',
            strapline: 'Find places to work with wifi near you',
        },
        sidebar: "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for",
    });
}

module.exports.information = information;