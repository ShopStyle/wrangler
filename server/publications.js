//this is used to turn off and on the stream from assembla
intervalHandle = null;

Meteor.publish('tickets', function() {
	var currentMilestone = Milestones.findOne({ current: true })
	if (currentMilestone) {
		return Tickets.find({ milestoneId: currentMilestone.id, statusName: "Done" });	
	}
});

Meteor.publish('users', function() {
	return AssemblaUsers.find({}, { fields: { login: 1, id: 1 }});
});

Meteor.publish('testscripts', function(assemblaId) {
	return Testscripts.find({ ticketAssemblaId: assemblaId }, 
		{sort: {testscriptNum: 1}});
});

Meteor.publish('notifications', function() {
	return Notifications.find();
});

Meteor.publish('milestones', function() {
	return Milestones.find();
});

Meteor.publish('stream', function() {
	return Stream.find();
});

Meteor.publish('userData', function() {
	return Meteor.users.find({}, {fields: {username: 1}});
})

Meteor.publish('browserAssignments', function() {
	var currentMilestoneId = Milestones.findOne({current: true});
	if (currentMilestoneId) {
		currentMilestoneId = currentMilestoneId.id;
	}
	return BrowserAssignments.find({milestoneId: currentMilestoneId});
})
