var strategy = require('../lib/strategy')
    , JwtVerifier = require('../lib/verify_jwt')
    , chai = require('chai')
    , test_data= require('./testdata')
    , url = require('url')
    , extract_jwt = require('../lib/extract_jwt');


describe('strategy-requests', function() {

    describe('handling request JWT present in request', function() {
        var result;
        before(async function() {
            var s = strategy(function(jwt_payload) {
                return Promise.resolve(jwt_payload);
            },
              {
                    jwtFromRequest: function (r) { return test_data.valid_jwt.token; },
                    secretOrKey: 'secret',
                    JwtVerifier
                }
            );

            let req = {};
            result = await s.authenticate(req);
        });


        it("verifies the right jwt", function() {
            expect(result.details.user).to.eql(test_data.valid_jwt.payload);
        });
    });


    describe('handling request with NO JWT', function() {
        var s;
        var result;
        before(async function() {
            s = strategy(function(jwt_payload) {
                return Promise.resolve(jwt_payload);
            },{jwtFromRequest: function(r) {}, secretOrKey: 'secret'});

            let req = {body:{}};
            result = await s.authenticate(req);
        });


        it('should fail authentication', function() {
            expect(result.details.error.message).to.equal("No auth token");
        });


        it('Should not try to verify anything', function() {
            expect(result.type).to.equal('fail')
        });

    });

    describe('handling request url set to url.Url instead of string', function() {
        var s;
        var result;
        before(async function() {
            s = strategy(function(jwt_payload) {
                return Promise.resolve(jwt_payload);
            },{jwtFromRequest: function(r) {}, secretOrKey: 'secret'});

            let req = {body:{},url: new url.Url('/')};
            result = await s.authenticate(req);
        });

        it('should fail authentication', function() {
            expect(result.details.error.message).to.equal("No auth token");
        });

    });


});
