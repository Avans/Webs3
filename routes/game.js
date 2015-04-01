var express = require('express');
var mongoose = require('mongoose');
var _ = require('underscore');

var router = express.Router();

var Gameboard = mongoose.model('Gameboard');

function validateHit(hit)
{
	if(!Object.keys(hit).length) { return "No data in Ajax request"; }
	if(!hit.x) { return "No key 'x' found on JSON object";}
	if(!hit.y) { return "No key 'y' found on JSON object";}
	if(isNaN(hit.y)) { return "Key 'y' could not be converted to a number" ;}
	return undefined;
}


/** --------  ALl the routes to  /game --------------**/
/**	All the routes for the gameboard **/
router.route('/')

	/** -------------    GET /game ------------------**/
	/** All the gameboards that currently are active **/
	.get(function(req, res, next) {
		
		Gameboard
		  	.find()
		 	.exec(function(err, result){
		 		if(err) { res.send("error");}

		 		res.json(result);
		 	});
	})

	/** -------------    POST /games ------------------**/
	/** Add a new empty game board to the collection **/
	.post(function(req, res, next) {

		var gameboard = new Gameboard(req.body);

		gameboard.save(function(err, data){
		if(err) { res.send("error");}

			res.send("success");
		});
	});

/** 
--------  ALl the routes to  /games/:id/shots --------------
All the routes for the gameboard it's hits
Return values: Error, SPLASH, BOOM and fail
Error: Wrong URL or JSON
SPLASH: shot added to the board, but no ship hit
BOOM: shot added to the board and to the hit of the ship 
FAIL: trying to add a shot that already excists
**/
router.route('/:id/shots')
	
	.post(function(req, res, next){

		var pShot = req.body;

		//Validate the parameter Shot
		var error = validateHit(pShot);
		if(error){return res.send(error + ";JSON: " + pShot);}

		//Make sure pShot.x is a number
		pShot.y = parseInt(pShot.y);

		Gameboard
		.findById(req.params.id, function(err, gameboard){

			if(!gameboard) { res.send("No gameboard found with id " + req.params.id)} 
			else
			{
				var shotFound = _.findWhere(gameboard.shots, pShot);
				console.log(pShot);

				//if shots does NOT contain a shot that looks like pShot
				if(!shotFound)
				{
					gameboard.shots.push(pShot); 
					var response = gameboard.isShipHit(pShot)
					gameboard.save(function(err, gameboard){
						console.log(gameboard);
						res.send(response);
					})
				}
				else{res.send("FAIL");}
			}
		});
	});

/** --------  ALl the routes to  /games/:id:/ships --------------**/
/**	All the routes for the gameboard it's ships **/
// router.route('/:id/ship')

// 	.post(function(req, res, next){

// 		var ship = req.body;

// 		Gameboard.findByIdAndUpdate(
// 			req.params.id,
// 			{$push: {ships: ship}},
// 			{safe: true, upsert: true},
// 			function(err, model) {
// 			 	if(err){ res.send('error'); }
// 			   	else{res.send("success");}
// 			}
// 		);
// 	});



module.exports = router;