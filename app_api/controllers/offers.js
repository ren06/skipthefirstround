var common = require('./commonApi');
var options = require('./options');

var addTextLabel = function(entry, language){

    entry['sectorText'] = options.options[language].sectorOptions[entry.sector].label;
    entry['positionText'] = options.options[language].sectorOptions[entry.sector].positions[entry.position];
    entry['offerTypeText'] = options.options[language].offerTypeOptions[entry.offer_type];
    entry['companyTypeText'] = options.options[language].companyTypeOptions[entry.company_type];
    entry['languageText'] = options.options[language].languageOptions[entry.language];


};

var addText = function(data, req){

    var language = req.header('Accept-Language');

    if(language.length > 2) {
        language = language.substring(0, 2);
    }
    if(!language){
        language = 'en';
    }
    if(typeof data !== 'undefined' && data.length > 0) {

        data.forEach(function(entry){

            addTextLabel(entry, language);

        });
    }

};

//used when data structure is like: "data": [{"offers": [ ...] }]
var addTextOffers = function(data, req){

    var language = req.header('Accept-Language');

    if(language.length > 2) {
        language = language.substring(0, 2);
    }
    if(!language){
        language = 'en';
    }

    var offers = data[0].offers;
    console.log(offers);

    if(typeof offers !== 'undefined' && offers.length > 0) {

        offers.forEach(function(entry){

            addTextLabel(entry, language);

        });
    }

};

module.exports.offerCreate = function(req, res){

    var data = req.body;

    console.log(data);
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

        common.readOne(req, res, 'tbl_offer', offerId, addText);

    }
};

module.exports.offerReadOneVideos = function(req, res){

    var offerId = req.params.offerId;


    if (!offerId) {

        common.sendJsonResponse(res, 400, false, 'Missing input', res.__('OfferReadMissingInput'), null);
    }
    else {

        var queryString = "SELECT * FROM tbl_interview i INNER JOIN tbl_sequence s ON s.id_interview = i.id INNER JOIN tbl_video v ON v.id = s.id_video WHERE i.id_offer = $1";

        console.log(queryString);

        common.dbHandleQuery(req, res, queryString, [offerId], addText, null, null, function(results){

            common.sendJsonResponse(res, 200, true, null, null, results);

        });

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

//TODO should not be used anymore, recruiters cannot see offers of others
//TODO another method to see videos of their posted offers
module.exports.offerSearchForRecruiter = function(req, res){

    var parameters = req.params;

    var queryString = "SELECT * FROM tbl_offer o INNER JOIN tbl_interview i ON i.id_offer = o.id INNER JOIN tbl_sequence s ON s.id_interview = i.id INNER JOIN tbl_video v ON v.id = s.id_video";

    common.dbHandleQuery(req, res, queryString, parameters, addText, 'Error', 'Error', function(results){

        common.sendJsonResponse(res, 200, true, null, null, results);

    });

};

module.exports.offerSearchForGuest = function(req, res){

    var whereClause = common.convertQueryToWhereClause(req.query, 'o');

    var queryString = "SELECT o.* FROM tbl_offer o " + whereClause;

    console.log(queryString);

    common.dbHandleQuery(req, res, queryString, null, addText, 'Error', 'Error', function(results){

        common.sendJsonResponse(res, 200, true, null, null, results);

    });
};

module.exports.offerSearchForUser = function(req, res){

    var userId = req.params.userId;
    console.log(req.query);

    var whereClause = common.convertQueryToWhereClause(req.query, 'o');

    var queryString = "SELECT o.* FROM tbl_offer o LEFT JOIN tbl_interview i ON i.id_offer = o.id AND i.id_user = $1 " + whereClause;

    console.log(queryString);

    common.dbHandleQuery(req, res, queryString, [userId], addText, 'Error', 'Error', function(results){

        common.sendJsonResponse(res, 200, true, null, null, results);

    });
};

module.exports.listOffers = function(req, res){

    var data = req.body;

    console.log(data);
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
                'id', o.id,\
                'idRecruiter', o.id_recruiter, \
                'sector', o.sector, \
                'position', o.position, \
                'offer_type', o.offer_type, \
                'company_type', o.company_type, \
                'location', o.location, \
                'text', o.text, \
                'language', o.language, \
                'created', o.created,\
                'apply_count', (SELECT COUNT(*) FROM tbl_interview i WHERE i.id_offer = o.id)\
                ) \
                FROM tbl_offer o INNER JOIN tbl_recruiter r ON o.id_recruiter = r.id ORDER BY o.id ASC) AS offers \
                FROM tbl_recruiter r \
                WHERE r.id = $1";


        common.dbHandleQuery(req, res, queryString, [recruiterId], addTextOffers, 'Error', 'Error', null);

    }

};

module.exports.searchVideos = function(req, res){

    var userId = req.params.userId;
    console.log(req.query);

    var whereClause = common.convertQueryToWhereClause(req.query, 'o');

    var queryString = "SELECT o.* FROM tbl_offer o LEFT JOIN tbl_interview i ON i.id_offer = o.id AND i.id_user = $1 " + whereClause;

    console.log(queryString);

    common.dbHandleQuery(req, res, queryString, [userId], addText, 'Error', 'Error', function(results){

        common.sendJsonResponse(res, 200, true, null, null, results);

    });
};





