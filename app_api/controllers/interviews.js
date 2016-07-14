var common = require('./common');

var pg = require('pg');
var config = require('config');

var databaseURL = config.get('Api.dbConfig.url');
var conString = databaseURL; //process.env.DATABASE_URL || 'postgres://admin:Santos100@localhost:5432/neris';
var moment = require('moment');
var options = require('./options');

var addText = function(data, req){

    var language = req.header('Accept-Language');

    if(!language){
        language = 'en';
    }

    console.log('header language: ' + language);

    data.forEach(function(entry) {

        var dateTime = entry.date_time;

        moment.locale(language);

        var result;

        if (dateTime == null) {

            result = __({phrase: 'DateUndefined',  locale: language});
        }
        else {
            result = moment(dateTime).format("dddd Do MMMM YYYY H:m");


        }
        console.log('res: ' + result);

        entry['dateTimeText'] = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
        entry['date'] = moment(dateTime).format("DD/MM/YYYY");
        entry['hour'] = moment(dateTime).format("H");
        entry['minute'] = moment(dateTime).format("m");
        entry['typeText'] = options.options.interviewTypeOptions[entry.type];
        entry['sectorText'] = options.options.sectorOptions[entry.sector];

    });

    return data;
}

module.exports.interviewCreate = function(req, res){

    console.log('interviewCreate');

    var userId = parseInt(req.body.userId);
    var type = parseInt(req.body.type); //simulation, offer
    var sector = parseInt(req.body.sector);
    //var dateTime = req.body.dateTime; => set later
    //var interviewerId = req.body.interviewerId; => set later
    //var appreciation = req.body.interviewerId; => set later
    //var status = req.body.status;
    //var video => set later

    var status = 1; //proposed

    console.log(req.body);

    //check it's all there
    if(!userId || !type || !sector ) {

        //syntactically wrong, bad request
        common.sendJsonResponse(res, 400, false , 'Missing input', res.__('InterviewCreationMissingInput'), null);
        return;
    }
    else{

        //check type and sector
        if(type != 1 && type != 2) {

            //semantic error
            common.sendJsonResponse(res, 422, false, 'Not valid type', 'Type must be 1 or 2, it is ' + type);
            return;
        }
        else if(!(sector == 1 || sector == 2 || sector == 3 || sector == 4)){

            //semantic error
            common.sendJsonResponse(res, 422, false, 'Not valid sector', 'Type must be 1, 2, 3 or 4, it is ' + sector);
            return;
        }
    }

    console.log('ok');

    pg.connect(conString, function (err, client, done) {

        var results = [];

        console.log('create interview');

        // Handle connection errors
        if (err) {
            console.log(err);
            done();
            common.sendJsonResponse(res, 500, false, err, 'Erreur inattendue');

        }
        else {

            // Insert
            var queryString = "INSERT INTO tbl_interview(id_user, type, sector, status) VALUES($1, $2, $3, $4) RETURNING *";
            console.log(queryString);

            console.log([userId, type, sector, status]);

            var query = client.query(queryString, [userId, type, sector, status],
                function (err, result) {
                    done();
                    if (err) {
                        console.log('insert error');
                        //conflict error
                        common.sendJsonResponse(res, 409, false, 'Insert error for interview for user ' + userId + '. Error: ' + err + ' ' + result, res.__('InterviewErrorUserId') );
                    }
                }
            );

            query.on("row", function (row, result) {
                
                var result = { 'interview': row, };
                common.sendJsonResponse(res, 201, true, null, null, result);
            });

            query.on('end', function () {
                done();
            });
        }

    });
}

var executeListPerUser = function(req, res, sql){

    var userId = req.params.userId;

    if(!userId){
        common.sendJsonResponse(res, 400, false , 'Missing input', res.__('InterviewPerUserMissingInput'), null);
    }
    else {

        pg.connect(conString, function (err, client, done) {

            var results = [];

            // Handle connection errors
            if (err) {
                done();
                console.log('err db ' + err);
                return res.status(500).json({success: false, data: err});
            }

            // SQL Query > Select Data
            var queryString = sql;

            //console.log(queryString);
            var query = client.query(queryString, [userId]);

            // Stream results back one row at a time
            query.on('row', function (row) {
                results.push(row);
            });

            // After all data is returned, close connection and return results
            query.on('end', function () {
                done();
                var resultWithText = addText(results, req);
                common.sendJsonResponse(res, 200, true, '', '', resultWithText);
            });

        });
    }
}

module.exports.interviewList = function(req, res){

    pg.connect(conString, function(err, client, done) {

        var results = [];

        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Select Data
        var queryString = "SELECT i.*, row_to_json(u.*) as user FROM tbl_interview i LEFT JOIN tbl_user u ON u.id = i.id_user ORDER BY u.id ASC";
        console.log(queryString);
        var query = client.query(queryString);

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            var resultWithText = addText(results, req);
            common.sendJsonResponse(res, 200, true, '', '', resultWithText);
        });

    });
}


module.exports.interviewListByUser = function(req, res){
    var sql = "SELECT * FROM tbl_interview i LEFT JOIN tbl_user u ON u.id = i.id_user WHERE id_user = $1 ORDER BY id ASC";
    executeListPerUser(req, res, sql);
}

module.exports.interviewPastByUser = function(req, res){
    var sql = "SELECT * FROM tbl_interview i LEFT JOIN tbl_user u ON u.id = i.id_user WHERE id_user = $1 AND date_time < now() ORDER BY date_time ASC";
    executeListPerUser(req, res, sql);
}

module.exports.interviewUpcomingByUser = function(req, res){
    var sql = "SELECT * FROM tbl_interview i LEFT JOIN tbl_user u ON u.id = i.id_user WHERE id_user = $1 AND (date_time IS NULL OR date_time >= now() ) ORDER BY date_time ASC";
    executeListPerUser(req, res, sql);
}

