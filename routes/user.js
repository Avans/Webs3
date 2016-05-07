var express = require('express');
var mongoose = require('mongoose');
var _ = require('underscore');

var router = express.Router();
var Game = mongoose.model('Game');
var Gameboard = mongoose.model('Gameboard');
var User = mongoose.model('User');
var token = require('../modules/tokenModule');


/** --------  ALl the routes to  /users/:id/games --------------**/
/** Req.user is available **/
/**    All the routes for the gameboard **/
router.route('/me/games')

.get(token.validate, function(req, res, next) {
	Game.myGames(req.user._id, function(err, games) {

		var result = [];

		//Foreach game in the result set
		games.forEach(function(game) {

			var item = { _id: game._id, status: game.status };

			if(game.status != "queue" && game.player1 && game.player2) {
				var enemy = game.player1; //player 1 is enemy

				if(game.player1._id == req.user._id) {
					enemy = game.player2;
				} //if player 1 is not current player

				item.enemyId = enemy._id;
				item.enemyName = enemy.name;
			}

			if(game.status == Game.schema.status.done) {
				item.winner = game.winner;
			}
			result.push(item);
		});

		res.json(result);//Send it away!

	});
})

.delete(token.validate, function(req, res) {
	Game.myGames(req.user._id, function(err, games) {
		games.forEach(function(game) {
			game.remove();
		});

		res.json({ msg: "Games removed succesfully" });
	});
});

/** Req.user is available **/
/** AGet basic user information **/
router.route('/info')

.get(token.validate, function(req, res) {
	res.json({
		"_id": req.user._id,
		"name": req.user.name
	});
});

module.exports = router;