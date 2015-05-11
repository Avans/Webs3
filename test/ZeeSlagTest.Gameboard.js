var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();

module.exports = function(app, Game, Gameboard, gToken, gUserId){


	describe('On Path /Games/1/Gameboards ', function(){

		it('should POST return success', function(done){

			var gameboard = {_id: 3};

			request(app)
				.post('/games/1/gameboards?token=' + gToken)
       			.send(gameboard)
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal("success");

					Game.findById(1).exec(function(err, game){
						should.exist(game.board2);
						game.status.should.equal(Game.schema.status.started);
						done(null, res);
					});
				});
		});

	});

	describe('On Path /Games/3/Gameboards ', function(){

		it('should POST return success', function(done){

			var gameboard = {_id: 5};

			request(app)
				.post('/games/3/gameboards?token=' + gToken)
       			.send(gameboard)
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal("success");

					Game.findById(3).exec(function(err, game){
						should.not.exist(game.board1);
						game.status.should.equal(Game.schema.status.setup);
						done(null, res);
					});
				});
		});

	});
}