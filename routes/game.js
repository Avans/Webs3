var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var Gameboard = mongoose.model('Gameboard');

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

	/** -------------    POST /game ------------------**/
	/** Add a new empty game board to the collection **/
	.post(function(req, res, next) {

		var gameboard = new Gameboard(req.body);

		gameboard.save(function(err, data){
		if(err) { res.send("error");}

			res.send("success");
		});
	});

/** --------  ALl the routes to  /game/:id/hit --------------**/
/**	All the routes for the gameboard it's hits **/
router.route('/:id/hit')
	
	.post(function(req, res, next){

		var hit = req.body;

		Gameboard.findByIdAndUpdate(
			req.params.id,
			{$push: {hits: hit}},
			{safe: true, upsert: true},
			function(err, model) {

				console.log(hit);

			 	if(err){ res.send('error'); }
			   	else res.send(model.isShipHit(hit));
			}
		);
	});

/** --------  ALl the routes to  /game/:id:/ship --------------**/
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