var express = require('express');
var mongoose = require('mongoose');
var _ = require('underscore');

var router = express.Router();
var Game = mongoose.model('Game');
var Gameboard = mongoose.model('Gameboard');
var User = mongoose.model('User');
var token = require('../modules/tokenModule');

/** --------  ALl the routes to  /games --------------**/
/** Req.user is available **/
/**	All the routes for the gameboard **/
router.route('/')

	/** -------------    GET /games ------------------**/
	/** All the gameboards that currently are active **/
	.get(token.validate, function(req, res, next) {

		Game.find({player2: undefined})
			.exec(function(err, games){

				//Select first game
				var game = games[0];
				//Todo: Replace 'currentUser' with username of current username
				var currentUser =  req.user;

				if(game && game.player1.equals(req.user._id))
				{
					res.json({msg: "Error: You are currently pending for a game."})
				}
				else if(game) //If game found, add current player and return game
				{

					game.player2 = req.user._id;
					game.status = Game.schema.status.setup;
					game.save(function(err, done){
						res.send(game);
					});
				}
				else //If no available game found, make a new one
				{

					newGame = new Game({player1: req.user._id});
					newGame.status = Game.schema.status.que;
					newGame.save(function(err, newGame){
						res.send(newGame);
					});
				}
			});
	});

router.route('/AI')

	.get(token.validate, function(req, res, next){
		var AI_ID = "55590d0ca742e811006bf1e2";

		// Ensure the AI user exists
		new User({
		"_id": AI_ID,
		local: {
			"token" : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.ImNvbXB1dGVyIg.Q6ngbbjB3bwhPJEUh8dSXHFggFgMqQZQXDQEoh5qPHI",
			"password" : "$2a$08$rXG6iWPkWZk4nVHcB4H3b.C5Zjm0symOwpPOD3i2Mb.9U1j8oTe8y",
			"email" : "computer"
		}}).save();

		newGame = new Game({player1: req.user._id, player2: AI_ID, isAI: true,});
		newGame.status = Game.schema.status.setup;
		newGame.save(function(err, newGame){
			res.send(newGame);
		});
	});

/** --------  ALl the routes to  /games/:id --------------**/
/** Req.user is available **/
/**	All the routes for the gameboard **/
 router.route('/:id')

	/** -------------    GET /game:/id ------------------**/
	/** Return the specified game by id if the user is part of the game. **/
 	.get(token.validate, function(req, res, next){

 		var userId = req.user._id;

		Game.findById(req.params.id)
			.exec(function(err, game){
				if(!game)
					return res.json({msg: "Error: No game found with id " + req.params.id});
				else{

					if(game.containsPlayer(userId))
			 		{
			 			var result = {
			 				_id: game._id,
			 				status: game.status,
			 				yourTurn:  req.user._id.equals(game.turn),
			 				youWon: req.user._id.equals(game.winner)
			 			};

						game.getMyGameboard(userId, function(err, myGameboard){

							if(myGameboard)
								result.myGameboard = myGameboard;


							if(game.status != "que")
				 			{
				 				var enemyId = game.player1;
				 				if(game.player1.equals(req.user._id))
				 					enemyId = game.player2;

				 				//Get the user element of the enemy player
				 				User.findById(enemyId, function(err, enemy){

					 				result.enemyId = enemy._id;
					 				result.enemyName = enemy.local.email;

					 				if(game.status != "setup"){
						 				game.getEnemyGameboard(userId, function(err, enemyGameboard){
						 					enemyGameboard.ships = undefined;
						 					result.myGameboard = myGameboard;
						 					result.enemyGameboard = enemyGameboard;
						 					res.json(result);
						 				});
					 				}
					 				else{
					 					res.json(result);
					 				}
				 				});
				 			}
				 			else
				 			{
				 				res.json(result);
				 			}

						});
			 		}
			 		else
			 		{
			 			res.json({msg: "Error: You are not a player in this game.", gameId: game._id });
			 		}
				}//Else Game!
			});
 	});

module.exports = router;
