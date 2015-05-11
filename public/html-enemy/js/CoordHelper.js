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