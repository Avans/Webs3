var mongoose = require('mongoose');
var Schema = mongoose.Schema;
autoIncrement = require('mongoose-auto-increment');

var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);

  //autoIncrement.initialize(connection); 

  var shipSchema = new Schema({
    name: String,
    length: Number
  });

  shipSchema.plugin(autoIncrement.plugin, 'Ship');


  var gameboardSchema = new Schema({
    shots: [{x: String, y: Number}],
    ships: [{
      isVertical: Boolean, //1 = vertical, 0 = horizontal 
      shipId: { type: Number, ref: 'Ship' },
      length: Number,
      startCell: {x: String, y: Number},
      hits: [{x: String, y: Number}]
    }],
  });

  gameboardSchema.plugin(autoIncrement.plugin, 'Gameboard');

  gameboardSchema.methods.isShipHit = function(shot) {

      var result = 'SPLASH';
      
      //Check every ship on the board
      this.ships.forEach(function(ship){

        var x = ship.startCell.x;
        var y = ship.startCell.y;

        //check all of the cells that the ship is on
        for(var index =0; index < ship.length; index++){

          if(x == shot.x & y == shot.y){
            ship.hits.push(shot);
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

  mongoose.model('Ship', shipSchema);
  mongoose.model('Gameboard', gameboardSchema);
