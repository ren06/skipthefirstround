var common = require('./common');
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
