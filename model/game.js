var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);

var gameSchema = new Schema({
  _id: Number,
  player1: { type: String, required: true}, 
  player2: String, 
  board1: {  type: Number, ref: 'Gameboard' },
  board2: {  type: Number, ref: 'Gameboard' },
  status: {  type: String, enum: [ "que", "setup", "started", "done"]},
  turn: { type: String, enum: ["p1", "p2"]}
});

gameSchema.plugin(autoIncrement.plugin, 'Game');

gameSchema.status = {
	que: "que",
	setup: "setup",
	started: "started",
	done: "done;"
};

mongoose.model('Game', gameSchema);