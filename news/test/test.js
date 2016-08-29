var prompt     = require('prompt');
var https      = require('https');
var feedlyObj = require('../lib/feedly');

var feedly = new feedlyObj({
  id: 'sandbox',
  secret: 'ES3R6KCEG46BW9MYD332',
  redirect_uri: 'http://localhost/'
});

prompt.start();

prompt.get([
  {
    name: 'access_token',
    message: 'Enter access token (optional)'
  }
], function(err, result) {
  if(result.access_token) {
    feedly.setAccessToken(result.access_token);
    return sampleCalls();
  }

  doAuthorization();
});

function doAuthorization() {
  var url = feedly.createURL();
  console.log('\n\nGo to the following URL:\n\n' + url + '\n\n');

  prompt.get([
    {
      name: 'code',
      message: 'Enter the code parameter from the returned URL',
      required: true
    }
  ], function(err, result) {
    console.log('\n\nConnecting to Feedly, retrieving Access Token...\n\n');
    feedly.getAccessToken(result.code, function(err, access_token) {
      if(err) {
        return console.log(err);
      }

      console.log(access_token);
      feedly.setAccessToken(access_token);
      sampleCalls();
    });
  });

}

function sampleCalls() {
  // GET
  feedly.get('profile', function(err, res) {
    if(err) {
      return console.log(err);
    }

    console.log(res);
  });
  // POST

  // PUT

  // DELETE
}
