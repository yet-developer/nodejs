# Feedly Node

    npm install feedly-node

You can run the test by cloning this repo and running:

    npm install
    node test/test

For setting up:

    var FeedlyObj = require('feedly-node');

    var feedly = new FeedlyObj({
      id: 'MYCLIENTID',
      secret: 'MYCLIENTSECRET',
      protocol: 'https', // optional, feedly recommends http, but I do not.
      redirect_uri: 'http://localhost' // set to your own redirect
    });

    var url = feedly.createURL();

After you have obtained the 'code' (either via your redirect or elsewhere):

    var code = ''; // put the short-time auth code in here.

    feedly.getAccessToken(code, function(err, access_token) {
      if(err) {
  		  return console.log(err);
      }
  		console.log(access_token);
  	});

If you have saved your access token in some sort of session or cookie data, you can skip the authorization request:

    var feedly = new FeedlyObj({
      id: 'MYCLIENTID',
      secret: 'MYCLIENTSECRET',
      redirect_uri: 'http://localhost',
      access_token: 'MYACCESSTOKEN'
    });

Once authorized, you can perform typical REST services (http://developer.feedly.com/v3/ for reference):

    // GET
    feedly.get('profile', function(err, res) {
      if(err) {
        return console.log(err);
      }

      console.log(res);
      // displays a user profile
    });

    // POST

    // PUT

    // DELETE

Built by www.typefoo.com
