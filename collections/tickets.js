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
			throw new Meteor.Error(401, "Please assign browsers to assign tickets");
		}
		
		var tickets = Tickets.find({milestoneId: currentMilestone.id, statusName: "Done", noTesting: false});
		var assignments = currentBrowser.assignments[0];
		var users = [];
		
		_.each(assignments, function(browser, user) {
			users.push(user);
		})
		var samplers = _.shuffle(users);

		if (samplers.length < 4) {
			throw new Meteor.Error(401, "Please assign at least four people to test");
		}

		tickets.forEach(function(ticket) {
			var testers = [];
			var assemblaUserId = ticket.assignedToId;
			var assignedToLogin = AssemblaUsers.findOne({id: assemblaUserId});
			if (!assignedToLogin) {
				return;
			}
			assignedToLogin = assignedToLogin.login;
			while (testers.length < 3) {
				if (samplers.length === 0 || samplers.length === 1 && samplers[0] === assignedToLogin) {
					samplers = _.shuffle(users);
				}
				var tester = _.sample(samplers);
				if (_.indexOf(testers, tester) === -1 && tester !== assignedToLogin) {
					testers.push(tester);
					samplers = _.reject(samplers, function(sample) { 
						return sample == tester; 
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