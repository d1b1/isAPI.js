var assert = require('assert');
var api    = require('../lib/isapi2');
//var sionon = require('sinon');

// Simple Placeholder mocha test for getting started with travis.

// describe('defaults', function() {  

//   api.setup( 
//    { 
//     'host': 'test.com',
//     'port': 80
//    }
//   );

//   var aAPI = api();

//   it('has global defaults (host,port,protocal)', function(){
//     assert.equal(aAPI.getParam('host'), 'test.com');
//     assert.equal(aAPI.getParam('port'), 80);
//     assert.equal(aAPI.getParam('protocal'), 'http');
//     assert.equal(aAPI.getParam('method'), 'get');
//   });
 
//   it('has changed', function(){
//     aAPI.host('you.com');
//     aAPI.port(8080); 
//     aAPI.put();

//     assert.equal(aAPI.getParam('host'), 'you.com');
//     assert.equal(aAPI.getParam('port'), 8080);
//     assert.equal(aAPI.getParam('method'), 'put');
//   });

//   it('builds a fullurl', function(){

//     // Setup tbe basic get call.
//     aAPI.host('domain.com').port(8080).get();

//     assert.equal(aAPI.getFullUrl(), 'http://domain.com:8080');

//     // Push String QUeryies onto the _query stack.
//     assert.equal(aAPI.query('test=1').getFullUrl(), 'http://domain.com:8080?test=1');
//     assert.equal(aAPI.query('test2=1').getFullUrl(), 'http://domain.com:8080?test=1&test2=1');

//     // Change the Protocal
//     assert.equal(aAPI.https().getFullUrl(), 'https://domain.com:8080?test=1&test2=1');

//     // Change the Host & Port.
//     assert.equal(aAPI.host('cnn.com').port(80).getFullUrl(), 'https://cnn.com?test=1&test2=1');
//   });

//   it('.query() supports additions', function(){
//     var aAPI = api();
//     aAPI.host('you.com')
//       .query( 'field1=1' )
//       .query( [ 'field2=1' ])
//       .query( { field3: 1 })
//       .query( { field4: 1, field5: 1 })

//     assert.equal(aAPI.getFullUrl(), 'http://you.com?field1=1&field2=1&field3=1&field4=1&field5=1');
//   });

//   it('.put() builds headers', function(){
//     var aAPI = api();
//     aAPI.host('you.com').put({ field1: 1, field2: 2 });

//     assert.equal(aAPI.getParam('request').path, '');
//     assert.equal(aAPI.getParam('request').headers['Content-Length'], JSON.stringify({ field1: 1, field2: 2 }).length);
//     assert.equal(aAPI.getParam('request').headers['Content-Type'], 'application/json');
//   });

// });

describe('http request', function() {  

  it('.get() builds headers', function(done){

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

    var aAPI = api();

    aAPI.host('localhost').port(4001)
      .get()
      .path('/maker/516c16906b5c870200000004')
      .assertions(
        {
          '$.data.name': function(val) { assert.equal(val, 'Test Maker 4'); },
          '$.statusCode': function(val) { assert.equal(val, 200); }
        }
      )
      .show()
      .done(done);

  });

});


