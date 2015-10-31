describe('IdeaController', function(){
  var scope;

  // load the controller's module
  beforeEach(module('dateworthy.idea'));

  beforeEach(module('dateworthy.services'));

  beforeEach(module(function ($provide) {
    $provide.value('$cordovaGeolocation', {
        someVariable: 1
    });
  }));

  beforeEach(module(function ($provide) {
    $provide.value('$ionicPopup', {
        someVariable: 1
    });
  }));

  beforeEach(inject(function($injector, $rootScope, $controller) {
    scope = $rootScope.$new();
    cordovaGeolocation = "foo";
    ionicPopup = "bar";
    var state = {};
    state.go = function(){};
    ionicHistory = "Buzz"
    ionicLoading = "flip"
    stateParams = "flop"
    $controller('IdeaCtrl', {$scope: scope, $state: state, $stateParams: stateParams, $ionicLoading: ionicLoading, $ionicHistory: ionicHistory, $cordovaGeolocation: cordovaGeolocation, $ionicPopup: ionicPopup});
  }));

  // tests start here
  it('should have current idea equal to 0', function(){
    expect(scope.currentIdea).toEqual(0)
  });

  it('should have a function clearData that resets the ideas and currentIdea variables', function(){
    scope.ideas = [{idea: 'testFirst'}, {idea: 'testSecond'}, {idea: 'testLast'}];
    scope.currentIdea = 1;
    scope.clearData();
    expect(scope.ideas).toEqual([]);
    expect(scope.currentIdea).toEqual(0)
  });
 
  it('should have a function like that sets the `liked` property to `1` on the idea object when the user clicks Like', function() {
    scope.ideas = [{idea: 'testFirst'}, {idea: 'testSecond'}, {idea: 'testLast'}];
    scope.currentIdea = 1;
    scope.like();
    expect(scope.ideas[scope.currentIdea].liked).toEqual(1);
    expect(scope.ideas[scope.currentIdea].disliked).toEqual(0);
  });

  it('should have a function like that sets the `disliked` property to `1` on the idea object when the user clicks Dislike', function() {
    scope.ideas = [{idea: 'testFirst'}, {idea: 'testSecond'}, {idea: 'testLast'}];
    scope.currentIdea = 1;
    scope.dislike();
    expect(scope.ideas[scope.currentIdea].disliked).toEqual(1);
    expect(scope.ideas[scope.currentIdea].liked).toEqual(0);
  });

  it('should set item\'s disliked property to `1` if the item has been liked then disliked', function() {
    scope.ideas = [{idea: 'testFirst'}, {idea: 'testSecond'}, {idea: 'testLast'}];
    scope.currentIdea = 1;
    scope.like();
    scope.dislike();
    expect(scope.ideas[scope.currentIdea].disliked).toEqual(1);
    expect(scope.ideas[scope.currentIdea].liked).toEqual(0);
  });


});

describe('FindADateCtrl', function(){
  var scope;
  var stateParams;
  var location;

  // load the controller's module
  beforeEach(module('dateworthy.findadate'));

  beforeEach(module('dateworthy.services'));

  beforeEach(module(function ($provide) {
    $provide.value('$cordovaGeolocation', {
        someVariable: 1
    });
  }));


  beforeEach(inject(function($injector, $rootScope, $controller, _$location_) {
    scope = $rootScope.$new();
    stateParams = { questionId: 0 };
    ionicHistory = "foo";
    ionicPlatform = "bar";
    state = {};
    state.go = function(){}
    location = _$location_;
    $controller('FindADateCtrl', {$scope: scope, $state: state, $stateParams: stateParams, $cordovaGeolocation: cordovaGeolocation, $ionicHistory: ionicHistory, $ionicPlatform: ionicPlatform, $location: location});

  }));

  it('should have obj currentQuestion equal to the current question', function(){
    expect(scope.currentQuestion.question).toBeDefined();
  });

  it('should update the URL when someone clicks "Next" in the findadate survey', function() {
    location.path('/findadate/0');
    scope.nextQuestion();
    expect(location.path()).toEqual('/findadate/1');
  });

  it('should have a function createQuestionObject that formats an object for the factory based off of survey data', function(){
    var question1 = {question: "testSecond", type: "logistics", field: "length", possibilities: ["30 mins", "1 hr", "2 hrs"]};
    var question2 = {question: "testLast", type: "tag", field: "noiseLevel", possibilities: ["Loud", "Quiet"]};
    question1.chosenOption = question1.possibilities[0];
    question2.chosenOption = question2.possibilities[0];
    var obj1 = scope.createQuestionObject(question1);
    var obj2 = scope.createQuestionObject(question2);
    console.log("obj1 is", obj1);
    expect(obj1["length"]).toEqual("30 mins");
    expect(obj2["noiseLevel"]).toEqual("Loud"); 
  });

});


