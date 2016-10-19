var chai = require('chai')
    , strategy = require('../lib/strategy')
    , test_data = require('./testdata')
    , sinon = require('sinon')
    , extract_jwt = require('../lib/extract_jwt')
    , JwtVerifier = require('../lib/verify_jwt')


describe('strategy-verify-test', function() {

    before(function() {
        strategy.JwtVerifier = sinon.stub();
        strategy.JwtVerifier.callsArgWith(3, null, test_data.valid_jwt.payload);
    });

    describe('Handling a request with a valid JWT and succesful verification', function() {
        var result;
        before(async function() {
            var s = strategy(function(jwt_payload) {
                  return Promise.resolve({user_id: 1234567890});
              },
              {
                  secretOrKey: 'secret',
                  JwtVerifier,
                  jwtFromRequest:extract_jwt.fromAuthHeader(), secretOrKey: 'secret'
              }
            );

            let req = {headers:{}};
            req.headers['authorization'] = "bearer " + test_data.valid_jwt.token;
            result = await s.authenticate(req);
        });

        it('should provide a user', function() {
            expect(result.details.user).to.be.an.object;
            expect(result.details.user.user_id).to.equal(1234567890);
        });

    });

    describe('handling a request with valid jwt and failed verification', function() {
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
            req.headers['authorization'] = "bearer " + test_data.valid_jwt.token;
            result = await s.authenticate(req);
        });


        it('should fail with info', function() {
            expect(result).to.be.an.object;
            expect(result.details).to.equal('Authentication failed');
        });

    });



    describe('handling a request with a valid jwt and an error during verification', function() {
        var result;
        before(async function() {
            var s = strategy(function(jwt_payload) {
                  throw new Error('invalid user');
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

        it('should error', function() {
            expect(result.type).to.equal('error');
            expect(result.details.error.message).to.equal('invalid user');
        });

    });



    describe('handling a request with a valid jwt and an exception during verification', function() {
        var result;
        before(async function() {
            var s = strategy(function(jwt_payload) {
                  throw new Error('EXCEPTION');
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

        it('should error', function() {
            expect(result.type).to.equal('error');
            expect(result.details.error.message).to.equal('EXCEPTION');
        });

    });
});
