var express = require('express');
var bodyParser = require('body-parser');
var OrientDB = require('orientjs');
var server = OrientDB({
	host: 'localhost',
	port: 2424,
	username: 'root',
	password: 'we1rdmeetup'
});

var db = server.use('o2');
var app = express();


app.use('/assets', express.static(__dirname + '/public'));
app.use('/assets', express.static(__dirname + '/uploads'));

app.use(bodyParser.urlencoded({
	extended: true
})); // 예제를 그대로 사용
app.locals.pretty = true;
app.set('views', './viewsDB'); // 템플릿은 여기에
app.set('view engine', 'jade');



app.get('/card/new', function(req, res) {
	res.render('new');
});


app.post('/card/new', function(req, res) {
	var title = req.body.title;
	var description = req.body.description;
	var author = req.body.author;
	var project = req.body.project;
	var sql = 'INSERT INTO topic (title, description, author, project) VALUES(:title, :description, :author, :project)';
	db.query(sql, {
	 params:{
	   title:title,
	   description:description,
	   author:author,
		 project:project
	 }
	}).then(function(results){
		console.log(results[0]['@rid']);
		rid = results[0]['@rid'].cluster + "_" + results[0]['@rid'].position
		res.redirect('/card/#'+rid);
 });
});

app.get(['/card', '/card/:id'], function(req, res) {
	var sql = 'SELECT FROM topic';
	db.query(sql).then(function(results) {
		var id = req.params.id;
		if (id) {
			var sql = 'SELECT FROM topic WHERE @rid=:rid';
			db.query(sql, {
				params: {
					rid: id
				}
			}).then(function(detail) {
				res.render('views', {
					cards: results,
					card: detail[0]
				});
			});
		} else {
			res.render('views', {
				cards: results
			});
		}
	});
});

app.listen(8080, function() {
	console.log('Connected on 8080 port!');
});
