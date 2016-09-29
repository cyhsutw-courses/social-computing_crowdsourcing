var express = require('express');
//var cookieParser = require('cookie-parser');

var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('camera.db');

var shortId = require('shortid');

var app = express();

var taskId = 1;
var taskSet = [10, 6];

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

app.get('/hi', function(req, res){
	db.all('SELECT * FROM camera', function(err, rows){
		res.status(200).send(rows);
	});
	//var result = db.run('SELECT * FROM camera');
	//res.status(200).send();
});

app.post('/users', function(req, res){

	if(req.body.gender === undefined || req.body.concern === undefined){
		res.status(400).json({error: "Bad Request"});
	}else if(req.body.gender != 'male' && req.body.gender != 'female'){
		res.status(400).json({error: "Bad Request"});
	}else if(req.body.concern.replace(/\s/ig, '').length <= 0){
		res.status(400).json({error: "Bad Request"});
	}else{

		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		var key = shortId.generate();
		db.run('INSERT INTO user (ip, key, task, gender, concern) VALUES (?, ?, ?, ?, ?)', [ip, key, taskSet[taskId], req.body.gender, req.body.concern], function(err){
			var uid = this.lastID;
			db.all('SELECT * FROM objects WHERE id=?', [taskSet[taskId]], function(err, rows){
				var tid = taskSet[taskId];

				taskId++;
				if(taskId >= taskSet.length){
					taskId %= taskSet.length;
				}
				var tasks = JSON.parse(rows[0]['object']);
				var cameras = [];

				db.each('SELECT * FROM camera WHERE id in (?, ?, ?, ?, ?)',
					tasks,
					function(err, row){
						var data = row;


						var cam = {};
						cam.spec = {};
						cam.id = data.id;
						cam.img = data.img;

						var keys = Object.keys(data);
						keys.forEach(function(keyEle){
							if(keyEle === 'id' || keyEle === 'img'){

							}else if(keyEle === 'spec'){
								cam.spec.url = data[keyEle];
							}else{
								cam.spec[keyEle] = data[keyEle];
							}
						});
						//console.log('push');
						cameras.push(cam);

					}, function(err, row){

						var obj2send = {};
						obj2send.userId = uid;
						obj2send.taskId = tid;
						obj2send.cams = cameras;

						req.session.userId = uid;
						req.session.taskId = tid;
						req.session.surveyKey = key;

						console.log('[' + new Date() + '] User #' + uid + ' created, performing task #' + tid + '. IP: ' + ip);

						res.status(201).json(obj2send);
					}
				);


			});

		});
	}


});

app.post('/tasks', function(req, res){

	var reqObj = req.body;
	if(req.session.userId === undefined || req.session.taskId === undefined){
		res.status(401).json({error:"Unauthorized"});
	}else if(reqObj.userId != req.session.userId || reqObj.taskId != req.session.taskId){
		res.status(400).json({error: "Bad Request"});
	}else{
		if(reqObj.cams === undefined || reqObj.cams.length != 5){
			res.status(400).json({error: "Bad Request"});
		}else{

			var tasks = [];
			db.each(
				'SELECT * FROM objects WHERE id=?', [reqObj.taskId],
				function(err, row){
					if(!err){
						tasks = JSON.parse(row['object']);
					}else{

					}

				},
				function(err, rows){
					if(err || rows != 1){
						res.status(400).json({error: "Bad Request"});
					}else{
						var isBadFormat = false;
						for(var i=0; i<5; i++){
							var thisCam = reqObj.cams[i];
							if(!thisCam.id || !thisCam.t1Score || !thisCam.t2Score ||
								 tasks.indexOf(thisCam.id) == -1 ||
								 thisCam.t1Score > 5 || thisCam.t1Score < 1 ||
								 thisCam.t2Score > 5 || thisCam.t2Score < 1 ){
								isBadFormat = true;
								break;
							}
						}
						if(isBadFormat){
							res.status(400).json({error: "Bad Request"});
						}else{
							db.serialize(function(){
								var stmt = db.prepare("INSERT INTO task (uid, ttype, oid, val) VALUES (?, ?, ?, ?)");
  								for(var i=0; i<5; i++){
  									var thisCam = reqObj.cams[i];
  									stmt.run([reqObj.userId, 1, thisCam.id, String(thisCam.t1Score)]);
  									stmt.run([reqObj.userId, 2, thisCam.id, String(thisCam.t2Score)]);
  								}
  								stmt.finalize();

  								console.log('[' + new Date() + '] User #' + reqObj.userId + " has finished the task #" + reqObj.taskId + ".");
  								var svCode = req.session.surveyKey;
  								req.session.destroy();
  								res.status(201).json({code:svCode});
							});


						}
					}
				}
			);
		}
	}
});

app.listen(80, function(){
	console.log("> Server running at 127.0.0.1:80 <");
});
