describe('Factory Unit Tests', function(){
  beforeEach(module('dateworthy.services'));

  beforeEach(module(function ($provide) {
    $provide.value('$cordovaGeolocation', {
        someVariable: 1
    });
  }));

  it('can append active tags and get all tags', inject(function(DateData) {
    DateData.appendTags({"dateGenre": "Romantic", "noiseLevel": "Quiet"})
    expect(DateData.getTags()).toEqual({"dateGenre": "Romantic", "noiseLevel": "Quiet"});
  }));

  it('can append logistics and get all logistics', inject(function(DateData) {
    DateData.appendLogistics({"TestLogistic1": "TestVal1", "TestLogistic2": "TestVal2", "TestLogistic3": "TestVal3"})
    expect(DateData.getLogistics()).toEqual({"TestLogistic1": "TestVal1", "TestLogistic2": "TestVal2", "TestLogistic3": "TestVal3"});
  }));

  it('can get and set date ideas', inject(function(DateData) {
    DateData.setDateIdeas({Idea:"Fish"})
    var newIdeas = "foo";
    DateData.getDateIdeas(function(ideas) {
      newIdeas = ideas;
    });
    expect(newIdeas).toEqual({Idea:"Fish"});
  }));

  it('can get getConcatenatedData', inject(function(DateData) {
    DateData.appendTags({"dateGenre": "Romantic", "noiseLevel": "Quiet"})
    DateData.appendLogistics({"TestLogistic1": "TestVal", "TestLogistic2": "TestVal2", "TestLogistic3": "TestVal3"})
    expect(DateData.getConcatenatedData().tags).toEqual(["Romantic", "Quiet"]);
    expect(DateData.getConcatenatedData().logistics).toEqual({"TestLogistic1": "TestVal", "TestLogistic2": "TestVal2", "TestLogistic3": "TestVal3"});
  }));

  it('can clear data', inject(function(DateData) {
    DateData.appendTags({"dateGenre": "Romantic", "noiseLevel": "Quiet"})
    DateData.appendLogistics({"TestLogistic1": "TestVal", "TestLogistic2": "TestVal2", "TestLogistic3": "TestVal3"})
    DateData.clearData()
    expect(DateData.getConcatenatedData().tags).toEqual([]);
    expect(DateData.getConcatenatedData().logistics).toEqual({});
  }))
  
});