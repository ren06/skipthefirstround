var express = require('express');
var router = express.Router();
var request = require('request');
var emails = require('../common/emails');
var common = require('../controllers/common');

router.get ('/email', function(req, res){

    res.render('email/template', {

    });

});

router.get ('/email/user-register', function(req, res){
    var data =  {firstName: 'Renaud', interviewType: 1};
    var html = emails.to_User_RegistrationHtml(data);
    res.send(html);

});

router.get ('/email/user-interview-confirmation', function(req, res){

    var data = {firstName: 'Renaud', skypeId: 'renaudt'};

    var html = emails.to_Admin_New_InterviewHtml(data);
    res.send(html);

});

router.get ('/email/recruiter-register', function(req, res){

    var html = emails.to_Recruiter_RegistrationHtml('');
    res.send(html);

});

router.get ('/email/sendTestEmail', function(req, res){

    emails.sendTestEmail('test@skipthefirstround.com', function(result){
        console.log(result);
        res.send(result);
    });

});

router.get ('/renameEmailAddress/', function(req, res){

    var requestOptions = common.getRequestOptions(req, '/api/test/renameEmailAddress', 'GET');

    request(requestOptions, function (err, response, body) {

        res.send(response);
    });

});






module.exports = router;