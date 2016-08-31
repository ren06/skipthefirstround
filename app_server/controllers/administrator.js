var request = require('request');
var common = require('./common');
var moment = require('moment');


var renderLogin = function(req, res, formData, error){

    res.render('admin/login', {
        title: 'Admin Login',
        formData: formData,
        error: error,
    });
};

module.exports.homepage = function(req, res){

    var session = req.session;

    if(session.authenticated && session.role == 'admin'){

        res.redirect('admin/main-menu');
    }
    else if(session.authenticated){

        res.render('admin/generic-text', {
            title: 'Please log off',
            content: 'You are logged in, but not as an administrator, please log off first.',
        });
    }
    else{
        renderLogin(req, res, {'email': '', 'password': ''}, null);
    }

};

module.exports.doLogin = function(req, res){

    var formData = req.body;

    if((formData.email == 'rtheuillon@hotmail.com' || formData.email == 'jerome.troiano@gmail.com' ) && formData.password == 'elmaros'){

            req.session.role = 'admin';
            req.session.authenticated = true;
            //req.session.token = token;

            res.redirect('admin/main-menu');
    }
    else{
        renderLogin(req, res, formData, 'Email and password do not match');
    }
};

module.exports.mainMenu = function(req, res){

    res.render('admin/main-menu', {
        title: 'Main menu',
    });

};

