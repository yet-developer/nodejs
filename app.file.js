var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('views', './views'); // 템플릿은 여기에
app.set('view engine', 'jade');
app.locals.pretty = true;
// app.post('/', function(req, res){
// 	res.send('hello, post');
// })


app.post('/topic', function (req, res) {
	var id = req.body.id;
	var signature =  req.body.signature;
	var name = req.body.name;
	var team = req.body.team;
	var title = req.body.title;
	var contactMain = req.body.contactMain;
	var contactMail = req.body.contactMail;
	var json = JSON.stringify(req.body);


	fs.writeFile('data/'+id,json, function(err){
		if (err){
			res.status(500).send('Internal Server Error');
		}
		res.send(req.body);
	});

});


app.get('/topic', function(req, res){
	fs.readdir('data', function(err, files){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error');
		}
		res.render('view', {topics:files});
	});
})

app.get('/topic/new', function(req, res){
	res.render('new');
});

app.get('/topic/:id', function(req, res){
	var id = req.params.id;
	fs.readFile('data/'+id, 'utf8', function(err, data){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error');
		}
		// res.send(data);
		res.render('signs', {json: data});
	});
});

app.listen(3000, function(){
	console.log('Connected on 3000 port!');
});
