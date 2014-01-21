Meteor.publish('tickets', function() {
	//only for current milestone, add only those with done assembla status
	// var currentSpaceId = Milestones.findOne({ current: true }).space_id;
	var currentSpaceId = "cbm-TcMkOr4OkpacwqjQYw"; // stand in for development, 1/28/2014
// 	return Tickets.find({ spaceId: currentSpaceId, statusName: "Done" });
return Tickets.find({ spaceId: currentSpaceId });
});

Meteor.publish('testscripts', function(ticketId) {
	return Testscripts.find({ ticketId: ticketId });
});

Meteor.publish('notifications', function() {
	return Notifications.find();
});

Meteor.publish('milestones', function() {
	return Milestones.find();
})