Meteor.publish('tickets', function() {
	return Tickets.find();
});

Meteor.publish('testscripts', function(ticketId) {
	return Testscripts.find({ ticketId: ticketId });
});

Meteor.publish('notifications', function() {
	return Notifications.find();
});