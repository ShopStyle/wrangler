Stream = new Meteor.Collection('stream');

Meteor.methods({
	handleInterval: function() {
		if (Meteor.isServer) {
			if (!intervalHandle) {
				intervalHandle = Meteor.setInterval(Assembla.watchTicketStream, 15000);
				Stream.update({}, {$set: {on: true}});
			}
			else {
				Meteor.clearInterval(intervalHandle);
				intervalHandle = null;
				Stream.update({}, {$set: {on: false}});
			}
		}
	}	
})