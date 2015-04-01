var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var shipSchema = new Schema({
	_id: Number, 
	name: String,
	length: Number
});

var gameSchema = new Schema({
  playe1: String, 
  player2: String, 
  board1: {  type: Number, ref: 'Gameboard' },
  board2: {  type: Number, ref: 'Gameboard' }
});

var gameboardSchema = new Schema({
  _id: Number,
  hits: {x: String, y: Number},
  ships: [{
  	isVertical: Boolean, //1 = vertical, 0 = horizontal 
  	shipId: { type: Number, ref: 'Ship' },
  	length: Number,
	 startCell: {x: String, y: Number}
  }],
});

gameboardSchema.methods.isShipHit = function(hit) {
	//Check every ship on the board

	var result = 'SPLASH';

  	this.ships.forEach(function(ship){

  		var x = ship.startCell.x;
  		var y = ship.startCell.y;

  		//check all of the cells that the ship is on
  		for(var index =0; index < ship.length; index++){

  			if(x == hit.x & y == hit.y){
  				result = 'BOOM';
  			}

  			//Increase X or Y depending on Orientation
  			if(ship.isVertical) //If vertical, increase Y 
  			{ 
  				y++;
  			}
  			else //If horizontal, increase X
  			{
  				x = String.fromCharCode(x.charCodeAt(0) + 1);
  			}
  		}
  	});

  	//If we reach this statement, the ship is not hit. 
  	return result;
}

mongoose.model('Game', gameSchema);
mongoose.model('Ship', shipSchema);
mongoose.model('Gameboard', gameboardSchema);