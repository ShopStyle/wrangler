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
			while (testers.length < 3) {
				if (assignments.length === 0) {
					assignments = _.shuffle(currentBrowser.assignments);
				}
				var tester = _.sample(assignments).username;
				if (_.indexOf(testers, tester) === -1) {
					testers.push(tester);
					assignments = _.reject(assignments, function(assignment) { 
						return assignment.username == tester; 
					});
				}
			}
			Tickets.update(
				{assemblaId: ticket.assemblaId},
				{$set: {testers: testers}}
			)
		});
	}
})