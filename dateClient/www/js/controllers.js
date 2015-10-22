angular.module('dateIdea.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $location) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});


  //Legacy data from the template
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


.controller('IdeaCtrl', function($scope, $stateParams, $ionicModal, $timeout, $location, DateData) {

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

  $scope.isLast = function( idea ) {
    return $scope.currentIdea === $scope.ideas.length - 1;
  };

  $scope.isFirst = function( idea ) {
    return $scope.currentIdea === 0;
  };

  $scope.clearData = function(){
    console.log($scope.isActive);
    $scope.ideas = [];
    $scope.currentIdea = 0;
    DateData.clearData();
    $location.path('/');
  };

})

.controller('ProfileQuestionsCtrl', function($scope, $ionicModal, $timeout, $location, DateData) {
  $scope.tags = [{tagname: "Intellectual"},{tagname: "Romantic"},{tagname: "Goofy"},{tagname: "Geeky"},{tagname: "Something"},{tagname: "Something"}]
  $scope.submit = function() {
    DateData.appendTags($scope.answers);
    $scope.isActive = {};
    $location.path('/findadate');
  };
  $scope.isActive = {};
  $scope.answers = {};


  $scope.select = function(index) {

    $scope.isActive[index] = !$scope.isActive[index];
    if($scope.isActive[index]){
      $scope.answers[$scope.tags[index].tagname] = 1;
    } else {
      $scope.answers[$scope.tags[index].tagname] = 0;
    }

  };
})


.controller('FindADateCtrl', function($scope, $stateParams, $location, $timeout, FindADate, DateData) {

  $scope.nextQuestion = function(question, index){
    if(question.type === "logistics"){
      var key = question.field;
      var val = question.possibilities[index];
      var obj = {};
      obj[key] = val;
      DateData.appendLogistics(obj)
    } else if (question.type === "tag"){
      var key = question.possibilities[index];
      var obj = {};
      obj[key] = 1;
      DateData.appendTags(obj);
    }
    //if type is logistics then append a key value pair w/ key as "field" and value as possability
    if($scope.currentQuestion === $scope.questions.length -1){
      $scope.currentQuestion = 0;
        //go to a loading screen
        FindADate.sendDateData(DateData.getConcatenatedData(), function(data){
        DateData.setDateIdeas(data);
        $location.path('/idea');
      });
    } else {
      $scope.currentQuestion++;
    }
  };

  $scope.isCurrent = function(question){
    return $scope.questions[$scope.currentQuestion].question === question;
  };

  $scope.questions = [
    {question: "When are you going?", type: "logistics", field: "time", possibilities: ["today", "tonight", "tommorrow"]},
    {question: "How long is your date?", type: "logistics", field: "length", possibilities: ["30 mins", "1 hr", "2 hrs"]},
    {question: "What's your mode of transportation", type: "logistics", field: "transportation", possibilities: ["walk","taxi","drive", "public transportation"]},
    {question: "Would you prefer a loud or quiet setting?", type: "tag", field: null, possibilities: ["Loud", "Quiet"]}
  ];

  $scope.currentQuestion = 0;
});


