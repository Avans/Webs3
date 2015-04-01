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
app.use('/games', game);

mongoose.connection.on('error', function(err){
    console.log(err);
});

describe('Zeeslag /games routes', function(){
	
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

	describe('The resource "/games" CRUD function ', function(){

		it('GET should return a resource', function(done){

			request(app)
				.get('/games')
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
				.post('/games')
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

	describe('The "/games/:id/shots" CRUD function ', function(){

		it('POST should return BOOM and add a hit', function(done){

			request(app)
				.post('/games/1/shots')
				.send({x: 'a', y: 1})
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal("BOOM");

					Gameboard.find(1).exec(function(err, gameboard){
						gameboard.shots.should.have.length(1);
						done(null, res);
					});

					done(null, res);
				});
		});

		it('POST should return SPLASH and add a shot', function(done){

			request(app)
				.post('/games/1/shots')
				.send({x: 'c', y: 3})
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal("SPLASH");

					Gameboard.find(1).exec(function(err, gameboard){
						gameboard.shots.should.have.length(1);
						done(null, res);
					});

					done(null, res);
				});
		});


		it('POST should return FAIL and NOT add a shot', function(done){

			request(app)
				.post('/games/2/shots')
				.send({x: 'g', y: 6})
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal("FAIL");

					Gameboard.find(1).exec(function(err, gameboard){
						gameboard.shots.should.have.length(1);
						done(null, res);
					});

					done(null, res);
				});
		});

		it('POST with wrong ID should return ERROR', function(done){

			request(app)
				.post('/games/18/shots')
				.send({x: 'g', y: 6})
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal("No gameboard found with id 18");
					done(null, res);
				});
		});

		it('POST without data should return ERROR', function(done){
			var data = {};

			request(app)
				.post('/games/2/shots')
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal("No data in Ajax request;JSON: " + data);
					done(null, res);
				});
		});


		it('POST without Y should return ERROR', function(done){

			var data = {x: 'a'};
			request(app)
				.post('/games/2/shots')
				.send(data)
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal("No key 'y' found on JSON object;JSON: " + data);
					done(null, res);
				});
		});


		it('POST without X should return ERROR', function(done){
			var data = {y: '2'};
			request(app)
				.post('/games/2/shots')
				.send(data)
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal("No key 'x' found on JSON object;JSON: " + data);
					done(null, res);
				});
		});


		it('POST with unparsable X should return ERROR', function(done){

			var data = { x: 'a', y : 'c'};

			request(app)
				.post('/games/2/shots')
				.send(data)
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal("Key 'y' could not be converted to a number;JSON: " + data);
					done(null, res);
				});
		});
	});

	describe('The "/games/:id/ships" CRUD function ', function(){
		
	});


	after('Hook: after test set', function() {
		Gameboard.collection.remove();
	});
});