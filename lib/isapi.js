var _        = require('underscore');
var http     = require('http');
var jsonPath = require('JSONPath').eval;

exports.authorization = require('./auth/authorization');

isAPI = (function() {

  // Setup the defaults.
  var options = {
    headers:    {},
    method:     'GET',
    port:       80,
    url:        null,
    datatype:   null,
    data:       null,
    parse:      null,
    assertions: null,
    debug:      false,
    
    // Meta Fields.
    _auth_enabled: false,
    _auth:         { customer_key: '', customer_secret: '', token: '', token_secret: '' },
    _auth_cb:       null,

    _remember:     null,
    _query:        [],
    _hasParse:     false
  };
  
  // Defined the hostname.
  options.host = function(host) { 
    this.host = host;
    return this;
  };

  options.remember = function( name ) {
    this._remember = name;
    return this;
  }

  options.port = function(port) {
    this.port = port;
    return this;
  };

  options.path = function(val) {
    this.path = val;
    return this;
  };

  options.configAuth = function(opts) {
    this._auth = opts;

    // TODO: Can we configure and validate this function.
    return this;
  };

  // Public flag to enable or disable the building and 
  // inclusion of the authorization in the header.

  options.authorize = function(state) {

    if (!_.isBoolean(state)) state = true;
    this._auth_enabled = state;

    if (state) console.log('Authorize: Enabled');
    return this;
  };

  // Provides the ability to define the signing function
  // for authentication. Currently no need to define the
  // type, just the function that will return the signature.

  // TODO: Move this to a setup function. Should not be 
  // be blended into the general calls.

  options.auth_cb = function(fn) {
    this._auth_cb = fn;
    return this;
  };

  // Add to the _query to add to the 
  // array of options. Supports string, array or object.
  options.query = function(opt) {
    this._query.push(opt)
    return this;
  };

  options.json = function(val) {
    this.contenttype = 'application/json';
    return this;
  };

  // HTTP Methods
  options.get = function(query) {
    this.method = 'GET';
    return this;
  };

  options.delete = function() {
    this.method = 'DELETE';
    return this;
  };

  options.put = function() {
    this.method = 'PUT';
    return this;
  };

  options.post = function(data) {
    this.data = data;
    this.method = 'POST';
    return this;
  };

  // Set Header
  options.header = function(data) {

    if (typeof data == 'function') {
      call(data, this)
      return this;
    }

    // Object
    if (typeof data == 'object') {
      this.headers[data.key] = data.value;
    }

    // Array
    if (typeof data == 'array') {
      this.headers[data[0]] = data[1];
    }

    // If we get NAME=John Doe
    if (typeof data == 'string') {
      var d = data.split('=');
      this.headers[d[0]] = d[1];
    }

    return this;
  };

  // This method provides the ability to parse
  // the results coming back from the request. 
  // 
  // Example: data.result
  // Example: data.result[0]
  //
  options.parse = function(func) {
    this._hasParse = true;
    this.parsefn = function(response) { return func(response, this) }
    return this;
  };

  options.debug = function(debug) {
    this.debug = debug;
    return this;
  };

  // Attach the assertions to the test.
  options.assertions = function(assertions) {
    this.assertions = assertions
    return this;
  };

  // Helder Method to handle _assertions.
  options.handleAssertions = function(done) {
    var that = this;
    var jsonResponse = this.result;
    for (var path in this.assertions) {
      var pathSearchResult = jsonPath(jsonResponse, path);
      if (pathSearchResult.length == 1) pathSearchResult = pathSearchResult[0];
      that.assertions[path](pathSearchResult);
    }
  };

  // Helper method to build the Query string field=100&field2=300
  options._getQuery = function() {

    var query_str = _.map(this._query, function(o) {
      if (_.isString(o)) return o;
      if (_.isArray(o)) return o.join('&');
      if (_.isObject(o)) {
        var n = [];
        var t = _.each(o, function(v, k) { return n[k] + '=' + v; })
        return n;
      }
    }).join('&');

    return query_str ? '?' + query_str : '';
  }

  options.done = options.assert = function(done) {

    var that = this;
    var opts = {
      path:     this.path + this._getQuery(),
      port:     this.port || 80,
      host:     this.host,
      method:   this.method,
      hostname:  'localhost',
      contenttype: 'application/json',
      datatype: 'json',
      // Move the API Key to setup.
      headers: {
         'api_key': 'stagingTEMPkey'
      }
    };

    if (that._auth_enabled && typeof that._auth_cb == 'function') {

      // TODO: Add in the protocal for HTTPS calls.
      var auth_opts = {
        fullurl:         'http://' + opts.host + ':' + opts.port + opts.path,
        method:          opts.method,
        consumer_key:    that._auth.consumer_key,
        consumer_secret: that._auth.consumer_secret,

        // If available after authentication. Can be set manually.
        auth_token:        that._auth.token,
        auth_token_secret: that._auth.token_secret,
        debug: that.debug || false
      };

      try {
        opts.headers['authorization'] = that._auth_cb(auth_opts);
      } catch(err) {
        console.log('Error in auth Callback', err);
        opts.headers['authorization'] = null;
        // TODO: Setup an expection for Auth CallBack Failure.
      }
      
    }

    var jsonData = null;
    if (this.method == 'POST' || this.method == 'PUT') {
      jsonData = JSON.stringify(this.data);
      opts.headers['Content-Length'] = jsonData.length;
    }

    if (this.contenttype == 'application/json')
      opts.headers['Content-Type'] = 'application/json';

    if (that.debug) { console.log(opts); console.log('') }

    var call = http.request(opts, function(result) {
      result.setEncoding('utf8');
      var chunkData = '';
      result.on('data', function(chunk) { chunkData = chunkData + chunk; });
      result.on('end', function() {
        var data = chunkData;
        console.log('StatusCode: ', result.statusCode);

        if (result.statusCode == 401) {
          that.result = {
            statusCode: result.statusCode,
            data: data,
            raw: chunkData
          };

          if (that.debug) console.log(that.result);
          that.handleAssertions();
          done();
          return;
        };

        if (that.contenttype == 'application/json') data = JSON.parse(chunkData);
        if (that._hasParse) data = that.parsefn(data);

        // Build the result for testing.
        that.result = {
          statusCode: result.statusCode,
          data: data,
          raw: chunkData
        };

        if (that._remember) {
          GLOBAL.spacedInfo[that._remember] = data;
        }

        if (that.debug) console.log(that.result);
        that.handleAssertions();
        done();
      });

    });

    call.on('error', function(e) { console.log('Request Error: ' + e); });

    if (jsonData) call.write(jsonData);
    call.end();

    return this;
  };

  return options;
})();

exports.APIClient = isAPI;