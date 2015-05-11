function GameController(){
	var self = this;

	//Properties
	self.games = [];

	//Methods
	self.getAllGames = function(){
		AjaxHelper.GET("users/my/games", {
			success: function(games){
				self.games = games;
				HtmlHelper.renderGameList(self);
			}
		});
	}

	self.selectGame = function(id){

		AjaxHelper.GET("games/" + id, {
			success: function(game){
				app.game = new Game(game);
				HtmlHelper.renderGame(self);
			},
		});
	}

	self.refreshGame = function(){
		AjaxHelper.GET("games/" + app.game._id, {
			success: function(game){

				app.game = new Game(game);
				HtmlHelper.renderGame(self);
				app.gameboardController = new GameboardController();
			},
		});
	}

	self.newGame = function(){
		AjaxHelper.GET("games", {
			success: function(){
				self.getAllGames(); //Refresh the games
			}
		});
	}

	//event
	$("#myGames").on("click", ".gameItem", function(event){
		var id = $(this).attr("id");
		self.selectGame(id)
	});
	$('#newGame').bind("click", function(){self.newGame()});
};