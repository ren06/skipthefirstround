var request = require('request');
var common = require('./common');
var moment = require('moment');
var cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: 'dzfmkzqdo',
    api_key: '577639826413541',
    api_secret: 'i7mJdBgVzasUcF0bMW7Kyzl0QC0'
    //environement variable: CLOUDINARY_URL=cloudinary://577639826413541:i7mJdBgVzasUcF0bMW7Kyzl0QC0@dzfmkzqdo
});

module.exports.homepage = function(req, res){

    res.render('admin/homepage', {
        title: 'Homepage',

    });

};

module.exports.usersList = function(req, res){


    var requestOptions = common.getRequestOptions(req, '/api/users', 'GET');

    request(requestOptions, function (err, response, body) {

        if (response.statusCode === 200) {

            var users = body.data;

            var requestOptions = common.getRequestOptions(req, '/api/interviewers', 'GET');

            res.render('admin/students-list', {
                users: users,
                title: 'Users List',

            });

        }
        else{
            common.showError(req, res, response.statusCode);
        }
    });

};

module.exports.etudiant = function(req, res){

    console.log('menu etudiants');
    res.render('admin/student-menu', {
        title: 'Homepage',

    });

};


module.exports.ajoutEntretien = function(req, res){

    console.log('etudiants');
    res.render('admin/student-add-interview', {
        title: 'Homepage',

    });

};

module.exports.studentInterviewsList = function(req, res){

    console.log('');
    res.render('admin/student-interviews-list', {
        title: 'Homepage',

    });

};

module.exports.studentsInterviewsList = function(req, res){

    var language = req.cookies.locale
    
    var requestOptions = common.getRequestOptions(req, '/api/interviews', 'GET', {}, false);

    request(requestOptions, function (err, response, body) {
        console.log(body);
        var interviews = body.data;
     
        res.render('admin/students-interviews-list', {
            title: 'Homepage',
            interviews: interviews

        });
    });

};

var renderInterview = function(req, res, editMode){

    var interviewId = req.params.interviewId;

    var requestOptions = common.getRequestOptions(req, '/api/interview/' + interviewId);

    request(requestOptions, function (err, response, body) {

        var interview = body.data[0];

        var sectorOptions = req.app.locals.options[res.getLocale()].sectorOptions;
        var tagOptions = req.app.locals.options[res.getLocale()].tagOptions;
        var interviewTypeOptions = req.app.locals.options[res.getLocale()].interviewTypeOptions;
        var interviewStatusOptions = req.app.locals.options[res.getLocale()].interviewStatusOptions;

        requestOptions = common.getRequestOptions(req, '/api/interviewers', 'GET', {}, false);

        request(requestOptions, function (err, response, body) {

            var interviewers = body.data;

            res.render('admin/interview', {
                interview: interview,
                title: 'Homepage',
                sectorOptions: sectorOptions,
                interviewTypeOptions: interviewTypeOptions,
                interviewStatusOptions: interviewStatusOptions,
                interviewers: interviewers,
                editMode: editMode,
            });
        });
    });
}

module.exports.interview = function(req, res){

    renderInterview(req, res, false);

}

module.exports.interviewModify = function(req, res){

    renderInterview(req, res, true);
}


var renderInterviewModifyDate = function(req, res, formData, error){

    console.log('renderINtervew error: ' + error);
    var interviewId = req.params.interviewId;

    var requestOptions = common.getRequestOptions(req, '/api/interview/' + interviewId, 'GET', {}, false);

    request(requestOptions, function (err, response, body) {

        if (response.statusCode === 200) {

            var interview = body.data[0];

            var requestOptions = common.getRequestOptions(req, '/api/interviewers', 'GET', {}, false);

            request(requestOptions, function (err, response, body) {

                if (response.statusCode === 200) {

                    var interviewers = body.data;
                    var sectorOptions = req.app.locals.options[res.getLocale()].sectorOptions;

                    res.render('admin/interview-modify-date', {
                        formData: formData,
                        interview: interview,
                        interviewers: interviewers,
                        title: 'Homepage',
                        sectorOptions: sectorOptions,
                        error: error,
                    });
                }
                else{
                    common.showError(req, res, response.statusCode);
                }
            });
        }
        else{
            common.showError(req, res, response.statusCode);
        }
    });
}

