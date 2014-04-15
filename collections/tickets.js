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
		var smokeTestTickets = [4929, 5026, 5154];
		Tickets.update({assemblaId: {$in: smokeTestTickets}},
			{$set: {passers: [], failers: [], testers: [], status: '', allStepsCompleted: []}}, {multi: true});
		Testscripts.update({ticketAssemblaId: {$in: smokeTestTickets}},
			{$set: {passers: [], failers: [], status: ''}}, {multi: true});

		var defaultNumTesters = 2;
		var currentMilestone = Milestones.findOne({current: true});
		if (!currentMilestone) {
			return;
		}

		var currentBrowser = BrowserAssignments.findOne({milestoneId: currentMilestone.id});
		if (!currentBrowser) {
			throw new Meteor.Error(401, "Please assign browsers to assign tickets");
		}

		Tickets.update({milestoneId: currentMilestone.id, statusName: "Done", noTesting: true},
			{$set: {testers: []}},
			{multi: true});

		var tickets = Tickets.find({milestoneId: currentMilestone.id, statusName: "Done", noTesting: false});
		var assignments = currentBrowser.assignments[0];
		var users = [];

		_.each(assignments, function(browser, user) {
			users.push(user);
		})
		var samplers = _.shuffle(users);

		if (samplers.length < defaultNumTesters + 1) {
			var numToAssign = defaultNumTesters + 1;
			var error = "Please assign at least " + numToAssign + " people to test";
			throw new Meteor.Error(401, error);
		}

		tickets.forEach(function(ticket) {
			var numTesters = ticket.numTesters || defaultNumTesters;
			if (numTesters > users.length - 1) {
				var requiredNumTesters = parseInt(numTesters) + 1;
				var errorMessage = "Please assign more people to test. Ticket "
					 + ticket.assemblaId + " requires " + requiredNumTesters
					 + " testers to ensure it will not be assigned to the person that fixed it.";
				throw new Meteor.Error(401, errorMessage);
				return;
			}
			var testers = [];
			var assemblaUserId = ticket.assignedToId;
			var assignedToLogin = AssemblaUsers.findOne({id: assemblaUserId});
			if (!assignedToLogin) {
				return;
			}
			assignedToLogin = assignedToLogin.login;
			while (testers.length < numTesters) {
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
	},
	updateTickets: function() {
		if (Meteor.isServer) {
			Assembla.populateTicketCollection();
		}
	}
})
