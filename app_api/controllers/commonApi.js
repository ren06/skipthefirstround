var camelcaseKeys = require('camelcase-keys-recursive');
var decamelize = require('decamelize');
var pg = require('pg');
var cryptography = require('../helper/cryptography');
var validator = require('validator');
var config = require('config');
var jwt = require('jsonwebtoken');

var getConnectionString = function(){

    var databaseURL = config.get('Api.dbConfig.url');
    if (process.env.NODE_ENV === 'production') {

        databaseURL = process.env.DATABASE_URL;
    }

    return databaseURL;
};


var sendJsonResponse = function(res, status, success, internalError, userError, data){

    console.log('JSON response sent: ' + status);

    //to make it consistant and always return an array
    if(!data){
        data = [];
    }
    else{
        //replaces null values with blank string
        data = JSON.stringify(data, function(key, value) {

            if(value === null) {
                return "";
            }
            else if(key === 'password_hash'){
                delete data[key];
            }
            else{
                return value;
            }

        });

        data = JSON.parse(data);

    }

    var returnData = camelcaseKeys({
        'success': success,
        'internalError': internalError,
        'userError': userError,
        'data': data,
    });

    res.status(status);
    res.json(returnData);

};

module.exports.dbConnect = function(callback){

    pg.connect(getConnectionString(), callback);
};

//Always return an array of rows, even if SELECT SINGLE
module.exports.dbHandleQuery = function(req, res, queryString, parameters, addTextFunction, internalError, userError, callback){
    
    pg.connect(getConnectionString(), function (err, client, done) {

        if (err) {
            done();
            console.log(err);
            sendJsonResponse(res, 500, false, 'DB connection error' + ' ' + err.code, 'DB error');
        }

        var query = client.query(queryString, parameters,
            function (err, result) {
                done();
                if (err) {
                    console.log(err);
                    sendJsonResponse(res, 409, false, (internalError? internalError : err.message) + ' ' + err.code, userError);
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

            if (addTextFunction && results.length > 0) {

                addTextFunction(results, req);
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
                else if(queryString.search("SELECT") > -1){
                    returnCode = 200;
                }
                else if(queryString.search("UPDATE") > -1){
                    returnCode = 200; //204 status does not return any JSON data
                }
                else{
                    returnCode = 0;
                }
                //TODO  204 (No Content) for SELECT, UPDATE

                sendJsonResponse(res, returnCode, true, null, null, results);
            }

        });
    }
    );
};

module.exports.convertQueryToWhereClause = function(query, tableAlias){

    //query is GET query string
    var keys = Object.keys(query);

    var whereClause = "";

    if(keys.length > 0) {

        var and = " AND ";

        whereClause += " WHERE ";

        keys.forEach(function (entry) {

            if(tableAlias){
                whereClause += tableAlias + '.'
            }
            whereClause +=  decamelize(entry) + "='" + query[entry] + "'" + and;
        });
        //remove last AND
        whereClause = whereClause.substr(0, whereClause.length - and.length);
    }

    return whereClause;

};

module.exports.rowUpdate = function (req, res, tableName, id, data, callback) {

    if(Object.keys(data).length > 0){

        //decamelise array
        var dataDecamelised = {};
        var newKey;

        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                newKey = decamelize(key);
                dataDecamelised[newKey] = data[key];
            }
        }

        //UPDATE Customers
        //SET ContactName='Alfred Schmidt', City='Hamburg'
        //WHERE CustomerName='Alfreds Futterkiste';

        var queryString = "UPDATE " + tableName + " SET";

        var comma =  ", ";
        var value;

        for (var key in dataDecamelised) {
            value = dataDecamelised[key];
            console.log(value);
            if(value === ''){
                queryString += ' ' + key + "=NULL" + comma;
            }
            else{
                if(value.toString().substring(0,3) === '@@@') {

                    queryString += ' ' + key + "=" + value.substring(3) + comma;
                }
                else{
                    queryString += ' ' + key + "='" + value + "'" + comma;
                }
            }
        }

        queryString = queryString.substring(0, queryString.length - comma.length);

        queryString += " WHERE id=" + id;
        queryString += " RETURNING *";

        console.log(queryString);

        this.dbHandleQuery(req, res, queryString, null, null, null, 'Error while updating content', function(results){

            if(callback){
                callback(results[0]);
            }
            else{

                sendJsonResponse(res, 200, true, null, null, results[0]);
            }
        });
    }
};

module.exports.rowInsert = function(req, res, tableName, data, callback){

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

    this.dbHandleQuery(req, res, queryString, values, null, null, 'Error', function(results){

        if(callback){
            callback(results[0]);
        }
        else{
            sendJsonResponse(res, 201, true, null, null, results[0]);
        }
    });
};

module.exports.readOne = function(req, res, tableName, id, addText, callback){

    var queryString = "SELECT * FROM " + tableName + " WHERE id = " + id;

    console.log(queryString);

    this.dbHandleQuery(req, res, queryString, null, addText, 'Internal Error', 'User Error', callback);

};

module.exports.readAll = function(req, res, tableName, addText, orderBy, whereFilters){ //whereFilters is json object, like qs

    var queryString = "SELECT * FROM " + tableName ;

    console.log(whereFilters);

    if(whereFilters){

        queryString += this.convertQueryToWhereClause(whereFilters);
    }

    if(orderBy){
        queryString += ' ORDER BY ' + orderBy;
    }

    console.log(queryString);

    this.dbHandleQuery(req, res, queryString, null, addText, 'Internal Error', 'User Error');

};


module.exports.checkParametersPresent = function(parameterString, data){

    parameterString = parameterString.replace(/\s/g, '');

    var array = parameterString.split(',');

    for (var i = 0; i < array.length -1; i++){
        var value = data[array[i]];
        console.log(value);
        if(!value || value == ''){
            return false;
        }
    }

    return true;
};

module.exports.generateJwt = function(id, email, lastName) {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return jwt.sign({
        _id: id,
        email: email,
        lastName: lastName,
        exp: parseInt(expiry.getTime() / 1000),
    }, config.Api.Secret); //USE dotenv module
};

module.exports.getLanguage = function(req){

    var language = req.header('Accept-Language');

    if(!language){
        language = 'en';
    }
    if(language.length > 2) {
        language = language.substring(0, 2);
    }

    return language;
};

module.exports.sendJsonResponse = sendJsonResponse;

module.exports.pg = pg;
module.exports.validator = validator;
module.exports.config = config;

