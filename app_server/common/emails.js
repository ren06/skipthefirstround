var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
var jade = require('jade');
var config = require('config');

var adminEmail = config.get('Email.adminEmail');

var sendEmail = function(to, html, subject, callback){

    var sendEmail = config.get('Email.sendEmail');

    console.log(sendEmail);

    var result = null;

    if(sendEmail) {

        var auth = {
            auth: {
                api_key: 'key-d89d723d9befc045fd954a45ac87a5b9',
                domain: 'skipthefirstround.com'
            }
        };

        var nodemailerMailgun = nodemailer.createTransport(mg(auth));

        nodemailerMailgun.sendMail({
            from: adminEmail,
            to: to, // An array if you have multiple recipients.
            //cc:'second@domain.com',
            //bcc:'secretagent@company.gov',
            subject: subject,
            //You can use "html:" to send HTML email content. It's magic!
            html: html,
            //You can use "text:" to send plain-text content. It's oldschool!
            //text: 'test message form mailgun',
        }, function (err, info) {

            if (err) {
                result = {'success': false, 'message': err};
            }
            else {
                result = {'success': true, 'message': info};
            }
            console.log(result);

            if(callback) {
                callback(result);
            }
        });

    }
    else{

        if(callback) {
            result = {'success': true, 'message': 'Email deactivated'};
            callback(result);
        }
    }
};

var renderView = function(templateName, data){

    var pathToTemplate = require('path').resolve(__dirname, '../views') + '/' + templateName + '.jade';
    var template = require('fs').readFileSync(pathToTemplate, 'utf8');
    var jadeFn = jade.compile(template, {filename: pathToTemplate, pretty: true});
    var renderedTemplate = jadeFn(data);

    return renderedTemplate;
};

//********************************************
//*** SEND USER REGISTRATION EMAIL
//********************************************
module.exports.to_User_RegistrationHtml = function(data){

    return renderView('email/user-registration', {data: data});
};

module.exports.to_User_Registration = function(email, data){

    var html = this.to_User_RegistrationHtml(data);

    sendEmail(email, html, 'Welcome to SkipTheFirstRound.com');
};

//****************************************************************
//*** SEND USER CONFIRMATION OF BOOKED INTERVIEW (after date set)
//****************************************************************
module.exports.to_User_InterviewConfirmationHtml = function(email,data){

    return renderView('email/user-interview-confirmation', {data: data});
};

module.exports.to_User_InterviewConfirmation = function(email, data){

    var html = this.to_User_InterviewConfirmationHtml(email, data);

    sendEmail(email, html, 'Interview Confirmation');

};

//************************************************************************
//*** SEND USER CONFIRMATION OF NEW INTERVIEW REQUEST (already registered)
//************************************************************************
module.exports.to_User_NewInterviewRequestHtml = function(firstName, interviewType){

    return renderView('email/user-new-interview-request', {data: {firstName: firstName,  interviewType: interviewType}});
};

module.exports.to_User_NewInterviewRequest = function(email, firstName, interviewType){

    var html = this.to_User_NewInterviewRequestHtml(firstName, interviewType);

    sendEmail(email, html, 'Request for a new interview');

};


//********************************************
//*** SEND RECRUITER REGISTRATION EMAIL
//********************************************
module.exports.to_Recruiter_RegistrationHtml = function(email, userName){

    return renderView('email/recruiter-registration', {data: {userName: userName}});

};
module.exports.to_Recruiter_Registration = function(email, userName){

    var html = this.to_Recruiter_RegistrationHtml(email, userName);

    sendEmail(email, html, 'Bienvenue sur SkipTheFirstRound.com');

};


//********************************************
//*** SEND ADMIN: USER ASKED FOR NEW INTERVIEW
//********************************************
// @param type 1 simulation 2 offer
module.exports.to_Admin_New_InterviewHtml = function(data){

    return renderView('email/admin-new-interview', {data: data});
};
module.exports.to_Admin_New_Interview = function(data){

    var html = this.to_Admin_New_InterviewHtml(data);
    var subject = "";
    if(data.interviewType == 1){
        subject = 'New mock interview request';
    }
    else{
        subject = 'New offer interview request';
    }

    sendEmail(adminEmail, html, subject);

};

//********************************************
//*** SEND INTERVIEWER: INTERVIEW CONFIRMATION
//********************************************
module.exports.to_Interviewer_InterviewConfirmationHtml = function(data){

    return renderView('email/interviewer-interview-confirmation', {data: data});
};
module.exports.to_Interviewer_InterviewConfirmation = function(email, data){

    var html = this.to_Interviewer_InterviewConfirmationHtml(data);
    sendEmail(email, html, 'Interview confirmation');

};


//**********************************
//*** SEND CONTACT FORM
//**********************************
module.exports.to_Admin_Contact_FormHtml = function(name, email, message){

    return renderView('email/contact-form', {data: {
        name: name,
        email: email,
        message: message,
    }});
};
module.exports.to_Admin_Contact_Form = function(name, email, message){

    var html = this.to_Admin_Contact_FormHtml(name, email, message);

    sendEmail(adminEmail, html, 'New inquiry from contact form');
};


//**********************************
//*** RESET PASSWORD
//**********************************
module.exports.to_User_ResetPasswordHtml = function(name, url){
    console.log(name);
    return renderView('email/user-password-reset', {data: {
        name: name,
        url: url,
    }});
};
module.exports.to_User_ResetPassword = function(email, name, url){

    var html = this.to_User_ResetPasswordHtml(name, url);

    sendEmail(email, html, 'Password reset request');
};



//**********************************
//*** TEST
//**********************************
module.exports.sendTestEmail = function(email, callback){

    sendEmail(email, "<h1>Hello Test</h1>", 'Test email', function(result){
        callback(result);
    });
};
