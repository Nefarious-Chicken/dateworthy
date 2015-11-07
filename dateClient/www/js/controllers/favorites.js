angular.module('dateworthy.favorites', [])

.controller('FavoritesCtrl',['$rootScope','$state', '$scope', '$location', 'DateData', 'UserData', 'LikeADate', function($rootScope, $state, $scope, $location, DateData, UserData, LikeADate) {
  var userData = UserData.userData;
  $scope.$on('$stateChangeSuccess', function () {
    LikeADate.getLikedDates(function(results){
      $scope.favorites = results;
      // sets hasDatesInFavorites to true by default - but if there are no favorites
      // then the user will see a different screen prompting them to start liking dates.
      $scope.hasDatesInFavorites = true;
      if ($scope.favorites.length === 0 || $scope.favorites === undefined) {
        $scope.hasDatesInFavorites = false;
      }
    });
  });

  // Gets Foursquare venue data for the date idea. 
  $scope.getDetails = function (index) {
    var geolocation = DateData.getGeoLocation();
    DateData.getVenueData($scope.favorites[index].dateIdea.venueVenueID, $scope.favorites[index].dateIdea.dateIdeaName, geolocation.lat, geolocation.long, function(venueData){
      var idea = {};
      for(var key in venueData){
        idea[key] = venueData[key];
      }
      idea['idea'] = $scope.favorites[index].dateIdea.dateIdeaName;
      if(idea.bestPhoto){
        idea['imgUrl'] = venueData.bestPhoto.prefix + venueData.bestPhoto.width + 'x' + venueData.bestPhoto.height + venueData.bestPhoto.suffix;
      } else {
        idea['imgUrl'] = "./img/placeholder.jpg";
      }
      idea['mapInit'] = false;
      DateData.setFavorite(idea)
      $rootScope.history.push($location.$$path);
      $state.go('favorite-single', {ideaId: index})
    });
  }

  // Returns a boolean about whether or not the view should show favorites. 
  $scope.showFavorites = function(){
    if($scope.userData && $scope.userData.email === "thenefariouschicken@gmail.com"){
      return false;
    } else {
      return true;
    }
  };

  // Lets the user go back.
  $scope.goBack = function () {
    var lastPath = $rootScope.history.pop();
    $location.path(lastPath);
  }
}])