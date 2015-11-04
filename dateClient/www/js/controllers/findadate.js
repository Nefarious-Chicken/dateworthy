angular.module('dateworthy.findadate', [])

.controller('FindADateCtrl', ['$scope', '$state', '$location', '$rootScope', '$timeout', '$stateParams', '$ionicHistory', '$ionicPlatform', '$document', 'FindADate', 'DateData', 'LikeADate', function($scope, $state, $location, $rootScope, $timeout, $stateParams, $ionicHistory, $ionicPlatform, $document, FindADate, DateData, LikeADate) {
  $scope.showSpinner = false;

  // Populate the Find a Date questionnaire with Questions. These should be sorted in the order in which they appear to the user.
  $scope.mandatoryQuestions = [
    {question: "Type in the city or location for your desired date location.", type: "logistics", field: "location", possibilities: []},
    //{question: "What time of day are you going?", type: "tag", field: "time", possibilities: ["Daytime", "Nighttime"], answerTags: ["Day", "Night"]},
    {question: "What's your mode of transportation?", type: "logistics", field: "transportation", possibilities:["I'm walking", "I'm taking a cab", "I'm driving", "Public trans, baby!"]},
    {question: "What type of date do you enjoy in general?", type: "tag", field: "dateGenre", possibilities: ["Intellectual", "Romantic", "Goofy", "Geeky"]},
    {question: "What kind of ambience are you looking for?", type: "tag", field: "noiseLevel", possibilities: ["Loud", "Quiet"]}
  ];

  //Each questionairre will come with a single optional question chosen randomly from this list.
  $scope.optionalQuestions = [
    {question: "Is this a first date?", type: "tag", field: "noiseLevel", optional: true, possibilities: ["Yes", "No"], answerTags: ["First-date", "NONE"]},
    {question: 'Are you in an indoors-y or outdoors-y mood?', type: "tag", field: "indoorsOutdoors", optional: true,  possibilities: ["Indoor", "Outdoor"]},
    {question: 'Do you want to get some fresh air?', type: "tag", field: "nature", optional: true,  possibilities: ["Yes, let's get to nature", "No, let's hit up the town"], answerTags: ["Nature", "NONE"]},
    {question: 'Take it all in, or get your hands dirty?', type: "tag", field: "creative", optional: true,  possibilities: ["Take it all in", "Get my hands dirty"], answerTags: ["Visual", "Creative"]}
  ];
  $scope.data = {};

  // We need this code to help the app know which question should be served to the user, given the
  // param in the URL.
  $scope.addOptionalQuestion = function(){
    var myQ = DateData.getOptionalQuestion();
    if(myQ === -1){
      var randomQ = Math.floor(Math.random() * $scope.optionalQuestions.length);
      $scope.mandatoryQuestions.push($scope.optionalQuestions[randomQ]);
      DateData.setOptionalQuestion(randomQ);
    } else {
      $scope.mandatoryQuestions.push($scope.optionalQuestions[myQ]);

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
    console.log("Spin status: ", $scope.showSpinner);
    return $scope.showSpinner;
  };

  //creates and formats an object so that the factory can append the data
  $scope.createQuestionObject = function (question){
    console.log("Current Question: ", question);
    //console.log(question.possibilities.indexOf(question.chosenOption));
    var obj = {};
    var key = question.field;
    if(question.answerTags){
      if(question.answerTags[question.possibilities.indexOf(question.chosenOption)] === "NONE"){
        return null;
      } else {
        obj[key] = question.answerTags[question.possibilities.indexOf(question.chosenOption)];
      }
    } else {
      obj[key] = question.chosenOption;
    }
    return obj;
  };

  //generates a question answer key value pair and sends it to the data factory.
  //will skip a question if no tag is provided, IE, a yes or no question to a single tag.
  var submitSoFar = function() {
    var currentQuestion = $scope.currentQuestion;
    var questionObject = $scope.createQuestionObject(currentQuestion);
    if(questionObject !== null){
      if (currentQuestion.type === "logistics") {
        DateData.appendLogistics(questionObject);
      } else {
        DateData.appendTags(questionObject);
      }
    }
  };

  // This function determines what should be the next URL that
  // the user navigates to and saves data from current survey.
  $scope.nextQuestion = function(){
    console.log("Next question called");
    submitSoFar();
    var tag;
    var nextQuestionId = Number($scope.currentIndex) + 1;
    console.log("Length of questions: ", $scope.mandatoryQuestions.length);
    console.log("nextQuestionID", nextQuestionId);
    //Update coordinates based off of google maps center location
    if ($scope.mandatoryQuestions[$scope.currentIndex].field === "location") {
      var center = $scope.map.getCenter();
      var lat = center.lat();
      var lng = center.lng();
      DateData.setGeoLocation(lat, lng);
      $state.go('findadate', {questionId: nextQuestionId});
      $scope.loadState();
    }
    //If we are at the end of the question list, we will send the data to the server and get date ideas.
    if(nextQuestionId === $scope.mandatoryQuestions.length){
      $scope.showSpinner = true;
      console.log("Doing stuff now!");
      FindADate.sendDateData(DateData.getConcatenatedData(), function(data){
        console.log("Data sent to the server: ", DateData.getConcatenatedData());
        DateData.setDateIdeas(data);
        $state.go('idea', {ideaId: 0});
        $scope.loadState();
      });
    //else we will go to the next question.
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
    console.log("Latutude: ", latitude);
    console.log("Initializing map");
    var coordinates = DateData.getGeoLocation();
    if(coordinates){
      latitude = coordinates.lat || 37.8044;
      longitude = coordinates.long || -122.2708;
    }
    var map = new google.maps.Map(document.getElementById('map'), {
      draggable: false,
      center: {lat: latitude || 37.8044, lng: longitude || -122.2708},
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');

    var searchBox = new google.maps.places.SearchBox(input);
    //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
      searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // [START region_getplaces]
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
      var places = searchBox.getPlaces();

      if (places.length === 0) {
        return;
      }

      // Clear out the old markers.
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

        // Create a marker for each place.
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
    // var center = $scope.map.getCenter();
    // var lat = center.lat();
    // var lng = center.lng();
    // DateData.setGeoLocation(lat, lng);
    // for (var prop in $scope.currentTags) {
    //   tag = $scope.currentTags[prop];
    //   if(tag !== undefined){
    //     LikeADate.tag(null, tag, function(err, results){
    //       if(err){
    //         console.log(err);
    //       }
    //     });
    //   }
    // }
  };

  //Determines if the question being loaded requires the map control.
  $scope.loadMapCheck = function (_decrement) {
    if(!_decrement){
      //console.log("Decrement exists!");
      _decrement = 0;
    }
    //console.log("Current Index", +$scope.currentIndex);
    //console.log("Field: ", $scope.mandatoryQuestions[+$scope.currentIndex].field);
    if ($scope.mandatoryQuestions[+$scope.currentIndex].field === "location"){//$scope.currentIndex === $scope.mandatoryQuestions.length - 1 - _decrement + ""){ //$scope.currentIndex === '0'){  //set to first for debegugging//$scope.currentIndex === $scope.questions.length - 1 + ""){
      return true;
    } else {
      return false;
    }
  };

  $scope.savedLikes = function() {
    $rootScope.history.push($location.$$path);
    $state.go('favorites');
  }

  $scope.loadState();


}]);


