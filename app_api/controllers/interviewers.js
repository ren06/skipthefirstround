var common = require('./commonApi');
var cryptography = require('../helper/cryptography');

//expects array
var addText = function(data, req){

    var language = common.getLanguage(req);

    if(typeof data !== 'undefined') {

        data.forEach(function (entry) {

            entry['fullName'] = entry.first_name + ' ' + entry.last_name;

        });
    }
}

module.exports.interviewerCreate = function(req, res){

    var email = req.body.email;
    var password = req.body.password;
    var confirmationPassword = req.body.confirmationPassword;

    if (!common.checkParametersPresent('email, firstName, lastName, mobilePhone, password, confirmationPassword', req.body)) {

        common.sendJsonResponse(res, 400, false, 'Missing input', res.__('RecruiterCreateMissingInput'), null);
        return;
    }

    //check email
    if(!common.validator.isEmail(email)){

        //semantic error
        common.sendJsonResponse(res, 422 , false , 'Not valid email', email + " is not a valid email");
        return;
    }

    var PASSWORD_MIN_LENGTH = common.config.get('Api.PasswordMinLength');

    if(password.length < PASSWORD_MIN_LENGTH){

        common.sendJsonResponse(res, 422 , false , 'Password too short', "Le mot de passe doit faire au mois " + PASSWORD_MIN_LENGTH + " caracteres" );
        return;
    }

    if(password !== confirmationPassword){

        common.sendJsonResponse(res, 422 , false , 'Password not matching confirmationPassword', "Password not matching Password Confirmation" );
        return;
    }

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
            delete data['confirmationPassword'];

            data['passwordHash'] = passwordHash;

            console.log('Interviewer create: ');
            console.log(data);

            common.rowInsert(req, res, 'tbl_interviewer', data, function(result){

                delete result['password_hash'];
                addText([result], req);
                common.sendJsonResponse(res, 201, true, null, null, result);
            });
        }
        else {
            common.sendJsonResponse(res, 500,  false, 'Unexpected error, buffer is null', 'Erreur inattendue');
        }

    });

};


module.exports.interviewersList = function(req, res){

    common.readAll(req, res, 'tbl_interviewer', addText);
};


module.exports.interviewerReadOne = function(req, res){

    var interviewerId = req.params.interviewerId;

    if(!interviewerId){
        common.sendJsonResponse(res, 400, false , 'Missing input', res.__('InterviewererMissingInput'), null);
    }
    else{
        common.readOne(req, res, 'tbl_interviewer', interviewerId, addText);
    }
};



