var assert = require('assert')
    , isAPI = require('isapi');

var api = isAPI();

api.host('staging-api.formagg.io');

var fixtures = {

  maker: {
    name: 'Test Cheese Maker',
    state: 'Vermont',
    country: 'United States'
  }

};

describe('/maker', function(done) {   

  it('should create new', function(done){
    _.clone(api)
      .path('/maker')
      .json()
      .post( fixtures.maker )
      .debug(true)
      .assertions(
        { 
          '$.name': function(val) { assert.equal(val, fixtures.maker.name) } 
        }
      )
      .done(done);
    }
  );

});