module.exports.doInterviewModify = function(req, res){

    console.log('saved');

    console.log(req.body);

    var interviewId = req.body.interviewId;
    var date = req.body.date;
    var hour = req.body.hour;
    var minute = req.body.minute;
    var type = req.body.type;
    var sector = req.body.sector;
    var interviewerId = req.body.interviewerId;
    var appreciation = req.body.appreciation;
    var status = req.body.status;
    var position = req.body.position;
    var company = req.body.company;
    var videoId = req.body.videoId;


    var dateTimeDb = moment(date + ' ' + hour + ':' + minute, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');

    var postData = {
        dateTime: dateTimeDb,
        type: type,
        sector: sector,
        interviewerId: interviewerId,
        appreciation: appreciation,
        status: status,
        videoId: videoId,
        company: company,
        position: position
    };

    var formData = {

    };

    var requestOptions = common.getRequestOptions(req, '/api/interview/' + interviewId + '/modify', 'POST', postData, false);

    request(requestOptions, function (err, response, body) {

        if(response.statusCode === 200 ) {

            console.log('update OK, redirecting...');
            res.redirect('/admin/interview/' + interviewId);
        }
        else if(response.statusCode === 400 || response.statusCode === 409 ){

            console.log(body.internalError);
            renderInterview(req, res, formData, body.userError);

        }
        else {
            console.log('error unhandled ');
            common.showError(req, res, response.statusCode);
        }

    });

}

module.exports.interviewModifyDate = function(req, res){

    //var defaultDate =  moment().format('DD/MM/YYYY');
    var defaultDate = '';
    var formData = {
        date: defaultDate,
        hour: '12',
        minute: '00',
        sendMail: true,
        interviewerId: ''
    }

    renderInterviewModifyDate(req, res, formData, null, false);

}

module.exports.doInterviewModifyDate = function(req, res){

    var interviewId = req.body.interviewId;
    var date = req.body.date;
    var hour = req.body.hour;
    var minute = req.body.minute;
    var interviewerId = req.body.interviewerId;
    var sendEmail = req.body.sendEmail;
    console.log('send mail raw ' + sendEmail);
    if(sendEmail === 'checked'){
        sendEmail = true;
    }

    console.log('sendMail: ' + sendEmail);

    var formData = {
        interviewId: interviewId,
        interviewerId: interviewerId,
        date: date,
        hour: hour,
        minute: minute,
        sendEmail: sendEmail,

    }

    //check everything is there
    if(!formData.date || !formData.hour || !formData.minute || !formData.interviewId || !formData.interviewerId  ){

        console.log('missing input');
        renderInterviewModifyDate(req, res, formData, 'Tous les champs doivent etre remplis');
    }
    else {

        //populate data to send to API
        var dateTimeDb = moment(date + ' ' + hour + ':' + minute, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');

        var postData = {
            dateTime: dateTimeDb,
            interviewerId: interviewerId
        };

        var requestOptions = common.getRequestOptions(req, '/api/interview/' + interviewId + '/setDate', 'POST', postData, false);

        console.log(requestOptions);

        request(requestOptions, function (err, response, body) {

            console.log('request Executed ' + response.statusCode);

            if(response.statusCode === 200 ) {

                if(sendEmail){
                    //send email to student to confirm booking
                    console.log('Sending Email to user');
                }

                console.log('update OK, redirecting...');
                res.redirect('/admin/students-interviews-list');
            }
            else if(response.statusCode === 400 || response.statusCode === 409 ){

                console.log(body.internalError);
                renderInterviewModifyDate(req, res, formData, body.userError);

            }
            else {
                console.log('error unhandled ');
                common.showError(req, res, response.statusCode);
            }
        });
    }
};

module.exports.interviewAddSequence = function(req, res){

    var formData = {
        tagId: Object.keys(req.app.locals.options[res.getLocale()].sequenceTagOptions)[0],
        videoUniqueId: '',
        videoUrl: '',
    }

    renderInterviewAddSequence(req, res, formData, null);

}

var renderInterviewAddSequence = function(req, res, formData, error){

    var interviewId = req.params.interviewId;

    var requestOptions = common.getRequestOptions(req, '/api/interview/' + interviewId);

    request(requestOptions, function (err, response, body) {

        var interview = body.data[0];

        var sequenceTagOptions = req.app.locals.options[res.getLocale()].sequenceTagOptions;
        var appreciationsOptions = req.app.locals.options[res.getLocale()].appreciationsOptions;

        // var tag = cloudinary.video("x4l7x9odymscvstysue8", { width: 300, height: 300,
        //     crop: "pad", background: "blue",
        //     preload: "none", controls: true,
        //     fallback_content: "Your browser does not support HTML5 video tags" });
        //
        // console.log(tag);

        res.render('admin/interview-add-sequence', {
            interview: interview,
            sequenceTagOptions: sequenceTagOptions,
            appreciationsOptions: appreciationsOptions,
            title: 'Homepage',
            formData: formData,
            //cloudinaryHtml : tag,
            error: error
        });
    });
}

module.exports.doInterviewAddSequence = function(req, res){

    console.log(req.body);

    var interviewId = req.body.interviewId;
    var videoUniqueId = req.body.videoUniqueId;
    var videoUrl = req.body.videoUrl;
    var tagId = req.body.tagId;
    var summary = req.body.summary;
    var appreciationId = req.body.appreciation;


    var formData = {
        videoUniqueId: videoUniqueId,
        videoUrl: videoUrl,
        interviewId: interviewId,
        tagId: tagId,
        summary: summary,
        appreciationId: appreciationId
    }


    //check everything is there
    if(!interviewId || !tagId || !summary || !appreciationId){

        renderInterviewAddSequence(req, res, formData, 'Please enter an appreciation and a summary');
    }
    else if(!videoUniqueId) {

        renderInterviewAddSequence(req, res, formData, 'Please upload a video');
    }
    else{

        var postData = {
            videoUniqueId: videoUniqueId,
            videoUrl: videoUrl,
            tagId: tagId,
            summary: summary,
            appreciationId: appreciationId
        }

        var requestOptions = common.getRequestOptions(req, '/api/interview/' + interviewId + '/sequences/new', 'POST', postData, false);

        console.log(requestOptions);

        request(requestOptions, function (err, response, body) {

            if(response.statusCode === 201 ) {

                console.log('video ok');
                res.redirect('/admin/interview/' + interviewId);
            }
            else if(response.statusCode === 400 || response.statusCode === 409 ){

                console.log(body.internalError);
                renderInterviewAddSequence(req, res, formData, body.userError);

            }
            else {
                console.log('error unhandled ' + err);
                common.showError(req, res, response.statusCode);
            }
        });
    }


}

module.exports.doUploadVideo = function(req, res){

    cloudinary.uploader.upload("C:/Users/rtheu/Desktop/SampleVideo_1280x720_1mb.mp4",
        function(result) {console.log(result); },
        { resource_type: "video" });
}

module.exports.viewUploadVideo = function(req, res){

    cloudinary.video("qenbobntlvupehao7au4");
}


