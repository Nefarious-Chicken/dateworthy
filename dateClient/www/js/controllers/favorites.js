angular.module('dateworthy.favorites', ['ngOpenFB', 'ngCordova'])

.controller('FavoritesCtrl', function($state, $scope, $ionicModal, $ionicPlatform, $timeout, $location, $rootScope, $cordovaGeolocation, DateData, UserData, LikeADate, ngFB) {
  var userData = UserData.userData;
  $scope.$on('$stateChangeSuccess', function () {
    LikeADate.getLikedDates(function(results){
      $scope.favorites = results;
    });
  });

  $scope.getDetails = function (index) {
    console.log("Clicked #" + index);
  }

  $scope.goBack = function () {
    var lastPath = $rootScope.history.pop();
    $location.path(lastPath);
  }
})