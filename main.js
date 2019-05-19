let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let request = require("request");

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

function getRants(msg) {
	return new Promise((resolve, reject) => {
		request("https://devrant.com/api/devrant/rants?app=3&sort=" + msg.sortBy + "&range=day&limit=20&skip=" + msg.offset, (err, res, body) => {
			if(err) {
				reject({});
			}

			let parsed = JSON.parse(body);
			resolve(parsed["rants"]);
		});
	})
}

function getRandomRant() {
	return new Promise((resolve, reject) => {
		request("https://devrant.com/api/devrant/rants/surprise?app=3", (err, res, body) => {
			if(err) {
				reject({});
			}

			let parsed = JSON.parse(body);
			resolve(parsed["rant"]);
		});
	})
}

io.on('connection', function(socket){
	console.log('Got a new connection.');

	socket.on('disconnect', function(){
		console.log('Closed a connection.');
	});

	socket.on("new rants with offset", (msg) => {
		getRants(msg).then((rants) => {
			socket.emit("rants", rants);
		});
	})

	socket.on("random rant", (msg) => {
		getRandomRant().then((rant) => {
			socket.emit("rant", rant)
		})
	})

});

http.listen(8000, function(){
	console.log('listening on *:8000');
});