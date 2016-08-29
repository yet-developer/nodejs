var express = require('express');
var https      = require('https');
var FB = require('fb');

var app = express();


app.get('/auth/feedly', function(req, res){
	var auth = passport.authenticate('feedly');
	res.send(console.log(auth));

});

// app.get('/auth/feedly/callback',
//     passport.authenticate('feedly', { failureRedirect: '/login' }),
//     function(req, res) {
//     // Successful authentication, redirect home.
//     res.redirect('/');
// });