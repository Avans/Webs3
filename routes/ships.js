var express = require('express');
var mongoose = require('mongoose');
var _ = require('underscore');
var router = express.Router();
var Ship = mongoose.model('Ship');
var token = require('../modules/tokenModule');
var async = require('async');

Ship.find(function(err, ships){

	if(ships.length != 5){
		
		Ship.collection.remove();

		async.parallel([
	      function(done){ (new Ship({length: 2, name: "Patrol boat"})).save(done) },
	 	  function(done){ (new Ship({length: 3, name: "Destoryer"})).save(done) },
	 	  function(done){ (new Ship({length: 3, name: "Submarine"})).save(done) },
	 	  function(done){ (new Ship({length: 4, name: "Battleship"})).save(done) },
	 	  function(done){ (new Ship({length: 5, name: "Aircraft carrier"})).save(done) }
	    ], function(){})
	}
});


/** --------  ALl the routes to  /users/:id/games --------------**/
/** Req.user is available **/
/**	All the routes for the gameboard **/
router.route('/')

	.get(token.validate, function(req, res, next){
		Ship.find(function(err, ships){

			res.json(ships);//Send it away!
			
		});
	});

module.exports = router;