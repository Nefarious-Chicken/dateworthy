angular.module('dateworthy.services')
.factory('FindADate',['$http', '$location', '$window', '$state', function ($http, $location, $window, $state) {
  return {
    // you need to convert the tags object into an array.
    // { loudness: quiet , genre: intellectual }
    // turn this into ['quiet', 'intellectual'];
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