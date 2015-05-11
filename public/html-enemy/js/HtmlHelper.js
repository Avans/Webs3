var HtmlHelper = {
	renderGameList: function(controller){
		$('#myGames').empty();
		$.each(controller.games, function(key, game){
			var style = "list-group-item-" + (game.status == "que" ? "danger" : "info" );
			$("<li>me <b>VS</b> <span/></li>")
				.addClass(style)
				.addClass("gameItem")
				.attr("id", game._id)
				.find("span")
					.text(game.enemyName)
				.end()
				.appendTo("#myGames");
		});
	},
	renderGame: function(controller){
		var game = app.game;
		if(game.status == "que"){
			$('#gameboard').addClass("hidden");
		}
		else
		{
			$('#gameboard').removeClass("hidden");
			$('#game_id').text(game._id);
			$('#game_enemyName').text(game.enemyName);
			$('#game_status').text(game.status);
		}
	},
	renderBoats: function(controller){
		var boats = controller.boats;
		$("#myBoats").empty();
		$.each(boats, function(key, boat){
			
			var isVertical = boat.isVertical ? "|" : "-";
			var coords = boat.startCell ? (boat.startCell.x + boat.startCell.y) : "";

			$("<li><button class='rotate'></button>  <label></label> <span class='coords'></span><span class='badge'></span></li>")
				.addClass("list-group-item boatItem")
				.attr("id", "boat_" + boat.id)
				.find("label")
					.text(boat.name)
					.end()
				.find(".coords")
					.text(coords)
					.end()
				.find("button")
					.attr("id", "boat_" + boat.id)
					.text(isVertical)
					.end()
				.find(".badge")
					.text(boat.length)
					.end()
				.appendTo("#myBoats");
		});
	}
}