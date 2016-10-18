# papers-jwt

A [papers](https://www.npmjs.com/package/papers) strategy for authenticating with a
[JSON Web Token](http://jwt.io).

This module lets you authenticate endpoints using a JSON web token. It is
intended to be used to secure RESTful endpoints without sessions.

This strategy was ported from [passport-jwt](https://www.npmjs.com/package/passport-jwt) to work with papers. My thanks to [Mike Nicholson](https://www.npmjs.com/~themikenicholson) 

This strategy works fine with KOA or KOA2 (via kao-convert)

## Install

    npm install papers-jwt

## Usage

### Configure Strategy

The JWT authentication strategy is constructed as follows:

    jwtStrategy(validate, options)

`options` is an object literal containing options to control how the token is
extracted from the request or verified.

* `secretOrKey` is a REQUIRED string or buffer containing the secret
  (symmetric) or PEM-encoded public key (asymmetric) for verifying the token's
  signature.

* `jwtFromRequest` (REQUIRED) Function that accepts a request as the only
  parameter and returns either the JWT as a string or *null*. See 
  [Extracting the JWT from the request](#extracting-the-jwt-from-the-request) for
  more details.
* `issuer`: If defined the token issuer (iss) will be verified against this
  value.
* `audience`: If defined, the token audience (aud) will be verified against
  this value.
* `algorithms`: List of strings with the names of the allowed algorithms. For instance, ["HS256", "HS384"].
* `ignoreExpiration`: if true do not validate the expiration of the token.

`validate` is a function with the parameters `verify(jwt_payload, req)`

* `jwt_payload` is an object literal containing the decoded JWT payload.
* `req` is the request object (ctx in koa)
* `result` should be either a user ( or the body of the payload ), a failure [undefined, null, false] or an error thrown

An example configuration which reads the JWT from the http
Authorization header with the scheme 'bearer':

```js
var papersjwt = require('papers-jwt');
var ExtractJwt = papersjwt.ExtractJwt;

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
opts.secretOrKey = 'secret';
opts.issuer = "accounts.examplesoft.com";
opts.audience = "yoursite.net";

var authUser = function(jwtPayload, req){
	// use decoded jwt payload to find and return a user
	// otherwise return false, or throw
}

var jwtStrategy = papersjwt.Strategy(authUser, opts);

```

### Extracting the JWT from the request

There are a number of ways the JWT may be included in a request.  In order to remain as flexible as
possible the JWT is parsed from the request by a user-supplied callback passed in as the
`jwtFromRequest` parameter.  This callback, from now on referred to as an extractor,
accepts a request object as an argument and returns the encoded JWT string or *null*.

#### Included extractors 

A number of extractor factory functions are provided in papers-jwt.ExtractJwt. These factory
functions return a new extractor configured with the given parameters.

* ```fromHeader(header_name)``` creates a new extractor that looks for the JWT in the given http
  header
* ```fromBodyField(field_name)``` creates a new extractor that looks for the JWT in the given body
  field.  You must have a body parser configured in order to use this method.
* ```fromUrlQueryParameter(param_name)``` creates a new extractor that looks for the JWT in the given
  URL query parameter.
* ```fromAuthHeaderWithScheme(auth_scheme)``` creates a new extractor that looks for the JWT in the
  authorization header, expecting the scheme to match auth_scheme.
* ```fromAuthHeader()``` creates a new extractor that looks for the JWT in the authorization header
  with the scheme 'bearer'
* ```fromExtractors([array of extractor functions])``` creates a new extractor using an array of
  extractors provided. Each extractor is attempted in order until one returns a token.

### Writing a custom extractor function

If the supplied extractors don't meet your needs you can easily provide your own callback. For
example, if you are using the cookie-parser middleware and want to extract the JWT in a cookie 
you could use the following function as the argument to the jwtFromRequest option:

```
var cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies)
    {
        token = req.cookies['jwt'];
    }
    return token;
};
```

### Authenticate requests

Use `papers().registerMiddleware(config)` specifying `'JWT'` as the strategy.
```js
var papersConfig = {
  strategies: [ JWTStrategy ]
}
app.use(papers().registerMiddleware(config));
```
or for a specific endpoint
```js
app.post('/profile', papers().registerMiddleware(config),
    function(req, res) {
        res.send(req.user.profile);
    }
);
```

### Include the JWT in requests

The strategy will first check the request for the standard *Authorization*
header. If this header is present and the scheme matches `options.authScheme`
or the shceme matches 'bearer' (the scheme recommended by jwt.io) then the token will be retrieved from
it. e.g.

    Authorization: bearer JSON_WEB_TOKEN_STRING.....

If the authorization header with the expected scheme is not found, the request
body will be checked for a field matching either `options.tokenBodyField` or
`auth_token` if the option was not specified.

Finally, the URL query parameters will be checked for a field matching either
`options.tokenQueryParameterName` or `auth_token` if the option was not
specified.

## Tests

    npm install
    npm test

To generate test-coverage reports:

    npm install -g istanbul
    npm run-script testcov
    istanbul report

## License

The [MIT License](http://opensource.org/licenses/MIT)

