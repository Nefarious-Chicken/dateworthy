// Ionic DateIdea App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'dateIdea.controllers' is found in controllers.js
angular.module('dateIdea', ['ionic', 'dateIdea.controllers', 'dateClient.services'])

.run(function($ionicPlatform) {
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
  });
})


//New routers will be the following:
// - login
// - /
// - welcomeBack
// - findDate
// - dateresults
// - submitIdea
// - /randomIdeas
// - /likes


.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('home', {
    url: '/',
    templateUrl: 'templates/home.html',
    controller: 'AppCtrl'
  })

  .state('profilequestions', {
    url: '/profilequestions',
    templateUrl: 'templates/profilequestions.html',
    controller: 'ProfileQuestionsCtrl'
  })

  .state('findadate', {
    url: '/findadate/:questionId',
    templateUrl: 'templates/findadate.html',
    controller: 'FindADateCtrl'
  })

  .state('idea', {
    url: '/idea',
    templateUrl: 'templates/idea.html',
    controller: 'IdeaCtrl'
  })


  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'AppCtrl'
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/');
});


