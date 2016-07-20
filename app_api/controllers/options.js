var common = require("./common");

//Offer type
var offerTypeOptionsFr = {
    "0": "Tous",
    "1": "Graduate programme",
    "2": "CDI",
    "3": "CDD",
    "4": "Stage pre-embauche",
    "5": "Stage cesure",
    "6": "Summer internship",
    "7": "Spring internship",
};
var offerTypeOptionsEn = {
    "0": "All",
    "1": "Graduate programme",
    "2": "CDI",
    "3": "CDD",
    "4": "Stage pre-embauche",
    "5": "Stage cesure",
    "6": "Summer internship",
    "7": "Spring internship",
};

//Sector
var sectorOptionsFr = {
    "1": "Fusions et acquisitions",
    "2": "Audit",
    "3": "Transaction services",
    "4": "DCM",
    "5": "ECM",
    "6": "Coverage/Origination",
    "7": "Structured finance",
    "8": "Private banking/wealth management",
    "9": "Spring/Summer internships/Graduate programmes",
    "10": "Coverage/Origination",
};
var sectorOptionsEn = {
    "1": "M&A, Private equity",
    "2": "Audit",
    "3": "Transaction services",
    "4": "DCM",
    "5": "ECM",
    "6": "Coverage/Origination",
    "7": "Structured finance",
    "8": "Private banking/wealth management",
    "9": "Spring/Summer internships/Graduate programmes",
    "10": "Coverage/Origination",
};

//Company types
var companyTypeOptionsFr = {
    "1": "Banque francaise",
    "2": "Banque internationale",
    "3": "Cabinet d'audit",
    "4": "Fonds Private Equity/Venture Capital",
    "5": "Corporate",
    "6": "Fintech/Startup",
};
var companyTypeOptionsEn = {
    "1": "French bank",
    "2": "International bank",
    "3": "Cabinet d'audit",
    "4": "Fonds Private Equity/Venture Capital",
    "5": "Corporate",
    "6": "Fintech/Startup",
};

//Interview status
var interviewStatusOptionsFr = {
    "1": "Demande",
    "2": "Rendez vous pris",
};

var interviewStatusOptionsEn = {
    "1": "Proposed",
    "2": "Booked",
};

//Interview type
var interviewTypeOptionsFr = {
    "1": "Simulation",
    "2": "Offre",
}

var interviewTypeOptionsEn = {
    "1": "Simulation",
    "2": "Offer",
}

//Sequence tag
var sequenceTagOptionsFr = {
    "1": "DCF",
    "2": "Consolidation",
    "3": "Methodes de valorisation",
    "4": "LBO"
}

var sequenceTagOptionsEn = {
    "1": "DCF",
    "2": "Consolidation",
    "3": "Methodes de valorisation",
    "4": "LBO"
}

//appreciations
var appreciationsOptionsFr = {
    "1": "Standard",
    "2": "Tres bien",
    "3": "Exceptionnel",
}

var appreciationsOptionsEn = {
    "1": "Standard",
    "2": "Very good",
    "3": "Exceptional",
}

var optionsFr = {
    sectorOptions: sectorOptionsFr,
    interviewStatusOptions: interviewStatusOptionsFr,
    interviewTypeOptions: interviewTypeOptionsFr,
    sequenceTagOptions: sequenceTagOptionsFr,
    appreciationsOptions: appreciationsOptionsFr,
    offerTypeOptions: offerTypeOptionsFr,
}

var optionsEn = {
    sectorOptions: sectorOptionsEn,
    interviewStatusOptions: interviewStatusOptionsEn,
    interviewTypeOptions: interviewTypeOptionsEn,
    sequenceTagOptions: sequenceTagOptionsEn,
    appreciationsOptions: appreciationsOptionsEn,
    offerTypeOptions: offerTypeOptionsEn,
}

//for locale stuff
module.exports.options = optionsEn;

//to cache all the options and avoid calling the separate methods all the time
module.exports.getAllOptions = function (req, res) {

    common.sendJsonResponse(res, 200, true, null, null, {"en": optionsEn, "fr": optionsFr});
}


module.exports.getSectorOptions = function (req, res) {

    common.sendJsonResponse(res, 200, true, null, null, sectorOptionsEn);
};

module.exports.getInterviewStatusOptions = function (req, res) {

    common.sendJsonResponse(res, 200, true, null, null, interviewStatusOptionsEn);

}

module.exports.getInterviewTypeOptions = function (req, res) {

    common.sendJsonResponse(res, 200, true, null, null, interviewTypeOptionsEn);

}

module.exports.getSequenceTagOptions = function (req, res) {

    common.sendJsonResponse(res, 200, true, null, null, sequenceTagOptionsEn);

}