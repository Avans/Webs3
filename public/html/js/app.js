var app = {

	boatController: null,
	gameController: null,
	gameboardController: null,
	init: function(){
		
		app.gameController = new GameController();
		app.gameController.getAllGames();

		app.boatController = new BoatController();
		app.boatController.getAllBoats();

		app.gameboardController = new GameboardController();
        
        $( "#api" ).change(function() {
            AjaxHelper.token = $(this).val();
            app.init();
        });
	},
	game: null,
}