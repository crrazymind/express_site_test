module.exports = function(app)
{
	fs = require('fs');

	nconf = require('nconf'),
	Recaptcha = require('recaptcha').Recaptcha;

	// home page
	app.get('/', function(req, res)
	{
		res.render('index', { title: 'Home Page.  ' })
	});

	// chat area
	app.get('/chat', function(req, res)
	{
		res.render('chat', { title: 'Chat with Me!  ' })
	});

	// about page
	app.get('/about', function(req, res)
	{
		res.render('about', { title: 'About Me.  ' })
	});
	// about page
	app.get('/demo', function(req, res)
	{
		res.render('demo', { title: 'Demo page.  ' })
	});
	// task page
	app.get('/task', function(req, res)
	{
		res.render('task', { title: 'task page.  ' })
	});

	var data = {"task0":{"title":"empty task from model","duration":0,"cost":0,"eta":"1/1/12","link":"http://google.com","done":false},"task1":{"title":"empty task1","duration":0,"cost":0,"eta":"1/1/12","link":"http://google.com","done":false},"task2":{"title":"empty task2","duration":0,"cost":0,"eta":"1/1/12","link":"http://google.com","done":false},"task3":{"title":"empty task3","duration":0,"cost":0,"eta":"1/1/12","link":"http://google.com","done":false},"task4":{"title":"empty task4","duration":0,"cost":0,"eta":"1/1/12","link":"http://google.com","done":false}};
	var dataSep = {
		"task0": {
			"title": "empty task from model",
			"id" : 0,
			"duration": 0,
			"cost": 0,
			"eta": "1/1/12",
			"link": "http://google.com",
			"done": false
		},
		"task1": {
			"title": "empty task1",
			"id" : 1,
			"duration": 0,
			"cost": 0,
			"eta": "1/1/12",
			"link": "http://google.com",
			"done": false
		},
		"task2": {
			"title": "empty task2",
			"id" : 2,
			"duration": 0,
			"cost": 0,
			"eta": "1/1/12",
			"link": "http://google.com",
			"done": false
		},
		"task3": {
			"title": "empty task3",
			"id" : 3,
			"duration": 0,
			"cost": 0,
			"eta": "1/1/12",
			"link": "http://google.com",
			"done": false
		},
		"task4": {
			"title": "empty task4",
			"id" : 4,
			"duration": 0,
			"cost": 0,
			"eta": "1/1/12",
			"link": "http://google.com",
			"done": false
		}
	}
	
	//this.in_memory_data = dataSep;
	console.log('get tl: ', app.in_memory_data);
	if(!app.in_memory_data){
		app.in_memory_data = {};
	}

	function addToList(in_memory_data, newData){
		in_memory_data.push(newData);
		return in_memory_data;
	}
	app.get('/task_source', function(req, res)
	{
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.write(JSON.stringify(app.in_memory_data));
		res.end();
	});
	app.post('/task_source', function(req, res)
	{
		res.writeHead(200, { 'Content-Type': 'application/json' });
		if(req.body.length > 0) {
			for (var i = in_memory_data.length - 1; i >= 0; i--) {
				if(in_memory_data[i]['_id'] == req.body['_id']) {
					for (var _i in req.body){
						in_memory_data[i][_i] = req.body[_i];
					}
				}
			};
			res.write(JSON.stringify(app.in_memory_data));
		}
		else res.write('no data');
		res.end();
	});
	app.put('/task_source/*', function(req, res)
	{
		res.writeHead(200, { 'Content-Type': 'application/json' });
		//delete req.body['_id'];
		//if(req.body) app.in_memory_data = addToList(app.in_memory_data, req.body);

		function dbPutCallback(data, err){
			//if( typeof data ==  Object) app.in_memory_data = addToList(app.in_memory_data, data, req);
			console.log(data);
			res.write(JSON.stringify(app.in_memory_data));
			res.end();
		}
		updateList(app.in_memory_data, req.body, dbPutCallback);
	});

	function updateList(in_memory_data, newData, callback){
		var _F = false;
		for (var i = in_memory_data.length - 1; i >= 0; i--) {
			if(in_memory_data[i]['_id'] == newData['_id']) {
				_F = true;
				for (var _i in newData){
					in_memory_data[i][_i] = newData[_i];
				}
			}
		};
		if(!_F){
			app.addTaskDb(newData, callback);
			return true;
		}else{
			return in_memory_data;
		}
	}

}
