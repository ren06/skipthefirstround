var common = require('./commonApi');

//postgres://[username]:[password]@[host]:[port]/[databasename]
var conString = process.env.DATABASE_URL || 'postgres://admin:Santos100@127.0.0.1:5432/daf'; 

var sendJsonResponse = function(res, status, content){
    res.status(status);
    res.json(content);

    if(status == 400 || status == 404) {
        console.log(content);
    }
}

var getConnection = function(){

}

module.exports.dbConnection = function(req, res){

    var client = new pg.Client(conString);

    client.connect(function(err) {
        if(err) {
            sendJsonResponse(res, 404, err);
        }
        else{
            sendJsonResponse(res, 201, {'message': 'DB connection OK'}); //if not 201 nothing displayed
        }

    });

};

module.exports.locale = function(req, res){

    sendJsonResponse(res, 201, res.__('Title'));

};

module.exports.renameEmailAddress = function(req, res){

    var randomNumber = Math.random();
    randomNumber = randomNumber * 100000;
    randomNumber = Math.floor(randomNumber);

    var newEmail = 'test' + randomNumber + '@skipthefirstround.com';

    var queryString = "UPDATE tbl_user SET email = '" + newEmail + "' WHERE email = 'test@skipthefirstround.com'";

    common.dbHandleQuery(req, res, queryString, null, null, null, null, function(){

        newEmail = 'recruiter' + randomNumber + '@skipthefirstround.com';

        queryString = "UPDATE tbl_recruiter SET email = '" + newEmail + "'  WHERE email = 'recruiter@skipthefirstround.com'";

        common.dbHandleQuery(req, res, queryString);

    });

};





