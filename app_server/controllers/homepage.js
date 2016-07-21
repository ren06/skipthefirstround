var request = require('request');

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

    req.session.role = 'user';

    var authenticated = req.session.authenticated;

    console.log('Homepage Authenticated: ' + authenticated );

    if (authenticated) {

        if(req.session.role == 'user') {
            res.redirect('/my-account');
        }
        else{
            res.redirect('recruiter/main-menu');
        }
    }
    else {
        console.log('render homepage');
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
    req.session.role = 'recruiter';

    res.render('recruiter/homepage', {title:  res.__('About'),});

};