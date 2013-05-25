var libpath = process.env['ISAPI_LIBRARY_COV'] ? '../lib-cov' : '../lib';
var assert  = require('assert');
var api     = require(libpath + '/isapi');
var expect  = require('expect.js');

// Simple Placeholder mocha test for getting started with travis.

describe('defaults', function() {  

  api.setup( 
   { 
    'host': 'test.com',
    'port': 80
   }
  );

  var aAPI = api();

  it('has global defaults (host,port,protocal)', function(){
    assert.equal(aAPI.getParam('host'), 'test.com');
    assert.equal(aAPI.getParam('port'), 80);
    assert.equal(aAPI.getParam('protocal'), 'http');
    assert.equal(aAPI.getParam('method'), 'get');
  });
 
  it('has changed', function(){
    aAPI.host('you.com');
    aAPI.port(8080); 
    aAPI.put();

    assert.equal(aAPI.getParam('host'), 'you.com');
    assert.equal(aAPI.getParam('port'), 8080);
    assert.equal(aAPI.getParam('method'), 'put');
  });

   it('builds a fullurl', function(){

    // Setup tbe basic get call.
    aAPI.host('domain.com').port(8080).get();

    assert.equal(aAPI.getFullUrl(), 'http://domain.com:8080');

    // Push String QUeryies onto the _query stack.
    assert.equal(aAPI.query('test=1').getFullUrl(), 'http://domain.com:8080?test=1');
    assert.equal(aAPI.query('test2=1').getFullUrl(), 'http://domain.com:8080?test=1&test2=1');

    // Change the Protocal
    assert.equal(aAPI.https().getFullUrl(), 'https://domain.com:8080?test=1&test2=1');

    // Change the Host & Port.
    assert.equal(aAPI.host('cnn.com').port(80).getFullUrl(), 'https://cnn.com?test=1&test2=1');
  });

  it('.query() supports additions', function(){

    var aAPI = api().host('you.com')
                .query( 'field1=1' )
                .query( [ 'field2=1' ])
                .query( { field3: 1 })
                .query( { field4: 1, field5: 1 })

    assert.equal(aAPI.getFullUrl(), 'http://you.com?field1=1&field2=1&field3=1&field4=1&field5=1');

  });

  it('.put() builds headers', function(){

    var aAPI = api().host('you.com').put({ field1: 1, field2: 2 });

    assert.equal(aAPI.getParam('request').opts.path, '');
    // assert.equal(aAPI.getParam('request').opts.headers['Content-Length'], JSON.stringify({ field1: 1, field2: 2 }).length);
  });

});

describe('http request with a file', function() {  

  it('attaches to file and gets a response', function(done){

    api.setup(
      { 'host': 'staging-api.formagg.io',
        'auth': {
           consumer_key:    'abc123', 
           consumer_secret: 'ssh-secret', 
           token:           '3H3Mw4Oxi5vDmujM', 
           token_secret:    'nF7duFct2qTnZpPKcvGabJJwS2lU3zYng0cz1OCRtJgdOb4elhEJkol7j3OTSHoR' 
        }
     });

    api()
      .put()
      .path('/maker/516c16906b5c870200000004/attach')
      .file('logofile', './test/files/sample.jpg')
      .assertions(
        {
          '$.options.headers.content-type': function(val) { 
            expect(val).to.contain(val, 'multipart/form-data'); 
          }
        }
      )
      .show(false) // Leave the method, disable the debug.
      .done(done);

  });

});


describe('http GET request', function() {  

  it('gets a json document', function(done){

    api.setup(
      { 'host': 'staging-api.formagg.io',
        'auth': {
           consumer_key:    'abc123', 
           consumer_secret: 'ssh-secret', 
           token:           '3H3Mw4Oxi5vDmujM', 
           token_secret:    'nF7duFct2qTnZpPKcvGabJJwS2lU3zYng0cz1OCRtJgdOb4elhEJkol7j3OTSHoR' 
        }
     });

    api()
      .get()
      .path('/maker/516c16906b5c870200000004')
      .assertions(
        {
          '$.data.name':    function(val) { assert.equal(val, 'Test Maker 4'); },
          '$.data.address': function(val) { assert.equal(val, '113 Atlantic'); },
          '$.data.city':    function(val) { assert.equal(val, 'Corpus Christi'); },
          '$.data.state':   function(val) { assert.equal(val, 'Texas'); },
          '$.data.country': function(val) { assert.equal(val, 'United States'); },
        }
      )
      .show(false) // Leave the method, disable the debug.
      .done(done);

  });

});

