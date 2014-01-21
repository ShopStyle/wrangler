Meteor.publish('tickets', function() {
	//only for current milestone, add only those with done assembla status
	// var currentSpaceId = Milestones.findOne({ current: true }).space_id;
	var currentMilestoneId = 4853043; // stand in for development, 1/28/2014
	return Tickets.find({ milestoneId: currentMilestoneId, statusName: "Done" });

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