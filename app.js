var express = require('express');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: 'keyboard cat'
}));

app.use(express.static(__dirname + '/_public'));
/*
app.get('/', function(req, res){
	req.session.workerId = 'aaa';
	res.send('<h1>hello</h1>');
});*/

app.post('/users', function(req, res){
	
});

app.post('/tasks', function(req, res){
	if(req.session.workerId === undefined){
		res.status(401).send('401');
	}else{
		console.log(req.body);
		res.send('gg');
	}
});

app.listen(1314);