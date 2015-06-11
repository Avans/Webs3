function GameboardVM(controller, owner){
	var self = this;
	
	self.controller = controller;
	
	self.draw = function(){
		var domElement;
		var shots;
		
		if(owner == 'me')
			domElement = $('#myBoard');
			shots = self.selectedGame.myGameboard.shots;
		else{
			domElement = $('#enemyBoard');
			shots = self.selectedGame.enemyGamboard.shots;
		}
		
		//teken canvas
		
		//teken schepen
		var ships = self.controller.selectedGame.ships;
		
		ships.forEach(function(ship){
			var shipElement = $('<div>');
			shipElement.class = "boat";
			shipElement.style('left', ship.startCell.x * 30);
			
			domElement.append(shipElement);
		});
		
		//teken schoten
		shots.forEach(function(shots){

			var elementId = '#' + shot.x + '_' + shot.y;			
			var cell = $(elementId);
			
			if(shot.isHit){
				cell.addClass('hit');
			}
			else{
				cell.addClass('miss');
			}
		});
	}
	
	$('.gameboard').on('click', '.cell', function(event){
		
		var coord = $(this).data('coords');
		
		if(self.controller.selectedGame.status == "setup")
			self.controller.placeShip(coords);
			
		if(self.controller.selectedGame.status == "started")
			self.controller.addShot(coords);
			
	});
}
