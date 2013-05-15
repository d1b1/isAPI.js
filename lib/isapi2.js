// isAPI.js
// version : 2.0.0
// author : Stephan Smith (Stephan.Smith.BC93@gmail.com)
// license : MIT
// Attribution: Based on the moment.js node.js module.
// Description: This is a new version of the beta library. It uses
// commonjs calls to handle module exports, scoping, defaults and
// function calls.

// ToDo: Handle this better. It will not work in the browser.
var _ = require('underscore');

(function (undefined) {

    /* Constants */

    var isapi,
        VERSION = '2.0.0',

        // Check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports),

        defaultProtocal = 'http',
        defaultHost = '',
        defaultPort = 80,
        defaultMethod = 'get',

        httpMethodss = 'get,post,delete,put,options'.split(',')
        ;

    /*** Constructor ***/

    // prototype object
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

    function buildFullPath(input) {
      return (input || '');
    }

    function buildFullUrl(input) {
      var p = input._payload;
      return p.protocal + '://' + p.host + (p.port != 80 ? ':' + p.port : '') + buildFullPath(p.path) + buildQuery(p._query);
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

    /* This function builds the request object that will be
       used for the HTTP/HTTPS request.

    */
    function buildRequest(payload) {
     
      var jsonData = null;

      if (payload._payload.method == 'post' || payload._payload.method == 'put')
          jsonData = JSON.stringify(payload._payload.data);

      var request = {
          host:   payload._payload.host,
          port:   payload._payload.port,
          method: payload._payload.method,
          path:   buildFullPath(payload._payload.path),
          method: payload._payload.method,
          headers: { 
            'Content-Type': 'application/json'
          }
      };

      if (jsonData) request.headers['Content-Length'] = jsonData.length;

      return request;
    }

    /*** Top Level Functions ***/

    function makeIsAPI(config) {
        var _payload = {};

        config._payload = config._defaults;
        config._payload._query = [];
 
        // ToDo: Provide the option to give a fullURL and parse the protocal, domain, port
        //       path and query from the string. 
        //       example: url: http://mysite.com:8080/path/to/2222?field=1&field2=name

        // ToDo: Provide the ability configure the IsAPI object with a larger dictionary of values.

        // if (typeof input === 'string') {
        //     config._i = input = getLangDefinition().preparse(input);
        // }

        // if (isapi.isSelf(input)) {
        //     config = extend({}, input);
        //     config._d = new Date(+input._d);
        // } else if (format) {
        //     if (isArray(format)) {
        //         makeDateFromStringAndArray(config);
        //     } else {
        //         makeDateFromStringAndFormat(config);
        //     }
        // } else {
        //     makeDateFromInput(config);
        // }

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

    /************************************
        IsAPI Prototype
    ************************************/

    isapi.fn = IsAPI.prototype = {

        clone : function () {
            return isapi(this);
        },

        /*** HTTP Verb Setters ***/

        get: function(input) {
            this._payload.method = 'get';
            if (input) {
              // TODO: parse the input into the _query scope.
            }
            return this;
        },

        delete: function(input) {
            this._payload.method = 'delete';
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
          this._payload.assertions.push(input);
          return;
        },

        // Singular call for chained method and DRYing out the calls.
        assert: function(input) {
          this._payload.assertions.push(input);
          return;
        },

        // This function handles the request to the API routes.
        done: function(done) {
          // Call the Request and send the data.
          return this;
        },

        toJSON: function() {
          return this._payload;
        },

        getFullUrl: function() {
          return buildFullUrl(this);
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
            case 'data':
              return this._payload.data;
              break;
            case 'request':
              return buildRequest(this);
              break;
            default: 
              return this._payload;
          }
        }

    };

    /************************************
        Exposing IsAPI
    ************************************/

    // CommonJS module is defined
    if (hasModule) {
        module.exports = isapi;
    }
    /* global ender:false */
    if (typeof ender === 'undefined') {
        // here, `this` means `window` in the browser, or `global` on the server
        // add `isapi` as a global object via a string identifier,
        // for Closure Compiler "advanced" mode
        this['isapi'] = isapi;
    }
    /* global define:false */
    if (typeof define === "function" && define.amd) {
        define("isapi", [], function () {
            return isapi;
        });
    }

}).call(this);