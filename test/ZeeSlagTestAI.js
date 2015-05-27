//require modules
var bodyParser = require('body-parser');
var async = require('async');
var passport = require('passport');
var session = require('express-session');
var cookieParser = require('cookie-parser');

var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();

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

var testData = {
	gameId: null,
	gToken : "abc",
	gUserId : "552b73580bab5a9c65610037",
	gameboardPlayer : { ships: [
		{name: 'a', isVertical: true, length: 2, startCell: {x: 'f', y: 1}},
		{name: 'b', isVertical: true, length: 3, startCell: {x: 'g', y: 2}},
		{name: 'c', isVertical: false, length: 3, startCell: {x: 'a', y: 9}},
		{name: 'd', isVertical: false, length: 5, startCell: {x: 'a', y: 1}},
		{name: 'e', isVertical: false, length: 4, startCell: {x: 'a', y: 10}},
	], shots: [] },
	GetGameAndBoards : function(callback){

		Game.findById(testData.gameId)
		.exec(function(err, game){

			var board1;
			var board2;

			async.parallel([
				function(cb){
					Gameboard.findById(game.board1, function(err, gameboard){
						board1 = gameboard;
						cb();
					});
				},
				function(cb){
					Gameboard.findById(game.board2, function(err, gameboard){
						board2 = gameboard;
						cb();
					});
				}
				], function(){
					callback(game, board1, board2);
				});
		});
	}
};//End of Test Data


describe('Test that depend on AI', function(){

	/** Init the test data **/
	before('Hook: before test set', function(done) {

		var user = new User({ _id: testData.gUserId, local: {token: testData.gToken, email: "test@mail.com" }});
		user.save(function(err, user){done();});

	});

	/** This is where te tests start
	This test set has focus on all the aspects of the AI in the routes.
	It will test 3 routes, games, gameboards and shots'
	**/
	describe('All the Test for requesting a game against an AI', function(){

		it('games/ai should return a game vs an AI computer', function(done){
			var data = {};

			Game.find(function(err, games){

				expect(games.length).to.eql(0);

				request(app)
				.get('/games/ai?token=' + testData.gToken)
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					Game.find(function(err, games){

						expect(games.length).to.eql(1);

						var game = res.body;
						expect(game.isAI).to.be.true;
						expect(game.player1).to.eql("552b73580bab5a9c65610037");
						expect(game.player2).not.to.be.undefined;
						expect(game.board1).to.be.undefined;
						expect(game.board2).to.be.undefined;
						expect(game.status).to.eql("setup");

						//Setup the Game Id for the next tests
						testData.gameId = game._id;

						done(null, res);
					});
				});
			});
		});

	});

	describe('All the Test for posting a gameboard against an AI', function(){

		it('posting a gameboard should add 2 gameboards', function(done){


			request(app)
			.post('/games/' + 	testData.gameId +'/gameboards?token=' + testData.gToken)
			.send(testData.gameboardPlayer)
			.expect(200)
			.end(function(err, res){
				if(err){ return done(err); }

				expect(res.body.msg).to.eql("success");
				expect(res.body.status).to.eql("started");

				testData.GetGameAndBoards(function(game, board1, board2){

					//Assert
					expect(board1.ships.length).to.equal(5);
					expect(board2.ships.length).to.equal(5);

					done();
				});
			});
		});
	});

	describe('All the Test for shooting against an AI', function(){

		it('posting a SHOT should add a shot to both gameboards', function(done){

			var shot = {x: 'a', y: 1};

			request(app)
			.post('/games/' + testData.gameId + '/shots?token=' + testData.gToken)
			.send(shot)
			.expect(200)
			.end(function(err, res){
				if(err){ return done(err); }


				testData.GetGameAndBoards(function(game, board1, board2){

					//Assert
					expect(board1.shots.length).to.equal(1);
					expect(board2.shots.length).to.equal(1);
					expect(board2.shots[0].x).to.eql(shot.x);
					expect(board2.shots[0].y).to.eql(shot.y);
					expect(game.turn.toString()).to.equal('552b73580bab5a9c65610037');
					done();

				});
			});
		});
	});

	after('Hook: after test set', function(done) {
		 //Gameboard.collection.remove();
		 //Game.collection.remove();
		 //User.collection.remove();
		 done();
	});
});