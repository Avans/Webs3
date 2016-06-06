//Test setup
var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();

//Model setup
 var randomShot = require('../modules/randomShot');


describe('Test that depend on module randomShot', function(){
    
    it('Shoud return x = a and y = 1',function(){
       
       randomShot.random = function() { return 0; }
       
       var shot = randomShot.next();
       
       expect(shot.x).to.equal('a');
       expect(shot.y).to.equal(1);
        
    });
    
    it('Shoud return x = j and y = 10',function(){
       
       randomShot.random = function() { return 0.99; }
       
       var shot = randomShot.next();
       
       expect(shot.x).to.equal('j');
       expect(shot.y).to.equal(10);
        
    });
});