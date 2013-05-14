isAPI.js
========

Node.js Library for testing API endpoints with chained HTTP methods.

Still very pre-beta. No tests for the test yet.

```
   api
    .path("/maker/100").
    .json()
    .get()
    .assertions(
      { 
        '$.data.name': function(val) { assert.equal(val, 'Vermont Blue') },
        '$.data._id': function(val) { assert.equal(val, 100) }
      }
    )
    .done();
```

## Objective
Provide a super DRY API testing pattern, using the jQuery Chaining of REST attributes. Mocha
and Jasmine both provide support for testing asynch calls. During the development of an API
that requires OAuth for all not Get calls I found the tests were getting out of hand. This
library was written to make may tests readable, even late night¡

*  JQuery like chainable methods!
*  Provide the ability to test all elements of an API call, options, response, status codes.
*  Provide Custom callbacks for response parsing.
*  Support for both Mocha and Jasmine
*  Provide Custom Authentication callbacks for different OAuth Signatures.

## Installation
This is a NPM package. You can download from the package, or call the Github.

```

  npm install isAPI
  or 
  npm install "git://github.com/d1b1/isAPI.js.git#master",

  // Sample code.
  var isAPI = require('isapi');
  var api = new isAPI;

  // Provide the hostname (do not include HTTP)
  api.host('api.formagg.io');

```

## Defaults
To keep things DRY and readable, a few things are assumes or defined once. You can of course
make your API rests as explicit as you want. The following are assumed.

*  All requests are assume to be JSON (application/json). use the `json()` or `contenttype()` to change.
*  If no Verb is defined then all request are assumed to be GETs.
*  If no protocal is defined its assumed to be HTTP. Use `http()` or `https()` to set explicitly.

## Example of a GET
This will call the /maker/ID path with a GET and will test the statusCode, data and raw.

```

  describe("/Maker", function(done) {   
    it("should return a maker", function(done){

      api
        .path("/maker/1").query('a=111').query('b=111')
        .json()
        .get()
        .assertions(
          { 
            '$.statusCode': function(val) { assert.equal(val, 401) },
            '$.data': function(val) { assert.equal(val, 'Unauthorized') },
            '$.raw': function(val) { assert.equal(val, '111') }
          }
        )
        .done(done);

    );

  });

```

## Example of a Post
Here is an example of a HTTP Post. The data for the request is defined in the .post() method.

```
  // Create a new Maker in the formagg.io API with Name, Country and State,
  // using a Post, and entpint of /maker. Test passes if the result contains
  // the required fields.

  api
    .url("/maker")
    .post( 
     {
        name: "Vermont Creamery",
        country: "United States",
        state: "Vermont"
     }
    )
    .assertions(
      {
        "$.statusCode": function(val) { assert.equal(val, 200),
        "$.data._id": function(val) { assert.equal(val, this.port.name), 
        "$.data.name": function(val) { assert.equal(val, this.port.name),
        "$.data.country": function(val) { assert.equal(val, this.port.country)
      }
    )
    .done(done);

```

## Options
The are methods that help with setup and debugging of the calls. 

*  `.done(done)` - Last element in the chain. Executes the call. (MUST BE LAST METHOD IN CHAIN). The `done` links the call
to the Mocha or Jasmine async `done` function and ensures the tests comply with the testing framework flow.
*  `.debug()` - Dumps out the HTTP requests and resulting data. Also .debug(true) or .debug(false) works during testing.

## .Path() & .Query()
These two options can be used to either define a base path or to build a path using one or more sets.

*  `.path( '/path/to' )` - Accepts a string. One for API call. 
*  `.query()` - Helper method to append values to the base path. Accepts the following
*  `.query( 'field=1')` - Single key value string.
*  `.query( [ 'field=1', 'field2=2' ])` - Array of key values strings.
*  `.qerry( { field1: 1, field2: 2} )` - Object of key values.

## .Json() 
This sets the content type. Alternate versions. .contenttype('xml,json,html')

## HTTP Verbs
Use the following to set the HTTP verb.

*  `.get()` - Sets the Method to 'GET'. Use can pass in a string, array or object argument to add to the path.
*  `.post()` - Sets the Method to 'POST'. Argument (Object) is used in the request body.
*  `.put()` - Sets the Method to 'PUT'. Argument (Object) is used in the request body.
*  `.delete()` - Sets the Method to 'DELETE'.

## Protocals
Currently this only supports HTTP. HTTPs is coming. Use the http() for https() to set the protocal at the call level.

### .Post() & .Put()
This sets the rest body. Accepts a object of key values pairs.

## .Debug()
Optional method. This is a chainable method that enables or disables the debug output per call. Defaults to true when in the chain. 
Use true or false to enable or disable in existing tests. 

## Assertions
This an object with each key contains the HTTP request value or the data value to check. Its assumed you will
want to test a number of elements in the API response. The JSONPath pattern is issued to parse the response
and provide a patterns for testing elements, arrays and patterns in the data.

Read [Stehan.Goessner Post](http://goessner.net/articles/JsonPath/) for more about JSONPath.

## Response Data Object
All response data is testable. Note the `$` is not the Jquery selector.

*  `$.statusCode` - HTTP statusCode (200, 401 etc).
*  `$.options` - Contains all the rest options; path, hostname, headers etc.
*  `$.data` - Parsed response data.
*  `$.raw` - Unparsed HTTP response string.

## Dependencies
This code base curently assumes you are using the Mocha packages.

*  [JSONPath](https://npmjs.org/package/JSONPath)
*  [underscore](https://npmjs.org/package/underscore)
*  [request](https://npmjs.org/package/request)

## Roadmap
The following are features and changes planned for the next few weeks.

*  Storage of tests and results for chaining of API behaviors.
*  Better OAuth signature options.
*  HTTPS protocal support.
*  Test for the library.
*  Hints for API calls.
*  Swagger UI consumption.
*  Lastly - refactor to allow it to run in a browser.

Feedback is 100% welcome. The current code was hammered together late night to 
make testing easier and to get an API out the door.

