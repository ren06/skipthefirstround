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
}

var sendEmail_Registration = function(email, userName){

    var html = renderView('email/user-registration', {data: {userName: userName}});

    sendEmail(email, html);

};


module.exports.testEmail = testEmail;
module.exports.sendEmailResistration = sendEmail_Registration;