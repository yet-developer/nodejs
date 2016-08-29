var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var multer  = require('multer')

var _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + '-' + Date.now())
  }
})

var upload = multer({ storage: _storage })

var mysql      = require('mysql');
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'we1rdmeetup',
	database : 'o2'
});

connection.connect();

var sql = 'SELECT * FROM topic';
connection.query(sql, function(err, rows, fields){
	if(err){
		console.log(err);
	} else{
		console.log('rows', rows);
		console.log('fields', fields);
	}
});

connection.end();

var app = express();


app.use('/assets', express.static(__dirname + '/public'));
app.use('/assets', express.static(__dirname + '/uploads'));

app.use(bodyParser.urlencoded({ extended: true })); // 예제를 그대로 사용
app.locals.pretty = true;
app.set('views', './views_mysql'); // 템플릿은 여기에
app.set('view engine', 'jade');



app.get('/topic/new', function(req, res){
	res.render('new');
});


app.post('/topic',upload.single('coupon'), function (req, res) {

	var id = req.body.id;
	var json = JSON.stringify(req.body);
	var file = req.file;

	fs.writeFile('data/'+ id, json, function(err){
		if (err){
			res.status(500).send('Internal Server Error');
		}
		// res.send('success '+ file);
		// console.log(file);
		res.redirect('/topic/'+id);
	});

});

app.get(['/coupon', '/coupon/:id'], function(req, res){
	var sql = 'SELECT FROM coupon';
	db.query(sql).then(function(results){
		res.send(results)
	});

});

/*
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
*/
app.listen(8080, function(){
	console.log('Connected on 8080 port!');
});
