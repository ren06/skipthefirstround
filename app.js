//Loading modules
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var request = require('request');
var pgSession = require('connect-pg-simple')(session);
var pg = require('pg');
var config = require('config');

//Loading routes
var routes = require('./app_server/routes/index');
var routesAdmin = require('./app_server/routes/indexAdmin');
var routesApi = require('./app_api/routes/indexAPI');

//Create application
var app = express();

//Set cookie parser
app.use(cookieParser("MON_SUPER_SECRET"));

//Configure i18n
i18n = require("i18n");


i18n.configure({
  //autoreload: false,
  //updateFiles: false,
  locales:['fr', 'en'],
  directory: __dirname + '/locales',
  defaultLocale: 'en',
  cookie: 'locale',
  register: global,
});

//Memory Session
// app.use(session({
//   resave: true,
//   saveUninitialized: true,
//   secret: 'MON_SUPER_SECRET',
//   cookie: { maxAge: 60000 }
// }));

//PG session
app.use(session({
  store: new pgSession({
    pg : pg,                                  // Use global pg-module
    conString : config.get('Api.dbConfig.url'), // Connect using something else than default DATABASE_URL env variable
    tableName : 'session'               // Use another table-name than the default "session" one
  }),
  secret: 'MON_SUPER_SECRET', //process.env.FOO_COOKIE_SECRET,
  resave: true,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
  saveUninitialized: true,
}))


app.use(i18n.init);

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
//app.set('views', path.join(__dirname, 'app_server', 'views/site_user'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

//to use session object inside jade template
app.use(function(req,res,next){
  res.locals.session = req.session;
  next();
});



app.all('/api/*', function(req, res, next){
  console.log('API call: ' + req.url);
  next();
});

app.use('/', routes);
app.use('/api/', routesApi);
app.use('/admin/', routesAdmin);

// // catch 404 and forward to error handler
app.use(function(req, res, next) {
  //var err = new Error('Not Found');
  //err.status = 404;

  //if api call don't render HTML

  //next(err);
  next();
});

//Once set, the value of app.locals properties persist throughout the life of the application,
//in contrast with res.locals properties that are valid only for the lifetime of the request.
app.locals.title = 'My App';


//Store in the app.locals.options all the dropdown options
var requestOptions = {
  url:  config.get('Website.apiServer') + '/api/options/all',
  method: 'GET',
  json: {},
  qs: { }
};

request(requestOptions, function (err, response, body) {

  if(err){
    console.log(err);
  }
  else {

    if (response.statusCode === 200) {
      
      app.locals.options = body.data;
    }
  }
});

//helper functions



// error handlers
// Catch unauthorised errors
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    // res.status(401);
    // res.json({
    //       'success': false,
    //       'internalError': err.name + ": " + err.message,
    //       'userError': 'Utilisateur non authentifie',
    //       'data': null,
    //     }
    // );
  }
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('user/error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('user/error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

