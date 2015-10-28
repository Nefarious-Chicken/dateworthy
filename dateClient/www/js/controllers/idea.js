angular.module('dateworthy.idea', ['ngOpenFB', 'ngCordova'])

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


