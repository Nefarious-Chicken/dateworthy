describe('Friends Unit Tests', function(){
    var Friends;
    beforeEach(module('dateClient.services'));

    it('can append active tags and get all tags', inject(function(DateData) {
        DateData.appendTags({"TestTag": 1, "TestTag2": 0, "TestTag3": 1})
        expect(DateData.getTags()).toEqual(["TestTag", "TestTag3"]);
    }));

    it('can append logistics and get all logistics', inject(function(DateData) {

        DateData.appendLogistics({"TestTag": "TestVal", "TestTag2": "TestVal2", "TestTag3": "TestVal3"})
        expect(DateData.getLogistics()).toEqual({"TestTag": "TestVal", "TestTag2": "TestVal2", "TestTag3": "TestVal3"});
    }));

    it('can get and set date ideas', inject(function(DateData) {
        DateData.setDateIdeas({Idea:"Fish"})
        expect(DateData.getDateIdeas()).toEqual({Idea:"Fish"});
    }));

    it('can get getConcatenatedData and clear data', inject(function(DateData) {
        DateData.appendTags({"TestTag": 1, "TestTag2": 0, "TestTag3": 1})
        DateData.appendLogistics({"TestTag": "TestVal", "TestTag2": "TestVal2", "TestTag3": "TestVal3"})
        expect(DateData.getConcatenatedData()).toEqual({tags: ["TestTag", "TestTag3"], logistics: {"TestTag": "TestVal", "TestTag2": "TestVal2", "TestTag3": "TestVal3"}});
        DateData.clearData()
        expect(DateData.getConcatenatedData()).toEqual({tags: [], logistics: {}})
    }));
    
});