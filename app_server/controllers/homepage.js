var request = require('request');
var emails = require('../common/emails');

var renderHomepage = function(req, res) {

    res.render('user/homepage', {
        title:  res.__('Hello'),
        catchphrase: res.__('CatchPhrase'),
        pageHeader: {
            title: 'DaF',
            strapline: 'Find places to work with wifi near you',
        },
        sidebar: "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for",
    });

}

module.exports.homepage = function(req, res){

    //use current cookie value for locale if there is one
    if(req.cookies.locale){
        res.setLocale(req.cookies.locale);
    }
    else{
        //default cookie to fr
        res.cookie('locale', 'fr');
        res.setLocale('fr');
    }

    if(!req.session.role){
        req.session.role = 'guest';
        console.log('Role not set, set to guest by default');
    };

    var authenticated = req.session.authenticated;
    var userId = req.session.userId;


    if (authenticated && userId) {

        console.log('Homepage Authenticated: ' + authenticated + ' userID ' + userId);

        if(req.session.role == 'user') {
            res.redirect('/my-account');
        }
        else{
            res.redirect('recruiter/main-menu');
        }
    }
    else if(authenticated && !userId){
        //bug, for the time being destroy the session
        req.session.destroy(function(err) {

            console.log('Session destroyed after finding authenticated true but no User ID');
            res.redirect('/');
        });
    }
    else {
        console.log('Render homepage for guest');
        renderHomepage(req, res);
    }

};


module.exports.changeLanguage = function(req, res){

    var language = req.params.language;

    res.cookie('locale', language);
    res.setLocale(language);

    res.redirect('back');


};

module.exports.about = function(req, res){

    res.render('user/generic-text', {title:  res.__('About'),});
};

module.exports.homepageRecruiter = function(req, res){

    //res.cookie('role', 'recruiter');
    //req.session.role = 'guest';
    if(!req.session.role){
        req.session.role = 'guest';
        console.log('Role not set, set to guest by default');
    };

    res.render('recruiter/homepage', {title:  res.__('About'),});

};

module.exports.doContactForm = function(req, res) {

    console.log('doContactForm');

    var name = req.body.name;
    var email = req.body.email;
    var message = req.body.message;

    if (name && email && message) {

        emails.to_Admin_Contact_Form(name, email, message);

        res.json('success');
    }
    else{
        res.json('error');
    }

};

