describe('Controllers', function(){
    var scope;

    // load the controller's module
    beforeEach(module('dateIdea.controllers'));

    beforeEach(module('dateClient.services'));

    beforeEach(inject(function($rootScope, $controller) {
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

    it('should have a function isCurrent that checks if', function(){

    });

    it('should have a function isLast that checks if', function(){

    });

    it('should have a function isFirst that checks if', function(){

    });
    
    it('should have a function clearData that checks if', function(){

    });
    // $scope.isCurrent = function(idea){
    //   return $scope.ideas[$scope.currentIdea].idea === idea;
    // };

    // $scope.isLast = function( idea ) {
    //   return $scope.currentIdea === $scope.ideas.length - 1;
    // };

    // $scope.isFirst = function( idea ) {
    //   return $scope.currentIdea === 0;
    // };

    // $scope.clearData = function(){
    //   $scope.ideas = [];
    //   $scope.currentIdea = 0;
    //   DateData.clearData();
    //   $location.path('/');
    // };
});