module.exports.logout = function(req, res){

    console.log('admin logout called');

    req.session.destroy(function(err) {

        console.log('admin session destroyed');
        res.redirect('/admin');
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

module.exports.student = function(req, res){

    console.log('menu etudiants');
    res.render('admin/student-menu', {
        title: 'Homepage',

    });

};



module.exports.studentsInterviewsList = function(req, res){

    var requestOptions = common.getRequestOptions(req, '/api/interviews', 'GET', {}, false);

    request(requestOptions, function (err, response, body) {
        console.log(body);
        var interviews = body.data;
     
        res.render('admin/students-interviews-list', {
            title: 'All Interviews for students',
            interviews: interviews

        });
    });

};

module.exports.studentsInterviewNoDate = function(req, res){

    var requestOptions = common.getRequestOptions(req, '/api/interviews/noDate', 'GET', {}, false);

    request(requestOptions, function (err, response, body) {
        console.log(body);
        var interviews = body.data;

        res.render('admin/students-interviews-list', {
            title: 'Interviews with no dates',
            interviews: interviews

        });
    });

};


var renderInterview = function(req, res, editMode, formData, videoData, error){

    var interviewId = req.params.interviewId;

    var requestOptions = common.getRequestOptions(req, '/api/interview/' + interviewId);

    request(requestOptions, function (err, response, body) {

        var interview = body.data[0];

        //break down date time in date, hour and minutes
        //DD/MM/YYYY HH:mm
        if(interview.date) {
            interview.date = moment(interview.dateTime).format('DD/MM/YYYY');
            interview.hour = moment(interview.dateTime).format('HH');
            interview.time = moment(interview.dateTime).format('mm');
        }

        console.log(interview.dateTimeText);
        console.log(interview.dateTime);

        var sectorOptions = req.app.locals.options[res.getLocale()].sectorOptions;
        var tagOptions = req.app.locals.options[res.getLocale()].tagOptions;
        var interviewTypeOptions = req.app.locals.options[res.getLocale()].interviewTypeOptions;
        var interviewStatusOptions = req.app.locals.options[res.getLocale()].interviewStatusOptions;
        var appreciationsOptions = req.app.locals.options[res.getLocale()].appreciationsOptions;
        var jobTypeOptions = req.app.locals.options[res.getLocale()].jobTypeOptions;

        jobTypeOptions['0'] = ' -- Select --';

        requestOptions = common.getRequestOptions(req, '/api/interviewers', 'GET', {}, false);

        request(requestOptions, function (err, response, body) {

            var interviewers = body.data;

            if(!videoData) {

                var videoData = [];

                if (interview.video) {
                    videoData.providerUniqueId = interview.video.providerUniqueId;
                    videoData.url = interview.video.url;
                }
                else {
                    videoData.providerUniqueId = '';
                    videoData.url = '';
                }
            }

            if(formData){
                //replace interview value
                interview.date = formData.date;
                interview.hour = formData.hour;
                interview.minute = formData.minute;
                interview.type = formData.type;
                interview.sector = formData.sector;
                interview.company = formData.company;
                interview.position = formData.position;
                interview.summary = formData.summary;
                interview.status = formData.status;
                interview.jobType = formData.jobType;
                interview.appreciation = formData.appreciation;
                interview.language = formData.language;
            }

            res.render('admin/interview', {
                interview: interview,
                title: 'Homepage',
                sectorOptions: sectorOptions,
                jobTypeOptions: jobTypeOptions,
                interviewTypeOptions: interviewTypeOptions,
                interviewStatusOptions: interviewStatusOptions,
                appreciationsOptions: appreciationsOptions,
                interviewers: interviewers,
                editMode: editMode,
                videoData: videoData,
                error: error,
            });
        });
    });
};

module.exports.interview = function(req, res){

    renderInterview(req, res, false, null, null, null);

};

module.exports.interviewModify = function(req, res){

    renderInterview(req, res, true, null, null, null);
};


var renderInterviewModifyDate = function(req, res, formData, error){

    console.log('renderIntervew error: ' + error);
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
                        title: 'Modify Date',
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
};

module.exports.doInterviewModify = function(req, res) {

    console.log(req.body);

    var interviewId = req.body.interviewId;
    var date = req.body.date;
    var hour = req.body.hour;
    var minute = req.body.minute;
    var type = req.body.type;
    var sector = req.body.sector;
    var idInterviewer = req.body.idInterviewer;
    var appreciation = req.body.appreciation;
    var status = req.body.status;
    var position = req.body.position;
    var jobType = req.body.jobType;
    var company = req.body.company;
    var videoProviderUniqueId = req.body.videoProviderUniqueId;
    var videoUrl = req.body.videoUrl;
    var idVideo = req.body.idVideo;
    var summary = req.body.summary;
    var language = req.body.language;

    var dateTimeDb = null;

    if (date && hour && minute) {
        dateTimeDb = moment(date + ' ' + hour + ':' + minute, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');
    }

    var postData = {
        dateTime: dateTimeDb,
        type: type,
        sector: sector,
        idInterviewer: idInterviewer,
        appreciation: appreciation,
        status: status,
        jobType: jobType,
        company: company,
        position: position,
        videoProviderUniqueId: videoProviderUniqueId,
        videoUrl: videoUrl,
        idVideo: idVideo,
        summary: summary,
        language: language,
    };

    var videoData = {
        providerUniqueId: videoProviderUniqueId,
        url: videoUrl,
    };

    if (status == 2 && !dateTimeDb) {
        renderInterview(req, res, true, req.body, videoData, 'You cannot have an interview with status Booked without a Date');
    }
    else {

        var requestOptions = common.getRequestOptions(req, '/api/interview/' + interviewId, 'PUT', postData, false);

        request(requestOptions, function (err, response, body) {

            if (response.statusCode === 204) {

                console.log('update OK, redirecting...');
                res.redirect('/admin/interview/' + interviewId);
            }
            else if (response.statusCode === 400 || response.statusCode === 409) {

                console.log(body.internalError);
                renderInterview(req, res, true, req.body, videoData, body.userError);

            }
            else {
                console.log('error unhandled ');
                common.showError(req, res, response.statusCode);
            }

        });
    }

};

module.exports.interviewModifyDate = function(req, res){

    //var defaultDate =  moment().format('DD/MM/YYYY');
    var defaultDate = '';
    var formData = {
        date: defaultDate,
        hour: '12',
        minute: '00',
        sendMail: true,
        interviewerId: ''
    };

    renderInterviewModifyDate(req, res, formData, null, false);

};

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
    };

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
            interviewerId: interviewerId,
            status: 2, //booked
        };

        var requestOptions = common.getRequestOptions(req, '/api/interview/' + interviewId + '/setDate', 'POST', postData, false);

        console.log(requestOptions);

        request(requestOptions, function (err, response, body) {

            console.log('request Executed ' + response.statusCode);

            if(response.statusCode === 204 ) {

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
    };

    var videoData = {
        url: '',
        providerUniqueId: '',
    };

    renderInterviewAddSequence(req, res, formData, videoData, null);

};

var renderInterviewAddSequence = function(req, res, formData, videoData, error){

    var interviewId = req.params.interviewId;

    var requestOptions = common.getRequestOptions(req, '/api/interview/' + interviewId);

    request(requestOptions, function (err, response, body) {

        var interview = body.data[0];

        var sequenceTagOptions = req.app.locals.options[res.getLocale()].sequenceTagOptions;
        var appreciationsOptions = req.app.locals.options[res.getLocale()].appreciationsOptions;


        res.render('admin/interview-add-sequence', {
            interview: interview,
            sequenceTagOptions: sequenceTagOptions,
            appreciationsOptions: appreciationsOptions,
            title: 'Homepage',
            formData: formData,
            videoData: videoData,
            error: error
        });
    });
};

module.exports.doInterviewAddSequence = function(req, res){

    console.log(req.body);

    var interviewId = req.body.interviewId;
    var videoProviderUniqueId = req.body.videoProviderUniqueId;
    var videoUrl = req.body.videoUrl;
    var tagId = req.body.tagId;
    var summary = req.body.summary;
    var appreciationId = req.body.appreciation;


    var formData = {
        interviewId: interviewId,
        tagId: tagId,
        summary: summary,
        appreciationId: appreciationId
    };

    var videoData = {
        uniqueProviderId: videoProviderUniqueId,
        url: videoUrl,
    };

    console.log(videoProviderUniqueId);

    //check everything is there
    if(!interviewId || !tagId || !summary || !appreciationId){

        renderInterviewAddSequence(req, res, formData, videoData, 'Please enter an appreciation and a summary');
    }
    else if(!videoProviderUniqueId) {

        renderInterviewAddSequence(req, res, formData, videoData, 'Please upload a video');
    }
    else{

        var postData = {
            videoUniqueId: videoProviderUniqueId,
            videoUrl: videoUrl,
            tagId: tagId,
            summary: summary,
            appreciationId: appreciationId
        };

        var requestOptions = common.getRequestOptions(req, '/api/interview/' + interviewId + '/sequences/new', 'POST', postData, false);

        console.log(requestOptions);

        request(requestOptions, function (err, response, body) {

            if(response.statusCode === 201 ) {

                console.log('video ok');
                res.redirect('/admin/interview/' + interviewId);
            }
            else if(response.statusCode === 400 || response.statusCode === 409 ){

                console.log(body.internalError);
                renderInterviewAddSequence(req, res, formData, videoData, body.userError);

            }
            else {
                console.log('error unhandled ' + err);
                common.showError(req, res, response.statusCode);
            }
        });
    }


};

module.exports.interviewerList = function(req, res){

    var requestOptions = common.getRequestOptions(req, '/api/interviewers', 'GET');

    request(requestOptions, function (err, response, body) {

        var interviewers = body.data;

        res.render('admin/interviewers-list', {
            interviewers: interviewers,
            title: 'Interviewer List',

        });

    });
};

var renderInterviewCreate = function(req, res, formData, error){

    res.render('admin/interviewer-create', {

        title: 'Interviewer Create',
        formData: formData,
        error: error,

    });
};

module.exports.interviewerCreate = function(req, res){

    renderInterviewCreate(req, res, {email: '', firstName: '', lastName: '', password: '', confirmationPassword: '', mobilePhone: ''});

};

module.exports.doInterviewerCreate = function(req, res){

    var formData =  req.body;

    var requestOptions = common.getRequestOptions(req, '/api/interviewer', 'POST', req.body);

    request(requestOptions, function (err, response, body) {

        console.log(body);

        if(response.statusCode === 201 ) {

            res.redirect('/admin/interviewers/');
        }
        else{

            renderInterviewCreate(req, res, formData, body.userError);
        }

    });

};


module.exports.recruitersList = function(req, res){

    var requestOptions = common.getRequestOptions(req, '/api/recruiters', 'GET');

    request(requestOptions, function (err, response, body) {

        var recruiters = body.data;

        res.render('admin/recruiters-list', {
            recruiters: recruiters,
            title: 'Recruiters List',

        });

    });
};

module.exports.toggleActiveInactive = function(req, res){

    var recruiterId = req.params.recruiterId;

    var requestOptions = common.getRequestOptions(req, '/api/recruiter/' + recruiterId + '/toggleActiveInactive' , 'POST');

    request(requestOptions, function (err, response, body) {

       res.redirect('/admin/recruiters');

    });
};




