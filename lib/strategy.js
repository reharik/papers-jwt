var util = require('util');
var url = require('url');
var JwtVerifier = require('./verify_jwt');
var co = require('co');

/**
 * strategy constructor
 *
 * @param options
 *          secretOrKey: (REQUIRED) String or buffer containing the secret or PEM-encoded public key
 *          jwtFromRequest: (REQUIRED) Function that accepts a reqeust as the only parameter and returns the either JWT as a string or null
 *          issuer: If defined issuer will be verified against this value
 *          audience: If defined audience will be verified against this value
 *          algorithms: List of strings with the names of the allowed algorithms. For instance, ["HS256", "HS384"].
 *          ignoreExpiration: if true do not validate the expiration of the token.
 *          passReqToCallback: If true the, the verify callback will be called with args (request, jwt_payload, done_callback).
 * @param verify - Verify callback with args (jwt_payload, done_callback) if passReqToCallback is false,
 *                 (request, jwt_payload, done_callback) if true.
 */
function jwtStrategy(validate, _options) {

  const options = gatherOptions(validate, _options);

  const authenticate = function (req) {

    var token = options._jwtFromRequest(req);
    if (!token) {
      return {type: 'fail', details: {error: new Error("No auth token")}};
    }

    // Verify the JWT 
    return co(function *() {
      const payload = yield JwtVerifier(token, options._secretOrKey, options._verifOpts);
      const user = yield validate(payload, req);
      return user
        ? {type: 'success', details: {user}}
        : {type: 'fail', details: 'Authentication failed'};
    }).catch(ex => {
      return {type: 'error', details: {error: ex}}
    });
  };

  return {authenticate};
}


const gatherOptions = (validate, _options) => {
    var options = {};
    options._secretOrKey = _options.secretOrKey;
    if (!options._secretOrKey) {
        throw new TypeError('JwtStrategy requires a secret or key');
    }

    options.validate = validate;
    if (!options.validate || typeof options.validate !== 'function') {
        throw new TypeError('JwtStrategy requires a validation function');
    }

    options._jwtFromRequest = _options.jwtFromRequest;
    if (!options._jwtFromRequest) {
        throw new TypeError('JwtStrategy requires a function to retrieve jwt from requests (see option jwtFromRequest)');
    }

    options._passReqToCallback = _options.passReqToCallback;
    options._verifOpts = {};

    if (_options.issuer) {
        options._verifOpts.issuer = _options.issuer;
    }

    if (_options.audience) {
        options._verifOpts.audience = _options.audience;
    }

    if (_options.algorithms) {
        options._verifOpts.algorithms = _options.algorithms;
    }

    if (_options.ignoreExpiration != null) {
        options._verifOpts.ignoreExpiration = _options.ignoreExpiration;
    }
  return options;
};

/**
 * Export the Jwt strategy
 */
 module.exports = jwtStrategy;
