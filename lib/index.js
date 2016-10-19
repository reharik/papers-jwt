'use strict';

var strategy = require('./strategy'),
    ExtractJwt = require('./extract_jwt.js');


module.exports = {
    strategy: strategy,
    ExtractJwt : ExtractJwt
};
