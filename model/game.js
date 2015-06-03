
  var mongoose = require('mongoose');
  var Schema = mongoose.Schema;
  var Gameboard = mongoose.model("Gameboard");
  var io = require('socket.io')();

  var autoIncrement = require('mongoose-auto-increment');
  autoIncrement.initialize(mongoose.connection);

  var gameSchema = new Schema({
    _id: Number,
    isAI: { type: Boolean , default: false },
    player1: { type: Schema.Types.ObjectId, ref: 'User'},
    player2: { type: Schema.Types.ObjectId, ref: 'User'},
    board1: {  type: Number, ref: 'Gameboard' },
    board2: {  type: Number, ref: 'Gameboard' },
    status: {  type: String, enum: [ "que", "setup", "started", "done"]},
    turn: { type: Schema.Types.ObjectId },
    winner: { type: Schema.Types.ObjectId, ref: 'User'},
  });

  // gameSchema.pre('save', function(next){
  //     app.io.alertIO(this._id);
  //     next();
  // });


  gameSchema.plugin(autoIncrement.plugin, 'Game');

  gameSchema.status = {
    que: "que",
    setup: "setup",
    started: "started",
    done: "done"
  };

  gameSchema.statics.myGames = function search (userId, cb) {
      this.find({$or : [{player1: userId}, {player2: userId}]})
        .populate('player2')
        .populate('player1')
        .exec(cb);
  }

  gameSchema.methods.start = function(){
     this.status = "started";

     if(this.isAI){
        this.turn = this.player1;
     }else{

       var firstTurnToPlayer1 = Math.floor(Math.random());

       if(firstTurnToPlayer1)
          this.turn = this.player1;
        else
          this.turn = this.player2;
      }
  }

  gameSchema.methods.containsPlayer = function(playerId)
  {
    return this.player1.equals(playerId) || this.player2.equals(playerId);
  }

  /** ------ GetMyGameboard -------- **/
  /** Returns a fully filled gameboard that you own **/
  gameSchema.methods.getMyGameboard = function(playerId, callback)
  {
      if(this.player1.equals(playerId)){
        Gameboard.findById(this.board1, callback);
      }
      else if(this.player2.equals(playerId)){
        Gameboard.findById(this.board2, callback);
      }
      else{
        callback({msg: "Error: You are not a player in this game.", gameId: this._id });//Return without a board :(
      }
  }

  gameSchema.statics.getGameDetails = function(gameId, callback)
  {
    this.findById(gameId)
        .exec(function(err, game){
          if(!game)
            callBack("Error: No game found with id " + gameId);
          else{

              var result = {
                _id: game._id,
                status: game.status,
                yourTurn:  req.user._id.equals(game.turn),
                youWon: req.user._id.equals(game.winner)
              };

              if(game.status != "que")
              {
                var enemyId = game.player1;
                if(game.player1.equals(req.user._id))
                  enemyId = game.player2;

                //Get the user element of the enemy player
                User.findById(enemyId, function(err, enemy){

                  result.enemyId = enemy._id;
                  result.enemyName = enemy.local.email;

                  if(game.status != "started")
                  {
                      game.getMyGameboard(userId, function(err, myGameboard){
                        game.getEnemyGameboard(userId, function(err, enemyGameboard){
                          enemyGameboard.ships = undefined;
                          result.myGameboard = myGameboard;
                          result.enemyGameboard = enemyGameboard;
                          callback(null, result);
                        });
                      });
                  }
                  else{
                    callback(null, result);
                  }
                });
              }
              else{
                callback(null, result);
              }
        };
    });
  }


  /** ------ GetEnemyGameboard ------------ **/
  /** Returns a semi filled gameboard (without ships) that you do not own **/
  gameSchema.methods.getEnemyGameboard = function(playerId, callback)
  {
      if(this.player1.equals(playerId)){
         Gameboard.findById(this.board2, callback);
      }
      else if(this.player2.equals(playerId)){
          Gameboard.findById(this.board1, callback);
      }
      else{
        callback({msg: "Error: You are not a player in this game.", gameId: this._id });//Return without a board :(
      }
  }


mongoose.model('Game', gameSchema);