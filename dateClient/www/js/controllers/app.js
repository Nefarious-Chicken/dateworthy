angular.module('dateworthy.app', ['ngOpenFB', 'ngCordova', 'angularSpinner'])

.controller('AppCtrl', ['$ionicHistory', '$state', '$scope', '$ionicModal', '$ionicPlatform', '$timeout', '$location', '$rootScope', '$cordovaGeolocation', 'DateData', 'UserData', 'ngFB', function($ionicHistory, $state, $scope, $ionicModal, $ionicPlatform, $timeout, $location, $rootScope, $cordovaGeolocation, DateData, UserData, ngFB) {

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


  //Once the main controller loads, this function grabs the users coordinates
  $scope.fbLogin = function () {

    //console.log("You're logging into facebook?");
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
    //once we are logged in, we update the userdata factory to persist user information.
    .then(function(response) {
      UserData.updateUserData(response);
      getUserData();
    });
  };

  //when the page is loaded, we will get your geolocation and confirm your login status.
  $ionicPlatform.ready(function() {
    DateData.setGeoLocation();
    myUser = UserData.getUserData();
    //thenefariousChicken@gmail.com is the organization's email address and the default address for anonymous users
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

  //A controller that will tell the template whether or not to show the favorites button.
  //an anonymous user cannot favorite date ideas.
  $scope.showFavorites = function(){
    if($scope.userData && $scope.userData.email === "thenefariouschicken@gmail.com"){
      return false;
    } else {
      return true;
    }
  };

  //When a change occurs to the user's data, we will push it to the factory,
  //and confirm the facebook login token.
  var updateUserData = function(anonymous) {
    var myUser = UserData.getUserData();
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
  };

  //When a user clicks, "Just give me a date idea, already!" we log them in as an anonymous user.
  $scope.noLogin = function(){
    //console.log("Don't log into facebook!");
    UserData.updateUserData({name: "date seeker~", split: "~", email: "thenefariouschicken@gmail.com"});
    getUserData();
    $state.go('home');
    //$state.go('login');
  };

  //Scope navigation to your saved date ideas.
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

}]);