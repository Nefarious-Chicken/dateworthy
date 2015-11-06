angular.module('dateworthy.findadate', [])

.controller('FindADateCtrl', ['$scope', '$state', '$location', '$rootScope', '$timeout', '$stateParams', '$ionicHistory', '$ionicPlatform', '$document', 'FindADate', 'DateData', 'LikeADate', function($scope, $state, $location, $rootScope, $timeout, $stateParams, $ionicHistory, $ionicPlatform, $document, FindADate, DateData, LikeADate) {
  $scope.showSpinner = false;

  // Populate the Find a Date questionnaire with Questions. These should be sorted in the order in which they appear to the user.
  $scope.mandatoryQuestions = [
    {question: "What type of date do you enjoy in general?", type: "tag", field: "dateGenre",
      possibilities: [
        {label: "Intellectual"}, 
        {label: "Romantic"}, 
        {label: "Sporty"}, 
        {label: "Goofy"}, 
        {label: "Creative"}, 
        {label: "Fancy"}
      ]},
    {question: "What kind of ambience are you looking for?", type: "tag", field: "noiseLevel",
      possibilities: [
        {label: "Loud"},
        {label: "Quiet"}
      ]},
    {question: "What's your mode of transportation?", type: "logistics", field: "transportation",
      possibilities: [
        {label: "I'm walking"},
        {label: "I'm taking a cab"},
        {label: "I'm driving"},
        {label: "Public trans, baby!"}
      ]},
    {question: "Type in the city or location for your desired date location.", type: "logistics", field: "location",
      possibilities: []}
  ];

  // Each questionairre will come with a single optional question chosen randomly from this list.
  $scope.optionalQuestions = [
    {question: "Is this a first date?", type: "tag", field: "firstDate", optional: true,
      possibilities: [
        {label: "First-date", string: "Yes"},
        {label: "NONE", string: "No"}
      ]
    },
    {question: 'Are you in an indoors-y or outdoors-y mood?', type: "tag", field: "indoorsOutdoors", optional: true, 
      possibilities: [
        {label: "Indoor"}, 
        {label: "Outdoor"}
      ]
    },
    {question: 'Do you want to get some fresh air?', type: "tag", field: "nature", optional: true, 
      possibilities: [
        {label: "Nature", string: "Yes, let's get to nature"},
        {label: "NONE", string: "No, let's hit up the town"}
      ]
    },
    {question: 'Sit back and enjoy the show, or jump in and get involved?', type: "tag", field: "creative", optional: true, 
      possibilities: [
       {label: "Visual", string: "Sit back and enjoy the show"}, 
       {label: "Creative", string: "Jump in and get involved"}
      ]
    }
  ];
  $scope.data = {};

  // We need this code to help the app know which question should be served to the user, given the
  // param in the URL.
  $scope.addOptionalQuestion = function(){
    var myQ = DateData.getOptionalQuestion();
    if(myQ === -1){
      var randomQ = Math.floor(Math.random() * $scope.optionalQuestions.length);
      $scope.mandatoryQuestions.splice(2, 0, $scope.optionalQuestions[randomQ]);
      DateData.setOptionalQuestion(randomQ);
    } else {
      $scope.mandatoryQuestions.splice(2, 0, $scope.optionalQuestions[myQ]);

    }
  };

  $scope.addOptionalQuestion();
  $scope.currentIndex = $stateParams.questionId;
  $scope.currentQuestion = $scope.mandatoryQuestions[$scope.currentIndex];

  //Anytime the state changes in this controller, this code runs to reinforce code stability.
  $scope.loadState = function(){
    $scope.currentLogistics = DateData.getLogistics();
    $scope.currentTags = DateData.getTags();
    preloadChosenOption($scope.currentQuestion);
  };

  //If you hit the back button, we will pre-load your pre-selected option.
  var preloadChosenOption = function(currentQuestion) {
    if ($scope.currentLogistics !== undefined) {
      if ($scope.currentLogistics.hasOwnProperty(currentQuestion.field)) {
        $scope.currentQuestion.chosenOption = $scope.currentLogistics[currentQuestion.field];
      }
      if ($scope.currentTags.hasOwnProperty(currentQuestion.field)) {
        $scope.currentQuestion.chosenOption = $scope.currentTags[currentQuestion.field];
      }
    }
  };

  // This allows the user to navigate back and forth between the questions.
  $scope.prevQuestion = function() {
    submitSoFar();
    $ionicHistory.goBack();
    $scope.loadState();
  };

  $scope.canSpin = function(){
    return $scope.showSpinner;
  };

  // Creates and formats an object so that the factory can append the data
  $scope.createQuestionObject = function (question){
    var obj = {};
    var key = question.field;
    if (question.chosenOption === "NONE"){
      obj[key] = "NONE";
    } else {
      obj[key] = question.chosenOption;
    }
    return obj;
  };

  // Generates a question answer key value pair and sends it to the data factory.
  // Will skip a question if no tag is provided, IE, a yes or no question to a single tag.
  var submitSoFar = function() {
    var currentQuestion = $scope.currentQuestion;
    var questionObject = $scope.createQuestionObject(currentQuestion);
    if(questionObject[$scope.currentQuestion.field]){
      if (currentQuestion.type === "logistics") {
        DateData.appendLogistics(questionObject);
      } else {
        DateData.appendTags(questionObject);
      }
    }
  };

  // Determines what should be the next URL that the user navigates to and
  // saves data from current survey.
  $scope.nextQuestion = function(){
    submitSoFar();
    var tag;
    var nextQuestionId = Number($scope.currentIndex) + 1;
    // Updates coordinates based off of google maps center location
    // Sends data to the server to get date ideas if we've hit the end of the questions list.
    if ($scope.mandatoryQuestions[$scope.currentIndex].field === "location") {
      var center = $scope.map.getCenter();
      var lat = center.lat();
      var lng = center.lng();
      DateData.setGeoLocation(lat, lng);
      $scope.showSpinner = true;
      FindADate.sendDateData(DateData.getConcatenatedData(), function(data){
        $scope.showSpinner = false;
        DateData.setDateIdeas(data);
        $state.go('idea', {ideaId: 0});
        $scope.loadState();
      });
    } else {
      $state.go('findadate', {questionId: nextQuestionId});
      $scope.loadState();
    }
  };

  // Initializes map and allows people to enter geographical searches. The search box will return a
  // pick list containing a mix of places and predicted search terms.
  $scope.initMap = function() {
    var latitude;
    var longitude;
    var coordinates = DateData.getGeoLocation();
    if(coordinates){
      latitude = coordinates.lat || 37.8044;
      longitude = coordinates.long || -122.2708;
    }
    var map = new google.maps.Map(document.getElementById('map'), {
      draggable: false,
      scrollwheel: false,
      center: {lat: latitude || 37.8044, lng: longitude || -122.2708},
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    // Creates the search box and link it to the UI element.
    var input = document.getElementById('pac-input');

    var searchBox = new google.maps.places.SearchBox(input);
    //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Biases the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
      searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // [START region_getplaces]
    // Listens for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
      var places = searchBox.getPlaces();

      if (places.length === 0) {
        return;
      }

      // Clears out the old markers.
      markers.forEach(function(marker) {
        marker.setMap(null);
      });
      markers = [];

      // For each place, get the icon, name and location.
      var bounds = new google.maps.LatLngBounds();
      places.forEach(function(place) {
        var icon = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25)
        };

        // Creates a marker for each place.
        markers.push(new google.maps.Marker({
          map: map,
          icon: icon,
          title: place.name,
          position: place.geometry.location
        }));

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
    });
    $scope.map = map;
  };

  // Returns a boolean about whether or not the view should show favorites. 
  $scope.showFavorites = function(){
    if($scope.userData && $scope.userData.email === "thenefariouschicken@gmail.com"){
      return false;
    } else {
      return true;
    }
  };

  // Determines if the question being loaded requires the map control.
  $scope.loadMapCheck = function (_decrement) {
    if(!_decrement){
      _decrement = 0;
    }
    if ($scope.mandatoryQuestions[+$scope.currentIndex].field === "location"){//$scope.currentIndex === $scope.mandatoryQuestions.length - 1 - _decrement + ""){ //$scope.currentIndex === '0'){  //set to first for debegugging//$scope.currentIndex === $scope.questions.length - 1 + ""){
      return true;
    } else {
      return false;
    }
  };

  // Takes a user to the 'favorites' view, where they can see all their saved like ideas.
  $scope.savedLikes = function() {
    $rootScope.history.push($location.$$path);
    $state.go('favorites');
  };


  // Allows user to tap a google maps autocomplete suggestion 
  $scope.disableTap = function(){
    container = document.getElementsByClassName('pac-container');
    // Disables ionic data tab
    angular.element(container).attr('data-tap-disabled', 'true');
    // Leaves input field if google-address-entry is selected
    angular.element(container).on("click", function(){
        document.getElementById('pac-input').blur();
    });
  };

  $scope.loadState();


}]);


