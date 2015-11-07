angular.module('dateworthy.services', [])
.factory('Auth', ['$http', '$location', function ($http, $location){
  
  //Adds new user to the SQL database
  return {
    login: function(obj, callback) {
      return $http({
        method: 'POST',
        url: '/users/signup',
        data: obj
      })
      .then(function (resp){
        callback(resp);
      });
    }
  }
}]);
