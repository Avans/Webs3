var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();
var async = require('async');
var mongoose = require('mongoose');

//global api token


module.exports = function(app, Game, User, gToken, gUserId){

	//Kom maar door met ide tests
	describe('On Path /users/my/games', function(){

		before('Hook: before test set', function(done) {

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
					var game2 = new Game({
						_id: 2, 
						player1: gUserId,
						player2: "552675ef7aa073c044cdc274", 
						board1: 4,
						status: Game.schema.status.que
					});
					game2.save(function(){cb();});
				},
				function(cb){
					var game3 = new Game({
						_id: 2, 
						player2: "552675ef7aa073c044cdc274", 
						board1: 4,
						status: Game.schema.status.que
					});
					game3.save(function(){cb();});
				}
			], function(){done();});
		});

		it('should GET return 2 games with the user as player', function(done){

			request(app)
				.get('/users/my/games?token=' + gToken)
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); } 

					res.body.should.have.length(2);

					done();
				});
		});	
	});
}