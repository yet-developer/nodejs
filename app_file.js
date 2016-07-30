var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

app.set('views', './views_file');
app.set('view engine', 'pug');

app.get('/coupon/new', function(req, res){
	res.send('Hi');

});

app.listen(3000, function(){
	console.log('Connected on 3000 port!');
});
