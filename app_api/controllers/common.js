var camelcaseKeys = require('camelcase-keys-recursive');
var pg = require('pg');
var cryptography = require('../helper/cryptography');
//var crypto = require('crypto');
var validator = require('validator');
var config = require('config');

var getConnectionString = function(){

    var databaseURL = config.get('Api.dbConfig.url');
    var conString = databaseURL; //process.env.DATABASE_URL || 'postgres://admin:Santos100@localhost:5432/neris';

    return conString;
}


var sendJsonResponse = function(res, status, success, internalError, userError, data){

    console.log('Final json response sent: ' + status);

    res.status(status);
    res.json(camelcaseKeys({
            'success': success,
            'internalError': internalError,
            'userError': userError,
            'data': data,
        })
    );
}

module.exports.dbConnect = function(callback){

    pg.connect(getConnectionString(), callback);
}

// module.exports.dbHandleConnectionError = function(res, err, done){
//
//     if (err) {
//         done();
//         console.log(err);
//         return res.status(500).json({success: false, data: err});
//     }
//     else{
//         return true;
//     }
// }
//
// module.exports.dbExecuteQuery = function(res, client, queryString, parameters, internalErrorText, userErrorText, done){
//
//     var query = client.query(queryString, parameters,
//         function (err, result) {
//             done();
//             if (err) {
//                 sendJsonResponse(res, 409, false, internalErrorText + ' ' + err.code, userErrorText);
//             }
//         }
//     );
//
//     return query;
//
// }
//
// module.exports.dbHandleReturnResults = function(req, res, query, addText, done){
//
//     var results = [];
//
//     // Stream results back one row at a time
//     query.on('row', function (row) {
//
//         results.push(row);
//     });
//
//     // After all data is returned, close connection and return results
//     query.on('end', function () {
//         done();
//
//         if (addText) {
//
//             results = addText(results, req);
//         }
//
//         sendJsonResponse(res, 200, true, null, null, results);
//     });
// }

module.exports.dbHandleQuery = function(req, res, queryString, parameters, addText, internalError, userError, callback){

    pg.connect(getConnectionString(),function (err, client, done) {

        if (err) {
            done();
            console.log(err);
            sendJsonResponse(res, 500, false, 'DB connection error' + ' ' + err.code, 'DB error');
        }

        var query = client.query(queryString, parameters,
            function (err, result) {
                done();
                if (err) {
                    sendJsonResponse(res, 409, false, internalError + ' ' + err.code, userError);
                }
            }
        );

        var results = [];

        // Stream results back one row at a time
        query.on('row', function (row) {

            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();

            if (addText) {

                results = addText(results, req);
            }

            if(callback){
                callback(results);
            }
            else{
                //figure out OK code according to INSERT, UPDATE, SELECT
                var returnCode;

                if(queryString.search("INSERT") > -1){
                    returnCode = 201;
                }
                else{
                    returnCode = 200;
                }
                sendJsonResponse(res, returnCode, true, null, null, results);
            }

        });
    }
    );

}



module.exports.sendJsonResponse = sendJsonResponse;

module.exports.pg = pg;
module.exports.validator = validator;
module.exports.config = config;

