var express = require('express');
var mongoose = require('mongoose');
var _ = require('underscore');

var router = express.Router();
var Game = mongoose.model('Game');
var Gameboard = mongoose.model('Gameboard');

/** --------  ALl the routes to  /game --------------**/
/**	All the routes for the gameboard **/
router.route('/')

	/** -------------    GET /game ------------------**/
	/** All the gameboards that currently are active **/
	.get(function(req, res, next) {
		
		Game
			.find({player2: undefined})
			.exec(function(err, games){

				//Select first game
				var game = games[0];
				//Todo: Replace 'currentUser' with username of current username
				var currentUser =  "currentUser";

				if(game) //If game found, add current player and return game
				{

					game.player2 = currentUser;
					game.status = Game.schema.status.setup;
					game.save(function(err, done){
						res.send(game);
					});
				}
				
				else //If no available game found, make a new one
				{

					newGame = new Game({player1: currentUser});
					newGame.status = Game.schema.status.que;
					newGame.save(function(err, newGame){
						res.send(newGame);
					});
				}
			});
	});

router.route('/:id/gameboards')

	.post(function(req, res, next) {

		var gameboard = new Gameboard(req.body);

		Game
			.findById(req.params.id)
			.exec(function(err, game){

				if(game.status === Game.schema.status.setup)
				{
					gameboard.save(function(err, gameboard){
						//check for errors
						if(err){res.json(err);}
						else{

							//if board 1 is not yet set
							if(!game.board1)
							{
								//TODO: bord moet gekozen worden o.b.v. currentUser
								game.board1 = gameboard._id;
								game.save(function(err, game){
	
									if(err){res.json(err);}
									else {res.send("success");}
								});
							}
							else
							{
								//TODO: bord moet gekozen worden o.b.v. currentUser
								game.board2 = gameboard._id;
								game.status = Game.schema.status.started;

								game.save(function(err, game){
									if(err){res.json(err);}
									else{res.send("success");}
								});
							}
						}
					});
				}
				else
				{
					res.send("Het is niet mogelijk om een gameboard te submitten naar een game met de status " + game.status);
				}

			});
	});

module.exports = router;
