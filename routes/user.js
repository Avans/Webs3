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
/**	All the routes for the gameboard **/
router.route('/me/games')

	.get(token.validate, function(req, res, next){
		Game.myGames(req.user._id, function(err, games){

			var result = [];

			//Foreach game in the result set
			games.forEach(function(game){

				var item = {_id: game._id,status: game.status};

				if(game.status != "que" && game.player1 && game.player2)
				{
					var enemy = game.player1; //player 1 is enemy

					if(game.player1._id.equals(req.user._id))
					 	enemy = game.player2; //if player 1 is not current player

					item.enemyId = enemy._id; 
					item.enemyName = enemy.local.email;
				}

				result.push(item);
			});

			res.json(result);//Send it away!
			
		});
	});

module.exports = router;