var express = require('express');
var session = require('express-session');
var OrientoStore = require('connect-oriento')(session);
var bkfd2Password = require('pbkdf2-password');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var bodyParser = require('body-parser');
var OrientDB = require('orientjs');
var hasher = bkfd2Password();
var server = OrientDB({
	host: 'localhost',
	port: 2424,
	username: 'root',
	password: '111111'
});
var db = server.use('o2');
var app = express();
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(session({
	secret: '1234DSFs@adf1234!@#$asd',
	resave: false,
	saveUninitialized: true,
	store: new OrientoStore({
		server: 'host=localhost&port=2424&username=root&password=111111&db=o2'
	})
}));

app.use(passport.initialize());
app.use(passport.session());


app.locals.pretty = true;
app.set('views', './viewsDB'); // 템플릿은 여기에
app.set('view engine', 'jade');

passport.serializeUser(function(user, done) {
	console.log('serializeUser', user);
	done(null, user.authId);
});
passport.deserializeUser(function(id, done) {
	console.log('deserializeUser', id);
	var sql = "SELECT displayName FROM users WHERE authId=:authId";
	db.query(sql, {
		params: {
			authId: id
		}
	}).then(function(results) {
		if (results.length === 0) {
			done('There is no user.');
		} else {
			done(null, results[0]);
		}
	});
});


// 정적 파일 서비스
app.use('/assets', express.static(__dirname + '/public'));
app.use('/assets', express.static(__dirname + '/uploads'));

app.get('/auth/logout', function(req, res) {
	req.logout();
	req.session.save(function() {
		res.redirect('/card/');
	});
});

app.get('/auth/login', function(req, res) {
	if (req.user && req.user.displayName) {
		res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
      <a href="/auth/logout">logout</a>
    `);

	} else {
		res.render('sign');
	}
});

passport.use(new LocalStrategy(
	function(username, password, done) {
		var uname = username;
		var pwd = password;
		var sql = 'SELECT * FROM users WHERE authId=:authId';
		db.query(sql, {
			params: {
				authId: 'local:' + uname
			}
		}).then(function(results) {
			if (results.length === 0) {
				return done(null, false);
			}
			var user = results[0];
			return hasher({
				password: pwd,
				salt: user.salt
			}, function(err, pass, salt, hash) {
				if (hash === user.password) {
					console.log('LocalStrategy', user);
					done(null, user);
				} else {
					done(null, false);
				}
			});
		})
	}
));
passport.use(new FacebookStrategy({
		clientID: '725852097556502',
		clientSecret: '12345678901234567890123456789012',
		callbackURL: "/auth/facebook/callback",
		profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName']
	},
	function(accessToken, refreshToken, profile, done) {
		console.log(profile);
		var authId = 'facebook:' + profile.id;
		var sql = 'SELECT FROM users WHERE authId=:authId';
		db.query(sql, {
			params: {
				authId: authId
			}
		}).then(function(results) {
			console.log(results, authId);
			if (results.length === 0) {
				var newuser = {
					'authId': authId,
					'displayName': profile.displayName,
					'email': profile.emails[0].value
				};
				var sql = 'INSERT INTO users (authId, displayName, email) VALUES(:authId, :displayName, :email)';
				db.query(sql, {
					params: newuser
				}).then(function() {
					done(null, newuser);
				}, function(error) {
					console.log(error);
					done('Error');
				})
			} else {
				return done(null, results[0]);
			}
		})
	}
));

app.get('/auth/failure', function(req, res) {
	res.send('로그인 실패')
});


app.post(
	'/auth/login',
	passport.authenticate(
		'local', {
			successRedirect: '/card/',
			failureRedirect: '/auth/failure',
			failureFlash: false
		}
	)
);
app.get(
	'/auth/facebook',
	passport.authenticate(
		'facebook', {
			scope: 'email'
		}
	)
);
app.get(
	'/auth/facebook/callback',
	passport.authenticate(
		'facebook', {
			successRedirect: '/card',
			failureRedirect: '/auth/login'
		}
	)
);

// 회원 가입 post
app.post('/auth/register', function(req, res) {
	hasher({
		password: req.body.password
	}, function(err, pass, salt, hash) {
		var user = {
			authId: 'local:' + req.body.username,
			username: req.body.username,
			password: hash,
			salt: salt,
			displayName: req.body.displayName
		};
		var sql = 'INSERT INTO users (authId,username,password,salt,displayName) VALUES(:authId,:username,:password,:salt,:displayName)';
		db.query(sql, {
			params: user
		}).then(function(results) {
			req.login(user, function(err) {
				req.session.save(function() {
					res.redirect('/card/');
				});
			});
		}, function(error) {
			console.log(error);
			res.status(500);
		});
	});
});

// 회원가입
app.get('/auth/register', function(req, res) {
	res.render('register');
});


app.get('/', function(req, res) {
	res.redirect('/card/');
});

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
		params: {
			title: title,
			description: description,
			author: author,
			project: project
		}
	}).then(function(results) {
		// rid = results[0]['@rid'].cluster + "_" + results[0]['@rid'].position
		var id = encodeURIComponent(results[0]['@rid'])
		res.redirect('/card/#' + id);
	});
});

app.get('/card/:id/edit', function(req, res) {
	var sql = 'SELECT FROM topic WHERE @rid=:rid';
	var id = req.params.id;
	db.query(sql, {
		params: {
			rid: id
		}
	}).then(function(result) {
		res.render('edit', {
			card: result[0]
		});
	});
});
app.post('/card/:id/edit', function(req, res) {
	var sql = 'UPDATE topic SET title=:t, description=:d, author=:a, project=:p WHERE @rid=:rid';
	var rid = req.params.id;
	var title = req.body.title;
	var desc = req.body.description;
	var author = req.body.author;
	var project = req.body.project;
	var id = encodeURIComponent(req.params.id);

	db.query(sql, {
		params: {
			t: title,
			d: desc,
			a: author,
			rid: rid,
			p: project
		}
	}).then(function(results) {
		res.redirect('/card/#' + id);
	});
});


app.post('/card/:id/delete', function(req, res) {
	var sql = 'DELETE FROM topic WHERE @rid=:rid';
	var id = req.params.id;
	db.query(sql, {
		params: {
			rid: id
		}
	}).then(function(result) {
		// if (err) {
		console.log(result);
		// }else {
		// console.log('success');
		res.redirect('/card/');
		// }
	});
});

app.get('/card/:id/delete', function(req, res) {
	var id = req.params.id;
	var sql = 'SELECT FROM topic WHERE @rid=:rid';
	db.query(sql, {
		params: {
			rid: id
		}
	}).then(function(result) {
		res.render('delete', {
			card: result[0]
		});
	});
});


app.get(['/card', '/card/:id'], function(req, res) {
	if (req.user && req.user.displayName) {
		displayName = req.user.displayName;
	} else {
		displayName = "null"
	}

	var sql = 'SELECT FROM topic LIMIT 20';
	db.query(sql).then(function(results) {
		var id = req.params.id;
		if (id) {
			var sql = 'SELECT FROM topic WHERE @rid=:rid';
			db.query(sql, {
				params: {
					rid: id
				}
			}).then(function(result) {
				res.render('views', {
					cards: results,
					card: result[0],
					displayName: displayName
				});
			});
		} else {
			res.render('views', {
				cards: results,
				displayName: displayName
			});
		}
	});
});

app.listen(8080, function() {
	console.log('Connected on 8080 port!');
});
