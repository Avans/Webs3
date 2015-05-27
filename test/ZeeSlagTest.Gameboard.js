var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();

module.exports = function(app, Game, Gameboard, gToken, gUserId){

	var ships_array = [
				{name: 'a', isVertical: true, length: 2, startCell: {x: 'f', y: 1}},
				{name: 'b', isVertical: true, length: 3, startCell: {x: 'g', y: 2}},
				{name: 'c', isVertical: false, length: 3, startCell: {x: 'a', y: 9}},
				{name: 'd', isVertical: false, length: 5, startCell: {x: 'a', y: 1}},
				{name: 'e', isVertical: false, length: 4, startCell: {x: 'a', y: 10}},
			];

	describe('On Path /Games/1/Gameboards ', function(){

		it('should not accept empty object', function(done) {

			var post = {};

			request(app)
				.post('/games/1/gameboards?token=' + gToken)
				.send(post)
				.end(function(err, res) {
					expect(res.text).to.equal('{"msg":"Error: JSON should include \'ships\' property"}');
					done(null, res);
				});
		});

		it('should POST return success', function(done){

			var post = {'ships': ships_array};

			request(app)
				.post('/games/1/gameboards?token=' + gToken)
				.send(post)
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal('{"msg":"success","status":"started"}');

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

			var post = {'ships': ships_array};

			request(app)
				.post('/games/3/gameboards?token=' + gToken)
       			.send(post)
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					expect(res.text).to.equal('{"msg":"success","status":"setup"}');

					Game.findById(3).exec(function(err, game){
						should.not.exist(game.board1);
						game.status.should.equal(Game.schema.status.setup);
						done(null, res);
					});
				});
		});

	});
}