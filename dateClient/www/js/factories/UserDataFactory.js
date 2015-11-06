angular.module('dateworthy.services')
.factory('UserData', ['$http', '$location', '$window', '$state', function ($http, $location, $window, $state) {
  return {
    userData: {},
    updateUserData: function(obj) {
      for (var prop in obj) {
        if (prop === "name") {
          if(obj.split){
            this.userData.firstName = obj[prop].split(obj.split)[0];
          } else{
            this.userData.firstName = obj[prop].split(" ")[0];
          }
        }
        this.userData[prop] = obj[prop];
      }
      console.log("Current user Data: ", this.userData);
      console.log("Attempting to push data to SQL");
      return $http({
        method: 'POST',
        url: '/users/',
        data: obj
      })
      .then(function successful (resp) {
        
      }, function tryAgainLater() {
        console.log("error will robinson")
        $state.go('error');
      });
    },
    getUserData: function() {
      return this.userData;
    }
  };
}])