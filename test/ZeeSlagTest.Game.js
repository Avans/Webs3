var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();
var async = require('async');
var mongoose = require('mongoose');

//global api token


module.exports = function(app, Game, User, gToken, gUserId){

	//Kom maar door met ide tests
	describe('On Path /games', function(){

		it('should GET return 1 game with 2 players and status setup', function(done){

			request(app)
				.get('/games?token=' + gToken)
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					res.body.player1.should.equal("552675ef7aa073c044cdc274");
					res.body.player2.should.equal(gUserId);
					expect(res.body.status).to.equal("setup");

					done(null, res);
				});
		});

		it('should GET return 1 game with 1 players and status que', function(done){

			request(app)
				.get('/games?token=' + gToken)
				.expect(200)
				.end(function(err, res){

					if(err){ return done(err); }

					expect(res.body.player1).to.be.equal(gUserId);
					expect(res.body.player2).to.be.an('undefined');
					expect(res.body.status).to.equal('que');

					done(null, res);
				});
		});
	});

	describe('On Path /games:/1', function(){

		it('should GET return 1 game with filled gameboards', function(done){

			request(app)
				.get('/games/1?token=' + gToken)
				.expect(200)
				.end(function(err, res){

					if(err){ return done(err); }

					expect(res.body.myGameboard).to.not.be.an('undefined');
					expect(res.body.enemyGameboard).to.not.be.an('undefined');
					expect(res.body.enemyGameboard.ships).to.be.an('undefined');

					done(null, res);
				});
		});
	});

}
