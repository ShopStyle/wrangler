Meteor.publish('tickets', function() {
	//only for current milestone, add only those with done assembla status
	// var currentSpaceId = Milestones.findOne({ current: true }).space_id;
	var currentMilestoneId = 4853043; // stand in for development, 1/28/2014
	// return Tickets.find({ milestoneId: currentMilestoneId, statusName: "In Progress" });
	return Tickets.find({ assemblaId: 3633 });

});

Meteor.publish('users', function() {
	return AssemblaUsers.find({}, { fields: { login: 1, id: 1 }});
});

Meteor.publish('testscripts', function(ticketId) {
	var assemblaId = Tickets.findOne('' + ticketId).assemblaId;
	return Testscripts.find({ ticketAssemblaId: assemblaId });
});

Meteor.publish('notifications', function() {
	return Notifications.find();
});

Meteor.publish('milestones', function() {
	return Milestones.find();
})