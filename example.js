var assert   = require('assert');
var _        = require('underscore');
var api      = require('./lib/isapi').Base;

api.host('staging-api.formagg.io');

describe('/relationship', function(done) {   

  it('should retreive a maker', function(done){
    _.clone(api)
      .path('/maker/510df090da57f2000000011e')
      .json()
      .get()
      .debug(false)
      .assertions(
        { 
          '$.name': function(val) { assert.equal(val, 'Lactalis') } 
        }
      )
      .done(done);
    }
  );

  it('should give us the new maker', function(done){

    _.clone(api)
      .path('/maker')
        .query('a=111')
        .query( [ 't=11', 'r4=222'])
        .query('b=111')
      .json()
      .post( 
        {
          name: 'This little test',
          source: 'cow',
          texture: 'Blue'
        }
      )
      .debug(true)
      .assertions(
        { 
          '$.statusCode': function(val) { assert.equal(val, 401) },
          '$.data': function(val) { assert.equal(val, 'Unauthorized') },
          '$.raw': function(val) { assert.equal(val, '111') }
        }
      )
      .done(done);
    }
  );

});

