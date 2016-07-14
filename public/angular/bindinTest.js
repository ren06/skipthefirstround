angular.module('myApp', []);

var myController = function($scope){
$scope.myInput = 'Hello World';
};

angular.module('myApp').controller('myController', myController);