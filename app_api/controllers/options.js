var common = require("./commonApi");

//Offer type
var offerTypeOptionsFr = {
    //"0": "Tous",
    "1": "Graduate programme",
    "2": "CDI",
    "3": "CDD",
    "4": "Stage pre-embauche",
    "5": "Stage cesure",
    "6": "Summer internship",
    "7": "Spring internship",
};
var offerTypeOptionsEn = {
    //"0": "All",
    "1": "Graduate programme",
    "2": "CDI",
    "3": "CDD",
    "4": "Stage pre-embauche",
    "5": "Stage cesure",
    "6": "Summer internship",
    "7": "Spring internship",
};

//Sector

var buysideOptionsEn = {
    "1": "Hedge Fund",
    "2": "Insurance",
    "3": "Portfolio Management",
    "4": "Marketing & Sales",
    "5": "Private Banking",
    "6": "Risk & Reporting",
    "99": "Other",
};

var corporateBankingOptionsEn = {
    "1": "Coverage & Origination",
    "2": "Retail",
    "3": "Credit & Risk Analysis",
    "4": "Microfinance",
    "99": "Other",
};

var corporateFinanceOptionsEn = {
    "1": "M&A",
    "2": "DCM",
    "3": "PE",
    "4": "Coverage & Origination",
    "5": "Structured Finance",
    "6": "Real Estate",
    "99": "Other",
};

var financialAnalysisOptionsEn = {
    "1": "External Audit",
    "2": "Controlling",
    "3": "Financial Analysis",
    "4": "Business Analysis",
    "5": "Internal Audit",
    "6": "Consultancy",
    "7": "Transaction Services",
    "8": "Financial Advisory",
    "99": "Other",
};

var financialMarketsOptionsEn = {
    "1": "Trading",
    "2": "Sales",
    "3": "Research",
    "4": "Risk",
    "5": "Middle Office",
    "6": "Rotation",
    "7": "Structuring",
    "8": "Hedging",
    "99": "Other",
};

var transversalOptionsEn = {
    "1": "Risk",
    "2": "Compliance",
    "3": "Legal",
    "4": " Sales & Marketing",
    "5": "IT",
    "99": "Other",
};

var sectorOptionsEn = {
    "1": {"label" : "Buyside", "positions" : buysideOptionsEn},
    "2": {"label" : "Corporate Banking", "positions" : corporateBankingOptionsEn},
    "3": {"label" : "Corporate Finance", "positions" : corporateFinanceOptionsEn},
    "4": {"label" : "Financial Analysis, Control, Audit, Consultancy", "positions" : financialAnalysisOptionsEn},
    "5": {"label" : "Financial Markets", "positions" : financialMarketsOptionsEn},
    "6": {"label" : "Transversal Functions", "positions" : transversalOptionsEn},
    "99": {"label" : "Other", "positions" : {"99": "Other"}},
};

var sectorOptionsFr = {
    "1": {"label" : "Buyside", "positions" : buysideOptionsEn},
    "2": {"label" : "Corporate Banking", "positions" : corporateBankingOptionsEn},
    "3": {"label" : "Corporate Finance", "positions" : corporateFinanceOptionsEn},
    "4": {"label" : "Financial Analysis, Control, Audit, Consultancy", "positions" : financialAnalysisOptionsEn},
    "5": {"label" : "Financial Markets", "positions" : financialMarketsOptionsEn},
    "6": {"label" : "Transversal Functions", "positions" : transversalOptionsEn},
    "99": {"label" : "Other", "positions" : {"99": "Other"}},
};



