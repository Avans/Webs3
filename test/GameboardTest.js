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
				{shipId: 1, isVertical: true, length: 2, startCell: {x: 'a', y: 0}, hits: []},
				{shipId: 2, isVertical: false, length: 2, startCell: {x: 'b', y: 4, hits: []}
			}]
		});

		done();
	});

	it('isShipHit that should return true A0 on ship 1', function(done){
		
		var result = gameboard.isShipHit({x: 'a', y: 0});

		expect(result).to.equal(true);

		done();
	});


	it('isShipHit that should return true A1 on ship 1', function(done){

		var result = gameboard.isShipHit({x: 'a', y: 1});
		expect(result).to.equal(true);

		done();
	});

	it('isShipHit that should return false on ship 1', function(done){

		var result = gameboard.isShipHit({x: 'b', y: 1});
		expect(result).to.equal(false);

		done();
	});

	it('isShipHit that should return true B4 on ship 2', function(done){

		var result = gameboard.isShipHit({x: 'b', y: 4});
		expect(result).to.equal(true);

		done();
	});

	it('isShipHit that should return true C4 on ship 2', function(done){

		var result = gameboard.isShipHit({x: 'c', y: 4});
		expect(result).to.equal(true);
		done();
	});

	it('isShipHit that should return false on ship 2', function(done){

		var result = gameboard.isShipHit({x: 'c', y: 5});
		expect(result).to.equal(false);
		done();
	});

	it('areAllShipsHit that should return true', function(done){

		var gameboard = new Gameboard({
			_id: 1,
			ships: [
				{shipId: 1, isVertical: true, length: 2, startCell: {x: 'a', y: 0}, hits: [{}, {}]}
			]
		});

		var result = gameboard.areAllShipsHit();
		expect(result).to.equal(true);
		done();
	});


	it('areAllShipsHit that should return false', function(done){

		var gameboard = new Gameboard({
			_id: 1,
			ships: [
				{shipId: 1, isVertical: true, length: 3, startCell: {x: 'a', y: 0}, hits: [{}, {}]}
			]
		});

		var result = gameboard.areAllShipsHit();
		expect(result).to.equal(false);
		done();
	});

});