isAPI.js
========

Node.js Library for testing API endpoints with chained methods. Follows the 
jQuery chaining pattern to keep HTTP/HTTP API calls short, readable and easy
to write.

```
 api()
  .path('/maker/100')
  .get()
  .assertions(
    { 
      '$.data.name': function(val) { assert.equal(val, 'Vermont Blue') },
      '$.data._id': function(val) { assert.equal(val, 100) }
    }
  )
  .done();
```

[![Build Status](https://travis-ci.org/d1b1/isAPI.js.png?branch=master)](https://travis-ci.org/d1b1/isAPI.js)
[![Coverage Status](https://coveralls.io/repos/d1b1/isAPI.js/badge.png?branch=master)](https://coveralls.io/r/d1b1/isAPI.js?branch=master)

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

## Download
This is a NPM package. You can download from the package, or call the Github.

```
  npm install isAPI
  or 
  npm install git://github.com/d1b1/isAPI.js.git#master

  // Sample code.
  var isAPI = require('isapi');
  var api = new isAPI;

  // Provide the hostname (do not include HTTP)
  api.host('api.formagg.io');
```

## Example of a GET()
This will call the /maker/ID path with a GET and will test the statusCode, data and raw.

```

  describe("/Maker", function(done) {   
    it("should return a maker", function(done){
      api()
        .path("/maker/1")
        .query('a=111').query('b=111')
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

## Example of a Post()
Here is an example of a HTTP Post. The data for the request is defined in the `.post()` method.

```
  // Create a new Maker in the formagg.io API with Name, Country and State,
  // using a Post, and entpint of /maker. Test passes if the result contains
  // the required fields.

  api
    .path("/maker")
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

## Defaults
To keep things DRY and readable, a few things are assumes or defined once. You can of course
make your API rests as explicit as you want. The following are assumed.

*  All requests are assume to be JSON (application/json). use the `json()` or `contenttype()` to change.
*  If no Verb is defined then all request are assumed to be GETs.
*  If no protocal is defined its assumed to be HTTP. Use `http()` or `https()` to set explicitly.

To setup a test with API defaults, use the following before all other calls. Any values
provides in the configuration will be used as defaults for all calls. Specific chained methods
will override the defaults: host(), port(), get() etc.

```
    var isapi = require('isapi');

    isapi.setup({
      host: 'myapi.com',
      port: 8080
    });
```

## Assertions
This an object with each key contains the HTTP request value or the data value to check. Its assumed you will
want to test a number of elements in the API response. The JSONPath pattern is issued to parse the response
and provide a patterns for testing elements, arrays and patterns in the data.

Read [Stehan.Goessner Post](http://goessner.net/articles/JsonPath/) for more about JSONPath.

## General Methods

`.get()` - Sets the request method to 'GET'.

`.put()` or `.put({})` - Sets the request method to to 'PUT'. If a dictionary is provides it sets the request data values.

`.post()` or `.psot({})` - Sets the request method to to 'POST'. If a dictionary is provides it sets the request data values.

`.delete()` - Sets the request method to 'DELETE'.

`.data({})` - Sets the request data. Expectes a dictionary of key values pairs.

`.http()`, `.https()` or `.protocal('https|http')` - Sets the protocal.

`.port( int )` - Sets the request port number. Integer is required.

`.host('domain')` - Sets the host. Do not include the protocal, just the domain.

`.path('/path/to')` - Sets the request path.

`.query(string)`, `.query([string])` or `.query({ key: value })` - Sets the query values in the request. Supports multiple calls. 

    Examples:
    * `.query('field=1')`
    * `.query(['field=1', 'field2=2'])` 
    * `.query({ field1: 1, field2: 2})`

The `.done()` provides the tail for API call chains. This must be the last call.

`.done()` or `.done(done)` - Last element in the chain. Executes the call. (MUST BE LAST METHOD IN CHAIN). 
The `done` links the call to the Mocha or Jasmine async `done` function and ensures the tests comply with the testing framework flow.

## Content Types
The followng content types are supported. All api calls default to json.

`.json()` - Sets the Header Content Type to `application\json`.

`.plain()` - Sets the Header to `text\plain`.

`.html()` - Sets the Header content type to `text\html`.

`.contenttype(string)` - Provides an alternate methods to set the contenttype. `.contenttype('json') == .json()`.

## Assertion Methods
These are methods for defining the test assertions to perform on the response data. 

`.assertions({})` - Accepts a dictionary of jsonPath patterns and assertion functions.

`.assert()` - Accepts a single assertion function. This method can be used in the chain multiple times.

## Persistent Data
The following methods provide the options for naming and storage of each call. 

`.named()` - Provides a method for attaching the API data and options into a named dictionary. Example: .named('User1') is accessible in following calls with `_remember.User1.data.name`. 

    Examples:
    * `.get().path('/user/' + _remember.User1.data.name )`
    * `.get().put( { 'nicknake': _remember.User1.data.name } )`
    * `.assertions({ 
         '$.data.name': function(val) { assert.equal(val, _remember.User1.data.name)} 
       })`

Variables: 

`_last` - Always contains the value of the last API call. Overriden with each request.

`_remember` (Dict) - Contains the Options and data for each `named()` call. This function is designed to
allow flexible access to the data in previous call. Use this to build following assertions or to clearup
data after tests are completed.

    Examples:
    * `_remember.FirstRecord` - Retreives the 'FirstRecord' data stored using `.named('FirstRecord')`.
    * `_remember.length` - Get the size of the stored API calls.

## Debug Methods
The following are debug and testing methods that can be used write building a test, or in assertions. One the `.show()` 
can be used in a api chain. 

`.show()` - Provides the ability to output settings and results. Accepts true or false. Defaults to true.

`.getParam()` - Provides the ability to get request options. Without any value defined it outputs all values. Accepts 
the following: host, port, path, fullURL, protocal and request.

`.getFullUrl()` - Gets the request full URL.

## Response Data
All response data is available for testing. Note the `$` is not the Jquery selector.

*  `$.statusCode` - HTTP statusCode (200, 401 etc).
*  `$.options` - Contains all the rest options; path, hostname, headers etc.
*  `$.data` - Parsed response data.
*  `$.raw` - Unparsed HTTP response data (string).

## Experimental

`.explain()` - Provides a human readable description for us in the documentation.

`.clone()` - Will provide the ability to clone an existing request settings.

`.authorize()` - Will tell the request to assign the desired auth to the request header.

`.url(string)` - Will provide the ability to provide a full URL. The API call will parse
the string to provide testable parts and cloneable settings. Patterned after the MongoDB 
url string formatting. 

```
  Calling the following:

    api().url('https://site.com/path/twitter?term=1&limit10');

  would be the same as the long form and would be ready for the `clone()`.
  
    api()
      .https()
      .host('site.com')
      .get()
      .path('/path/twitter')
      .query({ term: 1, limit: 10 })

    var api2 = api().clone();
```

## Dependencies
This code base curently assumes you are using the Mocha packages.

*  [JSONPath](https://npmjs.org/package/JSONPath)
*  [underscore](https://npmjs.org/package/underscore)
*  [request](https://npmjs.org/package/request)

## Roadmap
The following are features and changes planned for the next few weeks.

*  Storage of tests and results for chaining of API behaviors.
*  HTTPS protocal support.
*  Hints for API calls.
*  Swagger UI consumption.
*  Lastly - refactor to allow it to run in a browser.

Feedback is `100%` welcome. The current code was hammered together late night to 
make testing easier and to get an API out the door. I was surprise that this
was not available. Needs a better name?

