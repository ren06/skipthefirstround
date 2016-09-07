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

    common.readAll(req, res, 'tbl_recruiter', null, 'id');
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

module.exports.doRecruiterAuthenticate = function(req, res) {

    //get sent data
    var email = req.body.email;
    var password = req.body.password;

    console.log(req.body);

    //check it's all there
    if (!email || !password) {

        common.sendJsonResponse(res, 400, false, 'No user or password', 'Vous devez fournir un email et password', null);
        return;
    }

    var queryString = "SELECT id, email, first_name, last_name, password_hash FROM tbl_recruiter WHERE email= ($1)";

    common.dbHandleQuery(req, res, queryString, [email], null, 'noUser', 'Email or password does not exist', function (results) {

        var row = results[0];
        console.log(row);
        if (row && row.email && row.password_hash) {

            var buffer = new Buffer(row.password_hash, 'hex');

            cryptography.verifyPassword(password, buffer, function (err, success) {

                if (success) {
                    var token = common.generateJwt(row.id, row.email, row.last_name);
                    var result = {
                        'user': {
                            id: row.id,
                            email: row.email,
                            first_name: row.first_name,
                            last_name: row.last_name
                        }, 'token': token
                    };
                    common.sendJsonResponse(res, 200, true, 'User authorised', 'Utilisateur authentifie', result);
                }
                else {
                    common.sendJsonResponse(res, 401, false, 'User not authorised', 'Utilisateur non authentifie', null);
                }

            });
        }
        else {
            common.sendJsonResponse(res, 404, false, 'Email not found', 'Email non reconnu');
        }

    });
};

module.exports.toggleActiveInactive = function(req, res){

    var recruiterId = req.params.recruiterId;

    if(!recruiterId){
        common.sendJsonResponse(res, 400, false, 'No recruiterId', 'No recruiterId', null) ;
    }
    else{

        common.readOne(req, res, 'tbl_recruiter', recruiterId, null, function(results){

            var data = results[0];

            if(data) {
                var active;
                console.log(data.active);

                if (typeof data.active == 'undefined') {
                    active = true;
                }
                else if (data.active == false) {
                    active = true;
                }
                else {
                    active = false;
                }

                common.rowUpdate(req, res, 'tbl_recruiter', recruiterId, {'active': active});
            }
            else{
                //error no record
            }

        });
    }

};

module.exports.isActive = function(req, res){

    var recruiterId = req.params.recruiterId;

    common.readOne(req, res, 'tbl_recruiter', recruiterId, null, function(results){

        var active = results[0].active;
        console.log(active);
        var result = true;

        if(!active || typeof active == 'undefined'){
            result = false;
        }
        else if(active == false){
            result = false;
        }

        console.log(result);
        common.sendJsonResponse(res, 200, true, null, null, {'active' : result});

    });
};




