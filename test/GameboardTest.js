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
var defaultShips;

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

	/** All test that are related to the validation of the ships on the gameboard **/
	describe('All test for gameboard.isValid', function(){

		beforeEach(function(done){

			defaultShips = 	[
				{name: 'a', isVertical: true, length: 2, startCell: {x: 'f', y: 1}, hits: []},
				{name: 'b', isVertical: true, length: 3, startCell: {x: 'g', y: 2}, hits: []},
				{name: 'c', isVertical: false, length: 3, startCell: {x: 'a', y: 9}, hits: []},
				{name: 'e', isVertical: false, length: 4, startCell: {x: 'a', y: 10}, hits: []},
			];

			done();
		});

		it('isValid returns 1 error, startcell x out of bounds', function(done){

			defaultShips.push({name: 'd', isVertical: false, length: 5, startCell: {x: 'l', y: 1}});

			var gameboard = new Gameboard({ships: defaultShips});

			var result = gameboard.isValid();
			expect(result.length).to.equal(1);
			expect(result[0]).to.equal("The ship 'd' is horizontally out of bounds (x)");

			done();
		});


		it('isValid returns 1 error, startcell y out of bounds (right)', function(done){

			defaultShips.push({name: 'd', isVertical: false, length: 5, startCell: {x: 'b', y: 11}});

			var gameboard = new Gameboard({ships: defaultShips});

			var result = gameboard.isValid();
			expect(result.length).to.equal(1);
			expect(result[0]).to.equal("The ship 'd' is verticly out of bounds (y)");

			done();
		});

		it('isValid returns 1 eerror, startcell y out of bounds (left)', function(done){

			defaultShips.push({name: 'd', isVertical: false, length: 5, startCell: {x: 'a', y: 0}});

			var gameboard = new Gameboard({ships: defaultShips});

			var result = gameboard.isValid();
			expect(result.length).to.equal(1);
			expect(result[0]).to.equal("The ship 'd' is verticly out of bounds (y)");

			done();
		});

		it('isValid returns 0 errors, all startcells in bounds', function(done){

			defaultShips.push({name: 'd', isVertical: false, length: 5, startCell: {x: 'a', y: 1}});

			var gameboard = new Gameboard({ships: defaultShips});

			var result = gameboard.isValid();
			expect(result.length).to.equal(0);

			done();


		});

		it('isValid returns 1 error, not 4 ships', function(done){

			var gameboard = new Gameboard({
				_id: 1,
				ships: [
					{shipId: 1, isVertical: true, length: 3, startCell: {x: 'a', y: 1}, hits: [{}, {}]},
				]
			});

			var result = gameboard.isValid();
			expect(result.length).to.equal(1);
			expect(result[0]).to.equal("The collection of ships does not contain 5 ships.");
			done();
		});

		it('isValid returns 1 errors, 2 ships overlap', function(done){

			defaultShips.push({name: 'd', isVertical: false, length: 5, startCell: {x: 'f', y: 3}});

			var gameboard = new Gameboard({ships: defaultShips});

			var result = gameboard.isValid();
			expect(result.length).to.equal(1);
			expect(result[0]).to.equal("The ship 'd' has an overlap with another ship")
			done();
		});

		it('isValid returns 1 errors, ship collection is not correct', function(done){

			defaultShips.push({name: 'd', isVertical: false, length: 4, startCell: {x: 'f', y: 8}});

			var gameboard = new Gameboard({ships: defaultShips});

			var result = gameboard.isValid();
			expect(result.length).to.equal(1);
			expect(result[0]).to.equal("The ship 'd' has an incorrect size of 4");
			done();
		});

		it('isValid returns 1 error on missing x coordinate', function(done) {
			defaultShips.push({name: 'd', isVertical: false, length: 5});

			var gameboard = new Gameboard({ships: defaultShips});

			var result = gameboard.isValid();
			expect(result.length).to.equal(1);
			expect(result[0]).to.equal("The ship 'd' is missing x coordinate");
			done();
		});

		it('isValid returns 1 error on missing y coordinate', function(done){

			defaultShips.push({name: 'd', isVertical: false, length: 5, startCell: {x: 'a'}});

			var gameboard = new Gameboard({ships: defaultShips});

			var result = gameboard.isValid();
			expect(result.length).to.equal(1);
			expect(result[0]).to.equal("The ship 'd' is missing y coordinate");
			done();
		});

		it('isValid returns 1 error on missing length', function(done){

			defaultShips.push({name: 'd', isVertical: false, startCell: {x: 'a', y: 1}});

			var gameboard = new Gameboard({ships: defaultShips});

			var result = gameboard.isValid();
			expect(result.length).to.equal(1);
			expect(result[0]).to.equal("Ship 'd' is missing length");
			done();
		});

		it('isValid returns 1 error on missing name', function(done){

			defaultShips.push({isVertical: false, length: 5, startCell: {x: 'a', y: 1}});

			var gameboard = new Gameboard({ships: defaultShips});

			var result = gameboard.isValid();
			expect(result.length).to.equal(1);
			expect(result[0]).to.equal("Ship of length 5 is missing a name");
			done();
		});
	});
});