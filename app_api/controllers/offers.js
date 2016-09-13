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

    var language = common.getLanguage(req);

    if(typeof data !== 'undefined' && data.length > 0) {

        data.forEach(function(entry){

            addTextLabel(entry, language);

        });
    }

};

//used when data structure is like: "data": [{"offers": [ ...] }]
var addTextOffers = function(data, req){

    var language = common.getLanguage(req);

    var offers = data[0].offers;
    console.log(offers);

    if(typeof offers !== 'undefined' && offers.length > 0) {

        offers.forEach(function(entry){

            addTextLabel(entry, language);

        });
    }

};

var addTextOffersSequence = function(data, req){

    var language = common.getLanguage(req);

    var offers = data[0].offers;
    console.log(offers);

    if(typeof offers !== 'undefined' && offers.length > 0) {

        offers.forEach(function(entry){

            addTextLabel(entry, language);

        });
    }

    var sequences = data[0].sequences;

    if(typeof sequences !== 'undefined' && sequences.length > 0) {

        sequences.forEach(function(entry){

            entry['tagText'] = options.options[language].sequenceTagOptions[entry.tag];
            entry['appreciationText'] = options.options[language].appreciationsOptions[entry.appreciation];


        });
    }

    var interview = data[0];

    interview['appreciationText'] = options.options[language].appreciationsOptions[interview.appreciation];

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

module.exports.offersModifyOne = function(req, res){

    var offerId = req.params.offerId;

    if (!offerId) {

        common.sendJsonResponse(res, 400, false, 'Missing input', res.__('OfferModifyMissingInput'), null);
    }
    else {
        console.log(req.body);
        common.rowUpdate(req, res, 'tbl_offer', offerId, req.body);
    }
};

module.exports.offerReadOneForUser = function(req, res){

    var offerId = req.params.offerId;
    var userId = req.params.userId;

    if (!offerId || !userId) {

        common.sendJsonResponse(res, 400, false, 'Missing input', res.__('OfferReadMissingInput'), null);
    }
    else{
//SELECT o.id as offerId, i.id, i.id_user, o.text FROM tbl_offer o LEFT JOIN tbl_interview i ON i.id_offer = o.id AND i.id_user = 41 WHERE o.id = 9
        var queryString =  "SELECT o.*, i.id_user, CASE WHEN i.id_user IS NOT NULL THEN true ELSE false END AS already_applied FROM tbl_offer o LEFT JOIN tbl_interview i ON i.id_offer = o.id AND i.id_user = $1 WHERE o.id = $2";

        console.log(queryString);

        common.dbHandleQuery(req, res, queryString, [userId, offerId], addTextOffersSequence, null, null);
    }
};


module.exports.offersList = function(req, res){

    common.readAll(req, res, 'tbl_offer', addText, 'id');
};

module.exports.offerReadOneVideos = function(req, res){

    var offerId = req.params.offerId;

    if (!offerId) {

        common.sendJsonResponse(res, 400, false, 'Missing input', res.__('OfferReadMissingInput'), null);
    }
    else {

        //var queryString = "SELECT * FROM tbl_interview i INNER JOIN tbl_sequence s ON s.id_interview = i.id INNER JOIN tbl_video v ON v.id = s.id_video WHERE i.id_offer = $1";

        var queryString = "SELECT i.*, row_to_json(v.*) as video, row_to_json(o.*) as offer, row_to_json(u.*) as user, \
            ARRAY(SELECT json_build_object( \
            'id',s.id, \
            'tag', s.tag, \
            'summary', s.summary, \
            'visible', s.visible, \
            'appreciation', s.appreciation, \
            'video', json_build_object( \
                'provider', v.provider, \
                'provider_unique_id', v.provider_unique_id, \
                'provider_cloud_name', v.provider_cloud_name, \
                'url', v.url \
            ) \
        ) \
        FROM tbl_sequence s LEFT JOIN tbl_video v ON v.id = s.id_video WHERE s.id_interview = i.id \
        ) as sequences \
        FROM tbl_interview i \
        INNER JOIN tbl_offer o ON i.id_offer = o.id \
        INNER JOIN tbl_video v ON i.id_video = v.id \
        INNER JOIN tbl_user u ON i.id_user = u.id \
        WHERE o.id = $1";

        console.log(queryString);

        common.dbHandleQuery(req, res, queryString, [offerId], addTextOffersSequence, null, null, function(results){

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

    var queryString = "SELECT DISTINCT o.*, CASE WHEN i.id_user IS NOT NULL THEN true ELSE false END AS already_applied FROM tbl_offer o LEFT JOIN tbl_interview i ON i.id_offer = o.id AND i.id_user = $1 " + whereClause + " ORDER BY o.id DESC";

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
                'apply_count', (SELECT COUNT(*) FROM tbl_interview i WHERE i.id_offer = o.id),\
                'video_count', (SELECT COUNT(*) FROM tbl_interview i INNER JOIN tbl_video v on i.id_video = v.id WHERE i.id_offer = o.id)\
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





