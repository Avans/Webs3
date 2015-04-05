//require modules
var bodyParser = require('body-parser');
var async = require('async');
var passport = require('passport');
var session = require('express-session');
var cookieParser = require('cookie-parser');

//Setup app for testing
var dbConfig = require('../config/database')
var mongoose = require('mongoose');
var connection = mongoose.connect(dbConfig.testUrl);

//Require lcoal thingys
require('../model/gameboard');
require('../model/game');
var gameboard = require('../routes/gameboard');
var game = require('../routes/game');

//Require Gameboard
var Gameboard = mongoose.model('Gameboard');
var Game = mongoose.model('Game');

//init app
var app = require('express')();
app.use(bodyParser.json());
app.use(cookieParser()); // read cookies (needed for auth)
app.use(session({ secret: 'linksonderisthebestleagueplayerintheworld' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

//It's passport time!
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured p

//Route all the routes
app.use('/gameboards', gameboard);
app.use('/games', game);

mongoose.connection.on('error', function(err){
    console.log(err);
});

//include te sub tests
describe('Test that depend on routes', function(){
	
	before('Hook: before test set', function(done) {

		//Async test data
		async.parallel([
			function(cb){ //Function 1, add game

				var game1 = new Gameboard({
					_id: 1,
					ships: [
						{shipId: 1, isVertical: true, length: 2, startCell: {x: 'a', y: 0}},
						{shipId: 2, isVertical: false, length: 2, startCell: {x: 'b', y: 4}}
					]
				}); 
				game1.save(function(){cb();}); 
			},
			function(cb){  //function 2, add game
				var game2 = new Gameboard({
					_id: 2,
					shots: [{x: 'g', y: 6}],
					ships: [
						{shipId: 1, isVertical: true, length: 2, startCell: {x: 'a', y: 0}},
						{shipId: 2, isVertical: false, length: 2, startCell: {x: 'b', y: 4}}
					]
				}); 
				game2.save(function(){cb();}); 
			},

		], function(){done();} );
  	});


	//All the test for .Game
	require('./ZeeSlagTest.Gameboard')(app, Gameboard);

	//All the test for .Game
	require('./ZeeSlagTest.Shot')(app, Gameboard);

	//All the test for .Game
	require('./ZeeSlagTest.Game')(app, Game);

	after('Hook: after test set', function() {
		Gameboard.collection.remove();
	});
});