angular.module('dateworthy.services')
.factory('FindADate',['$http', '$location', '$window', '$state', function ($http, $location, $window, $state) {
  return {

    // Requests a date idea from the server given the data passed in by the user
    sendDateData: function(surveyData, callback){
      console.log("Survey Data: ", surveyData);
      return $http({
        method: 'POST',
        url: '/tags/sendDateData/',
        data: surveyData
      })
      .then(function successful (resp) {
        callback(resp.data.ideaArray);
      }, function tryAgainLater() {
        console.log("error will robinson")
        $state.go('error');
      });
    },
  };
}])