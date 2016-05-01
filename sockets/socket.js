var io;
var mongoose = require('mongoose');
var Game = mongoose.model('Game');
var User = mongoose.model('User');

function initIo() {
	io.sockets.on('connection', function(socket) {

		// Get token from connection
		var token = socket.handshake.query.token;

		// Find user in database
		User.findOne({ "token": token }, function(err, user) {
			if(!user) {
				socket.emit('Not a valid API token')
			} else {
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

function sendUpdate(gameId) {
	if(io) {
		io.to(gameId).emit("update", gameId);
	} else {
		console.log("IO is not initialized yet. Initialize it with HTTP");
	}
}

module.exports = function(http) {

	if(!io && http) {
		io = require('socket.io').listen(http);
		initIo();
	}

	return {
		sendUpdate: sendUpdate
	};
};
