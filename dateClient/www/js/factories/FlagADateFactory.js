angular.module('dateworthy.services')
.factory('FlagADate',['$http', '$location', '$ionicPopup', function($http, $location, $ionicPopup) {
  return {
    flaggedDates: [],
    flagDate: function(dateIdeaID, callback) {
      this.showAlert(dateIdeaID, callback);
    },
    showAlert: function(dateIdeaID, callback) {
      var confirmPopup = $ionicPopup.confirm({
       title: 'Are you sure?',
       template: 'Are you sure you want to flag this as a bad date idea? If enough people flag this idea, we\'ll scrub it from our database.'
     });
      confirmPopup.then(function(res) {
        if (res) {
          var dateObj = {
            dateIdeaID: dateIdeaID
          };
          return $http({
            method: 'POST',
            url: '/dateIdeas/blacklistDate/',
            data: dateObj
          })
          .then(function() {
            callback(res);
          })
        } else {
          console.log("Didn't flag");
        }
      });
    }
  }
}])