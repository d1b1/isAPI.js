var assert   = require('assert');
var _        = require('underscore');

var api = require('./lib/isapi2');

// TODO: Add in the Auth callback options to the new codebase.

api.setup( 
 { 
  'host': 'localhost',
  'port': 4001,
  'auth': {
    consumer_key:    'abc123', 
    consumer_secret: 'ssh-secret', 
    token:           '3H3Mw4Oxi5vDmujM', 
    token_secret:    'nF7duFct2qTnZpPKcvGabJJwS2lU3zYng0cz1OCRtJgdOb4elhEJkol7j3OTSHoR' 
  }
 }
);

var formaggio = api();

formaggio.get().path('/maker/516c16906b5c870200000004').done();

return;

GLOBAL.spacedInfo = {};

// Define the auth values for signing requests.
api.configAuth( { 
  consumer_key:    'abc123', 
  consumer_secret: 'ssh-secret', 
  token:           '3H3Mw4Oxi5vDmujM', 
  token_secret:    'nF7duFct2qTnZpPKcvGabJJwS2lU3zYng0cz1OCRtJgdOb4elhEJkol7j3OTSHoR' 
});

// Define the auth callback function.
api.auth_cb( require('./lib/isapi').authorization.sign );

describe('/relationship', function(done) {   

  // it('should retreive a maker', function(done){
  //   _.clone(api)
  //     .path('/maker/5192f988add2886f2a000002')
  //     .json()
  //     .get()
  //     .authorize()
  //     .debug(false)
  //     .assertions(
  //       { 
  //         '$.data.name': function(val) { assert.equal(val, 'asdadsfasdf') },
  //         '$.data._id': function(val) { assert.equal(val, '5192f988add2886f2a000002') }, 
  //       }
  //     )
  //     .remember( 'NewMaker' )
  //     .done(done);
  //   }
  // );

  it('should give us the new maker', function(done){

    _.clone(api)
      .path('/maker')
      .json()
      .authorize()
      .post( 
        {
          "name": "My Test Maker"
        }
      )
      .debug(false)
      .assertions(
        { 
          '$.statusCode': function(val) { assert.equal(val, 200) },
        }
      )
      .remember( 'NewMaker' )
      .done(done);
    }
  );

  it('should retreive a maker', function(done){
    _.clone(api)
      .path('/maker/' + GLOBAL.spacedInfo.NewMaker._id)
      .json()
      .get()
      .authorize()
      .debug(false)
      .assertions(
        { 
          '$.data.name': function(val) { assert.equal(val, GLOBAL.spacedInfo.NewMaker.name ) },
          '$.data._id': function(val) { assert.equal(val, GLOBAL.spacedInfo.NewMaker._id ) }, 
        }
      )
      .done(done);
    }
  );

});

