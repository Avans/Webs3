function GameboardController(){
	var self = this;

	self.drawBoats = function(boats){
		$('#gameboard .cell').removeClass("boat");
	
		$.each(boats, function(key, boat){

			if(boat.startCell)
			{
				var coord  = {x: boat.startCell.x, y: boat.startCell.y };
				for(var index = 0; index < boat.length; index++){
					var id = CoordHelper.coordtoId(coord);
					$("#" + id).addClass("boat");
					coord = CoordHelper.nextCoord(coord, boat.isVertical);
				}
			}
		})
	};

	$('#gameboard').on('click', '.cell', function(event){
		if(app.game.state.isSetup)
		{
			event.stopImmediatePropagation();
			var id = $(this).attr("id");
			coords = CoordHelper.idToCoord(id);
			app.boatController.placeBoat(coords);
		}
		else
		{	
			var id = $(this).attr("id");
			var coord = CoordHelper.idToCoord(id); //startcell
			app.game.shoot(coord);
		}
	});

	//Only add these events if setting up


		//events
		$('#gameboard').on("mouseenter", '.cell',function(){
			if(!app.game.state.isSetup) return;
			var boat = app.boatController.selectedBoat;
			if(boat){
				var id = $(this).attr("id");
				var coord = CoordHelper.idToCoord(id); //startcell
				for(var index = 0; index < boat.length; index++){
					var id = CoordHelper.coordtoId(coord);
					$("#" + id).addClass("ghostBoat");
					coord = CoordHelper.nextCoord(coord, boat.isVertical);
				}
			}
		});

		$('#gameboard').on("mouseleave", '.cell',function(){
			if(!app.game.state.isSetup) return;
			var boat = app.boatController.selectedBoat;
			if(boat){
				var id = $(this).attr("id");
				var coord = CoordHelper.idToCoord(id); //startcell
				for(var index = 0; index < boat.length; index++){
					var id = CoordHelper.coordtoId(coord);
					$("#" + id).removeClass("ghostBoat");
					coord = CoordHelper.nextCoord(coord, boat.isVertical);
				}
			}
		});


}