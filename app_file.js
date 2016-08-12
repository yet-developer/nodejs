var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path')
var app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true })); // 예제를 그대로 사용
app.locals.pretty = true;
app.set('views', './views'); // 템플릿은 여기에
app.set('view engine', 'jade');



app.get('/upload', function(req, res){
	res.render('new');
});

app.post('/card', function (req, res) {

	var id = req.body.id;
	var json = JSON.stringify(req.body);

	fs.writeFile('data/'+ id, json, function(err){
		if (err){
			res.status(500).send('Internal Server Error');
		}
		res.redirect('/card/'+id);
	});

});

app.get('/card', function(req, res){
	fs.readdir('data', function(err, files){
		if (err){
			res.status(500).send('Internal Server Error');
		}
		res.render('view', {cards:files});
	})
});



app.get('/card/:id', function(req, res){
	var id = req.params.id;
	fs.readFile('data/'+id, 'utf8', function(err, data){
		if(err){
			console.log(err);
			res.status(500).send('Internal Server Error');
		}
		// res.send(data);
		res.render('signs', {json: data, title: id});
	});
});

app.listen(8080, function(){
	console.log('Connected on 8080 port!');
});
