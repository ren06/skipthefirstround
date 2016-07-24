var common = require('./common');

var pg = require('pg');
var cryptography = require('../helper/cryptography');
//var crypto = require('crypto');
var validator = require('validator');
var config = require('config');


var databaseURL = config.get('Api.dbConfig.url');
var PASSWORD_MIN_LENGTH = 8;

var conString = databaseURL; //process.env.DATABASE_URL || 'postgres://admin:Santos100@localhost:5432/neris';


module.exports.usersList = function(req, res){

    pg.connect(conString, function(err, client, done) {

        var results = [];

        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Select Data
        var queryString = "SELECT * FROM tbl_user ORDER BY id ASC";
        console.log(queryString);
        var query = client.query(queryString);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            common.sendJsonResponse(res, 200, true, null, null, results);
        });

    });
};

module.exports.doUserAuthenticate = function(req, res){

    //get sent data
    var email = req.body.email;
    var password = req.body.password;

    console.log('doUserAuth');

    //check it's all there
    if(!email || !password) {

        common.sendJsonResponse(res, 400, false, 'No user or password', 'Vous devez fournir un email et password', null) ;
        return;
    }

    //read user
    pg.connect(conString, function (err, client, done) {

        var results = [];

        // Handle connection errors
        if (err) {
            done();
            common.sendJsonResponse(res, 500, false, 'DB connection error', 'Erreur de connexion', err);
            return;
        }

        // Select user
        var queryString = "SELECT id, email, first_name, last_name, password_hash FROM tbl_user WHERE email= ($1)";
        console.log(queryString);
        console.log(email);

        var query = client.query(queryString, [email],
            function(err, result) {
                done();
                console.log('executed');
                if (err) {
                    console.log('error');
                    common.sendJsonResponse(res, 400, false, 'DB connection error', 'Erreur de connexion', err);
                    return;
                }
            }
        );

        query.on('end', function(result) {

            done();

            if(result.rowCount === 0){
                common.sendJsonResponse(res, 404, false, 'Email not found', 'Email non reconnu');
                //return;
            }
            else if(result.rowCount === 1){
                onUserRead(result.rows[0]);
            }
            else{
                common.sendJsonResponse(res, 404,  false, 'Unexpected error, there should be only one row for email', 'Erreur email present plusieurs fois');
                //return;
            }

        });

    });

    var onUserRead = function(row){

        if(row && row.email && row.password_hash) {

            var buffer = new Buffer(row.password_hash, 'hex');

            cryptography.verifyPassword(password, buffer, function (err, success) {

                if(success){
                    var token = common.generateJwt(row.id, row.email, row.last_name);
                    var result = {'user': {id: row.id, email: row.email, first_name: row.first_name, last_name: row.last_name}, 'token' : token };
                    common.sendJsonResponse(res, 200, true, 'User authorised', 'Utilisateur authentifie', result);
                }
                else{
                    common.sendJsonResponse(res, 401, false, 'User not authorised', 'Utilisateur non authentifie', null);
                }

            });
        }
        else{
            common.sendJsonResponse(res, 404,  false, 'Unexpected error, email should be provided', 'Unexpected error, email should be provided');
        }
    }
};

module.exports.userCreate = function(req, res){

    //get sent data
    var email = req.body.email;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var password = req.body.password;
    var availability = req.body.availability;
    var sector = req.body.sector;
    var skypeId = req.body.skypeId;
    var mobilePhone = req.body.mobilePhone;
    var language = req.body.language;
    //var company = req.body.company;
    //var position = req.body.position;

    console.log('userCreate');
    console.log(req.body);

    //check it's all there
    //took out || !company || !position only relevant for simulation
    if(!email || !firstName || !lastName || !password || !availability || !sector || !skypeId) {

        //syntactically wrong, bad request
        common.sendJsonResponse(res, 400, false , 'Missing input', res.__('UserCreationMissingInput'), null);
        return;
    }
    else{

        //check email
        if(!validator.isEmail(email)){

            //semantic error
        common.sendJsonResponse(res, 422 , false , 'Not valid email', email + " n'est pas un email correcte");
            return;
        }
        else if(password.length < PASSWORD_MIN_LENGTH){

            common.sendJsonResponse(res, 422 , false , 'Password too short', "Le mot de passe doit faire au mois " + PASSWORD_MIN_LENGTH + " caracteres" );
            return;
        }

    }

    //encrypt password
     cryptography.hashPassword(password, function (err, buffer) {

        if (err !== null) {
            //internal message error
            common.sendJsonResponse(res, 500 , false, 'Error hashing password: ', 'Erreur inattendue');
        }
        else if (buffer !== null) {

            var passwordHash = buffer.toString('hex');
            onHashComplete(passwordHash);
        }
        else {
            common.sendJsonResponse(res, 500,  false, 'Unexpected error, buffer is null', 'Erreur inattendue');
        }

    });

    var saveUser = function(email, firstName, lastName, passwordHash, availability, sector, skypeId, mobilePhone) {

        pg.connect(conString, function (err, client, done) {

            var results = [];

            // Handle connection errors
            if (err) {
                done();
                console.log('500 '+ err);
                common.sendJsonResponse(res, 500, false, err, 'Erreur inattendue');

            }
            else {

                // Insert
                console.log('mobilePhone: ' + mobilePhone);
                if(mobilePhone == ''){
                  mobilePhone = null;
                }

                var queryString = "INSERT INTO tbl_user(email, first_name, last_name, password_hash, availability, sector, skype_id, language, mobile_phone) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *";

                console.log(queryString);
                console.log(email + ' ' + firstName + ' ' + lastName + ' ' + passwordHash);

                var parameters =  [email, firstName, lastName, passwordHash, availability, sector, skypeId, language, mobilePhone];

                var query = client.query(queryString, parameters,
                    function (err, result) {
                        done();
                        if (err) {
                            console.log('insert error');
                            //conflict error
                            common.sendJsonResponse(res, 409, false, 'Insert error for ' + email + '. Error code ' + err.code , res.__('EmailAlreadyExists') );
                        }
                    }
                );

                query.on("row", function (row, result) {

                    var token = common.generateJwt(row.id, row.email, row.last_name);

                    //return user data as camel case keys without password_hash
                    delete row['password_hash'];

                    var result = { 'user': row, 'token' : token };
                    common.sendJsonResponse(res, 201, true, null, null, result);
                });

                query.on('end', function () {
                    done();
                });
            }

        });
    }

    var onHashComplete  = function(passwordHash){

        saveUser(email, firstName, lastName, passwordHash, availability, sector, skypeId, mobilePhone);
    };
};

module.exports.userReadOne = function(req, res){

  var userId = req.params.userId;


    if (!userId) {

        common.sendJsonResponse(res, 400, false, 'Missing input', res.__('UserReadMissingInput'), null);
    }
    else {

        common.readOne(req, res, 'tbl_user', userId, null);

    }

}
