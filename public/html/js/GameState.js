function QueState(game){
	var self = this;

	self.drawControls = function(){
		var cElement = $('#controls');
		cElement.append("<h2>Que state</h2>");
		cElement.append("<h2>Que state</h2>");
	};
};

function SetupState(game){
	var self = this;

	self.drawControls = function(){
		var cElement = $('#controls');
		cElement.append("<h2>Setup state</h2>");
		cElement.append("<button id='submit_gameboard' class='btn btn-default'>Submit gameboard</button>");
	}

	self.SaveGameboard = function(){

		data = {
			ships: app.boatController.boats
		};

		AjaxHelper.POST("games/" + app.game._id + "/gameboards", data, {
			success: function(res){
				console.log(res);
			}
		});
	}

	//event
	$("#controls").on("click", "#submit_gameboard", self.SaveGameboard);
};


function StartedState(game){
	var self = this;

	app.gameboardController.drawShots(game.enemyGameboard.shots, "me");
	app.gameboardController.drawBoats(game.myGameboard.ships);
	app.gameboardController.drawShots(game.myGameboard.shots, "enemy");
	

	self.drawControls = function(){
		var cElement = $('#controls');
		cElement.append("<h2>Game started</h2>");

		if(game.yourTurn){
			cElement.append("<p>Your turn</p>")
		}
		else{
			cElement.append("<p>Enemy's turn</p>")
		}

		
		cElement.append("<button id='surrender_game' class='btn btn-default'>Surrender</button>");
	}

	self.surrender = function(){
		//todo: implement
	}

	self.shoot = function(coord){
		
		AjaxHelper.POST("games/" + app.game._id + "/shots", coord, {
			success: function(res){
				AjaxHelper.GET("games/" + game._id, {
					success: function(game){
						app.game = new Game(game);
					},
				});
			}
		});
	}


	//event
	$("#controls").on("click", "#submit_gameboard", self.surrender)
};

function DoneState(game){
	var self = this;

	self.drawControls = function(){
		console.log(game);
		var cElement = $('#controls');
		cElement.append("<h2>Game over</h2>");

		if(game.youWon){
			cElement.append("<h2>YOU WON THE GAME</H2>")
		}
		else{
			cElement.append("<H3>You lost :(</h3>")
		}
	}
}


function BrokenState(){
	var self = this;

	console.log("Broken state init");
};



//Semi prototype
GameState = {
	Get : function(game){
		//clear controls
		$('#controls').html("");

		var state = null;

		switch(game.status)
		{
			case "que": state = new QueState(game); break;
			case "setup": state = new SetupState(game); break;
			case "started":state = new StartedState(game); break;
			case "done":state = new DoneState(game); break;
			default: state = new BrokenState(game); break;
		}

		state.drawControls();
		state.isSetup = game.status == "setup";
		return state;
	}
};