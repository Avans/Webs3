function BoatController(){
	var self = this;

	//Propertie
	self.selectedBoat = null;
	self.boats = [];

	self.getAllBoats = function(){

		AjaxHelper.GET("ships", {
			success: function(ships){

				for(var i = 0; i < ships.length; i++){
					var ship = ships[i];
					ship.isVertical = true;
					ship.startCell = null;
					self.boats.push(ship);
				}
	
				HtmlHelper.renderBoats(self);
			}
		});
		
		// //Dummy data
		// self.boats = [
		// 	{id: 2, length: 2, startCell: null, name: "Santa Maria", isVertical: true},
		// 	{id: 1, length: 3, startCell: null, name: "C.S.S. Hunley", isVertical: true},
		// 	{id: 3, length: 3, startCell: null, name: "U.S.S. Constituation", isVertical: true},
		// 	{id: 5, length: 4, startCell: null, name: "Bismarck", isVertical: true},
		// 	{id: 6, length: 5, startCell: null, name: "Bismarck HUDGE", isVertical: true},
		// ];

		
	}

	self.placeBoat = function(coords){
		console.log("let's place a boat on " + coords.x + coords.y);
		if(self.selectedBoat)
		{
			self.selectedBoat.startCell = coords;
			self.refreshBoats();
			app.gameboardController.drawBoats(self.boats);
		}
	}

	self.selectBoat = function(pId){
		var id = pId.split("_")[1];
		$.each(self.boats, function(key, boat){
			if(boat._id == id){
				self.selectedBoat = boat;
				$("#myBoats .selected").removeClass("selected");
				$("#" + pId).addClass("selected");
			}
		});
	}

	self.rotateBoat = function(pId){
		var id = pId.split("_")[1];
		$.each(self.boats, function(key, boat){
			if(boat._id == id){
				console.log(boat);
				boat.isVertical = !boat.isVertical;
				self.refreshBoats();
				app.gameboardController.drawBoats(self.boats);
			}
		});
	}

	self.refreshBoats = function(){
		HtmlHelper.renderBoats(self);
		$("#boat_" + self.selectedBoat._id).addClass("selected");
	}

	$('#myBoats').on('click', ".rotate", function(event){
		event.stopImmediatePropagation();
		var id = $(this).attr("id");
		self.rotateBoat(id)
	});

	//events
	$('#myBoats').on('click', ".boatItem", function(event){
		var id = $(this).attr("id");
		self.selectBoat(id)
	});


}