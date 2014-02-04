Tickets = new Meteor.Collection('tickets');
if (Meteor.isServer) {
	Tickets._ensureIndex({ "assemblaId": 1 }, { unique: true });
}


Tickets.allow({
	update: function() {
		return Meteor.user();
	}
});

Meteor.methods({
	assignTickets: function() {
		var currentMilestone = Milestones.findOne({current: true});
		if (!currentMilestone) {
			return;
		}
		
		var currentBrowser = BrowserAssignments.findOne({milestoneId: currentMilestone.id});
		if (!currentBrowser) {
			throw new Meteor.Error(401, "Please select a current milestone to assign tickets");
		}
		
		var tickets = Tickets.find({milestoneId: currentMilestone.id, statusName: "Done"});
		var assignments = _.shuffle(currentBrowser.assignments);

		tickets.forEach(function(ticket) {
			var testers = [];
			for (var i = 0; i < 3; i++) {
				if (assignments.length === 0) {
					assignments = _.shuffle(currentBrowser.assignments);
				}
				testers.push(assignments.pop().username);  	
			}
			Tickets.update(
				{assemblaId: ticket.assemblaId},
				{$set: {testers: testers}}
			)
		});
	}
})