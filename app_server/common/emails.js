var nodemailer = require('nodemailer');
var jade = require('jade');
var config = require('config');

function testEmail(req, res) {

    var result = sendEmail_Registration('rtheuillon@hotmail.com', 'Renaud');
    res.json(result);

}

var sendEmail = function(to, html){

    var sendEmail = config.get('Email.sendEmail');
    console.log(sendEmail);

    if(sendEmail) {

        var transporter = nodemailer.createTransport({
            service: 'Mailgun',
            auth: {
                user: 'admin@demandeaufinaud.com',
                pass: 'admin'
            }
        });
        var mailOptions = {
            from: 'admin@demandeaufinaud.com',
            to: to,
            subject: 'test subject',
            text: 'test message form mailgun',
            html: html,
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err);
                return {'success': false, 'message': err};
            } else {
                console.log('Message sent: ' + info.response);
                return {'success': true, 'message': info.response};
            }
            ;
        });
    }
    else{
        return {'success': true, 'message': 'Email deactivated'};
    }
};

var renderView = function(templateName, data){

    var pathToTemplate = require('path').resolve(__dirname, '../views') + '/' + templateName + '.jade'
    var template = require('fs').readFileSync(pathToTemplate, 'utf8');
    var jadeFn = jade.compile(template, {filename: pathToTemplate, pretty: true});
    var renderedTemplate = jadeFn(data);

    return renderedTemplate;
};

//SEND USER REGISTRATION EMAIL
module.exports.to_User_RegistrationHtml = function(email, firstName){

    return renderView('email/user-registration', {data: {firstName: firstName, email: email}});
};

module.exports.to_User_Registration = function(email, firstName){

    var html = this.to_User_RegistrationHtml(email, firstName);

    sendEmail(email, html);

};

//SEND RECRUITER REGISTRATION EMAIL
module.exports.to_Recruiter_RegistrationHtml = function(email, userName){

    var html = renderView('email/recruiter-registration', {data: {userName: userName}});

    sendEmail(email, html);

};
module.exports.to_Recruiter_Registration = function(email, userName){

    var html = to_Recruiter_RegistrationHtml(email, userName);

    sendEmail(email, html);

};



//SEND USER INTERVIEW CONFIRMATION
/**
 * @param type 1 simulation 2 offer
 */
module.exports.to_Admin_New_InterviewHtml = function(type, firstName, position, date, time, skypeId){

    return renderView('email/user-interview-confirmation', {data: {
        type: type,
        firstName: firstName,
        position: position,
        date: date,
        time: time,
        skypeId: skypeId,
    }});
}
module.exports.to_Admin_New_Interview = function(type, email, firstName, position, date, time, skypeId){

    var html = this.to_Admin_New_InterviewHtml(type, firstName, position, date, time, skypeId);

    sendEmail(email, html);

};

