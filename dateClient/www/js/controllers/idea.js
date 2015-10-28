angular.module('dateworthy.idea', ['ngOpenFB', 'ngCordova'])

.controller('IdeaCtrl', function($location, $ionicHistory, $q, $ionicLoading, $scope, $stateParams, DateData, LikeADate) {

  $scope.initMap = function(latitude, longitude, name){
    console.log("Initiating Map...", latitude, longitude);
    var myLatlng = new google.maps.LatLng(latitude, longitude);
    var mapOptions = {
        center: myLatlng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    navigator.geolocation.getCurrentPosition(function(pos) {
        map.setCenter(new google.maps.LatLng(latitude, longitude));
        var myLocation = new google.maps.Marker({
            position: new google.maps.LatLng(latitude, longitude),
            map: map,
            title: name
        });
    });
    $scope.map = map;
  };

  DateData.getDateIdeas(function(ideas) {
    $scope.ideas = ideas;
    console.log($scope.ideas);
    $scope.currentIdea = $stateParams.ideaId;
    $scope.idea = $scope.ideas[$scope.currentIdea];
    setTimeout($scope.initMap($scope.idea.location.lat, $scope.idea.location.lng, $scope.idea.name), 2000);
  });


  $scope.like = function() {
    $scope.ideas[currentIdea].liked = 1;
    $scope.ideas[currentIdea].disliked = 0;
    var tagnames = DateData.getTags();
    for (var prop in tagnames) {
      if(tagnames[prop] !== undefined){
        LikeADate.increaseTagWeight(tagnames[prop], function(results){console.log(results)});
      }
    };
  }

  $scope.dislike = function() {
    $scope.ideas[$scope.currentIdea].disliked = 1;
    $scope.ideas[$scope.currentIdea].liked = 0;  
    var tagnames = DateData.getTags();
    for (var prop in tagnames) {
      if(tagnames[prop] !== undefined){
        LikeADate.decreaseTagWeight(tagnames[prop], function(results){console.log(results)});
      }
    };
  };

  $scope.goBack = function() {
    $ionicHistory.goBack();
  };

  // MAPS INTEGRATION 
  

});


