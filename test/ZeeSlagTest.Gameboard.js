var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();

module.exports = function(app, Gameboard){
	
	describe('On Path /Gameboard ', function(){

		it('should GET return a resource', function(done){

			request(app)
				.get('/gameboards')
				.expect(200)
				.end(function(err, res){
					if(err){ return done(err); }

					res.body.should.have.length(2);
					done(null, res);
				});
		});

		it('should POST return success', function(done){

			var gameboard = {_id: 3};

			request(app)
				.post('/gameboards')
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
}