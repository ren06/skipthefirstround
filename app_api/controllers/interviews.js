var common = require('./commonApi');
var pg = require('pg');
var config = require('config');
var moment = require('moment');
var options = require('./options');

var conString = config.get('Api.dbConfig.url');

var addText = function(data, req){

    var language = req.header('Accept-Language');

    if(!language){
        language = 'en';
    }
    if(language.length > 2) {
        language = language.substring(0, 2);
    }

    console.log('header language: ' + language);

    console.log(data);

    if(typeof data !== 'undefined') {

        data.forEach(function (entry) {

            var dateTime = entry.date_time;

            moment.locale(language);

            var result;

            if (dateTime == null) {

                result = __({phrase: 'DateUndefined', locale: language});
            }
            else {
                result = moment(dateTime).format("dddd Do MMMM YYYY H:m");


            }
            console.log('res: ' + result);

            entry['dateTimeText'] = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
            entry['date'] = moment(dateTime).format("DD/MM/YYYY");
            entry['hour'] = moment(dateTime).format("H");
            entry['minute'] = moment(dateTime).format("m");
            entry['typeText'] = options.options[language].interviewTypeOptions[entry.type];
            entry['sectorText'] = options.options[language].sectorOptions[entry.sector];

            if(entry.type == 2){
                entry['typeText'] =  entry['typeText'] + ' #' + entry.id;
            }


            if(!entry.company){
                entry['companyText'] = 'Not specified';
            }
            else{
                entry['companyText'] = entry.company;
            }

            if(typeof entry.sequences !== 'undefined') {

                entry.sequences.forEach(function (entry) {

                    entry['tagText'] = options.options[language].sequenceTagOptions[entry.tag];
                    entry['appreciationText'] = options.options[language].appreciationsOptions[entry.appreciation];

                });

            }

        });

    }
    return data;
}

