angular.module('dateworthy.services')
.factory('DateData', ['$http', '$location', '$window', '$cordovaGeolocation', 'UserData',function ($http, $location, $window, $cordovaGeolocation, UserData){
  
  //This factory contains getters and setters used to 
  //store data user inputs when filling out survey and liking dates
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
        if (tag !== "undefined"){
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

    // Sets the latitude and logitude for where the date is to start
    // _lat and _long are option parameters. If unused the coordinates will 
    // be set using the GPS coordinates retrieved from cordova
    setGeoLocation: function (_lat, _long){
      if(_lat && _long){
        this.geoLocation = {lat: _lat, long: _long};
      } else {
        var posOptions = {maximumAge: 300000, timeout: 10000, enableHighAccuracy: false};
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
          if (this.tags[key] !== "NONE") {
            tagsArray.push(this.tags[key]);
          }
        }
      };
      return {userName: data.email, tags: tagsArray, logistics: this.logistics, geoLocation: this.geoLocation};
    },

    clearData: function () {
      this.tags = {};
      this.logistics = {};
      this.dateIdeas = {};
    },

    getVenueData: function (venueId, dateIdeaName, lat, lng, callback) {
      return $http({
        method: 'GET',
        url: '/venues/venueDetails',
        params: { venueId: venueId, dateIdeaName: dateIdeaName, lat: lat, lng: lng }
      })
      .then(function (resp) {
        callback(resp.data);
      })
    },
    
    setFavorite: function(idea){
      this.favorite = idea;
    }

  };
}])