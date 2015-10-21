angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $location) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});


  // Form data for the login modal
  //$scope.loggedIn = false;

  $scope.loginData = {};

  $scope.$on('$ionicView.enter', function(e) {
    // if(!$scope.loggedIn){
    //   $location.path('/login');
    // }
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $location.path('/');
  };

  // Open the login modal
  $scope.login = function() {
    $location.path('/login');
  };
  

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);
    $scope.loggedIn = true;

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
  
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})


.controller('PlaylistCtrl', function($scope, $stateParams) {
})
.controller('IdeaCtrl', function($scope, $stateParams) {
  $scope.ideas = [{idea: "Frisbee in Dolores"},
    {idea: "Get schwasted at Branch and Bourbon"},
    {idea: "Kiss in the middle of the golden gate bridge"}
  ]

  $scope.currentIdea = 0;

  $scope.nextIdea= function(){
    $scope.currentIdea++;
  }

  $scope.prevIdea= function(){
    $scope.currentIdea--;
  }

  $scope.isCurrent = function(idea){
    return $scope.ideas[$scope.currentIdea].idea === idea;
  }
  $scope.isLast = function( idea ) {
    return $scope.currentIdea === $scope.ideas.length - 1;
  }
  $scope.isFirst = function( idea ) {
    return $scope.currentIdea === 0;
  }
})

.controller('FindADateCtrl', function($scope, $stateParams, $location, $timeout) {
  $scope.questions = [{question: "When are you going?", possabilities: ["today", "tonight", "tommorrow"]},
    {question: "How long is your date?", possabilities: ["30 mins", "1 hr", "2 hrs"]},
    {question: "What time will the date start?", possabilities: [5,6,7]} 
  ]
  $scope.currentQuestion = 0;

  $scope.nextQuestion= function(){
    if($scope.currentQuestion === $scope.questions.length -1){
      console.log($scope.questions.length -1)
      $scope.currentQuestion = 0;
      $location.path('/idea');
    } else {

      $scope.currentQuestion++;
    }
  }
  
  $scope.isCurrent = function(question){
    return $scope.questions[$scope.currentQuestion].question === question;
  }
});


