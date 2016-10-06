var jwt = require('jsonwebtoken');

module.exports  = function(token, secretOrKey, options) { 
    return new Promise((res, rej) => {
        jwt.verify(token, secretOrKey, options, (err, data) => {
            return err ? rej(err) :  res(data);
        });
    })
};
