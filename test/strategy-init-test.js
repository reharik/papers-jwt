var strategy = require('../lib/strategy');

describe('strategy', function() {

    it('should throw if constructed without a validate function', function() {
        expect(function() {
            var s = strategy(undefined, {jwtFromRequest: function(r) {}, secretOrKey: 'secret'});
        }).to.throw(TypeError, "JwtStrategy requires a validation function");
    });


    it('should throw if constructed without a secretOrKey arg', function() {
        expect(function() {
            var s = strategy(function() {},{jwtFromRequest: function(r) {}, secretOrKey: null});
        }).to.throw(TypeError, 'JwtStrategy requires a secret or key');
    });


    it('should throw if constructed without a jwtFromRequest arg', function() {
        expect(function() {
            var s = strategy(function() {}, {secretOrKey: 'secret'});
        }).to.throw(TypeError);
    });
});
