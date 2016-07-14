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

    // console.log(req.cookies);
    // console.log(req.cookies.locale);

    //use current cookie value for locale if there is one
    if(req.cookies.locale){
        res.setLocale(req.cookies.locale);
    }

    console.log("Homepage Cookie language value set to: " + req.cookies.locale);

    var authenticated = req.session.authenticated;

    console.log('Homepage Authenticated: ' + authenticated );

    if (authenticated) {
        res.redirect('/my-account');
    }
    else {
        console.log('render homepage');
        renderHomepage(req, res);
    }

};


module.exports.changeLanguage = function(req, res){

    var language = req.params.language;
    console.log('Change Language to ' + language);
    console.log('current cookie value: ' + req.cookies.locale);
    res.cookie('locale', language);
    res.setLocale(language);
  

    //var referrer = req.headers.referer;


    res.redirect('back');

    // if(referrer) {
    //
    //     res.redirect(referrer);
    //     console.log(res.cookie('locale'));
    //     console.log('redirecting to: ' + referrer);
    // }
    // else {
    //     console.log('Redirect homepage');
    //     res.redirect("/");
    // }

};

module.exports.about = function(req, res){

    res.render('user/generic-text', {title:  res.__('About'),});
};
