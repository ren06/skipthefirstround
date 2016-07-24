var common = require('./common');
var options = require('./options');

var addTextLabel = function(entry, language){

    entry['sectorText'] = options.options[language].sectorOptions[entry.sector];
    entry['offerTypeText'] = options.options[language].offerTypeOptions[entry.offer_type];
    entry['companyTypeText'] = options.options[language].companyTypeOptions[entry.company_type];
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

    if(typeof data !== 'undefined') {

        var offers = data[0].offers;

        offers.forEach(function (entry) {

            addTextLabel(entry, language);

        });
    }

    return data;
};



var addText2 = function(data, req){

    var language = req.header('Accept-Language');

    console.log(language);
    if(language.length > 2) {
        language = language.substring(0, 2);
    }
    if(!language){
        language = 'en';
    }

    if(typeof data !== 'undefined') {

        var offer = data[0];

        addTextLabel(offer, language);

        return offer;
    }
};

module.exports.offerCreate = function(req, res){

    var data = req.body;

    console.log(data)
    if (!common.checkParametersPresent('sector, offerType, companyType, location, text, language', data)) {

        common.sendJsonResponse(res, 400, false, 'Missing input', res.__('OfferCreateMissingInput'), null);
    }
    else {
        console.log(data);
        common.rowInsert(req, res, 'tbl_offer', data);

    }
};


module.exports.offerReadOne = function(req, res){

    var offerId = req.params.offerId;


    if (!offerId) {

        common.sendJsonResponse(res, 400, false, 'Missing input', res.__('OfferReadMissingInput'), null);
    }
    else {

        common.readOne(req, res, 'tbl_offer', offerId, addText2);

    }
};


module.exports.offerLocationsList = function(req, res){

    var queryString = "SELECT DISTINCT location FROM tbl_offer GROUP BY location";

    common.dbHandleQuery(req, res, queryString, null, null, 'Error', 'Error', function(results){

        var data = {};

        results.forEach(function(entry){

            data[ entry.location] = entry.location;
        });

        common.sendJsonResponse(res, 200, true, null, null, data);

    });

};

module.exports.offerSearchForRecruiter = function(req, res){

    var parameters = req.params;

    var queryString = "SELECT * FROM tbl_offer o INNER JOIN tbl_interview i ON i.id_offer = o.id INNER JOIN tbl_video v ON i.id_video = v.id";


    common.dbHandleQuery(req, res, queryString, null, null, 'Error', 'Error', function(results){

        common.sendJsonResponse(res, 200, true, null, null, data);

    });

};

module.exports.offerSearchForUser = function(req, res){

    console.log(req.query);

    var whereClause = common.convertQueryToWhereClause(req.query);

    var queryString = "SELECT * FROM tbl_offer " + whereClause;

    console.log(queryString);

    common.dbHandleQuery(req, res, queryString, null, null, 'Error', 'Error', function(results){

        common.sendJsonResponse(res, 200, true, null, null, results);

    });
};

module.exports.listOffers = function(req, res){

    var data = req.body;

    console.log(data)
    if (!common.checkParametersPresent('sector, offerType, companyType, location, text, language', data)) {

        common.sendJsonResponse(res, 400, false, 'Missing input', res.__('OfferCreateMissingInput'), null);
    }
    else {

        common.rowInsert(req, res, 'tbl_offer', data);

    }
};



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
                'offer_type', o.offer_type, \
                'company_type', o.company_type, \
                'location', o.location, \
                'text', o.text, \
                'language', o.language \
                ) \
                FROM tbl_offer o INNER JOIN tbl_recruiter r ON o.id_recruiter = r.id ORDER BY o.id ASC) AS offers \
                FROM tbl_recruiter r \
                WHERE r.id = $1";


        common.dbHandleQuery(req, res, queryString, [recruiterId], addText, 'Error', 'Error', null);

    }

};





