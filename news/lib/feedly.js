function FeedlyConnect(params) {
    var utils         = require('./utils'),
    querystring       = require('querystring'),
    http             = require('http'),
    https            = require('https'),
    $scope            = this;

  var defaults = {
    state: utils.createGUID(),
    id: '',
    secret: '',
    redirect_uri: '',
    access_token: null,
    sandbox: true,
    version: 'v3',
    protocol: 'http',
    port: 80,
    scope: encodeURIComponent('https://cloud.feedly.com/subscriptions'),
    user_agent: 'feedly-node (www.typefoo.com)'
  };

  $scope.config = utils.extend(defaults, params);
  var requestor = http;
  if($scope.config.port === 443 || $scope.config.protocol === 'https') {
    $scope.config.port = 443;
    $scope.config.protocol = 'https';
    requestor = https;
    console.log('using https');
  }

  $scope.config.host = $scope.config.sandbox === true ? 'sandbox.feedly.com' : 'cloud.feedly.com';

  $scope.setAccessToken = function(access_token) {
    $scope.config.access_token = access_token;
    return $scope;
  };

  $scope.createURL = function() {
    return $scope.config.protocol + '://' + $scope.config.host + '/' + $scope.config.version + '/auth/auth?'
      + 'response_type=code'
      + '&client_id=' + $scope.config.id
      + ($scope.config.scope ? '&scope=' + $scope.config.scope : '')
      + '&state=' + $scope.config.state
      + '&redirect_uri=' + encodeURIComponent($scope.config.redirect_uri);
  };

  function doReq(opts, d, callback) {
    var q = JSON.stringify(d);

    if(!opts.method) {
      opts.method = 'get';
    }
    opts.method = opts.method.toLowerCase();
    if(opts.method === 'post' || opts.method === 'put' || opts.method === 'delete') {
      opts.headers['Content-Length'] = q.length;
    }

    var req = requestor.request(opts, function(sock) {
      sock.setEncoding('utf-8');
    });
    req.on('response', function(res) {
      var responseData = '';
      res.on('data', function(chunk) {
        responseData += chunk;
      });

      res.on('end', function() {
        try {
          var j = JSON.parse(responseData);
          if(j.errors || j.error) {
            j.arguments = opts;
            return callback(j, null);
          }
          callback(null, j);
        } catch(e) {
          callback({
            error: true,
            message: 'Error on: [' + opts.method + '] ' + opts.path,
            details: responseData,
            arguments: opts
          }, null);
        }
      });
    });

    req.on('error', function(e) {
      callback(e, null);
    });

    if(opts.method === 'post' || opts.method === 'put' || opts.method === 'delete') {
      req.write(q);
    }

    req.end();
  }

  $scope.getAccessToken = function(code, callback) {
    if(typeof code === 'undefined') {
      callback({
        error: true,
        message: 'No code parameter given'
      }, null);
    }

    var qs = querystring.stringify({
      client_id: $scope.config.id,
      client_secret: $scope.config.secret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: $scope.config.redirect_uri
    });

    var opts = {
      host: $scope.config.host,
      path: '/' + $scope.config.version + '/auth/token?' + qs,
      port: $scope.config.port,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': $scope.config.user_agent
      }
    };

    doReq(opts, null, function(err, json) {
      if(err) {
        return callback(err, null);
      }

      callback(null, json.access_token);
    });
  };

  $scope.request = function(access_token, path, method, data, callback) {
    var used_args = arguments;
    if(access_token === null) {
      return callback({
        error: true,
        message: 'No access token set.'
      }, null);
    }

    method = method.toLowerCase();

    if(data) {
      var dataKeys = Object.keys(data);
      if(dataKeys.length > 0) {
        if(path.indexOf('?') === -1) {
          path += '?';
        }
        for(var i in data) {
          if(typeof data[i] === 'object') {
            path += i + '=' + JSON.stringify(conf.data[i]);
          } else {
            path += i + '=' + conf.data[i];
          }
          if(i !== dataKeys[dataKeys.length-1]) {
            path += '&';
          }
        }
      }
    }

    var opts = {
      host: $scope.config.host,
      path: '/' + $scope.config.version + '/' + path,
      method: method,
      port: $scope.config.port,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'OAuth ' + $scope.config.access_token,
        'User-Agent': $scope.config.user_agent
      }
    };

    doReq(opts, data, function(err, json) {
      if(err) {
        return callback(err, null);
      }

      callback(null, json);
    });
  };

  $scope.get = function(path, data, callback) {
    if(arguments.length < 3) {
      callback = data;
      data = null;
    }
    $scope.request($scope.config.access_token, path, 'get', data, callback);
  };

  $scope.post = function(path, data, callback) {
    $scope.request($scope.config.access_token, path, 'post', data, callback);
  };

  $scope.put = function(path, data, callback) {
    $scope.request($scope.config.access_token, path, 'put', data, callback);
  };

  $scope.delete = function(path, data, callback) {
    if(arguments.length < 3) {
      callback = data;
      data = null;
    }
    $scope.request($scope.config.access_token, path, 'delete', data, callback);
  };

  return $scope;
}

module.exports = FeedlyConnect;
