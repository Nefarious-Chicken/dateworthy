describe('IdeaControllers', function(){
    var scope;

    // load the controller's module
    beforeEach(module('dateIdea.controllers'));

    beforeEach(module('dateClient.services'));

    beforeEach(inject(function($injector, $rootScope, $controller) {
        scope = $rootScope.$new();
        $controller('IdeaCtrl', {$scope: scope});
    }));


    // tests start here
    it('should have ideas equal to an empty object and current idea equal to 0', function(){
        expect(scope.ideas).toEqual({});
        expect(scope.currentIdea).toEqual(0)
    });

    it('should have a function nextIdea that increases the currentIdea index by 1', function(){
        scope.nextIdea()
        expect(scope.currentIdea).toEqual(1)
        scope.nextIdea()
        expect(scope.currentIdea).toEqual(2)
    });

    it('should have a function prevIdea that decreases the currentIdea index by 1', function(){
        scope.prevIdea()
        expect(scope.currentIdea).toEqual(-1)
        scope.prevIdea()
        expect(scope.currentIdea).toEqual(-2)
    });

    it('should have a function isCurrent that checks if a given idea is the current idea', function(){
        scope.ideas = [{idea: 'testFirst'}, {idea: 'testSecond'}, {idea: 'testLast'}];
        expect(scope.isCurrent('testFirst')).toEqual(true);
        scope.nextIdea()
        expect(scope.isCurrent('testSecond')).toEqual(true);
        scope.nextIdea()
        expect(scope.isCurrent('testLast')).toEqual(true);
    });

    it('should have a function isLast that checks if the current idea is the last idea', function(){
        scope.ideas = [{idea: 'testFirst'}, {idea: 'testSecond'}, {idea: 'testLast'}];
        expect(scope.isLast()).toEqual(false);
        scope.nextIdea()
        expect(scope.isLast()).toEqual(false);
        scope.nextIdea()
        expect(scope.isLast()).toEqual(true);
    });

    it('should have a function isFirst that checks if the current idea is the first idea', function(){
        scope.ideas = [{idea: 'testFirst'}, {idea: 'testSecond'}, {idea: 'testLast'}];
        expect(scope.isFirst()).toEqual(true);
        scope.nextIdea()
        expect(scope.isFirst()).toEqual(false);
        scope.nextIdea()
        expect(scope.isFirst()).toEqual(false);
    });

    it('should have a function clearData resets the ideas and currentIdea variables', function(){
        scope.ideas = [{idea: 'testFirst'}, {idea: 'testSecond'}, {idea: 'testLast'}];
        scope.currentIdea = 1;
        scope.clearData();
        expect(scope.ideas).toEqual([]);
        expect(scope.currentIdea).toEqual(0)
    });
   
});

describe('ProfileQuestionsCtrl', function(){
    var scope;

    // load the controller's module
    beforeEach(module('dateIdea.controllers'));

    beforeEach(module('dateClient.services'));

    beforeEach(inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        $controller('ProfileQuestionsCtrl', {$scope: scope});
    }));

    it('should have obj isActive equal to an empty object and answers equal to {}', function(){
        expect(scope.isActive).toEqual({});
        expect(scope.answers).toEqual({});
    });


    it('should have a function select that toggles isActive for a given tag index and toggles the value connected to the tag key between 0 and 1', function(){
        scope.isActive = {0:true,1:false,2:true};
        scope.answers = {"Intellectual": 0,"Romantic": 0,"Goofy": 1};
        scope.select(0);
        scope.select(1);
        expect(scope.isActive).toEqual({0:false,1:true,2:true});
        expect(scope.answers).toEqual({"Intellectual": 0,"Romantic": 1,"Goofy": 1});
    });

    it('should have a function clearSelections that resets isActive and answers to {}', function(){
        scope.isActive = {0:true,1:false,2:true};
        scope.answers = {"Intellectual": 0,"Romantic": 0,"Goofy": 1};
        scope.clearSelections();
        expect(scope.isActive).toEqual({});
        expect(scope.answers).toEqual({});
    });

    
});

describe('FindADateCtrl', function(){
    var scope;
    var stateParams;

    // load the controller's module
    beforeEach(module('dateIdea.controllers'));

    beforeEach(module('dateClient.services'));

    beforeEach(inject(function($injector, $rootScope, $controller) {
        scope = $rootScope.$new();
        stateParams = { questionId: 0 };
        $controller('FindADateCtrl', {$scope: scope, $stateParams: stateParams});
    }));

    it('should have obj currentQuestion equal to the current question', function(){
        expect(scope.currentQuestion.question).toBeDefined();
    });


    it('should have a function createQuestionObject that formats an object for the factory based off of survey data', function(){
        var question1 = {question: "testSecond", type: "logistics", field: "length", possibilities: ["30 mins", "1 hr", "2 hrs"]};
        var question2 = {question: "testLast", type: "tag", field: null, possibilities: ["Loud", "Quiet"]};
        question1.chosenOption = question1.possibilities[0]
        question2.chosenOption = question2.possibilities[0]
        var obj = scope.createQuestionObject(question1)
        var obj2 = scope.createQuestionObject(question2)
        expect(obj["length"]).toEqual("30 mins");
        expect(obj2["Loud"]).toEqual(1);
        
    });
    
});


