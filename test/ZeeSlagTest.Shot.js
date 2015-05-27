var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();


module.exports = function(app, Gameboard, gToken, Game){


	describe('On Path /games/1/shots ', function(){

		beforeEach(function(done) {
	        Game.findById(1, function(err, game){
	        	game.turn = "552b73580bab5a9c65610037";
	        	game.save(function(err, game){
	        		done();
	        	});
	        });
	    });

		it('should POST return BOOM and add a hit', function(done){

			request(app)
				.post('/games/1/shots?token=' + gToken)
				.send({x: 'a', y: 1})
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal("BOOM");

					Gameboard.findById(4).exec(function(err, gameboard){
						gameboard.shots.should.have.length(2);
						done(null, res);
					});
				});
		});

		it('should POST return SPLASH and add a shot', function(done){

			request(app)
				.post('/games/1/shots?token=' + gToken)
				.send({x: 'c', y: 3})
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal("SPLASH");

					Gameboard.findById(4).exec(function(err, gameboard){
						gameboard.shots.should.have.length(3);
						done(null, res);
					});
				});
		});


		it('should POST return FAIL and NOT add a shot', function(done){

			request(app)
				.post('/games/1/shots?token=' + gToken)
				.send({x: 'g', y: 6})
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal("FAIL");

					Gameboard.findById(4).exec(function(err, gameboard){
						gameboard.shots.should.have.length(3);
						done(null, res);
					});
				});
		});


		it('should POST without data return ERROR', function(done){
			var data = {};

			request(app)
				.post('/games/1/shots?token=' + gToken)
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal("No data in Ajax request;JSON: " + data);
					done(null, res);
				});
		});


		it('should POST without Y return ERROR', function(done){

			var data = {x: 'a'};
			request(app)
				.post('/games/1/shots?token=' + gToken)
				.send(data)
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal("No key 'y' found on JSON object;JSON: " + data);
					done(null, res);
				});
		});


		it('should POST without X return ERROR', function(done){
			var data = {y: '2'};
			request(app)
				.post('/games/1/shots?token=' + gToken)
				.send(data)
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal("No key 'x' found on JSON object;JSON: " + data);
					done(null, res);
				});
		});


		it('should POST with unparsable X return ERROR', function(done){

			var data = { x: 'a', y : 'c'};

			request(app)
				.post('/games/1/shots?token=' + gToken)
				.send(data)
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal("Key 'y' could not be converted to a number;JSON: " + data);
					done(null, res);
				});
		});
	});
}