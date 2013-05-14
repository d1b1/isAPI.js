var _        = require('underscore');
var http     = require('http');
var jsonPath = require('JSONPath').eval;

var api = (function() {

  // Setup the defaults.
  var options = {
    headers:    {},
    method:     'GET',
    url:        null,
    datatype:   null,
    data:       null,
    parse:      null,
    assertions: null,
    debug:      false,
    // Meta Fields.
    _query:    [],
    _hasParse: false
  };
  
  // Defined the hostname.
  options.host = function(host) { 
    this.hostname = host;
    return this;
  };

  options.path = function(val) {
    this.path = val;
    return this;
  };

  // Add to the _query to add to the 
  // array of options. Supports string, array or object.
  options.query = function(opt) {
    this._query.push(opt)
    return this;
  };

  options.json = function(val) {
    this.contentType = 'application/json';
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
    return '?' + _.map(this._query, function(o) {
      if (_.isString(o)) return o;
      if (_.isArray(o)) return o.join('&');
      if (_.isObject(o)) {
        var n = [];
        var t = _.each(o, function(v, k) { return n[k] + '=' + v; })
        return n;
      }
    }).join('&');
  }

  options.done = options.assert = function(done) {

    var that = this;
    var opts = {
      path:     this.path + this._getQuery(),
      hostname: this.hostname,
      method:   this.method,
      // Move the API Key to setup.
      headers: {
         'api_key': 'stagingTEMPkey'
      }
    };

    var jsonData = null;
    if (this.method == 'POST') {
      var jsonData = JSON.stringify(this.data);
      opts.headers['Content-Length'] = jsonData.length;
    }

    if (this.contentType == 'json')
      opts.headers['Content-Type'] = 'application/json';

    if (that.debug) console.log(opts);

    var call = http.request(opts, function(res) {
      res.setEncoding('utf8');
      var chunkData = '';
      res.on('data', function(chunk) { chunkData = chunkData + chunk; });

      res.on('end', function() {
        var data = chunkData;

        if (res.statusCode == 401) {

          that.result = {
            statusCode: res.statusCode,
            data: data,
            raw: chunkData
          };

          if (that.debug) console.log(that.result);

          that.handleAssertions();
          done();
          return;
        };

        if (that.contentType == 'application/json') data = JSON.parse(chunkData);
        if (that._hasParse) data = that.parsefn(data);

        // Build the result for testing.
        that.result = {
          statusCode: res.statusCode,
          data: data,
          raw: chunkData
        };

        if (that.debug) console.log(that.result);

        that.handleAssertions();
        done();
      });

    });

    call.on('error', function(e) { console.log('Error: ' + e); });

    // Write data to request body
    if (jsonData) call.write(jsonData);
    call.end();

    return this;
  };

  return options;
})();
