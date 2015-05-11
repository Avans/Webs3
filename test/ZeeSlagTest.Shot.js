var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();

module.exports = function(app, Gameboard, gToken){


	describe('On Path /games/1/gameboards/4/shots ', function(){

		it('should POST return BOOM and add a hit', function(done){

			request(app)
				.post('/games/1/gameboards/4/shots?token=' + gToken)
				.send({x: 'a', y: 1})
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal("BOOM");

					Gameboard.find(4).exec(function(err, gameboard){
						gameboard.shots.should.have.length(1);
						done(null, res);
					});

					done(null, res);
				});
		});

		it('should POST return SPLASH and add a shot', function(done){

			request(app)
				.post('/games/1/gameboards/4/shots?token=' + gToken)
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


		it('should POST return FAIL and NOT add a shot', function(done){

			request(app)
				.post('/games/1/gameboards/4/shots?token=' + gToken)
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

		it('should POST with wrong ID return ERROR', function(done){

			request(app)
				.post('/games/1/gameboards/18/shots?token=' + gToken)
				.send({x: 'g', y: 6})
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.body.msg).to.equal("Error: Gameboard with id 18 is not part of game with id 1");
					done(null, res);
				});
		});

		it('should POST without data return ERROR', function(done){
			var data = {};

			request(app)
				.post('/games/1/gameboards/4/shots?token=' + gToken)
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
				.post('/games/1/gameboards/4/shots?token=' + gToken)
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
				.post('/games/1/gameboards/4/shots?token=' + gToken)
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
				.post('/games/1/gameboards/4/shots?token=' + gToken)
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