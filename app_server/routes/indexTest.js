var express = require('express');
var router = express.Router();
var emails = require('../common/emails');

router.get ('/email', function(req, res){

    res.render('email/template', {

    });

});

router.get ('/email/user-register', function(req, res){

    var html = emails.to_User_RegistrationHtml('rtheuillon@hotmail.com', 'Renaud');
    res.send(html);

});

router.get ('/email/user-interview-confirmation', function(req, res){

    var html = emails.to_Admin_New_InterviewHtml(1, 'Renaud', 'Junior Analyst', '17/10/2016', '12:30', 'renaudt');
    res.send(html);

});

router.get ('/email/recruiter-register', function(req, res){

    var html = emails.to_Recruiter_RegistrationHtml('');
    res.send(html);

});




module.exports = router;