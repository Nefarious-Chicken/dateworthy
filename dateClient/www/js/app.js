// Ionic dateworthy App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'dateworthy.controllers' is found in controllers.js
angular.module('dateworthy', [
  'ionic',
  'ngOpenFB',
  'dateworthy.app',
  'dateworthy.findadate',
  'dateworthy.idea',
  'dateworthy.favorites',
  'dateworthy.services'
])

.run(['$ionicPlatform', '$rootScope', '$state', '$location', 'ngFB', 'UserData',function($ionicPlatform, $rootScope, $state, $location, ngFB, UserData) {
  ngFB.init({appId: '996902650371971'});
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    //------------------------------------------------------------//
    // CHECK IF THE USER IS LOGGED IN WITH FACEBOOK
    //------------------------------------------------------------//
    // Get the user's login status on page render. If the user is logged in, let them go to
    // the home view.
    $rootScope.$on('$ionicView.enter', function(e) {
      $rootScope.userData = UserData.getUserData();
      if($rootScope.userData.email && $rootScope.userData.email !== "thenefariouschicken@gmail.com"){
        ngFB.getLoginStatus()
        .then(function(response){
          if(response.status !== "connected"){
            console.log("User is not logged in.");
            $state.go('login');
          }
        });
      }
    });

    // History state
    $rootScope.history = [];
  });
}])


//New routers will be the following:
// - login
// - /
// - welcomeBack
// - findDate
// - dateresults
// - submitIdea
// - /randomIdeas
// - /likes


.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('login', {
    url: '/login/',
    templateUrl: 'templates/login.html',
    controller: 'AppCtrl'
  })
  .state('home', {
    url: '/',
    templateUrl: 'templates/home.html',
    controller: 'AppCtrl'
  })
  .state('findadate', {
    url: '/findadate/:questionId/',
    templateUrl: 'templates/findadate.html',
    controller: 'FindADateCtrl'
  })
  .state('idea', {
    url: '/idea/:ideaId/',
    templateUrl: 'templates/idea-single.html',
    controller: 'IdeaCtrl',
    cache: false
  })
  .state('error', {
    url: '/dangerWillRobinson/',
    templateUrl: 'templates/error.html'
  })
  .state('favorites', {
    url: '/favorites/',
    templateUrl: 'templates/favorites.html',
    controller: 'FavoritesCtrl',
  })
  .state('favorite-single', {
    url: '/favorites/:ideaId',
    templateUrl: 'templates/idea-single.html',
    controller: 'IdeaCtrl',
    cache: false
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/');
}]);

