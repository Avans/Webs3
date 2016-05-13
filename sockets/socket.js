var io;
var mongoose = require('mongoose');
var Game = mongoose.model('Game');
var User = mongoose.model('User');

var connections = [];

function initIo() {
	io.sockets.on('connection', function(socket) {

		// Get token from connection
		var token = socket.handshake.query.token;

		// Find user in database
		User.findOne({ "token": token }, function(err, user) {
			if(!user) {
				socket.emit('Not a valid API token')
			} else {
				connections[token] = socket;
				Game.myGames(user._id, function(err, games) {
					games.forEach(function(game) {
						socket.join(game._id);
						console.log("user with id " + user._id + " observing game with id " + game._id);
					});
				});
			}
		});
	});
}

function addGame(gameId, token) {
	if(io && connections[token]) {
		connections[token].join(gameId);
	} else {
		console.log("IO is not initialized yet. Initialize it with HTTP");
	}
}

// Listen to status changes for a game
function sendUpdate(gameId, status) {
	if(io) {
		io.to(gameId).emit('update', {
			gameId: gameId,
			status: status
		});
	} else {
		console.log("IO is not initialized yet. Initialize it with HTTP");
	}
}

function sendTurnUpdate(gameId, turn) {
	if(io) {
		io.to(gameId).emit("turn", {
			gameId: gameId,
			turn: turn
		});
	} else {
		console.log("IO is not initialized yet. Initialize it with HTTP");
	}
}

// Listen for shots from the enemy
function sendShot(gameId, user, field, result) {
	if(io) {
		io.to(gameId).emit("shot", {
			gameId: gameId,
			user: user,
			field: field,
			result: result
		});
	} else {
		console.log("IO is not initialized yet. Initialize it with HTTP");
	}
}

module.exports = function(http) {

	if(!io && http) {
		io = new require('socket.io').listen(http);
		initIo();
	}

	return {
		addGame: addGame,
		sendUpdate: sendUpdate,
		sendShot: sendShot,
		sendTurnUpdate: sendTurnUpdate
	};
};
