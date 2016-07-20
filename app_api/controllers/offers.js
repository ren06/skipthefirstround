var common = require('./common');
var options = require('./options');

module.exports.createOffer = function(req, res){

    var data = req.body;

    console.log(data)
    if (!common.checkParametersPresent('sector, offerType, companyType, location, text, language', data)) {

        common.sendJsonResponse(res, 400, false, 'Missing input', res.__('OfferCreateMissingInput'), null);
    }
    else {

        common.rowInsert(req, res, 'tbl_offer', data);

    }
}

module.exports.listOffers = function(req, res){

    var data = req.body;

    console.log(data)
    if (!common.checkParametersPresent('sector, offerType, companyType, location, text, language', data)) {

        common.sendJsonResponse(res, 400, false, 'Missing input', res.__('OfferCreateMissingInput'), null);
    }
    else {

        common.rowInsert(req, res, 'tbl_offer', data);

    }
}

var addText = function(data, req){

    var language = req.header('Accept-Language');

    console.log(language);
    if(language.length > 2) {
        language = language.substring(0, 2);
    }
    if(!language){
        language = 'en';
    }

    var offers = data[0].offers;

    offers.forEach(function(entry) {

        entry['sectorText'] = options.options[language].sectorOptions[entry.sector];
        entry['offerTypeText'] = options.options[language].offerTypeOptions[entry.offerType];
        entry['companyTypeText'] = options.options[language].companyTypeOptions[entry.companyType];

    });

    return data;
}

module.exports.offersListByRecruiter = function(req, res){

    var recruiterId = req.params.recruiterId;

    if (!recruiterId) {

        common.sendJsonResponse(res, 400, false, 'Missing input', res.__('RecruiterIdMissingInput'), null);
    }
    else {

        var queryString =
            "SELECT (SELECT row_to_json(_) FROM (SELECT r.id, r.email, r.first_name, r.last_name, r.mobile_phone, r.company, r.language) as _) AS recruiter, ARRAY(SELECT json_build_object( \
                'idRecruiter', o.id_recruiter, \
                'sector', o.sector, \
                'offerType', o.offer_type, \
                'companyType', o.company_type, \
                'location', o.location, \
                'text', o.text, \
                'language', o.language \
                ) \
                FROM tbl_offer o INNER JOIN tbl_recruiter r ON o.id_recruiter = r.id ORDER BY o.id ASC) AS offers \
                FROM tbl_recruiter r \
                WHERE r.id = $1";


        common.dbHandleQuery(req, res, queryString, [recruiterId], addText, 'Error', 'Error', null);

    }

}