// var sectorOptionsFr = {
//     "0": "Indifferent",
//     "1": "Fusions et acquisitions",
//     "2": "Audit",
//     "3": "Transaction services",
//     "4": "DCM",
//     "5": "ECM",
//     "6": "Coverage/Origination",
//     "7": "Structured finance",
//     "8": "Private banking/wealth management",
//     "9": "Spring/Summer internships/Graduate programmes",
//     "10": "Coverage/Origination",
// };
// var sectorOptionsEn = {
//     "0": "Any",
//     "1": "M&A, Private equity",
//     "2": "Audit",
//     "3": "Transaction services",
//     "4": "DCM",
//     "5": "ECM",
//     "6": "Coverage/Origination",
//     "7": "Structured finance",
//     "8": "Private banking/wealth management",
//     "9": "Spring/Summer internships/Graduate programmes",
//     "10": "Coverage/Origination",
// };

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
};

var interviewTypeOptionsEn = {
    "1": "Simulation",
    "2": "Offer",
};

//Sequence tag
var sequenceTagOptionsFr = {
    "1": "DCF",
    "2": "Consolidation",
    "3": "Methodes de valorisation",
    "4": "LBO"
};

var sequenceTagOptionsEn = {
    "1": "DCF",
    "2": "Consolidation",
    "3": "Methodes de valorisation",
    "4": "LBO"
};

//appreciations
var appreciationsOptionsFr = {
    "1": "Standard",
    "2": "Tres bien",
    "3": "Exceptionnel",
};

var appreciationsOptionsEn = {
    "1": "Standard",
    "2": "Very good",
    "3": "Exceptional",
};

var jobTypeOptionsFr = {
    "1": "Penultimate year",
    "2": "Final year",

};

var jobTypeOptionsEn = {
    "1": "Avant-derniere annee",
    "2": "Derniere annee",
};


//language
var languageOptionsFr = {
    //"" : 'Tous',
    "en": "Anglais",
    "fr": "Francais",
};

var languageOptionsEn = {
    //"" : 'All',
    "en": "English",
    "fr": "French",
};

var optionsFr = {
    sectorOptions: sectorOptionsFr,
    interviewStatusOptions: interviewStatusOptionsFr,
    interviewTypeOptions: interviewTypeOptionsFr,
    sequenceTagOptions: sequenceTagOptionsFr,
    appreciationsOptions: appreciationsOptionsFr,
    offerTypeOptions: offerTypeOptionsFr,
    companyTypeOptions: companyTypeOptionsFr,
    languageOptions: languageOptionsFr,
    jobTypeOptions: jobTypeOptionsFr,

};

var optionsEn = {
    sectorOptions: sectorOptionsEn,
    interviewStatusOptions: interviewStatusOptionsEn,
    interviewTypeOptions: interviewTypeOptionsEn,
    sequenceTagOptions: sequenceTagOptionsEn,
    appreciationsOptions: appreciationsOptionsEn,
    offerTypeOptions: offerTypeOptionsEn,
    companyTypeOptions: companyTypeOptionsEn,
    languageOptions: languageOptionsEn,
    jobTypeOptions: jobTypeOptionsEn,
};

//for locale stuff
module.exports.options =  {"en": optionsEn, "fr": optionsFr};

//to cache all the options and avoid calling the separate methods all the time
module.exports.getAllOptions = function (req, res) {

    common.sendJsonResponse(res, 200, true, null, null, {"en": optionsEn, "fr": optionsFr});
};


module.exports.getSectorOptions = function (req, res) {

    common.sendJsonResponse(res, 200, true, null, null,  {"en": sectorOptionsEn, "fr": sectorOptionsFr} );
};

module.exports.getInterviewStatusOptions = function (req, res) {

    common.sendJsonResponse(res, 200, true, null, null,  {"en": interviewStatusOptionsEn, "fr": interviewStatusOptionsFr} );

};

module.exports.getInterviewTypeOptions = function (req, res) {

    common.sendJsonResponse(res, 200, true, null, null,  {"en": interviewTypeOptionsEn, "fr": interviewTypeOptionsFr} );

};

module.exports.getSequenceTagOptions = function (req, res) {

    common.sendJsonResponse(res, 200, true, null, null,  {"en": sequenceTagOptionsEn, "fr": sequenceTagOptionsFr} );

};