//TODO maybe split it in 2 functions, one for offer, one for simulation
module.exports.interviewCreate = function(req, res){

    console.log('interviewCreate');

    var userId = parseInt(req.body.userId);
    var type = parseInt(req.body.type); //simulation, offer
    var sector = parseInt(req.body.sector);
    var offerId = req.body.offerId;
    var company = req.body.company;
    var position = req.body.position;

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
        console.log(res.getLocale());

        var allowedTypes = options.options[res.getLocale()].interviewTypeOptions;
        var allowedSector = options.options[res.getLocale()].sectorOptions;



        if(typeof allowedTypes[type] === 'undefined') {

            //semantic error
            common.sendJsonResponse(res, 422, false, 'Not valid type', 'Type must be 1 or 2, it is ' + type);
            return;
        }
        else if(typeof allowedSector[sector] === 'undefined'){

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

            var queryString = "";
            var params = [userId, type, sector, status];

            if(offerId){
                params.push(offerId);
                var queryString = "INSERT INTO tbl_interview(id_user, type, sector, status, id_offer) VALUES($1, $2, $3, $4, $5) RETURNING *";
            }
            else{
                params.push(company);
                params.push(position);
                var queryString = "INSERT INTO tbl_interview(id_user, type, sector, status, company, position) VALUES($1, $2, $3, $4, $5, $6) RETURNING *";
            }

            console.log(params);

            var query = client.query(queryString, params,
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

module.exports.interviewListNoDate = function(req, res){

    var queryString = "SELECT i.*, row_to_json(u.*) as user FROM tbl_interview i INNER JOIN tbl_user u ON u.id = i.id_user WHERE date_time IS NULL ORDER BY u.id ASC ";

    common.dbHandleQuery(req, res, queryString, null, null, 'Error', 'Error', function(results){

        // var data = {};
        //
        // results.forEach(function(entry){
        //
        //     data[ entry.location] = entry.location;
        // });

        common.sendJsonResponse(res, 200, true, null, null, results);

    });
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
        var queryString = "SELECT i.*, row_to_json(u.*) as user FROM tbl_interview i INNER JOIN tbl_user u ON u.id = i.id_user ORDER BY u.id ASC";
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
    var sql = "SELECT i.* FROM tbl_interview i INNER JOIN tbl_user u ON u.id = i.id_user WHERE id_user = $1 ORDER BY id ASC";
    executeListPerUser(req, res, sql);
}

module.exports.interviewPastByUser = function(req, res){
    var sql = "SELECT i.* FROM tbl_interview i INNER JOIN tbl_user u ON u.id = i.id_user WHERE id_user = $1 AND date_time < now() ORDER BY date_time ASC";
    executeListPerUser(req, res, sql);
}

module.exports.interviewUpcomingByUser = function(req, res){
    var sql = "SELECT i.* FROM tbl_interview i INNER JOIN tbl_user u ON u.id = i.id_user WHERE id_user = $1 AND (date_time IS NULL OR date_time >= now() ) ORDER BY date_time ASC";
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

        var queryString = "SELECT i.*, row_to_json(u.*) as user, row_to_json(o.*) as offer, ARRAY(SELECT json_build_object( \
            'id',s.id, \
            'tag', s.tag, \
            'summary', s.summary, \
            'visible', s.visible, \
            'appreciation', s.appreciation, \
            'video', json_build_object( \
                'provider', v.provider, \
                'provider_unique_id', v.provider_unique_id, \
                'provider_cloud_name', v.provider_cloud_name, \
                'url', v.url \
            ) \
        ) \
        FROM tbl_sequence s INNER JOIN tbl_video v ON v.id = s.id_video WHERE s.id_interview = i.id \
        ) as sequences \
        FROM tbl_interview i \
        INNER JOIN tbl_user u ON u.id = i.id_user \
        LEFT JOIN tbl_offer o ON i.id_offer = o.id \
        WHERE i.id = $1 ORDER BY u.id ASC"


        //console.log(queryString);
        var query = client.query(queryString, [interviewId]);
        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();

            var result = results[0];
            if(result){
            var result = addText([result], req);
            }

            common.sendJsonResponse(res, 200, true, '', '', result);
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
    var videoUrl = req.body.videoUrl;

    console.log(req.body);

    var provider = 'cloudinary';
    var providerCloudName = 'dzfmkzqdo';


    if (!tagId || !summary || !appreciationId || !videoUniqueId) {

        common.sendJsonResponse(res, 400, false, 'Missing input', res.__('InterviewAddSequenceMissingInput'), null);
    }
    else {

        var queryString = "INSERT INTO tbl_video(provider, provider_cloud_name, provider_unique_id, url) VALUES ($1, $2, $3, $4) RETURNING *";
        var parameters = [provider, providerCloudName, videoUniqueId, videoUrl];

        common.dbHandleQuery(req, res, queryString, parameters, null, 'Video insert error', res.__('VideoInsertError'), function (results) {

            var idVideo = results[0].id;

            var queryString = "INSERT INTO tbl_sequence(id_interview, tag, summary, appreciation, id_video) VALUES ($1, $2, $3, $4, $5) RETURNING *";
            var parameters = [interviewId, tagId, summary, appreciationId, idVideo];

            common.dbHandleQuery(req, res, queryString, parameters, null, 'Video insert error', res.__('VideoInsertError'));

        });
    }
}

module.exports.interviewModify = function(req, res){

    var interviewId = req.params.interviewId;

    //date_time, type, sector, id_interviewer, appreciation, status, id_video

    console.log(req.body);

    var dateTime = req.body.dateTime;
    var type = req.body.type;
    var sector = req.body.sector;
    var idInterviewer = req.body.idInterviewer;
    // var appreciation = req.body.appreciation;
    // var status = req.body.status;
    // var videoId = req.body.videoId;

    if (!dateTime || !type || !sector || !idInterviewer) {

        common.sendJsonResponse(res, 400, false, 'Missing input', res.__('InterviewModifyMissingInput'), null);
    }
    else {

        // var queryString = "UPDATE tbl_interview SET date_time=$1, type=$2, sector=$3, id_interviewer=$4, appreciation=$5, status=$6, id_video=$7 " +
        //     "WHERE id =$8 RETURNING * ";
        // var parameters = [dateTime, type, sector, interviewerId, appreciation, status, videoId, interviewId];
        // console.log(queryString);
        // console.log(parameters);
        //
        // common.dbHandleQuery(req, res, queryString, parameters, null, 'Video insert error', res.__('VideoModifyError'));

        common.rowUpdate(req, res, 'tbl_interview', interviewId, req.body);
    }


}



