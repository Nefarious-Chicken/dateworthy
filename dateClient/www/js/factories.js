angular.module('dateworthy.services', [])
.factory('FindADate',['$http', '$location', '$window', '$state', function ($http, $location, $window, $state) {
  return {
    // you need to convert the tags object into an array.
    // { loudness: quiet , genre: intellectual }
    // turn this into ['quiet', 'intellectual'];
    sendDateData: function(surveyData, callback){
      console.log("Survey Data: ", surveyData);
      return $http({
        method: 'POST',
        url: '/tags/sendDateData/',
        data: surveyData
      })
      .then(function successful (resp) {
        callback(resp.data.ideaArray);
      }, function tryAgainLater() {
        console.log("error will robinson")
        $state.go('error');
      });
    },
  };
}])
.factory('LikeADate', ['$http', '$state','$location', '$window', 'UserData', 'DateData', function ($http, $state,$location, $window, UserData, DateData) {
  return {
    getLikedDates: function(callback){
      return $http({
        method: 'GET',
        url: '/users/userInfo',
        params: { userName: UserData.getUserData().email }
      })
      .then(function(resp){
        return $http({
          method: 'GET',
          url: '/users/userpreferences',
          params: {userID: resp.data.userID }
        })
      })
      .then(function (resp) {
        callback(resp.data);
      });
    },
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
      .then(function successful (resp) {
        callback(resp.data);
      }, function tryAgainLater() {
        console.log("error will robinson")
        $state.go('error');
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
}])
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
.factory('UserData', ['$http', '$location', '$window', '$state', function ($http, $location, $window, $state) {
  return {
    userData: {},
    updateUserData: function(obj) {
      for (var prop in obj) {
        if (prop === "name") {
          this.userData.firstName = obj[prop].split(obj.split)[0];
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
.factory('DateData', ['$http', '$location', '$window', '$cordovaGeolocation', 'UserData',function ($http, $location, $window, $cordovaGeolocation, UserData){
  return {

    tags: {},
    logistics: {},
    dateIdeas: {},
    favorite: {},
    geoLocation: null,
    optionalQuestion: -1,

    setOptionalQuestion: function(ID){
      this.optionalQuestion = ID;
    },

    getOptionalQuestion: function(){
      return this.optionalQuestion;
    },

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
    },
    getVenueData: function (venueId, callback) {
      return $http({
        method: 'GET',
        url: '/venues/venueDetails',
        params: { venueId: venueId }
      })
      .then(function (resp) {
        callback(resp.data);
      })
    },
    setFavorite: function(idea){
      this.favorite = idea;
      console.log("Favorite is now: " + this.favorite);
    }

  };
}])
.factory('Auth', ['$http', '$location', function ($http, $location){
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
