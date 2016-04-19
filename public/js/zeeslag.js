
/** Ajax helper */
AjaxHelper = {
	server: 'http://localhost:3000/',//'http://zeeslagavanstest.herokuapp.com/', //https://zeeslagavans.herokuapp.com/',
	token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.InMuc211bGRlcnNAYXZhbnMubmwi.eu926uUUa37v50xtsqRcr9vthtHI8NKSkQPVdi4yhLU", 
	GET : function(url, options){
		AjaxHelper.REQ(url, 'GET', null, options);
	},
	POST: function(url, data, options){
        AjaxHelper.REQ(url, 'POST', data, options);
	},
    DELETE: function(url, options){
        AjaxHelper.REQ(url, 'DELETE', null, options);
    },
    REQ: function(url, type,  data, options){
        	$.ajax({
		    type: type,
		    data: data,
		    url: this.server + url + '?token=' + AjaxHelper.token,
		    success: options.success,
		    error: options.error
		});
    }
}

var CoordHelper = {
	nextCoord: function(coord, isVertical){
		 //Increase X or Y depending on Orientation
          if(isVertical) //If vertical, increase Y 
          { 
            coord.y++;
          }
          else //If horizontal, increase X
          {
            coord.x = String.fromCharCode(coord.x.charCodeAt(0) + 1);
          }
          return coord;
	},
  idToCoord: function(id){
    var data = id.split('_');
    return coord = {
      x: data[0],
      y: data[1]
    };
  },
  coordtoId: function(coord){
    return coord.x + "_" + coord.y;
  }

}



var app = {
    gameCtrl: new GameController(),
    gameboardCtrl: new GameboardController(),
	start: function(){

        app.gameCtrl.getAllGames();
        
        $('#vsPC').on('click', app.gameCtrl.requestPC);
        $('#gamelist').on('click', 'li',  app.gameCtrl.select);
        $('#removeGames').on('click', app.gameCtrl.remove);
        $('#msg').on('click', app.gameCtrl.msgClick)
    }
    
}

function GameboardController(){
    var self = this;
    
    self.axisX = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h' , 'i' , 'j'];
	self.axisY = [ 1 , 2 , 3 , 4 , 5 , 6 , 7 , 8 , 9 , 10 ];
    self.ships = [];
    self.currentIndex = 0;
    
    var htmlString = "";

    self.axisY.forEach(function(y){
        htmlString += "<tr>";
        self.axisX.forEach(function(x){
                htmlString += "<td class='cell' id='" + x + "_" + y +"'>";
                htmlString += x + y;
                htmlString += "</td>";
        });
        htmlString += "</tr>";
    });

    $('.gameboard').append(htmlString);
    AjaxHelper.GET('ships', {
        success: function(ships){
            self.ships = ships;
            self.selectShip(0);
        }
    })
    
    self.selectShip = function(index){
        self.currentIndex = index;
        var ship = self.ships[index];
        $('#selectedShip').text("Place " + ship.name + ", click here to rotate");
    }
    
    self.rotate = function(){
        self.ships[self.currentIndex].isVertical = self.ships[self.currentIndex].isVertical;
    }
    

}

function GameController(){
    var self = this;
    
    //events
    self.remove = function(){
         AjaxHelper.DELETE('users/me/games/', {
             success: self.getAllGames
         });
    }
    
    self.msgClick = function(){
        if(self.game){
            if(self.game.status == "setup")
                app.gameboardCtrl.rotate();
            }
        }
    }
    
    self.select = function(){
        AjaxHelper.GET('games/' + this.id, {
            success: function(game){
                $('#gameTitle').text("You VS " +  game.enemyName + " - " + game.status)
                $('#game').show();

            }
        })
    }

    self.getAllGames = function(){
         AjaxHelper.GET('users/me/games', {
            success: function(games){
               $('#gamelist').empty();
               $.each(games, function( index, value ){
                   $('#gamelist').append("<li id='" + value._id +"'>" + value.enemyName + "</li>");
               }); 
            }
        })
    }
    
    self.requestPC = function(){
         AjaxHelper.GET('games/AI', {
            success: self.getAllGames
        })
    }
    
}


//GOGOGO
app.start()