var common = require('./common');

var sectorOptions =  {
    '1' : 'M&A, Private equity',
    '2' : 'Audit',
    '3' : 'Transaction services',
    '4' : 'DCM',
};

var interviewStatusOptions =  {
    '1' : 'Proposed',
    '2' : 'Booked',
};

var interviewTypeOptions = {
    '1' : 'Simulation',
    '2' : 'Offer',
}

var sequenceTagOptions = {
    '1' : 'DCF',
    '2' : 'Consolidation',
    '3' : 'Methodes de valorisation',
    '4' : 'LBO'
}

var appreciationsOptions = {
    '1' : 'Standard',
    '2' : 'Very good',
    '3' : 'Exceptional',
}

var options = {
    sectorOptions : sectorOptions,
    interviewStatusOptions: interviewStatusOptions,
    interviewTypeOptions: interviewTypeOptions,
    sequenceTagOptions : sequenceTagOptions,
    appreciationsOptions: appreciationsOptions,
}

//for locale stuff
module.exports.options = options

//to cache all the options and avoid calling the separate methods all the time
module.exports.getAllOptions = function(req, res){

    common.sendJsonResponse(res,  200, true, null, null, options);
}


module.exports.getSectorOptions = function(req, res){

    common.sendJsonResponse(res,  200, true, null, null, sectorOptions);
};

module.exports.getInterviewStatusOptions = function(req, res){

    common.sendJsonResponse(res,  200, true, null, null, interviewStatusOptions);

}

module.exports.getInterviewTypeOptions = function(req, res){

    common.sendJsonResponse(res,  200, true, null, null,  interviewTypeOptions);

}

module.exports.getSequenceTagOptions = function(req, res){

    common.sendJsonResponse(res,  200, true, null, null,  sequenceTagOptions);

}