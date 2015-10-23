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