//GET
module.exports.interviewReadOne = function(req, res){

    console.log('interviewReadOne');
    
    var interviewId = req.params.interviewId;

    if(!interviewId){
        common.sendJsonResponse(res, 400, false , 'Missing input', res.__('InterviewMissingInput'), null);
    }

    pg.connect(conString, function(err, client, done) {

        var results = [];

        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err});
        }

        // var queryString = "SELECT i.*, row_to_json(u.*) as user, row_to_json(s.*) as sequence " +
        //     "FROM tbl_interview i " +
        //     "LEFT JOIN tbl_user u ON u.id = i.id_user " +
        //     "LEFT JOIN tbl_sequence s ON s.id_interview = i.id " +
        //     "WHERE i.id = $1 ORDER BY u.id ASC";

        //BUG
        // var queryString = "SELECT i.*, row_to_json(u.*) as user, json_build_object( \
        // 'id',s.id, \
        //     'tag', s.tag, \
        //     'summary', s.summary, \
        //     'visible', s.visible, \
        //     'videos', json_build_object( \
        //     'provider', v.provider,\
        //     'provider_unique_id', v.provider_unique_id, \
        //     'provider_cloud_name', v.provider_cloud_name \
        // ) \
        // ) as sequence \
        // FROM tbl_interview i \
        // LEFT JOIN tbl_user u ON u.id = i.id_user \
        // LEFT JOIN tbl_sequence s ON s.id_interview = i.id \
        // LEFT JOIN tbl_video v ON v.id = s.id_video \
        // WHERE i.id = $1 ORDER BY u.id ASC";

        var queryString = "SELECT i.*, row_to_json(u.*) as user, ARRAY(SELECT json_build_object( \
            'id',s.id, \
            'tag', s.tag, \
            'summary', s.summary, \
            'visible', s.visible, \
            'video', json_build_object( \
                'provider', v.provider, \
                'provider_unique_id', v.provider_unique_id, \
                'provider_cloud_name', v.provider_cloud_name \
            ) \
        ) \
        FROM tbl_sequence s LEFT JOIN tbl_video v ON v.id = s.id_video WHERE s.id_interview = i.id \
        ) as sequences \
        FROM tbl_interview i \
        LEFT JOIN tbl_user u ON u.id = i.id_user \
        WHERE i.id = $1 ORDER BY u.id ASC"


        console.log(queryString);
        var query = client.query(queryString, [interviewId]);
        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            var resul = results[0];
            var resultWithText = addText([resul], req);
            common.sendJsonResponse(res, 200, true, '', '', resultWithText);
        });

    });

}

module.exports.interviewUpdateOne = function(req, res){

}

//POST
module.exports.interviewSetDate = function(req, res){

    var interviewId = req.params.interviewId;

    var dateTime = req.body.dateTime;
    var interviewerId = req.body.interviewerId;

    if(!interviewId || !dateTime || !interviewerId){
        console.log(interviewId + dateTime + interviewerId);
        common.sendJsonResponse(res, 400, false , 'Missing input', res.__('InterviewSetDateMissingInput'), null);
    }
    else {

        common.dbConnect(function (err, client, done) {

            var results = [];

            // Handle connection errors
            if (err) {
                done();
                console.log(err);
                return res.status(500).json({success: false, data: err});
            }

            var queryString = "UPDATE tbl_interview SET date_time = $2, id_interviewer = $3 WHERE id = $1 RETURNING *";
            console.log(queryString);
            console.log(dateTime);
            var query = client.query(queryString, [interviewId, dateTime, interviewerId],
                function (err, result) {
                    done();
                    if (err) {
                        console.log('insert error');

                        common.sendJsonResponse(res, 409, false, 'Insert error for ' + interviewId + '. Error code ' + err.code, res.__('InterviewerDoesNotExist'));
                    }
                }
            );

            // Stream results back one row at a time
            query.on('row', function (row) {

                results.push(row);
            });

            // After all data is returned, close connection and return results
            query.on('end', function () {
                done();

                var resultWithText = addText(results, req);
                console.log('RETURN RESPOSNE');
                console.log(resultWithText);
                common.sendJsonResponse(res, 200, true, null, null, resultWithText);
            });

        });
    }

}

//POST
module.exports.interviewAddSequence = function(req, res) {

    var interviewId = req.params.interviewId;

    var tagId = req.body.tagId;
    var summary = req.body.summary;
    var appreciationId = req.body.appreciationId;
    var videoUniqueId = req.body.videoUniqueId;

    console.log(req.body);

    var provider = 'cloudinary';
    var providerCloudName = 'dzfmkzqdo';


    if (!tagId || !summary || !appreciationId || !videoUniqueId) {

        common.sendJsonResponse(res, 400, false, 'Missing input', res.__('InterviewAddSequenceMissingInput'), null);
    }
    else {

        var queryString = "INSERT INTO tbl_video(provider, provider_cloud_name, provider_unique_id) VALUES ($1, $2, $3) RETURNING *";
        var parameters = [provider, providerCloudName, videoUniqueId];

        common.dbHandleQuery(req, res, queryString, parameters, null, 'Video insert error', res.__('VideoInsertError'), function (results) {

            var idVideo = results[0].id;

            var queryString = "INSERT INTO tbl_sequence(id_interview, tag, summary, appreciation, id_video) VALUES ($1, $2, $3, $4, $5) RETURNING *";
            var parameters = [interviewId, tagId, summary, appreciationId, idVideo];

            common.dbHandleQuery(req, res, queryString, parameters, null, 'Video insert error', res.__('VideoInsertError'));


        });
    }
}



