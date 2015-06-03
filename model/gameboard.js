var mongoose = require('mongoose');
var Schema = mongoose.Schema;
autoIncrement = require('mongoose-auto-increment');
var _ = require('underscore');

var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);

  //autoIncrement.initialize(connection);

  var shipSchema = new Schema({
    name: String,
    length: Number
  });

  shipSchema.plugin(autoIncrement.plugin, 'Ship');


  var gameboardSchema = new Schema({
    shots: [{x: String, y: Number, isHit: Boolean}],
    ships: [{
      isVertical: Boolean, //1 = vertical, 0 = horizontal
      name:  String,
      length: Number,
      startCell: {x: String, y: Number},
      hits: [{x: String, y: Number}]
    }],
  });

  gameboardSchema.plugin(autoIncrement.plugin, 'Gameboard');

  gameboardSchema.methods.areAllShipsHit = function()
  {
      var itsOver = true;

      for(var index =0; index < this.ships.length; index++){
          if((this.ships[index].hits.length < this.ships[index].length)){
            itsOver = false;
            index = this.ships.length;
          }
      };

      return itsOver;
  }

  gameboardSchema.methods.isShipHit = function(shot) {

      var result = false;

      //Check every ship on the board
      this.ships.forEach(function(ship){

        var x = ship.startCell.x;
        var y = ship.startCell.y;

        //check all of the cells that the ship is on
        for(var index =0; index < ship.length; index++){

          if(x == shot.x & y == shot.y){
              ship.hits.push(shot);
              shot.isHit = true;
              result = true;
              index = ship.length; //we are done here
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

      this.shots.push(shot);
      return result;
  }

  /**
  A validation method for the ships on the gameboard.
  Return: A list of validation errors if the gameboard is not valid
  parameters: none
  **/

  gameboardSchema.methods.isValid = function() {

    //the final result
    var shipValidations = [];

    var xAxis = ['a','b','c','d','e','f','g','h', 'i', 'j'];
    var yAxis = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var coveredCells = [];
    var shipLengths = [2, 3, 3, 4, 5 ];

    if(this.ships.length != 5){
      shipValidations.push("The collection of ships does not contain 5 ships.")
      return shipValidations;
    }


    var isValid = true;
    for(var index = 0; index < 5; index++){

        var ship = this.ships[index];

        if(ship.startCell.x === undefined) {
          shipValidations.push("The ship '" + ship.name + "' is missing x coordinate");
          continue;
        }

        if(ship.startCell.y === undefined) {
          shipValidations.push("The ship '" + ship.name + "' is missing y coordinate");
          continue;
        }

        if(ship.length === undefined) {
          shipValidations.push("Ship '" + ship.name + "' is missing length");
          continue;
        }

        if(ship.name === undefined) {
          shipValidations.push("Ship of length " + ship.length + " is missing a name");
          continue;
        }

        var coord = {x: ship.startCell.x, y: ship.startCell.y};
        var shipIsValid = true;

        //Make sure this ship has a correct Length
        var slIndex = shipLengths.indexOf(ship.length);
        if (slIndex > -1) { shipLengths.splice(slIndex, 1); }  //Remove the ship from the list
        else{
          shipValidations.push("The ship '" + ship.name + "' has an incorrect size of " + ship.length);
        }

        for(var shipIndex = 0; shipIndex < ship.length; shipIndex++){

          //We only wanna check for more validation errors if the ship is still valid
          if(shipIsValid){
             //Check if X is in bounds
            if(!_.contains(xAxis, coord.x)){
              shipIsValid = false;
              shipValidations.push("The ship '" + ship.name + "' is horizontally out of bounds (x)")
            }

            //check if Y is in bounds
            if(!_.contains(yAxis, coord.y)){
              shipIsValid = false; //We only want 1 validation per ship
              shipValidations.push("The ship '" + ship.name + "' is verticly out of bounds (y)")
            }

            //check for overlap
            if(_.findWhere(coveredCells, coord)){
              shipIsValid = false; //We only want 1 validation per ship
              shipValidations.push("The ship '" + ship.name + "' has an overlap with another ship")
            }
          }

          coveredCells.push({x: coord.x, y: coord.y});
          coord = getNextCoord(coord, ship.isVertical);
        }

    }

    return shipValidations;
    //return true of false;
  };

  function getNextCoord(coord, isVertical){
    if(isVertical){
      coord.y++;
    }else{
      coord.x = String.fromCharCode(coord.x.charCodeAt(0) + 1)
    }

    return coord;
  }

  mongoose.model('Ship', shipSchema);
  mongoose.model('Gameboard', gameboardSchema);