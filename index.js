var apiai = require('apiai');

var app = apiai('a7ff50039e5d44a28cee822de698909d');

var request = app.textRequest('<Your text query>', {
   sessionId: '<unique session id>'
});

request.on('response', function(response) {
   console.log(response);
});

request.on('error', function(error) {
   console.log(error);
});

request.end();