var io;
var mongoose = require('mongoose');
var Game = mongoose.model('Game');
var User = mongoose.model('User');

function initIo(){

    io.sockets.on('connection', function (socket) {

        var token = socket.handshake.query.token;
        User.findOne({ "local.token": token }, function (err, user) {
            if (!user) { socket.emit('Not a valid API token') }{

                Game.myGames(user._id, function(err, games){

                    games.forEach(function(game){
                        socket.join(game._id);
                        console.log("user with id " + user._id + " observering game with id " + game._id);
                    });
                });
            }
        });
    });
}

function sendUpdate(gameId){
    if(io){
        io.to(gameId).emit("update", gameId);
    } else{
        console.log("IO is not initialized yet. Initialize it with HTTP") ;
    }
}

module.exports = function(http){

    if(!io && http){
        io = require('socket.io').listen(http);
        initIo();
    }

    return {
       sendUpdate: sendUpdate
    };
};
