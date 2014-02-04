BrowserAssignments = new Meteor.Collection('browserAssignments');

Meteor.methods({
	assignBrowsers: function(users) {
		console.log("hi");
		var currentMilestoneId = Milestones.findOne({current: true});
		if (currentMilestoneId) {
			currentMilestoneId = currentMilestoneId.id;
		}
		BrowserAssignments.update(
			{milestoneId: currentMilestoneId}, 
			{$set: {assignments: users, milestoneId: currentMilestoneId}},
			{upsert: true}
		)
	}
});