angular.module('dateworthy.findadate', [])
.controller('FindADateCtrl', function($scope, $location, $timeout, $stateParams, $ionicHistory, $ionicPlatform, $document, FindADate, DateData, LikeADate) {


  // Populate the Find a Date questionnaire with Questions. These should be sorted in the order in which they appear to the user. 
  // These will eventually come from a REST API endpoint on the server, so we can dynamically serve questions. 
  $scope.questions = [
    {question: "What type of date do you enjoy in general?", type: "tag", field: "dateGenre", possibilities: ["Intellectual", "Romantic", "Goofy", "Geeky"]},
    {question: "When are you going?", type: "logistics", field: "time", possibilities: ["Today", "Tonight", "Tomorrow"]},
    {question: "How long is your date?", type: "logistics", field: "length", possibilities: ["30 minutes", "1 hour", "2 hours"]},
    {question: "What's your mode of transportation?", type: "logistics", field: "transportation", possibilities:["I'm walking","I'm taking a cab","I'm driving", "Public trans, baby!"]},
    {question: "Would you prefer a loud or quiet setting?", type: "tag", field: "noiseLevel", possibilities: ["Loud", "Quiet"]},
    {question: "Type in the city or location for your desired date location.", type: "logistics", field: "location", possibilities: []}
    
  ];
  $scope.data = {};

  // We need this code to help the app know which question should be served to the user, given the
  // param in the URL. 
  $scope.currentIndex = $stateParams.questionId;
  $scope.currentQuestion = $scope.questions[$scope.currentIndex];

  $scope.loadState = function(){
    $scope.currentLogistics = DateData.getLogistics();
    $scope.currentTags = DateData.getTags();
    preloadChosenOption($scope.currentQuestion);
  }; 

  var preloadChosenOption = function(currentQuestion) {
    if ($scope.currentLogistics !== undefined) {
      if ($scope.currentLogistics.hasOwnProperty(currentQuestion.field)) {
        $scope.currentQuestion.chosenOption = $scope.currentLogistics[currentQuestion.field];
      }
      if ($scope.currentTags.hasOwnProperty(currentQuestion.field)) {
        $scope.currentQuestion.chosenOption = $scope.currentTags[currentQuestion.field];
      }
    }
  }

  // This allows the user to navigate back and forth between the questions. 
  $scope.prevQuestion = function() {
    submitSoFar();
    $ionicHistory.goBack();
    $scope.loadState();
  };

  //creates and formats an object so that the factory can append the data
  $scope.createQuestionObject = function (question){
    var obj = {};
    var key = question.field;
    obj[key] = question.chosenOption;
    return obj;
  };

  var submitSoFar = function() {
    var currentQuestion = $scope.currentQuestion;
    var questionObject = $scope.createQuestionObject(currentQuestion);
    if (currentQuestion.type === "logistics") {
      DateData.appendLogistics(questionObject);
    } else {
      DateData.appendTags(questionObject);
    }
  }

  // This function determines what should be the next URL that 
  // the user navigates to and saves data from current survey. 
  $scope.nextQuestion = function(){
    submitSoFar();
    var tag;
    var nextQuestionId = Number($scope.currentIndex) + 1;
    if (nextQuestionId === $scope.questions.length) {

      for (prop in $scope.currentTags) {
        tag = $scope.currentTags[prop]
        if(tag !== undefined){
          LikeADate.tag(null, tag, function(err, results){
            if(err){
              console.log(err)
            }
          })
        }
      };

      FindADate.sendDateData(DateData.getConcatenatedData(), function(data){
        console.log(DateData.getConcatenatedData(), "DATA WE ARE sending")
        DateData.setDateIdeas(data);
        $scope.loadState();
        $location.path('/idea');
      });

    } else {
      var nextPath = '/findadate/' + nextQuestionId;
      $location.path(nextPath);
      $scope.loadState();
    }
  };

  
  // Initializes map and allows people to enter geographical searches. The search box will return a
  // pick list containing a mix of places and predicted search terms.

  $scope.initMap = function() {
    
    var coordinates = DateData.getGeoLocation();
    if(coordinates){
      var latitude = coordinates.lat || -34.6033
      var longitude = coordinates.long || -58.3817
    }
    var map = new google.maps.Map(document.getElementById('map'), {
      draggable: false,
      center: {lat: latitude || -34.6033, lng: longitude || -58.3817},
      zoom: 10,
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

      if (places.length == 0) {
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
  }

  $scope.loadMapCheck = function () {
    if ($scope.currentIndex === $scope.questions.length - 1 + ""){ //$scope.currentIndex === '0'){  //set to first for debegugging//$scope.currentIndex === $scope.questions.length - 1 + ""){
      setTimeout($scope.initMap, 1000);
      return true
    } else {
      return false
    }
  }

  $scope.loadState();

})

