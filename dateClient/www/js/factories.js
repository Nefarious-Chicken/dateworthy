angular.module('dateClient.services', [])
.factory('FindADate', function ($http, $location, $window) {
  return {
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
.factory('UserData', function ($http, $location, $window) {
  return {
    userData: {},
    updateUserData: function(obj) {
      console.log("The user Data: ",obj);
      for (var prop in obj) {
        if (prop === "name") {
          this.userData.firstName = obj[prop].split(' ')[0];
        }
        this.userData[prop] = obj[prop];
      }
      return $http({
        method: 'POST',
        url: '/users/',
        data: obj
      });
    },
    getUserData: function(callback) {
      //console.log("Getting user data", this.userData);
      return this.userData;
    }
  };
})
.factory('DateData', function ($http, $location, $window, UserData){
  return {

    tags: [],
    logistics: {},
    dateIdeas: {},

    appendTags: function (tags){
      for (var tag in tags){
        if (tags[tag] === 1){
          this.tags.push(tag);
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


    setDateIdeas: function (ideas){
      this.dateIdeas = ideas;
    },
    getDateIdeas: function (){
      return this.dateIdeas;
    },
    getConcatenatedData: function () {
      var data = UserData.getUserData();
      console.log("Email is: ", data.email);
      return {userName: data.email, tags: this.tags, logistics: this.logistics};
    },


    clearData: function () {
      this.tags = [];
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
