var express = require('express');
var app = express();
app.set('view engine', 'jade'); // view 엔진을 jade로 설정
app.set('views', './views')
app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/route', function(req, res){
	res.send('Hello Router, <img src="/route/001.png">')
});


app.get('/dynamic', function(req, res){
	var lis = "";
	for (var i = 0; i < 5; i++){
		lis = lis + '<li>coding</li>';
	};

	var output = `
		<html>
			<head>
				<meta charset="utf-8">
				<title>test ing</title>
			</head>
			<body>
				hello Dynamic world!
				${lis}
			</body>
		</html>`
		res.send(output);
});


app.get('/template', function (req, res) {
  res.render('temp', {
  	title:'hey', 
  	message: 'hello there!',
  	time: Date()
  });
});

app.get('/topic', function(req,res){
	var topics = [
	'Javascript is....',
	'Nodejs is...',
	'Express is...'
	];

	var output = `
	<a href="/topic?id=0">JavaScript</a><br>
	<a href="/topic?id=1">Nodejs</a><br>
	<a href="/topic?id=2">Express</a><br><br>
	${topics[req.query.id]}
	` // JavaScript 표현식 {} 사용 

	res.send(output);
});


// semantic URL 방식 
app.get('/topic/:id', function(req, res){ // 들어오는 정보를 ID로 정의해 놓고 있는 것이다. 
  var topics = [
    'Javascript is....',
    'Nodejs is...',
    'Express is...'
  ];
  var output = `
  <a href="/topic?id=0">JavaScript</a><br>
  <a href="/topic?id=1">Nodejs</a><br>
  <a href="/topic?id=2">Express</a><br><br>
  ${topics[req.params.id]} 
  ` // 그것을 위에서 정의한 ID를 여기서 써먹는다. 
  res.send(output);
})

app.get('/topic/:id/:mode', function(req, res){
  res.send(req.params.id+','+req.params.mode) // param의 형식을 정의해 놓고 있자.
})


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});