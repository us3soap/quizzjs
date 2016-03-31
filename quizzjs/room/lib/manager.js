var Room = require('./room').Room;

/*
 * Gestionnaire des salles.
 */
exports.RoomManager = {
	rooms : [],
	
	getRoom : function(token) {
		for(var i=0; i<this.rooms.length; i++)
		{
			if(this.rooms[i].getToken() == token)
				return this.rooms[i];
		}
		
		return false;
	},
	
	newRoom : function() {
		var room = new Room();
		this.rooms.push(room);
		return room.getToken();
	},
	
	deleteRoom : function(token) {
		for(var i=0; i<this.rooms.length; i++)
		{
			if(this.rooms[i].getToken() == token)
			{
				this.rooms[i].close();
				this.rooms.splice(i, 1);
				return true;
			}	
		}
		
		return false;
	}
}
