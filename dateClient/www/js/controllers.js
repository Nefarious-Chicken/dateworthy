angular.module('dateIdea.controllers', ['ngOpenFB'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $location, $rootScope, DateData, UserData, ngFB) {

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
    ngFB.login({scope: 'email,publish_actions'})
    .then(function (response) {
        if (response.status === 'connected') {
        console.log('Facebook login succeeded', response);
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
      console.log("The response from the promise is", response);
      UserData.updateUserData(response);
      $scope.getUserData();
      // TODO: Write a factory function to make the user object persist across all controllers
      // and... write it to the database of course! 
    })
  }

  // Removed $scope from these, they aren't externally exposed functions
  // adding functions to $scope object is resource intensive
  var getUserData = function() {
    UserData.getUserData(function(response) {
      $scope.userData = response;
    });
  }; 

  var updateUserData = function() {
    var obj = {
      path: '/me',
      params: {
        access_token: window.sessionStorage.fbAccessToken,
        fields: 'id,name,email'
      }
    };
    return ngFB.api(obj)
    .then(function(userData){
      UserData.updateUserData(userData);
      getUserData();
    });
  }

  // Make sure $scope.userData is always loaded, even when page is refreshed
  $scope.$on('$stateChangeSuccess', function () {
    if(!$scope.userData || Object.keys($scope.userData).length === 0){
      updateUserData();
    }
  });

  updateUserData();

})


.controller('IdeaCtrl', function($scope, $timeout, $location, DateData) {

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
    $scope.ideas[$scope.currentIdea].liked = 1;
    $scope.ideas[$scope.currentIdea].disliked = 0;
    // TODO: Write a factory that talks to the server and updates the server.
    // Maybe do this when the user hits the NEXT IDEA button?
  }

  $scope.dislike = function() {
    $scope.ideas[$scope.currentIdea].disliked = 1;
    $scope.ideas[$scope.currentIdea].liked = 0;  
    // TODO: Write a factory that talks to the server and updates the server.
    // Maybe do this when the user hits the NEXT IDEA button?
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
    $location.path('/');
  };

})

.controller('ProfileQuestionsCtrl', function($scope, $timeout, $location, DateData) {

  $scope.isActive = {};
  $scope.answers = {};
  $scope.tags = [{tagname: "Intellectual"},{tagname: "Romantic"},{tagname: "Goofy"},{tagname: "Geeky"},{tagname: "Indoor"},{tagname: "Outdoor"}]
  $scope.submit = function() {
    DateData.appendTags($scope.answers);
    //timeout so that the user doesnt think the selection was unselected
    $timeout($scope.clearSelections, 1000);
    $location.path('/findadate/0');
  };
  
  $scope.select = function(index) {

    $scope.isActive[index] = !$scope.isActive[index];
    if($scope.isActive[index]){
      $scope.answers[$scope.tags[index].tagname] = 1;
    } else {
      $scope.answers[$scope.tags[index].tagname] = 0;
    }

  };

  $scope.clearSelections = function(){
    $scope.isActive = {};
    $scope.answers = {};
  }
})


.controller('FindADateCtrl', function($scope, $location, $timeout, $stateParams, $ionicHistory, FindADate, DateData) {


  // Populate the Find a Date questionnaire with Questions. These should be sorted in the order in which they appear to the user. 
  // These will eventually come from a REST API endpoint on the server, so we can dynamically serve questions. 
  $scope.questions = [
    {question: "When are you going?", type: "logistics", field: "time", possibilities: ["Today", "Tonight", "Tomorrow"]},
    {question: "How long is your date?", type: "logistics", field: "length", possibilities: ["30 minutes", "1 hour", "2 hours"]},
    {question: "What's your mode of transportation?", type: "logistics", field: "transportation", possibilities:
      ["I'm walking","I'm taking a cab","I'm driving", "Public trans, baby!"]},
    {question: "Would you prefer a loud or quiet setting?", type: "tag", field: null, possibilities: ["Loud", "Quiet"]}
  ];

  $scope.data = {};

  // We need this code to help the app know which question should be served to the user, given the
  // param in the URL. 
  $scope.currentIndex = $stateParams.questionId;
  $scope.currentQuestion = $scope.questions[$scope.currentIndex];

  $scope.loadState = function(){
    $scope.currentLogistics = DateData.getLogistics();
    $scope.currentTags = DateData.getTags();
  }; 

  // This allows the user to navigate back and forth between the questions. 
  $scope.prevQuestion = function() {
    $ionicHistory.goBack();
    $scope.loadState();
  };

  //creates and formats an object so that the factory can append the data
  $scope.createQuestionObject = function (question){
    var obj = {};
    if (question.type === "logistics") {
      var key = question.field;
      obj[key] = question.chosenOption;
    } else {
      var key = question.chosenOption;
      obj[key] = 1;
    }
    return obj
  }

  // This function determines what should be the next URL that 
  // the user navigates to and saves data from current survey. 
  $scope.nextQuestion = function(){
    var nextQuestionId = Number($scope.currentIndex) + 1;
    var currentQuestion = $scope.currentQuestion;
    var questionObject = $scope.createQuestionObject(currentQuestion);

    if (currentQuestion.type === "logistics") {
      DateData.appendLogistics(questionObject);
    } else {
      DateData.appendTags(questionObject);
    }

    if (nextQuestionId === $scope.questions.length) {
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
});


