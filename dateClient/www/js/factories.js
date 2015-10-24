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
      for (var prop in obj) {
        if (prop === "name") {
          this.userData.firstName = obj[prop].split(' ')[0];
        }
        this.userData[prop] = obj[prop];
      }
    },
    getUserData: function(callback) {
      console.log("Getting user data", this.userData);
      callback(this.userData);
    }
  }
})
.factory('DateData', function ($http, $location, $window){
  return {

    tags: [],
    logistics: {},
    dateIdeas: {},

    appendTags: function (tags){
      for (tag in tags){
        if (tags[tag] === 1){
          this.tags.push(tag);
        }
      }
    },
    getTags: function (){
      return this.tags;
    },


    appendLogistics: function (logistics){
      for (logistic in logistics){
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
      return {tags: this.tags, logistics: this.logistics}
    },


    clearData: function () {
      this.tags = [];
      this.logistics = {};
      this.dateIdeas = {};
    }

  };
})
;
