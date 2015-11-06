// This is the controller for the individual date ideas - i.e. the one that has all the Foursquare venue details,
// including the address, opening hours, and map. 

angular.module('dateworthy.idea', ['ngOpenFB', 'ngCordova'])


.controller('IdeaCtrl', ['$ionicHistory', '$state', '$location', '$q', '$scope', '$rootScope','$stateParams', 'DateData', 'LikeADate', 'FlagADate', function($ionicHistory, $state, $location, $q, $scope, $rootScope, $stateParams, DateData, LikeADate, FlagADate) {
  $scope.ideas = {}; 

  // Initializes the map for idea views. 
  $scope.initMap = function(latitude, longitude, name){
    var myLatlng = new google.maps.LatLng(latitude, longitude);
    var mapOptions = {
      draggable: true,
      scrollwheel: false,
      center: myLatlng,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    // On the idea-single.html template, we are dynamically creating the IDs of the map div based on the
    // index of the idea. If we don't do this, the first map repeats itself for each idea. 
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

  // We need to set the current idea when the state changes. 
  $scope.$on('$stateChangeSuccess', function() {
    if ($state.includes('idea')) {
      $scope.ideaOrFavorite = 'idea';
      DateData.getDateIdeas(function(ideas) {
        $scope.ideas = ideas;
        $scope.currentIdea = Number($stateParams.ideaId);
        // Grabs the inner width so that we can make the images all square. 
        // The images returned from Foursquare come in different orientations (portrait and landscape)
        // We programatically shrink & crop them using CSS backgrounds and this imgWidth variable. 
        $scope.imgWidth = window.innerWidth + 'px';
        $scope.idea = $scope.ideas[$scope.currentIdea];
        // Tells the view tor ender the placeholder photo if Foursquare responds with no bestPhoto.
        if(!$scope.idea.imgUrl){
          $scope.idea.imgUrl = "./img/placeholder.jpg";
        }
        $scope.idea.index = $scope.currentIdea;
        $scope.idea.last = false;
        // Sets mapInit to false every time the state changes to stop the map from
        // initializing multiple times. 
        $scope.idea.mapInit = false;
        $scope.idea.flagged = $scope.idea.flagged || false;
        if ($scope.idea.index === $scope.ideas.length - 1) {
          $scope.idea.last = true; 
        }
      });
    } else if ($state.includes('favorite-single')) {
      $scope.ideaOrFavorite = 'favorite';
      $scope.imgWidth = window.innerWidth + 'px'; 
      $scope.idea = DateData.favorite;
      $scope.idea.index = $stateParams.ideaId;
      $scope.idea.last = true;
      $scope.idea.mapInit = false;
      $scope.idea.flagged = $scope.idea.flagged || false;
    }
  });

  // Initializes the currentIdea as the 0th index. 
  $scope.currentIdea = 0;

  // Invokes the dislike method when the user taps/clicks the heart icon. The method
  // sets the state on the view as "liked" and tells the server to increase the tag weight. 
  $scope.like = function() {
    var currentIdea = $scope.currentIdea;
    $scope.ideas[currentIdea].liked = 1;
    $scope.ideas[currentIdea].disliked = 0;
    var tagnames = DateData.getTags();
    for (var prop in tagnames) {
      if(tagnames[prop] !== undefined){
        LikeADate.increaseTagWeight(tagnames[prop], function(results){ });
      }
    };
    LikeADate.markLikeDislike($scope.ideas[currentIdea].dateIdeaID, 1);
  }

  // Invokes the dislike method when the user taps/clicks the X icon. The method
  // sets the state on the view as "disliked" and tells the server to decrease the tag weight. 
  $scope.dislike = function() {
    var currentIdea = $scope.currentIdea;
    $scope.ideas[$scope.currentIdea].disliked = 1;
    $scope.ideas[$scope.currentIdea].liked = 0;  
    var tagnames = DateData.getTags();
    for (var prop in tagnames) {
      if(tagnames[prop] !== undefined){
        LikeADate.decreaseTagWeight(tagnames[prop], function(results){ });
      }
    };
    LikeADate.markLikeDislike($scope.ideas[currentIdea].dateIdeaID, -1);
  };

  // Sends the date idea to the blacklist table in our SQL database.
  $scope.flagDate = function() {
    var dateIdeaID = $scope.ideas[$scope.currentIdea].dateIdeaID;
    FlagADate.flagDate(dateIdeaID, function() {
      $scope.idea.flagged = true;
    });
  };

  // Allows the user to toggle back and forth between ideas.
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
  
  // Returns a boolean about whether or not the view should show favorites. 
  $scope.showFavorites = function(){
    // thenefariouschicken@gmail.com is the generic, non-logged-in user.
    if($scope.userData && $scope.userData.email === "thenefariouschicken@gmail.com"){
      return false;
    } else {
      return true;
    }
  };

  // Clears the data (tags, etc.) when the user clicks/taps the "home" button to start over,
  // so they can use dateworthy again from scratch. 
  $scope.clearData = function(){
    $scope.ideas = [];
    $scope.currentIdea = 0;
    DateData.clearData();
    $state.go('home');
  };

  // Takes a user to the 'favorites' view, where they can see all their saved like ideas.
  $scope.savedLikes = function() {
    $rootScope.history.push($location.$$path);
    $state.go('favorites');
  }

}]);

