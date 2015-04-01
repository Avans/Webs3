var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();
var async = require('async');
var bodyParser = require('body-parser');

var dbConfig = require('../config/database')
var mongoose = require('mongoose');
mongoose.connect(dbConfig.testUrl);

var models = require('../model/gameboard');
var Gameboard = mongoose.model('Gameboard');

var app = require('express')();
app.use(bodyParser.json());
var game = require('../routes/game');
app.use('/game', game);

mongoose.connection.on('error', function(err){
    console.log(err);
});

describe('Zeeslag /game routes', function(){
	
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
					ships: [
						{shipId: 1, isVertical: true, length: 2, startCell: {x: 'a', y: 0}},
						{shipId: 2, isVertical: false, length: 2, startCell: {x: 'b', y: 4}}
					]
				}); 
				game2.save(function(){cb();}); 
			},

		], function(){done();} );
  	});

	describe('The resource "/game" CRUD function ', function(){

		it('GET should return a resource', function(done){

			request(app)
				.get('/game')
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					res.body.should.have.length(2);
					done(null, res);
				});
		});

		it('POST should return success', function(done){

			var gameboard = {_id: 3};

			request(app)
				.post('/game')
       			.send(gameboard)
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal("success");

					Gameboard.find().exec(function(err, result){
						result.should.have.length(3);
						done(null, res);
					});
				});
		});
	});

	describe('The "/game/:id/hit" CRUD function ', function(){

		it('POST should return BOOM and add a hit', function(done){

			request(app)
				.post('/game/1/hit')
				.send({x: 'a', y: 1})
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal("BOOM");

					Gameboard.find(1).exec(function(err, gameboard){
						gameboard.hits.should.have.length(1);
						done(null, res);
					});

					
					done(null, res);
				});
		});

		it('POST should return SPLASH and add a hit', function(done){

			request(app)
				.post('/game/1/hit')
				.send({x: 'c', y: 3})
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal("SPLASH");

					Gameboard.find(1).exec(function(err, gameboard){
						gameboard.hits.should.have.length(1);
						done(null, res);
					});

					done(null, res);
				});
		});
	});

	describe('The "/game/:id/ship" CRUD function ', function(){
		
	});


	after('Hook: after test set', function() {
		Gameboard.collection.remove();
	});
});