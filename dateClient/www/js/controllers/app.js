angular.module('dateworthy.app', ['ngOpenFB', 'ngCordova'])

.controller('AppCtrl', function($scope, $ionicModal, $ionicPlatform, $timeout, $location, $rootScope, $cordovaGeolocation, DateData, UserData, ngFB) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  //------------------------------------------------------------//
  // FACEBOOK LOGIN!
  //------------------------------------------------------------//
  // Creds: https://ccoenraets.github.io/ionic-tutorial/ionic-facebook-integration.html
  // PLEASE NOTE, in the original code, the scope key value pair had the string 
  // 'email,read_stream,publish_actions' as the value, but it was returning errors. 
  $scope.fbLogin = function () {
    console.log("trying to get geo location")
    $ionicPlatform.ready(function() {
      DateData.setGeoLocation();
    });
    
    ngFB.login({scope: 'email,publish_actions'})
    .then(function (response) {
        if (response.status === 'connected') {
        $location.path('/home');
        return response;
      } else {
        alert('Facebook login failed');
      }
    })
    .then(function(response) {
      // Makes call to Facebook Graph API /me to get data about the user who logged in.
      // We'll take the response from that and add it to our database. 
      var obj = {
        path: '/me',
        params: {
          access_token: response.authResponse.accessToken,
          fields: 'id,name,email'
        }
      };
      return ngFB.api(obj);
    })
    .then(function(response) {
      
      UserData.updateUserData(response);
      getUserData();
      // TODO: Write a factory function to make the user object persist across all controllers
      // and... write it to the database of course! 
    })
  }

  // Removed $scope from these, they aren't externally exposed functions
  // adding functions to $scope object is resource intensive
  var getUserData = function() {
    $scope.userData = UserData.getUserData();
  };

  var updateUserData = function() {
    var obj = {
      path: '/me',
      params: {
        access_token: window.sessionStorage.fbAccessToken,
        fields: 'id,name,email'
      }
    };
    return ngFB.api(obj)
    .then(function(userData){
      UserData.updateUserData(userData);
      getUserData();
    });
  }

  // Make sure $scope.userData is always loaded, even when page is refreshed
  $scope.$on('$stateChangeSuccess', function () {
    if(!$scope.userData || Object.keys($scope.userData).length === 0){
      updateUserData();
    }
  });

  updateUserData();

})