BrowserAssignments = new Meteor.Collection('browserAssignments');

Meteor.methods({
	assignBrowsers: function(browsers, locales) {
		var currentMilestoneId = Milestones.findOne({current: true});
		if (currentMilestoneId) {
			currentMilestoneId = currentMilestoneId.id;
		}
		BrowserAssignments.update(
			{milestoneId: currentMilestoneId}, 
			{$set: {assignments: [browsers, locales], milestoneId: currentMilestoneId}},
			{upsert: true}
		)
	}
});