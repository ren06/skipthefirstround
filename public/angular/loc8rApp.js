angular.module('loc8rApp', []);


var locationListCtrl = function($scope, loc8rData, geolocation){

    // $scope.data = {
    //     locations: [{
    //         name: 'Burger Queen',
    //         address: '125 High street, Reading RG6 1PS',
    //         rating: 3,
    //         facilities: ['Hot drinks', 'Food', 'Premium wifi'],
    //         distance: 0.296456,
    //         _id: '123'
    //     },
    //     {
    //         name: 'Costy',
    //         address: '125 High street, Reading RG6 1PS',
    //         rating: 4,
    //         facilities: ['Hot drinks', 'Food', 'Premium wifi'],
    //         distance: 0.296456,
    //         _id: ''
    //     }]
    // }

    // $scope.message = 'Checking your location';
    //
    // loc8rData.
    // success(function(data) {
    //     $scope.data = { locations: data };
    //     $scope.message = data.length > 0 ? '' : 'No locations found';
    // }).
    // error(function(e) {
    //     console.log(e);
    //     $scope.message = 'Sorry something has gone wrong';
    // });

    $scope.message = 'Checking your location';
    $scope.getData = function(position){
        $scope.message = 'Searching nearby places';
        loc8rData.success(function(data){
            $scope.message = data.length > 0 ? '': 'No locations found';
            $scope.data = { locations: data };
        }).error(function(e){
            $scope.message = 'Sorry something is wrong';
        });
    };

    $scope.showError = function(error){
        $scope.$apply(function(){
            $scope.messgage = error.message;
        });

    $scope.noGeo = function() {
        $scope.$apply(function () {
            $scope.messgage = 'Geolocation not supported by this browser';
        });
    };
        
    geolocation.getPosition($scope.getData, $scope.showError, $scope.nogeo);
};

var _isNumeric = function(n){
    return !isNaN(parseFloat(n)) && isFinite(n);
}

var formatDistance = function(){
    return function(distance){
        var numDistance, unit;
        if(distance && _isNumeric(distance)){
            if(distance > 1){
                numDistance = parseFloat(distance).toFixed(1);
                unit = 'km';
            }
            else{
                numDistance = parseFloat(distance * 1000,10);
                unit = 'm';
            }
            return numDistance + unit;
        }
        else{
            return '?';
        }
    }
}

var ratingStars = function(){
    return {
        scope: { thisRating: '=rating'},
        //template: "{{ thisRating }}"
        templateUrl: '/angular/rating-stars.html'
    };
}


var loc8rData = function($http){

   return $http.get('/api/locations?lng=-0.7992599&lat=51.378091');
}

var geolocation = function() {
    var geoPosition = function(cbSuccess, cbError, cbNoGeo){
        if(navigato.geolocatiokn){
            navigator.geolocation.getCurrentPosition(cbSuccess, cbError);
        }
        else{
            cbNoGeo();
        }
        return { getPosition: getPosition };
    };
};

angular.module('loc8rApp').controller('locationListCtrl', locationListCtrl);
angular.module('loc8rApp').filter('formatDistance', formatDistance);
angular.module('loc8rApp').directive('ratingStars', ratingStars);
angular.module('loc8rApp').service('loc8rData', loc8rData);
angular.module('loc8rApp').service('geolocation', geolocation);