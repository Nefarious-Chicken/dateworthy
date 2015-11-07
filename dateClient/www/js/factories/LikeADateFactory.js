angular.module('dateworthy.services')
.factory('LikeADate', ['$http', '$state','$location', '$window', 'UserData', 'DateData', function ($http, $state,$location, $window, UserData, DateData) {
  return {
    //Returns all date ideas a user has liked
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

    // Increases the weight between a User-Tag relationship so that 
    // future ideas returned weigh more heavily on this tag.
      // IE: 'USERA' liked an 'Intellectual' date so in the future show more
      // dates that are intellectual
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

    // Decreases the weight between a User-Tag relationship so that 
    // future ideas returned weigh less heavily on this tag.
      // IE: 'USERA' disliked an 'Intellectual' date so in the future show less
      // dates that are intellectual
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

    // Establishes a 'prefers' relationship between user and tag
      // IE: 'UserA' prefers dates that are 'Intellectual'
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

    // Adds like and dislike data to the SQL database
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
      });
    }
  };
}])