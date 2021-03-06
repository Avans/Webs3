var express = require('express');
var mongoose = require('mongoose');
var _ = require('underscore');

var router = express.Router();
var Gameboard = mongoose.model('Gameboard');
var Game = mongoose.model('Game');
var token = require('../modules/tokenModule');
var io = require('../sockets/socket')();

var RandomShot = require('../modules/randomShot');


function validateHit(hit) {
	if(!Object.keys(hit).length) {
		return "No data in Ajax request";
	}
	if(!hit.x) {
		return "No key 'x' found on JSON object";
	}
	if(!hit.y) {
		return "No key 'y' found on JSON object";
	}
	if(isNaN(hit.y)) {
		return "Key 'y' could not be converted to a number";
	}
	return undefined;
}

/** --------  ALl the routes to  /games/:id/gameboards --------------**/
/** Req.user is available **/
/**    All the routes for the gameboard **/
router.route('/games/:id/gameboards')

/** -------------    POST /games/:gameId/gameboards ------------------**/
.post(token.validate, function(req, res, next) {

	var gameId = req.params.id;

	if(!req.body.ships) {
		return res.json({ msg: "Error: JSON should include 'ships' property" });
	}

	Game.findById(gameId)
		.exec(function(err, game) {

			//Check if the game excists
			if(!game) {
				return res.json({ msg: "Error: No game found with id " + gameId });
			}

			//Check if the game is in the right state for setting up gameboards
			if(game && game.status === Game.schema.status.setup) {
				//Check if a user already posted a gameboard
				game.getMyGameboard(req.user._id, function(err, gameboard) {
					if(err) {
						res.json(err)
					}
					if(gameboard) {
						res.json({ msg: "Error: You already have a gameboard in this game'.", status: game.status })
					} else {

						//add a new gameboard to the game
						gameboard = new Gameboard();
						var ships = req.body.ships;

						//Voor de zekerheid nemen we alleen de velden over van ship die nodig zijn
						for(var i = 0; i < ships.length; i++) {
							var ship = {
								startCell: ships[i].startCell,
								name: ships[i].name,
								isVertical: ships[i].isVertical,
								length: ships[i].length
							};
							gameboard.ships.push(ship);
						}

						var validationErrors = gameboard.isValid();

						if(validationErrors.length != 0) {
							return res.json({
								msg: "Error: The gameboard contains validation errors",
								validationErrors: validationErrors
							});
						}

						gameboard.save(function(err, gameboard) {

							//check for errors
							if(err) {
								res.json(err);
							} else {
								//Check if enemy is AI
								if(game.isAI) {
									var gameboardAI = new Gameboard();
									gameboardAI.ships = gameboard.ships;
									gameboardAI.save(function(err, gameboardAI) {
										SetGameboardsToGame(req, res, game, gameboard, gameboardAI);
									});
								} else {
									SetGameboardsToGame(req, res, game, gameboard);
									io.sendUpdate(game._id, game.status);
								}
							}
						});
					}
				});
			} else {
				res.send("Het is niet mogelijk om een gameboard te submitten naar een game met de status " + game.status);
			}
	});
});

function SetGameboardsToGame(req, res, game, gameboard, gameboardAI) {
	//user 1 or user 2?
	if(game.player1 == req.user._id) {
		game.board1 = gameboard._id;
	} else {
		game.board2 = gameboard._id;
	}

	if(gameboardAI) {
		game.board2 = gameboardAI._id;
	}

	//Are both gameboards posted? Then we can start
	if(game.board1 && game.board2) {
		game.start();
	}

	//Save all the games!!
	game.save(function(err, game) {
		if(err) {
			res.json(err);
		} else {
			res.json({ msg: "success", status: game.status });
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
 FAIL: trying to add a shot that already exists
 **/
router.route('/games/:id/shots')

.post(token.validate, function(req, res, next) {

	var gameId = req.params.id;

	Game.findById(gameId)
	.exec(function(err, game) {

		req.game = game;

		//Check if the game excists
		if(!game) {
			return res.json({ msg: "Error: No game found with id " + gameId });
		}

		//check if user is part of game
		if(!game.containsPlayer(req.user._id)) {
			return res.json({ msg: "Error: You are not a player in this game.", gameId: game._id });
		}

		if(game.status != Game.schema.status.started) {
			return res.json({ msg: "Error: This game does not have the right status.", gameId: game._id });
		}

		if(game.turn != req.user._id) {
			return res.json({ msg: "Error: It is not the your turn to add a shot", gameId: game._id });
		}


		//Check if the game is in the right state for adding shots
		if(game.status === Game.schema.status.started) {

			game.getEnemyGameboard(req.user._id, function(err, gameboard) {

				var pShot = req.body;

				//Validate the parameter Shot
				var error = validateHit(pShot);
				if(error) {
					return res.send(error + ";JSON: " + pShot);
				}

				//Make sure pShot.x is a number
				pShot.y = parseInt(pShot.y);

				var shotFound = _.findWhere(gameboard.shots, pShot);
				var response = "FAIL";

				//if shots does NOT contain a shot that looks like pShot
				if(!shotFound) {
					response = "SPLASH";

					var isHit = gameboard.isShipHit(pShot); //also adds hits and stuff
					if(isHit) {
						//If the ship is hit, we need to check of the game is over
						if(gameboard.areAllShipsHit()) {
							game.status = Game.schema.status.done;
							game.winner = req.user._id;
							response = "WINNER";
							io.sendUpdate(game._id, Game.schema.status.done);
						} else {
							response = "BOOM";
						}
					}

					// Send shot over socket to notify the user of the result
					io.sendShot(game._id, game.turn, { x: pShot.x, y: pShot.y }, response);

					gameboard.save(function(err, gameboard) {
						game.turn = (req.user._id == game.player1) ? game.player2 : game.player1;
						io.sendTurnUpdate(game._id, game.turn);

						game.save(function(err, game) {
							if(game.isAI) {
								req.result = response;
								next();
							} else {
								res.send(response);
							}
						});

					});
				} else {
					// Send shot over socket to notify the user of the result
					io.sendShot(game._id, req.user._id, { x: pShot.x, y: pShot.y }, response);
					if(game.isAI) {
						req.result = response;
						next();
					} else {
						res.send(response);
					}
				}
			});
		}
	});//End of Exec
}, function(req, res, next) {

	var game = req.game;
	//If we reach this code, it's the turn of the AI to hit the board1 of the game
	Gameboard.findById(game.board1, function(err, gameboard) {

		var shotFound = true;
		var valid = false;
		var pShot;
		while(shotFound && !valid) {
			pShot = RandomShot.next();
			shotFound = _.findWhere(gameboard.shots, pShot);
			valid = validateHit(pShot);
		}

		var isHit = gameboard.isShipHit(pShot); //also adds hits and stuff
		var response = "SPLASH";

		gameboard.save(function(err, gameboard) {

			if(gameboard.areAllShipsHit()) {
				game.status = Game.schema.status.done;
				game.winner = game.player2; //The computer won the game omg!
				response = "WINNER";
				io.sendUpdate(game._id, Game.schema.status.done);
			} else if(isHit) {
				response = "BOOM";
			}

			// Send shot over socket to notify the user of the result
			io.sendShot(game._id, game.player2, { x: pShot.x, y: pShot.y }, response);

			game.turn = req.user._id;
			io.sendTurnUpdate(game._id, game.turn);

			game.save(function(err, game) {
				res.send(req.result);
			});
		});
	});
});


module.exports = router;


