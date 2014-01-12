Meteor.publish('tickets', function() {
	return Tickets.find();
});

Meteor.publish('testscripts', function() {
	return Testscripts.find();
})