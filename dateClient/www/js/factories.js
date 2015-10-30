angular.module('dateworthy.services', [])
.factory('FindADate', function ($http, $location, $window) {
  return {
    // you need to convert the tags object into an array.
    // { loudness: quiet , genre: intellectual }
    // turn this into ['quiet', 'intellectual'];
    sendDateData: function(surveyData, callback){
      return $http({
        method: 'POST',
        url: '/tags/sendDateData/',
        data: surveyData
      })
      .then(function (resp) {
        callback(resp.data.ideaArray);
      });
    },
  };
})
.factory('LikeADate', function ($http, $location, $window, UserData, DateData) {
  return {
    increaseTagWeight: function(tagname, callback){
      var userName = UserData.getUserData().email;
      var likeData = {tagname: tagname};
      return $http({
        method: 'POST',
        url: '/users/' + userName +'/increaseWeight/',
        data: likeData
      })
      .then(function (resp) {
        callback(resp.data);
      });
    },
    decreaseTagWeight: function(tagname, callback){
      var userName = UserData.getUserData().email;
      var disLikeData = {tagname: tagname};
      return $http({
        method: 'POST',
        url: '/users/' + userName +'/decreaseWeight/',
        data: disLikeData
      })
      .then(function (resp) {
        callback(resp.data);
      });
    },
    tag: function(currentIdeaIndex, _tagname, callback){
      var userName = UserData.getUserData().email;
      var index = currentIdeaIndex;
      var tagname = _tagname || DateData.getTags()[index];
      var tagData = {tagname: tagname};
      return $http({
        method: 'POST',
        url: '/users/' + userName +'/tag/',
        data: tagData
      })
      .then(function (resp) {
        callback(resp.data);
      });
    },
    markLikeDislike: function(dateIdeaID, likeDislikeFlag){
      var preferences = {
        dateIdeaID: dateIdeaID,
        likeDislike: likeDislikeFlag
      }
      
      return $http({
        method: 'GET',
        url: '/users/userInfo',
        params: { userName: UserData.getUserData().email }
      })
      .then(function(resp){
        preferences.userID = resp.data.userID;
      })
      .then(function(){
        $http({
          method: 'POST',
          url: '/users/userpreferences',
          data: preferences
        })
      })
      .then(function(resp){
        console.log('Updated user prefs for dateIdeaID ' + dateIdeaID);
      });
    }
  };
})
.factory('FlagADate', function($http, $location, $ionicPopup) {
  return {
    flaggedDates: [],
    flagDate: function(dateIdeaID) {
      // WRITE SERVER CODE HERE THAT WILL SHOW THIS DATE AS "FLAGGED"
      console.log("I am sending the date with dateIdeaID", dateIdeaID, "to the SQL database to be queued for removal");
      this.showAlert();
    },
    showAlert: function() {
      var alertPopup = $ionicPopup.alert({
       title: 'Thank you!',
       template: 'Thanks for helping us improve our recommendations. If enough people flag this idea,' + 
       ' We\'ll scrub it idea from our database. '
      });
    }
  }
})
.factory('UserData', function ($http, $location, $window) {
  return {
    userData: {},
    updateUserData: function(obj) {
      for (var prop in obj) {
        if (prop === "name") {
          this.userData.firstName = obj[prop].split(' ')[0];
        }
        this.userData[prop] = obj[prop];
      }
      console.log("Current user Data: ", this.userData);
      console.log("Attempting to push data to SQL");
      return $http({
        method: 'POST',
        url: '/users/',
        data: obj
      });
    },
    getUserData: function() {
      return this.userData;
    }
  };
})
.factory('DateData', function ($http, $location, $window, $cordovaGeolocation, UserData){
  return {

    tags: {},
    logistics: {},
    dateIdeas: {},
    geoLocation: null,

    appendTags: function (tags){
      for (var tag in tags){
        if (tag !== "undefined" && !this.tags.hasOwnProperty(tag)){
          this.tags[tag] = tags[tag];
        }
      }
    },
    getTags: function (){
      return this.tags;
    },
    appendLogistics: function (logistics){
      for (var logistic in logistics){
        this.logistics[logistic] = logistics[logistic];
      }
    },
    getLogistics: function (){
      return this.logistics;
    },
    setGeoLocation: function (_lat, _long){
      if(_lat && _long){
        
        this.geoLocation = {lat: _lat, long: _long};
      
      } else {

        var posOptions = {timeout: 10000, enableHighAccuracy: false};
        var context = this;
        $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
            var lat  = position.coords.latitude;
            var long = position.coords.longitude;
            context.geoLocation = {lat:lat,long:long};
          }, function(err) {
            // error
          });
      }
    },
    getGeoLocation: function(){
      return this.geoLocation;
    },

    setDateIdeas: function (ideas){
      this.dateIdeas = ideas;
    },
    getDateIdeas: function (callback){
      callback(this.dateIdeas);
    },
    getConcatenatedData: function () {
      var data = UserData.getUserData();
      // Convert the tags object into an array, which the server expects. 
      var tagsArray = [];
      for (var key in this.tags) {
        if (this.tags[key] !== undefined) {
          tagsArray.push(this.tags[key])
        }
      };
      return {userName: data.email, tags: tagsArray, logistics: this.logistics, geoLocation: this.geoLocation};
    },
    clearData: function () {
      this.tags = {};
      this.logistics = {};
      this.dateIdeas = {};
    }

  };
})
.factory('Auth', function ($http, $location){
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
})
;
