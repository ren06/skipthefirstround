// var mongoose = require('mongoose');
// var Loc = mongoose.model('Location');
//
// var sendJsonResponse = function(res, status, content){
//     res.status(status);
//     res.json(content);
// }
//
// var doSetAverageRating = function(location){
//     var i, reviewCount, ratingAverage, ratingTotal;
//     if(location.reviews && location.reviews.length > 0){
//         reviewCount = location.reviews.length;
//         ratingTotal = 0;
//         for(i = 0; i < reviewCount; i++){
//             ratingTotal = ratingTotal + location.reviews[i].rating;
//         }
//         ratingAverage = parseInt(ratingTotal/reviewCount, 10);
//         location.rating = ratingAverage;
//         location.save(function(err){
//            if(err){
//                console.log(err);
//            }
//             else{
//                console.log('Average rating updated to ' + ratingAverage);
//            }
//         });
//     }
// }
//
// var updateAverageRating = function(locationid){
//     Loc.findById(locationid).select('rating reviews').exec(function(err, location){
//         if(!err){
//             doSetAverageRating(location);
//         }
//     });
// }
//
// var doAddReview = function(req, res, location){
//     if(!location){
//         sendJsonResponse(res, 404, {'message': 'locationid not found'});
//     }
//     else{
//         location.reviews.push({
//             author: req.body.author,
//             rating: req.body.rating,
//             reviewText: req.body.reviewText,
//         });
//         location.save(function(err, location){
//             var thisReview;
//             if(err){
//                 console.log(err);
//                 sendJsonResponse(res, 400, err);
//             }else{
//                 updateAverageRating(location._id);
//                 thisReview = location.reviews[location.reviews.length -1];
//                 sendJsonResponse(res, 201, thisReview);
//             }
//         });
//     }
// };
//
// module.exports.reviewsCreate = function(req, res){
//     var locationid = req.params.locationid;
//     if(locationid){
//         Loc.findById(locationid).select('reviews').exec(function(err, location){
//             if(err){
//                 sendJsonResponse(res, 400, err);
//             }
//             else{
//                 doAddReview(req, res, location);
//             }
//         })
//     }
//     else{
//         sendJsonResponse(res, 404, {'message': 'Not found, locationid required'});
//     }
// };
//
// module.exports.reviewsReadOne = function(req, res){
//     if(!req.params.locationid || req.params.reviewid){
//         sendJsonResponse(res, 404, {'message': 'Not found, locationid and reviewid required'});
//         return;
//     }
//     Loc.findById(req.params.locationid).select('reviews').exec(function(err, location){
//         var thisReview;
//         if(!location) {
//             sendJsonResponse(res, 404, {'message': 'locationid not found'});
//             return;
//         }
//         else if (err){
//             sendJsonResponse(res, 400, err);
//             return;
//         }
//
//         if(location.reviews && location.reviews.length > 0){
//             thisReview = location.reviews.id(req.params.reviewid);
//             if (!thisReview){
//                 sendJsonResponse(res, 404, {'message': 'reviewid not found'});
//             } else{
//                 thisReview.author = req.body.author;
//                 thisReview.rating = req.body.rating;
//                 thisReview.reviewText = req.body.reviewText;
//                 if(err){
//                     sendJsonResponse(res, 404, err);
//                 } else {
//                     updateAverageRating(location._id);
//                     sendJsonResponse(res, 200, thisReview);
//                 }
//             };
//         }
//         else{
//             sendJsonResponse(res, 404, {'message' : 'no review to update' });
//         }
//     });
// };
//
// module.exports.reviewsUpdateOne = function(req, res){
//
//     if(req.params && req.params.locationid && req.params.reviewid) {
//
//         Loc.findById(req.params.locationid).select('name review').exec(function (err, location) {
//             var name, review;
//             if (!location) {
//                 sendJsonResponse(res, 404, {'message': 'locationid not found'});
//                 return;
//             }
//             else if (err) {
//                 sendJsonResponse(res, 404, err);
//                 return;
//             }
//             if(location.reviews && location.review.lentgh > 0){
//                 review = location.review.id(req.params.reviewid);
//                 if(!review){
//                     sendJsonResponse(res, 404, {'message' : 'review not found'});
//                 }
//                 else{
//                     response = { location: {name: location.name, id: req.params.locationid}, review: review};
//                 }
//
//             }
//             else{
//                 sendJsonResponse(res, 404, {'message': 'no reviews found'});
//             }
//             sendJsonResponse(res, 200, location);
//         });
//     }
//     else{
//         sendJsonResponse(res, 404, {'message': 'not found, both locationid and reviewid required'});
//     }
//
// };
//
// module.exports.reviewsDeleteOne = function(req, res){
//
//     if(req.params && req.params.locationid && req.params.reviewid) {
//
//         Loc.findById(req.params.locationid).select('name review').exec(function (err, location) {
//             var review;
//             if (!location) {
//                 sendJsonResponse(res, 404, {'message': 'locationid not found'});
//                 return;
//             }
//             else if (err) {
//                 sendJsonResponse(res, 404, err);
//                 return;
//             }
//             if (location.reviews && location.review.lentgh > 0) {
//                 review = location.review.id(req.params.reviewid);
//                 if (!review) {
//                     sendJsonResponse(res, 404, {'message': 'review not found'});
//                 }
//                 else {
//                     review.remove();
//                     location.save(function (err) {
//                         if (err) {
//                             sendJsonResponse(res, 404, err);
//                         } else {
//                             updateAverageRating(location._id);
//                             sendJsonResponse(res, 204, null);
//                         }
//                     });
//                 }
//             }
//             else{
//                 sendJsonResponse(res, 404, {'message': 'no review to delete'});
//             }
//         });
//     }
//     else{
//         sendJsonResponse(res, 404, {'message': 'not found, both locationid and reviewid required'});
//     }
// };