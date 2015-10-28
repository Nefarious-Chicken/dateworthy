angular.module('dateIdea.controllers', ['ngOpenFB', 'ngCordova'])

.controller('AppCtrl', function($scope, $ionicModal, $ionicPlatform, $timeout, $location, $rootScope, $cordovaGeolocation, DateData, UserData, ngFB) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  //------------------------------------------------------------//
  // FACEBOOK LOGIN!
  //------------------------------------------------------------//
  // Creds: https://ccoenraets.github.io/ionic-tutorial/ionic-facebook-integration.html
  // PLEASE NOTE, in the original code, the scope key value pair had the string 
  // 'email,read_stream,publish_actions' as the value, but it was returning errors. 
  $scope.fbLogin = function () {
    console.log("trying to get geo location")
    $ionicPlatform.ready(function() {
      DateData.setGeoLocation();
    });
    ngFB.login({scope: 'email,publish_actions'})
    .then(function (response) {
        if (response.status === 'connected') {
        $location.path('/home');
        return response;
      } else {
        alert('Facebook login failed');
      }
    })
    .then(function(response) {
      // Makes call to Facebook Graph API /me to get data about the user who logged in.
      // We'll take the response from that and add it to our database. 
      var obj = {
        path: '/me',
        params: {
          access_token: response.authResponse.accessToken,
          fields: 'id,name,email'
        }
      };
      return ngFB.api(obj);
    })
    .then(function(response) {
      UserData.updateUserData(response);
      getUserData();
      // TODO: Write a factory function to make the user object persist across all controllers
      // and... write it to the database of course! 
    })
  }

  // Removed $scope from these, they aren't externally exposed functions
  // adding functions to $scope object is resource intensive
  var getUserData = function() {
    $scope.userData = UserData.getUserData();
  };

  var updateUserData = function() {
    var obj = {
      path: '/me',
      params: {
        access_token: window.sessionStorage.fbAccessToken,
        fields: 'id,name,email'
      }
    };
    if(obj.params.access_token){
      return ngFB.api(obj)
      .then(function(userData){
        UserData.updateUserData(userData);
        getUserData();
      });
    }
  };

  // Make sure $scope.userData is always loaded, even when page is refreshed
  $scope.$on('$stateChangeSuccess', function () {
    if(!$scope.userData || Object.keys($scope.userData).length === 0){
      updateUserData();
    }
  });
  updateUserData();

})


.controller('IdeasCtrl', function($scope, $timeout, $location, DateData, LikeADate) {

  $scope.ideas = DateData.getDateIdeas();
  $scope.currentIdea = 0;

  $scope.$on('$stateChangeSuccess', function () {
    $scope.ideas = DateData.getDateIdeas();
  });

  $scope.nextIdea= function(){
    $scope.currentIdea++;
  };

  $scope.prevIdea= function(){
    $scope.currentIdea--;
  };

  $scope.isCurrent = function(idea){
    return $scope.ideas[$scope.currentIdea].idea === idea;
  };

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
  }

  $scope.isLast = function( idea ) {
    return $scope.currentIdea === $scope.ideas.length - 1;
  };

  $scope.isFirst = function( idea ) {
    return $scope.currentIdea === 0;
  };

  $scope.clearData = function(){
    $scope.ideas = [];
    $scope.currentIdea = 0;
    DateData.clearData();
    $location.path('/home');
  };

})

.controller('FindADateCtrl', function($scope, $location, $timeout, $stateParams, $ionicHistory, $ionicPlatform, FindADate, DateData, LikeADate) {


  // Populate the Find a Date questionnaire with Questions. These should be sorted in the order in which they appear to the user. 
  // These will eventually come from a REST API endpoint on the server, so we can dynamically serve questions. 
  $scope.questions = [
    {question: "What type of date do you enjoy in general?", type: "tag", field: "dateGenre", possibilities: ["Intellectual", "Romantic", "Goofy", "Geeky"]},
    {question: "When are you going?", type: "logistics", field: "time", possibilities: ["Today", "Tonight", "Tomorrow"]},
    {question: "How long is your date?", type: "logistics", field: "length", possibilities: ["30 minutes", "1 hour", "2 hours"]},
    {question: "What's your mode of transportation?", type: "logistics", field: "transportation", possibilities:
      ["I'm walking","I'm taking a cab","I'm driving", "Public trans, baby!"]},
    {question: "Would you prefer a loud or quiet setting?", type: "tag", field: "noiseLevel", possibilities: ["Loud", "Quiet"]}
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

  $scope.loadState();
})

.controller('IdeaCtrl', function($location, $ionicHistory, $scope, $stateParams, DateData, LikeADate) {
  $scope.ideas = DateData.getDateIdeas();
  $scope.currentIdea = $stateParams.ideaId;
  $scope.idea = $scope.ideas[$scope.currentIdea];

  // Make sure $scope.userData is always loaded, even when page is refreshed
  $scope.$on('$stateChangeSuccess', function () {
    $scope.ideas = DateData.getDateIdeas();
    console.log($scope.ideas);
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

});


