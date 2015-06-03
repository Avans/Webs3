var express = require('express');
var mongoose = require('mongoose');
var _ = require('underscore');

var router = express.Router();
var Gameboard = mongoose.model('Gameboard');
var Game = mongoose.model('Game');
var token = require('../modules/tokenModule');
var io = require('../sockets/socket')();



module.exports = function(app){



	function validateHit(hit)
	{
		if(!Object.keys(hit).length) { return "No data in Ajax request"; }
		if(!hit.x) { return "No key 'x' found on JSON object";}
		if(!hit.y) { return "No key 'y' found on JSON object";}
		if(isNaN(hit.y)) { return "Key 'y' could not be converted to a number" ;}
		return undefined;
	}

	/** --------  ALl the routes to  /games/:id/gameboards --------------**/
	/** Req.user is available **/
	/**	All the routes for the gameboard **/
	router.route('/games/:id/gameboards')

		/** -------------    POST /games/:gameId/gameboards ------------------**/
		.post(token.validate, function(req, res, next) {

			var gameId = req.params.id;

			if(!req.body.ships) {
				return res.json({msg: "Error: JSON should include 'ships' property"});
			}

			Game.findById(gameId)
				.exec(function(err, game){

					//Check if the game excists
					if(!game)
						return res.json({msg: "Error: No game found with id " + gameId});

					//Check if the game is in the right state for setting up gameboards
					if(game && game.status === Game.schema.status.setup)
					{
						//Check if a user already posted a gameboard
						game.getMyGameboard(req.user._id, function(err, gameboard){
							if(err){res.json(err)}
							if(gameboard){res.json({msg: "Error: You already have a gameboard in this game'.", status: game.status})}
							else{

								//add a new gameboard to the game
								var gameboard = new Gameboard();
								var ships = req.body.ships;

								//Voor de zekerheid nemen we alleen de velden over van ship die nodig zijn
								for(var i = 0; i < ships.length; i++){
									var ship = {
										startCell: ships[i].startCell,
										name: ships[i].name,
										isVertical: ships[i].isVertical,
										length: ships[i].length,
									};
									gameboard.ships.push(ship);
								}

								var validationErrors = gameboard.isValid();

								if(validationErrors.length != 0){
									return res.json({
										msg: "Error: The gameboard contains validation errors",
										validationErrors: validationErrors
									});
								}

								gameboard.save(function(err, gameboard){

									//check for errors
									if(err){res.json(err);}
									else{

										//Check if enemy is AI
										if(game.isAI){
											var gameboardAI = new Gameboard();
											gameboardAI.ships =  gameboard.ships;
											gameboardAI.save(function(err, gameboardAI){
												SetGameboardsToGame(req, res, game, gameboard, gameboardAI);
											});
										}
										else
										{
											io.sendUpdate(game._id);
											SetGameboardsToGame(req, res, game, gameboard);
										}
									}
								});
							}
						});

					}
					else
					{
						res.send("Het is niet mogelijk om een gameboard te submitten naar een game met de status " + game.status);
					}

				});
		});

	function SetGameboardsToGame(req, res, game, gameboard, gameboardAI){
		//user 1 or user 2?
		if(game.player1.equals(req.user._id))
		game.board1 = gameboard._id;
		else
		game.board2 = gameboard._id;

		if(gameboardAI){
			game.board2 = gameboardAI._id;
		}

		//Are both gameboards posted? Then we can start
		if(game.board1 && game.board2){
			game.start();
		}

		//Save all the games!!
		game.save(function(err, game){
			if(err){res.json(err);}
			else {

				res.json({msg: "success", status: game.status});
			}
		});
	}


	/**
	--------  ALl the routes to  /gameboards/:id/shots --------------
	All the routes for the gameboard it's hits
	Return values: Error, SPLASH, BOOM and fail
	Error: Wrong URL or JSON
	SPLASH: shot added to the board, but no ship hit
	BOOM: shot added to the board and to the hit of the ship
	FAIL: trying to add a shot that already excists
	**/
	router.route('/games/:id/shots')

		.post(token.validate, function(req, res, next){

			var gameId = req.params.id;

			Game.findById(gameId)
				.exec(function(err, game){

					req.game = game;

					//Check if the game excists
					if(!game)
						return res.json({msg: "Error: No game found with id " + gameId});

					//check if user is part of game
					if(!game.containsPlayer(req.user._id))
						return res.json({msg: "Error: You are not a player in this game.", gameId: game._id });

					if(game.status != Game.schema.status.started)
						return res.json({msg: "Error: This game does not have the right status.", gameId: game._id });

					if(!game.turn.equals(req.user._id))
						return res.json({msg: "Error: It is not the your turn to add a shot", gameId: game._id });


					//Check if the game is in the right state for adding shots
					if(game.status === Game.schema.status.started)
					{

						game.getEnemyGameboard(req.user._id, function(err, gameboard){

							var pShot = req.body;

							//Validate the parameter Shot
							var error = validateHit(pShot);
							if(error){return res.send(error + ";JSON: " + pShot);}

							//Make sure pShot.x is a number
							pShot.y = parseInt(pShot.y);

							var shotFound = _.findWhere(gameboard.shots, pShot);

							//if shots does NOT contain a shot that looks like pShot
							if(!shotFound)
							{
								var isHit = gameboard.isShipHit(pShot); //also adds hits and stuff

								gameboard.save(function(err, gameboard){

									var enemyId = req.user._id.equals(game.player1) ? game.player2 : game.player1;
									game.turn = enemyId;
									var response = "SPLASH";
									if(isHit)
									{

										//If the ship is hit, we need to check of the game is over
										if(gameboard.areAllShipsHit())
										{
											game.status = Game.schema.status.done;
											game.winner = req.user._id;
											response = "WINNER";
										}
										else
										{
											response = "BOOM";
										}
									}

									game.save(function(err, game){
										if(game.isAI){
											req.result = response;
											next();
										}
										else{
											io.sendUpdate(game._id);
											res.send(response);
										}
									});

								});
							}
							else{
								if(game.isAI)
								{
									req.result = "FAIL";
									next();
								}
								else{
									io.sendUpdate(game._id);
									res.send("FAIL");
								}
							}
						});
					}
				});//End of Exec
		}, function(req, res, next){

			var game = req.game;
			//If we reach this code, it's the turn of the AI to hit the board1 of the game
			Gameboard.findById(game.board1, function(err, gameboard){

				var shotFound = true;
				while(shotFound){
					pShot = RandomShot();
					shotFound = _.findWhere(gameboard.shots, pShot);
				}

				var isHit = gameboard.isShipHit(pShot); //also adds hits and stuff



				gameboard.save(function(err, gameboard){

					if(gameboard.areAllShipsHit()){
						game.status = Game.schema.status.done;
						game.winner = game.player2; //The computer won the game omg!
					}

					game.turn = req.user._id;
					game.save(function(err, game){
						res.send(req.result);
					});
				});
			});
		});

	function RandomShot(){
		var possible = "abcdefghij";
		var y = Math.floor(Math.random() * 9) + 1;
		var x = possible.charAt(Math.floor(Math.random() * possible.length));
		return {x: x, y: y};
	}
	return router; 
}
