function Game(game){
	var self = this;

	console.log(game);
	self._id = game._id;
	self.enemyGameboard = game.enemyGameboard;
	self.myGameboard = game.myGameboard;
	self.state = GameState.Get(game);
	self.yourTurn = game.yourTurn;


	self.shoot = function(coord){
		if(self.state.shoot)
		{
			self.state.shoot(coord);
		}
	}
}