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


.controller('IdeaCtrl', function($scope, $stateParams, DateData) {
  $scope.ideas = DateData.getDateIdeas();
  $scope.currentIdea = 0;

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

})

.controller('ProfileQuestionsCtrl', function($scope, $ionicModal, $timeout, $location) {
  $scope.tags = [{tagname: "Intellectual"},{tagname: "Romantic"},{tagname: "Goofy"},{tagname: "Geeky"},{tagname: "Something"},{tagname: "Something"}]
  $scope.submit = function() {
    $location.path('/findadate');
  };
  $scope.isActive = {};

  $scope.select = function(index) {
    $scope.isActive[index] = !$scope.isActive[index];
  };
})


.controller('FindADateCtrl', function($scope, $stateParams, $location, $timeout, FindADate, DateData) {

  $scope.nextQuestion = function(){
    if($scope.currentQuestion === $scope.questions.length -1){
      console.log($scope.questions.length -1);
      $scope.currentQuestion = 0;
      //go to a loading screen
      var tags = {tags: ["STUPID"]};
      FindADate.sendTags(tags, function(data){
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
    {question: "When are you going?", possibilities: ["today", "tonight", "tommorrow"]},
    {question: "How long is your date?", possibilities: ["30 mins", "1 hr", "2 hrs"]},
    {question: "What time will the date start?", possibilities: [5,6,7]}
  ];

  $scope.currentQuestion = 0;
});


