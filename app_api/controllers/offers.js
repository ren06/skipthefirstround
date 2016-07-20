var common = require('./common');

module.exports.createRecruiter = function(req, res){


    if (!common.checkParametersPresent('sector, offerType, companyType, location, text, language', req.body)) {

        common.sendJsonResponse(res, 400, false, 'Missing input', res.__('OfferCreateMissingInput'), null);
    }
    else {

        var data = req.body;

        common.rowInsert(req, res, 'tbl_offer', data);

    }
}


