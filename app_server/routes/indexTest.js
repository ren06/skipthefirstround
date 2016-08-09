var express = require('express');
var router = express.Router();


router.get ('/email', function(req, res){

    res.render('email/template', {

    });

});


module.exports = router;