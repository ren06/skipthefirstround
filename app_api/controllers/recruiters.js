var common = require('./commonApi');
var cryptography = require('../helper/cryptography');

module.exports.createRecruiter = function(req, res){

    if (!common.checkParametersPresent('email, firstName, lastName, mobilePhone, password, company, language', req.body)) {

        common.sendJsonResponse(res, 400, false, 'Missing input', res.__('RecruiterCreateMissingInput'), null);
    }
    else {

        var data = req.body;

        //encrypt password
        cryptography.hashPassword(data.password, function (err, buffer) {

            if (err !== null) {
                //internal message error
                common.sendJsonResponse(res, 500 , false, 'Error hashing password: ', 'Erreur inattendue');
            }
            else if (buffer !== null) {

                var passwordHash = buffer.toString('hex');


                delete data['password'];
                data['passwordHash'] = passwordHash;

                console.log(data);

                common.rowInsert(req, res, 'tbl_recruiter', data);
            }
            else {
                common.sendJsonResponse(res, 500,  false, 'Unexpected error, buffer is null', 'Erreur inattendue');
            }

        });

    }
}

module.exports.recruiterList = function(req, res){

    common.readAll(req, res, 'tbl_recruiter', null);
}

module.exports.recruiterReadOne = function(req, res){

    var recruiterId = req.params.recruiterId;

    if(!recruiterId){
        common.sendJsonResponse(res, 400, false, 'No recruiterId', 'No recruiterId', null) ;
    }
    else{

        common.readOne(req, res, 'tbl_recruiter', recruiterId, null);
    }

}

module.exports.doRecruiterAuthenticate = function(req, res){

    //get sent data
    var email = req.body.email;
    var password = req.body.password;

    console.log(req.body);

    //check it's all there
    if(!email || !password) {

        common.sendJsonResponse(res, 400, false, 'No user or password', 'Vous devez fournir un email et password', null) ;
        return;
    }

    var queryString = "SELECT id, email, first_name, last_name, password_hash FROM tbl_recruiter WHERE email= ($1)";

    common.dbHandleQuery(req, res, queryString, [email], null, 'noUser', 'Email or password does not exist', function(results){

        var row = results[0];

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

    });

    // //read user
    // pg.connect(conString, function (err, client, done) {
    //
    //     common.rowInsert();
    //
    //     var results = [];
    //
    //     // Handle connection errors
    //     if (err) {
    //         done();
    //         common.sendJsonResponse(res, 500, false, 'DB connection error', 'Erreur de connexion', err);
    //         return;
    //     }
    //
    //     // Select user
    //     var queryString = "SELECT id, email, first_name, last_name, password_hash FROM tbl_user WHERE email= ($1)";
    //     console.log(queryString);
    //     console.log(email);
    //
    //     var query = client.query(queryString, [email],
    //         function(err, result) {
    //             done();
    //             console.log('executed');
    //             if (err) {
    //                 console.log('error');
    //                 common.sendJsonResponse(res, 400, false, 'DB connection error', 'Erreur de connexion', err);
    //                 return;
    //             }
    //         }
    //     );
    //
    //     query.on('end', function(result) {
    //
    //         done();
    //
    //         if(result.rowCount === 0){
    //             common.sendJsonResponse(res, 404, false, 'Email not found', 'Email non reconnu');
    //             //return;
    //         }
    //         else if(result.rowCount === 1){
    //             onUserRead(result.rows[0]);
    //         }
    //         else{
    //             common.sendJsonResponse(res, 404,  false, 'Unexpected error, there should be only one row for email', 'Erreur email present plusieurs fois');
    //             //return;
    //         }
    //
    //     });
    //
    // });


};




