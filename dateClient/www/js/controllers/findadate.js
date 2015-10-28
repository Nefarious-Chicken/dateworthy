angular.module('dateworthy.findadate', [])
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
