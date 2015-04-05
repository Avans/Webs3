//Test setup
var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();

//Database setup
var mongoose = require('mongoose');
require('../model/gameboard');

//Model setup
var Gameboard = mongoose.model('Gameboard');
var Ship = mongoose.model('Ship');
var gameboard; 

describe('Test that depend on model Gameboard', function(){

	before('hook: before test set', function(done){
		
		gameboard = new Gameboard({
			_id: 1,
			ships: [
				{shipId: 1, isVertical: true, length: 2, startCell: {x: 'a', y: 0}},
				{shipId: 2, isVertical: false, length: 2, startCell: {x: 'b', y: 4}
			}]
		});

		done();
	});

	it('isShipHit that should return BOOM A0 on ship 1', function(done){
		
		var result = gameboard.isShipHit({x: 'a', y: 0});

		expect(result).to.equal('BOOM');

		done();
	});


	it('isShipHit that should return BOOM A1 on ship 1', function(done){

		var result = gameboard.isShipHit({x: 'a', y: 1});
		expect(result).to.equal('BOOM');

		done();
	});

	it('isShipHit that should return SPLASH on ship 1', function(done){

		var result = gameboard.isShipHit({x: 'b', y: 1});
		expect(result).to.equal('SPLASH');

		done();
	});

	it('isShipHit that should return BOOM B4 on ship 2', function(done){

		var result = gameboard.isShipHit({x: 'b', y: 4});
		expect(result).to.equal('BOOM');

		done();
	});

	it('isShipHit that should return BOOM C4 on ship 2', function(done){

		var result = gameboard.isShipHit({x: 'c', y: 4});
		expect(result).to.equal('BOOM');

		done();
	});

	it('isShipHit that should return splash on ship 2', function(done){

		var result = gameboard.isShipHit({x: 'c', y: 5});
		expect(result).to.equal('SPLASH');

		done();
	});

});