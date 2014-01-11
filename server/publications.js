Meteor.publish('tickets', function() {
	return Tickets.find();
});