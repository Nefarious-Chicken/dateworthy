angular.module('dateClient.services', [])
.factory('FindADate', function ($http, $location, $window) {
  return {
    sendTags: function(surveyData, callback){
      console.log("The sendTags factory method works.");
      return $http({
        method: 'POST',
        url: '/tags/sendTags/',
        data: surveyData
      })
      .then(function (resp) {
        console.log(resp.data.ideaArray);
        callback(resp.data.ideaArray);
      });
    },
  };
})
.factory('DateData', function ($http, $location, $window){
  return {
    dateIdeas: {},
    setDateIdeas: function (ideas){
      this.dateIdeas = ideas;
    },
    getDateIdeas: function (){
      return this.dateIdeas;
    }
  };
})
;
