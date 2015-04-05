var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();
var async = require('async');

module.exports = function(app, Game){

	//Kom maar door met ide tests
	describe('On Path /games', function(){

		before('hook: before test set', function(done){

			async.parallel([
				function(cb){
					var game1 = new Game({_id: 1, player1: "p1", player2: "p2"});
					game1.save(function(){cb();});
				},
				function(cb){
					var game2 = new Game({_id:2, player1: "p1"});
					game2.save(function(){cb();});			
				},
				function(cb){
					var game3 = new Game({_id:3, player1: "p1", player2: "p2", status: "setup"});
					game3.save(function(){cb();});			
				}
			], function(){done();});

		});

		it('should GET return 1 game with 2 players and status setup', function(done){	

			request(app)
				.get('/games')
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					res.body.player1.should.equal("p1");
					res.body.player2.should.equal("currentUser");
					expect(res.body.status).to.equal("setup");

					done(null, res);
				});
		});

		it('should GET return 1 game with 1 players and status que', function(done){	

			request(app)
				.get('/games')
				.expect(200)
				.end(function(err, res){

					if(err){ return done(err); }

					expect(res.body.player1).to.be.equal("currentUser");
					expect(res.body.player2).to.be.an('undefined');
					expect(res.body.status).to.equal('que');

					done(null, res);
				});
			
		});

		it('should POST return success with status setup and board1 filled', function(done){	

			var gameboard = {
				ships: 	[{shipId: 1, isVertical: true, length: 2, startCell: {x: 'a', y: 0}}],
			};

			request(app)
				.post('/games/3/gameboards')
				.send(gameboard)
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					//TODO assert
					expect(res.text).to.equal('success');

					Game.findById(3)
						.exec(function(err, game){
							expect(game.status).to.eq
							.ual('started');
							expect(game.board1).to.not.be.an('undefined'); 
							expect(game.board2).to.not.be.an('undefined'); 
							done(null, res);
						});
				});
		});

		after('hook: after test set', function(done){

			Game.collection.remove();
			done();
		});
	});
}
