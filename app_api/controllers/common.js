var camelcaseKeys = require('camelcase-keys-recursive');
var decamelize = require('decamelize');
var pg = require('pg');
var cryptography = require('../helper/cryptography');
var validator = require('validator');
var config = require('config');

var getConnectionString = function(){

    var databaseURL = config.get('Api.dbConfig.url');
    if (process.env.NODE_ENV === 'production') {

        databaseURL = process.env.DATABASE_URL;
    }

    return databaseURL;
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


module.exports.dbHandleQuery = function(req, res, queryString, parameters, addTextFunction, internalError, userError, callback){

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
            console.log(addTextFunction)
            if (addTextFunction) {

                results = addTextFunction(results, req);
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

module.exports.rowInsert = function(req, res, tableName, data){

    //decamelise array
    var dataDecamelised = {};
    var newKey;

    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            newKey = decamelize(key);
            dataDecamelised[newKey] = data[key];
        }
    }


    var queryString = "INSERT INTO " + tableName + " (";

    var values = [];
    var comma =  ", ";
    var params = "";
    var i=1;

    for (var key in dataDecamelised) {
        queryString += key + comma;
        values.push(dataDecamelised[key]);
        params += "$" + i +  comma;
        i++;
    }

    queryString = queryString.substring(0, queryString.length - comma.length);

    queryString += ") VALUES (" + params;
    queryString = queryString.substring(0, queryString.length - comma.length);

    queryString += ") RETURNING *";

    console.log(queryString);
    console.log(values);

    this.dbHandleQuery(req, res, queryString, values, null, 'Internal Error', 'User Error');

}

module.exports.checkParametersPresent = function(parameterString, data){

    parameterString = parameterString.replace(/\s/g, '');

    var array = parameterString.split(',');

    for (var i = 0; i < array.length -1; i++){
        var value = data[array[i]];
        console.log(value);
        if(!value || value == ''){
            console.log('fasle');
            return false;
        }
    }

    console.log('all ok');
    return true;

}


module.exports.sendJsonResponse = sendJsonResponse;

module.exports.pg = pg;
module.exports.validator = validator;
module.exports.config = config;

