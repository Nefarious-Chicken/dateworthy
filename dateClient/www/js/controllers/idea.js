// This is the controller for the individual date ideas - i.e. the one that has all the Foursquare venue details,
// including the address, opening hours, and map. 

angular.module('dateworthy.idea', ['ngOpenFB', 'ngCordova'])


.controller('IdeaCtrl', ['$ionicHistory', '$state', '$location', '$q', '$scope', '$rootScope','$stateParams', 'DateData', 'LikeADate', 'FlagADate', function($ionicHistory, $state, $location, $q, $scope, $rootScope, $stateParams, DateData, LikeADate, FlagADate) {
  $scope.ideas = {}; 

  $scope.initMap = function(latitude, longitude, name){
    console.log($scope.idea);
    console.log("Initiating Map...", latitude, longitude);
    var myLatlng = new google.maps.LatLng(latitude, longitude);
    var mapOptions = {
        draggable: false,
        scrollwheel: false,
        center: myLatlng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: false
    };
    var venueMap = new google.maps.Map(document.getElementById("venueMap" + $stateParams.ideaId), mapOptions);
    navigator.geolocation.getCurrentPosition(function(pos) {
      venueMap.setCenter(new google.maps.LatLng(latitude, longitude));
      var myLocation = new google.maps.Marker({
          position: new google.maps.LatLng(latitude, longitude),
          map: venueMap,
          title: name
      });
    });
    $scope["venueMap" + $stateParams.ideaId] = venueMap;
    $scope.idea.mapInit = true;
  };

  $scope.$on('$stateChangeSuccess', function() {
    if ($state.includes('idea')) {
      $scope.ideaOrFavorite = 'idea';
      DateData.getDateIdeas(function(ideas) {
        $scope.ideas = ideas;
        console.log($scope.ideas);
        $scope.currentIdea = Number($stateParams.ideaId);
        $scope.imgWidth = window.innerWidth + 'px';
        console.log("innerwidth is", $scope.imgWidth);
        $scope.idea = $scope.ideas[$scope.currentIdea];
        if(!$scope.idea.imgUrl){
          $scope.idea.imgUrl = "./img/placeholder.jpg";
        }
        $scope.idea.index = $scope.currentIdea;
        $scope.idea.last = false;
        $scope.idea.mapInit = false;
        $scope.idea.flagged = $scope.idea.flagged || false;
        console.log("$scope.idea.index", $scope.idea.index);
        if ($scope.idea.index === $scope.ideas.length - 1) {
          $scope.idea.last = true; 
        }
        $scope.idea.detailsVisible = false;
      });
    } else if ($state.includes('favorite-single')) {
      $scope.ideaOrFavorite = 'favorite';
      $scope.imgWidth = window.innerWidth + 'px'; 
      console.log("innerwidth is", $scope.imgWidth);
      $scope.idea = DateData.favorite;
      $scope.idea.index = $stateParams.ideaId;
      $scope.idea.last = true;
      $scope.idea.mapInit = false;
      console.log($scope.idea);
      $scope.idea.flagged = $scope.idea.flagged || false;
      $scope.idea.detailsVisible = false;      
    }
  });

  $scope.currentIdea = 0;


  $scope.showDetails = function() {
    console.log("Details should be vis now");
    $scope.idea.detailsVisible = true;
    console.log("$scope.idea.detailsVisible", $scope.idea.detailsVisible);
  }

  $scope.like = function() {
    var currentIdea = $scope.currentIdea;
    $scope.ideas[currentIdea].liked = 1;
    $scope.ideas[currentIdea].disliked = 0;
    var tagnames = DateData.getTags();
    for (var prop in tagnames) {
      if(tagnames[prop] !== undefined){
        LikeADate.increaseTagWeight(tagnames[prop], function(results){console.log(results)});
      }
    };
    LikeADate.markLikeDislike($scope.ideas[currentIdea].dateIdeaID, 1);
  }

  $scope.dislike = function() {
    var currentIdea = $scope.currentIdea;
    $scope.ideas[$scope.currentIdea].disliked = 1;
    $scope.ideas[$scope.currentIdea].liked = 0;  
    var tagnames = DateData.getTags();
    for (var prop in tagnames) {
      if(tagnames[prop] !== undefined){
        LikeADate.decreaseTagWeight(tagnames[prop], function(results){console.log(results)});
      }
    };
    LikeADate.markLikeDislike($scope.ideas[currentIdea].dateIdeaID, -1);
  };

  $scope.flagDate = function() {
    var dateIdeaID = $scope.ideas[$scope.currentIdea].dateIdeaID;
    FlagADate.flagDate(dateIdeaID, function() {
      $scope.idea.flagged = true;
    });
  };

  $scope.nextIdea= function(){
    var next = Number($scope.currentIdea) + 1; 
    $state.go('idea', {ideaId: next});
  };

  $scope.prevIdea= function(){
    if($scope.ideaOrFavorite === 'idea'){
      var prev = Number($scope.currentIdea) - 1;
      $state.go('idea', {ideaId: prev});
    } else {
      var lastPage = $rootScope.history.pop();
      $location.path(lastPage);
    }
  };
  
  $scope.showFavorites = function(){
    if($scope.userData && $scope.userData.email === "thenefariouschicken@gmail.com"){
      return false;
    } else {
      return true;
    }
  };
  $scope.clearData = function(){
    $scope.ideas = [];
    $scope.currentIdea = 0;
    DateData.clearData();
    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    $state.go('home');
  };

  $scope.savedLikes = function() {
    $rootScope.history.push($location.$$path);
    $state.go('favorites');
  }

}]);

