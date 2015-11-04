angular.module('dateworthy.app', ['ngOpenFB', 'ngCordova', 'angularSpinner'])

.controller('AppCtrl', [ '$state', '$scope', '$ionicModal', '$ionicPlatform', '$timeout', '$location', '$rootScope', '$cordovaGeolocation', 'DateData', 'UserData', 'ngFB', function($state, $scope, $ionicModal, $ionicPlatform, $timeout, $location, $rootScope, $cordovaGeolocation, DateData, UserData, ngFB) {

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


  //once the main controller loads grab users coordinates
  
  $scope.fbLogin = function () {

    console.log("You're logging into facebook?");
    ngFB.login({scope: 'email,publish_actions'})
    .then(function (response) {
        if (response.status === 'connected') {
        $state.go('home');
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
    });
  };

  $ionicPlatform.ready(function() {
    DateData.setGeoLocation();
    myUser = UserData.getUserData();
    if(myUser.email !== "thenefariouschicken@gmail.com"){
      ngFB.getLoginStatus()
      .then(function(response){
        if(response.status !== "connected"){
          console.log("User is not logged in.");
          $state.go('login');
        }
      });
    }
  });

  // Removed $scope from these, they aren't externally exposed functions
  // adding functions to $scope object is resource intensive
  var getUserData = function() {
    $scope.userData = UserData.getUserData();
  };

  $scope.showFavorites = function(){
    if($scope.userData && $scope.userData.email === "thenefariouschicken@gmail.com"){
      return false;
    } else {
      return true;
    }
  };

  var updateUserData = function(anonymous) {
    var myUser = UserData.getUserData();
    if(myUser.email && myUser.email !== "thenefariouschicken@gmail.com"){
      var obj = {
        path: '/me',
        params: {
          access_token: window.sessionStorage.fbAccessToken,
          fields: 'id,name,email'
        }
      };
      if(obj.params.access_token){
        return ngFB.api(obj)
        .then(function(userData){
          userData.split = " ";
          UserData.updateUserData(userData);
          getUserData();
        });
      }
    }
  };

  $scope.noLogin = function(){
    console.log("Don't log into facebook!");
    UserData.updateUserData({name: "date seeker~", split: "~", email: "thenefariouschicken@gmail.com"});
    getUserData();
    $state.go('home');
    //$state.go('login');
  };

  $scope.savedLikes = function() {
    $rootScope.history.push($location.$$path);
    $state.go('favorites');
  };

  // Make sure $scope.userData is always loaded, even when page is refreshed
  $scope.$on('$stateChangeSuccess', function () {
    if(!$scope.userData || Object.keys($scope.userData).length === 0){
      updateUserData();
    }
  });

  //updateUserData();

}])