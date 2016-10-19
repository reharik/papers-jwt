var strategy = require('../lib/strategy')
    , chai = require('chai')
    , test_data = require('./testdata')
    , sinon = require('sinon')
    , extract_jwt = require('../lib/extract_jwt')
  , JwtVerifier = require('../lib/verify_jwt');

describe('strategy-validation', function() {

    describe('handling valid jwt', function() {
        var result;
        before(async function() {
            var s = strategy(function(jwt_payload) {
                  return Promise.resolve(jwt_payload);
              },
              {
                  secretOrKey: 'secret',
                  JwtVerifier,
                  jwtFromRequest:extract_jwt.fromAuthHeader()
              }
            );

            let req = {headers:{}};
            req.headers['authorization'] = "bearer " + test_data.valid_jwt.token;
            result = await s.authenticate(req);
        });

        it('should call verify with the correct payload', function() {
            expect(result.details.user).to.deep.equal(test_data.valid_jwt.payload);
        });
    });


    describe('handling failing jwt', function() {
        var result;
        before(async function() {
            var s = strategy(function(jwt_payload) {
                  throw new Error("jwt expired");
              },
              {
                  secretOrKey: 'secret',
                  JwtVerifier,
                  jwtFromRequest:extract_jwt.fromAuthHeader()
              }
            );

            let req = {headers:{}};
            req.headers['authorization'] = "bearer " + test_data.valid_jwt.token;
            result = await s.authenticate(req);
        });

        it('should fail with error message.', function() {
            expect(result.type).to.be.equal('error');
            expect(result.details.error.message).to.equal('jwt expired');
        });

    });


    describe('handling an invalid authentication header', function() {
        var result;
        before(async function() {
            var s = strategy(function(jwt_payload) {
                return Promise.resolve();
              },
              {
                  secretOrKey: 'secret',
                  JwtVerifier,
                  jwtFromRequest:extract_jwt.fromAuthHeader()
              }
            );

            let req = {headers:{}};
            req.headers['authorization'] = "malformed";
            result = await s.authenticate(req);
        });

        it('should fail with error message.', function() {
            expect(result.type).to.equal('fail');
            expect(result.details.error.message).to.be.equal('No auth token');
        });

    });

});
