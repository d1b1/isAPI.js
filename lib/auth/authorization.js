var authUtil = require('./authUtil');
var oauth    = require('./oauth').oauth;
var _        = require('underscore');

/*
   Arguments:

   opts: {
     fullurl:         string ( http://... ),
     method:          string ( GET/POST/DELETE/PUT ),
     consumer_key:    string ( Required ),
     consumer_secret: string ( Required ),
     auth_token:      string ( Optional)
     debug:           boolean (Defaults false)
   }

*/
exports.sign = function( opts ) {

  var params = {
    oauth_nonce:            authUtil.uid(16),
    oauth_timestamp:        authUtil.getTime(),
    oauth_version:          '1.0',
    oauth_consumer_key:     opts.consumer_key,
    oauth_signature_method: 'HMAC-SHA1',      
  };

  if (opts.auth_token) { 
    params.oauth_token = opts.auth_token;
  }

  var options = { 
    method: opts.method, 
    url: opts.fullurl, 
    consumerSecret: opts.consumer_secret  // Never shared. Only part of the signing process.
  };

  if (opts.auth_token_secret) options.tokenSecret = opts.auth_token_secret;                  

  var authDict = {};
  if (params.oauth_token) authDict['oauth_token'] = params.oauth_token;
  authDict['oauth_version']          = params.oauth_version;
  authDict['oauth_consumer_key']     = params.oauth_consumer_key;
  authDict['oauth_signature_method'] = params.oauth_signature_method;
  authDict['oauth_nonce']            = params.oauth_nonce;
  authDict['oauth_timestamp']        = params.oauth_timestamp;

  if (params.access_token && params.access_token_secret) { 
    authDict.oauth_token = params.access_token;
    authDict.oauth_token_secret = params.access_token_secret;
  }

  authDict['oauth_signature'] = authUtil.signRequest(params, options, opts.debug);

  var paramArray = _.map(authDict, function convertPairTo2ElementArray(value, key) { return [key, value]; });
  var authHeaderValue = oauth.getAuthorizationHeader('', paramArray, opts.debug);

  // headers['authorization'] = authHeaderValue;
  return authHeaderValue
}
