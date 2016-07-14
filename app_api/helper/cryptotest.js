
var cryptography = require('./cryptography');

var testHash = function(req, res){

    var crypto = require('crypto');

    cryptography.hashPassword('thelongestpasswordever', function(err, buffer){

        var result;

        if (err !== null){
            console.log('error : ' + err);
            result = err;
        }
        else if (buffer !== null){
            console.log('buffer is: ');
            console.log(buffer instanceof Buffer);
            console.log(buffer);
            var resultHex = buffer.toString('hex');
            console.log('buffer to hex:');
            console.log(resultHex);
        }
        else{
            console.log('buffer is null');
        }

        var newBuffer = new Buffer(resultHex, 'hex');
        console.log('length: ' + resultHex.length);

        cryptography.verifyPassword('secret', buffer, function(err, success) {

            res.json({"result" : success });

        });

    });
};

exports.testHash = testHash;

