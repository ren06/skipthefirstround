// 'use strict';
//
// var moment = require('moment');
//
// class Interview{
//
//     constructor(properties, language){
//         this.properties = properties;
//         this.language = language;
//     }
//
//     getTypeText(){
//
//         var options = app.locals.options;
//         console.log('opt ' + options);
//     }
//
//     getDateTimeText() {
//
//         var dateTime = this.properties.dateTime;
//
//         moment.locale(this.language);
//
//         var result;
//
//         if(dateTime) {
//             result = moment(dateTime).format("dddd Do MMMM YYYY H:m");
//         }
//         else{
//             result =  __('DateUndefined');
//         }
//
//         return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
//     }
//
//     static getListFromProperties(propertiesList, language) {
//
//         console.log('inside getListFromProperties');
//
//         var objects = [];
//
//         propertiesList.forEach(function(entry) {
//
//             var object = new Interview(entry, language);
//             objects.push(object);
//         });
//
//         return objects;
//     }
//
//     get speech(){
//
//         return " i am static method";
//     }
//
// }
//
// module.exports = Interview;
//
