angular.module('dateworthy.favorites', ['ngOpenFB', 'ngCordova'])

.controller('FavoritesCtrl', function($state, $scope, $ionicModal, $ionicPlatform, $timeout, $location, $rootScope, $cordovaGeolocation, DateData, UserData, LikeADate, ngFB) {
  var userData = UserData.userData;
  $scope.$on('$stateChangeSuccess', function () {
    LikeADate.getLikedDates(function(results){
      $scope.favorites = results;
    });
  });

  $scope.getDetails = function (index) {
    DateData.getVenueData($scope.favorites[index].dateIdea.venueVenueID, function(venueData){
      var idea = {};
      for(var key in venueData){
        idea[key] = venueData[key];
      }
      idea['idea'] = $scope.favorites[index].dateIdea.dateIdeaName;
      if(idea.bestPhoto){
        idea['imgUrl'] = venueData.bestPhoto.prefix + venueData.bestPhoto.width + 'x' + venueData.bestPhoto.height + venueData.bestPhoto.suffix;
        console.log(idea.imgUrl);
      } else {
        idea['imgUrl'] = "./img/placeholder.jpg";
      }
      idea['mapInit'] = false;
      DateData.setFavorite(idea)
      $rootScope.history.push($location.$$path);
      $state.go('favorite-single', {ideaId: index})
      // $location.path('/favorites/' + index);
    });
  }

  $scope.hasDates = function() {
    if ($scope.favorites == undefined || $scope.favorites.length == 0) {
      return false;
    } else {
      return true;
    }
  }
  $scope.goBack = function () {
    var lastPath = $rootScope.history.pop();
    $location.path(lastPath);
  }
})