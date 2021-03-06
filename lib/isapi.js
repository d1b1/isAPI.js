// isAPI.js
// version : 2.0.0
// author : Stephan Smith (Stephan.Smith.BC93@gmail.com)
// license : MIT
// Attribution: Based on the moment.js node.js module.
// Description: This is a new version of the beta library. It uses
// commonjs calls to handle module exports, scoping, defaults and
// function calls.
//
// TODO Items:
// 
//   1. DONE - Add the remember option.
//   2. Enable the HTTPs option.
//   3. Make this work client side.
//   4. Add the Authorize method to enable or disable token.
//   5. Add a timeout element for long requests. Might be needed
//      for uploading and testing files.

GLOBAL._last = null;
GLOBAL._remember = {};

var _             = require('underscore');
var http          = require('http');
var Authorization = require('./auth/authorization');
var jsonPath      = require('JSONPath').eval;
var FormData      = require('form-data');
var fs            = require('fs');

(function (undefined) {

    // Constants

    var isapi,
        VERSION = '2.0.0',

        // Check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports),

        defaultProtocal = 'http',
        defaultHost = '',
        defaultPort = 80,
        defaultMethod = 'get',
        defaultAuth = null,

        httpMethods = 'get,post,delete,put,options'.split(',')
        ;

    // Constructor
    // -------------------------
    // Prototype object
    function IsAPI(config) {
        extend(this, config);
    }

    /*** Helpers ***/

    function extend(a, b) {
        for (var i in b) {
            if (b.hasOwnProperty(i)) {
                a[i] = b[i];
            }
        }
        return a;
    }

    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    /* 
      Helper function that builds a save query string 
      using the array values in the accreted query() 
      calls.

      ToDo: Add in a function call to allow the user to build a key value in a callback.
      ToDo: Add in option for a global _query (example: api_key added to all calls)
      ToDo: Add in a URL encoding function.

    */
    function buildQuery(query) {
        if (query.length == 0) return ''
        var query_str = _.map(query, function(o) {
            if (_.isString(o)) return o;
            if (_.isArray(o)) return o.join('&');
            if (_.isObject(o)) {
                var n = [];
                _.each(o, function(v, k) { n.push(k + '=' + v) });
                return n.join('&');
            }
          }).join('&');
        return query_str ? '?' + query_str : '';
    }

    function buildFullPath(opts) {
        return (opts.path || '') + buildQuery(opts._query);
    }

    function buildFullUrl(opts) {
        return opts.protocal + '://' + opts.host + (opts.port != 80 ? ':' + opts.port : '') + (opts.path || '') + buildQuery(opts._query);
    }

    // Helder Method to handle _assertions.
    function handleAssertions(data, assertions) {

        var jsonResponse = data;

        _.each(assertions, function(assertionGroup) {
          for (var path in assertionGroup) {
            var pathSearchResult = jsonPath(jsonResponse, path);
            if (pathSearchResult.length == 1) pathSearchResult = pathSearchResult[0];
            assertionGroup[path](pathSearchResult);
          }
        });

    };

    /* This function builds the request object that will be
       used for the HTTP/HTTPS request.

    */
    function buildRequest(obj) {
     
      var opts = obj._payload;

      // Start building the request wrapper. 
      var request = {
        jsonData: null,
        fullUrl: buildFullUrl(opts)
      };

      // Opts contains all the values that will feed into the 
      // HTTP request to the API.
      request.opts = {
          host:   opts.host,
          port:   opts.port,
          method: opts.method,
          path:   buildFullPath(opts),
          method: opts.method,
          headers: {}
      };

      if (opts._contenttype == 'json') 
        request.opts.headers['Content-Type'] = 'application/json';

      if (opts._contenttype == 'html') 
        request.opts.headers['Content-Type'] = 'text/plain';

      // if (opts._contenttype == 'xml') 
      //   request.opts.headers['Content-Type'] = 'application/json';
      // TODO: Add in the HTML and TEXT content types.

      // ----------------------------------------------
      if (obj._files) {

        if (_.isArray(obj._files) && obj._files.length > 0) { 
          var form = new FormData();
          _.each(obj._files, function(v, k) {
            form.append(v.name, fs.createReadStream(v.file));
          });

          request.opts.headers = form.getHeaders()
          // Hacky solution. Pust the form back in the request. object.

          // TODO Refactor to use the form-data to build the headers 
          // and attach the data correctly.
          request._form = form;
        }
      }
      // ------------------------------------------

      if (opts.method == 'post' || opts.method == 'put') {
        if (opts.data) {
          request.jsonData = JSON.stringify(opts.data);
          request.opts.headers['Content-Length'] = request.jsonData.length;
        }
      }

      if (defaultAuth) {
        var auth_opts = {
          fullurl:         request.fullUrl,
          method:          opts.method,
          consumer_key:    defaultAuth.consumer_key,
          consumer_secret: defaultAuth.consumer_secret,

          // If available after authentication. Can be set manually.
          // TODO: Only Add if we have these already.
          auth_token:        defaultAuth.token,
          auth_token_secret: defaultAuth.token_secret,
        };

        try {
          request.opts.headers['authorization'] = Authorization.sign(auth_opts);
        } catch(err) {
          console.log('Error in auth Callback', err);
          request.opts.headers['authorization'] = err.message;
        }
      }

      return request;
    }

    /*** Top Level Functions ***/

    function makeIsAPI(config) {
        var _payload = {};

        config._payload = config._defaults;
        config._payload._query = [];
        config._assertions = [];
        config._files = [];
        config._show = false;

        return new IsAPI(config);
    }

    isapi = function (config) {
        return makeIsAPI({
            _defaults: {
              protocal: defaultProtocal,
              host: defaultHost,
              port: defaultPort,
              method: defaultMethod
            }
        });
    };

    /* Provides a global set of defaults for host port and auth.

       Example: 
         api.setup( { host: 'myhost.com' })

    */
    isapi.setup = function (opts) {
        if (opts.host) defaultHost = opts.host;
        if (opts.port) defaultPort = opts.port;
        if (opts.auth) defaultAuth = opts.auth;
        return isapi();
    };

    // version number
    isapi.version = VERSION;

    // defaults from parent.
    isapi.defaultMethod = defaultMethod;
    isapi.defaultHost = defaultHost;
    isapi.defaultPort = defaultPort;

    // compare isapi object
    isapi.isSelf = function (obj) {
        return obj instanceof IsAPI;
    };

    /*** IsAPI Prototype ***/

    isapi.fn = IsAPI.prototype = {

        clone : function () {
            return isapi(this);
        },

        // HTTP Verb Setters
        // -------------------------

        get: function() {
            this._payload.method = 'get';
            return this;
        },

        delete: function() {
            this._payload.method = 'delete';
            return this;
        },

        put: function(input) {
            this._payload.method = 'put';
            if (input) this._payload.data = input;
            return this;
        },

        post: function(input) {
            this._payload.method = 'post';
            if (input) this._payload.data = input;
            return this;
        },
  
        // Data Related methods.
        // -------------------------

        data: function(input) {
            if (input) this._payload.data = input;
            return this;
        },

        file: function(name, file) {
            this._files.push({ name: name, file: file });
            return this;
        },

        // Protocal methods.
        // -------------------------

        protocal: function (input) {
            // ToDo: Add validation for http or https
            this._payload.protocal = input;
            return this
        },

        http: function () {
            this._payload.protocal = 'http';
            return this
        },

        https: function () {
            this._payload.protocal = 'https';
            return this
        },

        // Content Type
        // -------------------------

        host: function (input) {
            this._payload.host = input;
            return this
        },

        port: function (input) {
            this._payload.port = input;
            return this
        },

        path: function (input) {
            this._payload.path = input;
            return this
        },

        /* Query allows for different method signitures. The internal
           query value is stored as an array to allow the user to build
           the query object using any of the following.
        
           - as a single string: 'field=name',
           - as a single array: [ 'field1=name1', 'field2=name2' ],
           - as a dictionary:  { field1: 'name1', field2: 'name2' }

           * No need for array of arrays or array of objects. :)
        */
        query: function (input) {
            this._payload._query.push(input);
            return this
        },

        // Content Types
        json: function() {
             this._payload._contenttype = 'json';
             return this;
        },

        html: function() {
             this._payload._contenttype = 'html';
             return this;
        },

        plain: function() {
             this._payload._contenttype = 'plain';
             return this;
        },

        contenttype: function(input) {
             this._payload._contenttype = input;
             return this;
        },

        // F XML. Do it manually.

        // -------------------------
        /* Assertions
           As with the query function assertions can be added in a number
           of ways so that the user can build and format the call to be readable
           and testable.

           - As a function ( function(responseJSON) { } )
             Best for testing of more then one key value at a time.

           - As an array of functions: [ function(), function() ]
             Builds upon the signle function call.

           - As a dictionary of jsonpath arguments and functions: { '$.name': function(val) { assert(); }}
             Recommended - Used the jsonPath package to provide easy to read parsing and matching
             of json data to asserts.

          Example:

            api.get()
              .path('/maker')
              .assert({ '$.name': function(val) { assert.equal(val, 'Jane Doe') } })
              .done();

            or  

            api.get()
              .path('/maker/2222')
              .assertions(
                 { 
                   '$.name': function(val) { assert.equal(val, 'Jane Doe') },
                   '$.name': function(val) { assert.equal(val, 'John Doe') },
                   '$.name': function(val) { assert.equal(val, 'Larry Skywalker') } 
                 }
              )
              .done();

        */
        assertions: function(input) {
            this._assertions.push(input);
            return this;
        },

        // Singular call for chained method and DRYing out the calls.
        assert: function(input) {
            this._payload.assertions.push(input);
            return this;
        },

        named: function(input) {
            this._named = input;
            return this;
        },

        // -------------------------
        // Get help functions.
        //
        // These functions can not be chained as they will
        // return data and will not allow the object to 
        // pass between methods.

        getFullUrl: function() {
            return buildFullUrl(this._payload);
        },

        getParam: function(input) {
            switch(input) {
              case 'port':
                  return this._payload.port;
                  break;
              case 'host':
                  return this._payload.host;
                  break;
              case 'protocal':
                  return this._payload.protocal;
                  break;
              case 'method':
                  return this._payload.method;
                  break;
              case 'path':
                  return this._payload.path;
                  break;
              case 'data':
                  return this._payload.data;
                  break;
              case 'request':
                  return buildRequest(this);
                  break;
              default: 
                  return this._payload;
            }
        },

        // Note: Chainable
        show: function(input) {
            if (input == undefined) input = true;
            this._show = input;
            return this;
        },

        // This function handles the request to the API routes.
        done: function(done) {
            var that = this;
            var request = buildRequest(that);
            if (that._show) console.log(request);

            _last = null;

            var call = http.request(request.opts, function(result) {
              result.setEncoding('utf8');
              var chunkData = '';
              result.on('data', function(chunk) { chunkData = chunkData + chunk; });
              result.on('end', function() {

                var rawdata = chunkData;
                try {
                  rawdata = JSON.parse(chunkData);
                } catch(err) {
                  // WTF
                }
                
                if (that._show) console.log('StatusCode:' + result.statusCode);

                // TODO: Handle the different status codes.
                if (result.statusCode == 401) {
                  that.result = {
                    statusCode: result.statusCode,
                    data:       rawdata,
                    options:    request.opts,
                    raw:        chunkData,
                    input:      that._payload.data
                  };

                  // Store the last result in a global.
                  _last = that.result;
                  if (that._named) _remember[that._named] = that.result;

                  if (that._show) console.log(that.result);
                  handleAssertions(that.result, that._assertions);
                  if (done) done()
                  return;
                };

                // Build the result for testing.
                that.result = {
                  statusCode: result.statusCode,
                  data:       rawdata,
                  options:    request.opts,
                  raw:        chunkData,
                  input:      that._payload.data
                };

                // Store the last result in a global.
                _last = that.result;

                if (that._named) _remember[that._named] = that.result;

                if (that._show) console.log('Debug', that.result);
                handleAssertions(that.result, that._assertions);
                if (done) done();
              });

            });

            call.on('error', function(e) { console.log('Request Error: ' + e); });
            if (request.jsonData) {
              call.write(request.jsonData);
            }

            if (request._form) {
              request._form.pipe(call);
            } else {
              call.end();
            }

            return this;
          }
    };

    // Exposing IsAPI

    if (hasModule) {
        module.exports = isapi;
    }

    // Global ender:false

    if (typeof ender === 'undefined') {
        // here, `this` means `window` in the browser, or `global` on the server
        // add `isapi` as a global object via a string identifier,
        // for Closure Compiler "advanced" mode
        this['isapi'] = isapi;
    }

    // Global define:false

    if (typeof define === 'function' && define.amd) {
        define('isapi', [], function () {
            return isapi;
        });
    }

}).call(this);
