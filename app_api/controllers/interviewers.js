var common = require('./common');

var addText = function(data, req){

    var language = req.header('Accept-Language');

    data.forEach(function(entry) {

        // var dateTime = entry.date_time;
        //
        // moment.locale(language);
        //
        // var result;
        //
        // if (dateTime == null) {
        //
        //     result = __({phrase: 'DateUndefined',  locale: language});
        // }
        // else {
        //     result = moment(dateTime).format("dddd Do MMMM YYYY H:m");
        //
        //
        // }
        
        entry['fullName'] = entry.first_name + ' ' + entry.last_name;

    });

    return data;
}

module.exports.interviewerCreate = function(req, res){

    console.log('interviewerCreate');

    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;
    var mobilePhone = req.body.mobilePhone;
    var password = req.body.password;

    var PASSWORD_MIN_LENGTH = common.config.get('Api.PasswordMinLength');

    //check it's all there
    if(!firstName || !lastName || !email || !mobilePhone || !password) {

        //syntactically wrong, bad request
        common.sendJsonResponse(res, 400, false , 'Missing input', res.__('InterviewerCreationMissingInput'), null);
        return;
    }
    else{

        //check email
        if(!common.validator.isEmail(email)){

            //semantic error
            common.sendJsonResponse(res, 422 , false , 'Not valid email', email + " n'est pas un email correcte");
            return;
        }
        else if(password.length < PASSWORD_MIN_LENGTH){

            common.sendJsonResponse(res, 422 , false , 'Password too short', "Le mot de passe doit faire au mois " + PASSWORD_MIN_LENGTH + " caracteres" );
            return;
        }
    }

    common.dbConnect(function (err, client, done) {

        var results = [];

        console.log('create interviewer');

        // Handle connection errors
        if (err) {
            console.log(err);
            done();
            common.sendJsonResponse(res, 500, false, err, 'Erreur inattendue');
        }
        else {

            // Insert
            var queryString = "INSERT INTO tbl_interviewer(first_name, last_name, email, mobile_phone, password_hash) VALUES($1, $2, $3, $4, $5) RETURNING *";
            console.log(queryString);


            var query = client.query(queryString, [firstName, lastName, email, mobilePhone, password],
                function (err, result) {
                    done();
                    if (err) {
                        console.log('insert error');
                        //conflict error
                        common.sendJsonResponse(res, 409, false, 'Insert error for interviewer. Error code ' + err.code , res.__('InterviewerError') );
                    }
                }
            );

            query.on("row", function (row, result) {
                
                var result = { 'interviewer': row, };
                common.sendJsonResponse(res, 201, true, null, null, result);
            });

            query.on('end', function () {
                done();
            });
        }

    });
}


module.exports.interviewersList = function(req, res){

    common.dbConnect(function (err, client, done) {

        var results = [];

        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Select Data
        var queryString = "SELECT * FROM tbl_interviewer i ORDER BY i.id ASC";
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


module.exports.interviewerReadOne = function(req, res){

    var interviewerId = req.params.interviewerId;

    if(!interviewerId){
        common.sendJsonResponse(res, 400, false , 'Missing input', res.__('InterviewererMissingInput'), null);
    }

    common.dbConnect(function (err, client, done) {

        var results = [];

        // Handle connection errors
        if(err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err});
        }

        var queryString = "SELECT * FROM tbl_interviewer i WHERE i.id = $1 ORDER BY i.id ASC";
        console.log(queryString);
        var query = client.query(queryString, [interviewerId]);
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



