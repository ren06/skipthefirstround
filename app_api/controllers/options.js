var common = require("./commonApi");

//**************
//** Offer type
//**************
var offerTypeOptionsFr = {

    "1": "Graduate programme",
    "2": "CDI",
    "3": "CDD",
    "4": "Stage pré-embauche",
    "5": "Stage",
    "6": "Summer internship",
    "7": "Spring internship",
};
var offerTypeOptionsEn = {

    "1": "Graduate programme",
    "2": "CDI",
    "3": "CDD",
    "4": "Stage pré-embauche",
    "5": "Stage",
    "6": "Summer internship",
    "7": "Spring internship",
};

//**************
//** Sector
//**************

var buysideOptionsEn = {
    "1": "Hedge Fund",
    "2": "Insurance",
    "3": "Portfolio Management",
    "4": "Marketing & Sales",
    "5": "Private Banking",
    "6": "Risk & Reporting",
    "99": "Other",
};
var buysideOptionsFr = {
    "1": "Hedge Fund",
    "2": "Insurance",
    "3": "Portfolio Management",
    "4": "Marketing & Sales",
    "5": "Private Banking",
    "6": "Risk & Reporting",
    "99": "Autre",
};

var corporateBankingOptionsEn = {
    "1": "Coverage & Origination",
    "2": "Retail",
    "3": "Credit & Risk Analysis",
    "4": "Microfinance",
    "99": "Other",
};
var corporateBankingOptionsFr = {
    "1": "Coverage & Origination",
    "2": "Retail",
    "3": "Credit & Risk Analysis",
    "4": "Microfinance",
    "99": "Autre",
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
var corporateFinanceOptionsFr = {
    "1": "M&A",
    "2": "DCM",
    "3": "PE",
    "4": "Coverage & Origination",
    "5": "Structured Finance",
    "6": "Real Estate",
    "99": "Autre",
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
var financialAnalysisOptionsFr = {
    "1": "External Audit",
    "2": "Controlling",
    "3": "Financial Analysis",
    "4": "Business Analysis",
    "5": "Internal Audit",
    "6": "Consultancy",
    "7": "Transaction Services",
    "8": "Financial Advisory",
    "99": "Autre",
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
var financialMarketsOptionsFr = {
    "1": "Trading",
    "2": "Sales",
    "3": "Research",
    "4": "Risk",
    "5": "Middle Office",
    "6": "Rotation",
    "7": "Structuring",
    "8": "Hedging",
    "99": "Autre",
};

var transversalOptionsEn = {
    "1": "Risk",
    "2": "Compliance",
    "3": "Legal",
    "4": " Sales & Marketing",
    "5": "IT",
    "99": "Other",
};
var transversalOptionsFr = {
    "1": "Risk",
    "2": "Compliance",
    "3": "Legal",
    "4": " Sales & Marketing",
    "5": "IT",
    "99": "Autre",
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
    "1": {"label" : "Buyside", "positions" : buysideOptionsFr},
    "2": {"label" : "Corporate Banking", "positions" : corporateBankingOptionsFr},
    "3": {"label" : "Corporate Finance", "positions" : corporateFinanceOptionsFr},
    "4": {"label" : "Financial Analysis, Control, Audit, Consultancy", "positions" : financialAnalysisOptionsFr},
    "5": {"label" : "Financial Markets", "positions" : financialMarketsOptionsFr},
    "6": {"label" : "Transversal Functions", "positions" : transversalOptionsFr},
    "99": {"label" : "Autre", "positions" : {"99": "Autre"}},
};


//*****************
//** Company types
//*****************
var companyTypeOptionsFr = {
    "1": "French bank",
    "2": "International bank",
    "3": "M&A Boutique",
    "4": "Hedge Fund",
    "5": "Audit firm",
    "6": "PE/VC funds",
    "7": "Corporate",
    "8": "Fintech/start-up",
};
var companyTypeOptionsEn = {
    "1": "French bank",
    "2": "International bank",
    "3": "M&A Boutique",
    "4": "Hedge Fund",
    "5": "Audit firm",
    "6": "PE/VC funds",
    "7": "Corporate",
    "8": "Fintech/start-up",
};

//******************
//**Interview status
//******************
var interviewStatusOptionsFr = {
    "1": "A confirmer",
    "2": "Rendez vous pris",
    "3": "Realisee",
};
var interviewStatusOptionsEn = {
    "1": "To be confirmed",
    "2": "Scheduled",
    "3": "Completed",
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
    "3": "Méthodes de valorisation",
    "4": "LBO"
};

var sequenceTagOptionsEn = {
    "1": "DCF",
    "2": "Consolidation",
    "3": "Méthodes de valorisation",
    "4": "LBO"
};

//appreciations
var appreciationsOptionsFr = {
    "1": "Standard",
    "2": "Très bien",
    "3": "Exceptionnel",
};

var appreciationsOptionsEn = {
    "1": "Standard",
    "2": "Very good",
    "3": "Exceptional",
};

var jobTypeOptionsEn = {
    "1": "Penultimate year",
    "2": "Final year",

};
var jobTypeOptionsFr = {
    "1": "Avant-dernière année",
    "2": "Dernière année",
};


//language
var languageOptionsFr = {
    "en": "Anglais",
    "fr": "Français",
};

var languageOptionsEn = {
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
