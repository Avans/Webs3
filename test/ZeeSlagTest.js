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
require('../model/user');

var gameboard = require('../routes/gameboard');
var game = require('../routes/game');
var users = require('../routes/user');

//Require Gameboard
var Gameboard = mongoose.model('Gameboard');
var Game = mongoose.model('Game');
var User = mongoose.model('User');

//init app
var app = require('express')();
app.use(bodyParser.json());
app.use(cookieParser()); // read cookies (needed for auth)
app.use(session({ secret: 'linksonderisthebestleagueplayerintheworld' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

//Route all the routes
app.use('/games', game);
app.use('/', gameboard);
app.use('/users', users);

mongoose.connection.on('error', function(err){
    console.log(err);
});

var gToken = "abc";
var gUserId = "552b73580bab5a9c65610037";

//include te sub tests
describe('Test that depend on routes', function(){

	before('Hook: before test set', function(done) {
		User.collection.remove();
		Gameboard.collection.remove();
		Game.collection.remove();

		async.parallel([
				function(cb){
					var game1 = new Game({
						_id: 1,
						player1: "552675ef7aa073c044cdc274",
						player2: gUserId,
						board1: 4,
						status: Game.schema.status.setup
					});
					game1.save(function(){cb();});
				},
				function(cb){
					var game2 = new Game({_id:2, player1: "552675ef7aa073c044cdc274"});
					game2.save(function(){;cb();});
				},
				function(cb){
					var game3 = new Game({
						_id:3,
						player1: "552675ef7aa073c044cdc274",
						player2: gUserId,
						status: Game.schema.status.setup
					});
					game3.save(function(){cb();});
				},
				function(cb){
					var gameboard = new Gameboard({
							_id: 4,
							ships: [
			 					{shipId: 1, isVertical: true, length: 2, startCell: {x: 'a', y: 0}, his: []},
			 					{shipId: 2, isVertical: false, length: 2, startCell: {x: 'b', y: 4}, hits: []}
			 				],
			 				shots: [
			 					{x: 'g', y: 6}
			 				]
					});
					gameboard.save(function(){cb();});
				},
				function(cb){
					var user = new User({ _id: gUserId, local: {token: gToken, email: "test@mail.com" }});
					user.save(function(err, user){cb();});
				},
				function(cb){
					var enemy = new User({ _id: "552675ef7aa073c044cdc274", local: {token: "def", email: "enemy@mail.com" }});
					enemy.save(function(err, user){cb();});
				},
			], function(){done();});

  	});

	describe('1. All the test for the route Gameboard (ZeeSlagTest.Gameboard)', function(){
		require('./ZeeSlagTest.Gameboard')(app, Game, Gameboard,  gToken);
	});

	describe('2. All the test for the route Shot (ZeeSlagTest.Shot)', function(){
		require('./ZeeSlagTest.Shot')(app, Gameboard, gToken, Game);
	});

	describe('3. All the test for the route Game (ZeeSlagTest.Game)', function(){
		require('./ZeeSlagTest.Game')(app, Game, User, gToken, gUserId);
	});

	describe('4. All the test for the route User (ZeeSlagTest.User)', function(){
		require('./ZeeSlagTest.User')(app, Game, User, gToken, gUserId);
	});



	after('Hook: after test set', function(done) {
		Gameboard.collection.remove();
		Game.collection.remove();
		User.collection.remove();
		done();
	});
});