var DEFAULT_TESTERS_PER_TICKET = 2;

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
		var smokeTestTickets = [4929, 5026, 5154, 6399, 7036];
		Tickets.update({assemblaId: {$in: smokeTestTickets}},
			{$set: {passers: [], failers: [], testers: [], status: '', allStepsCompleted: []}}, {multi: true});
		Testscripts.update({ticketAssemblaId: {$in: smokeTestTickets}},
			{$set: {passers: [], failers: [], status: ''}}, {multi: true});

		var currentMilestone = Milestones.findOne({current: true});
		if (!currentMilestone) {
			throw new Meteor.Error(401, "Milestone not found");
		}

		var testers = []
		var testersCollection = TestingAssignments.find({milestoneId: currentMilestone.id});
		if (!testersCollection) {
			throw new Meteor.Error(401, "Please assign browsers to assign tickets");
		}
		else if (testersCollection.count() < DEFAULT_TESTERS_PER_TICKET) {
			throw new Meteor.Error(401, "Please assign at least " + DEFAULT_TESTERS_PER_TICKET + " people to test");
		}

		// remove testers from all tickets with no-testing required
		Tickets.update({milestoneId: currentMilestone.id, statusName: "Done", noTesting: true},
			{$set: {testers: []}},
			{multi: true});

		// get all tickets that need testers assigned
		var tickets = Tickets.find({milestoneId: currentMilestone.id, statusName: "Done", noTesting: false});

		var MAX_TICKETS_PER_TESTER = Math.floor((tickets.count() * DEFAULT_TESTERS_PER_TICKET) / testersCollection.count());

		tickets.forEach(function(ticket) {
			// some tickets might have a tester num override, check that here.
			var numTesters = ticket.numTesters || DEFAULT_TESTERS_PER_TICKET;
			if (numTesters >= testersCollection.count()) {
				var requiredNumTesters = parseInt(numTesters) + 1;
				var errorMessage = "Please assign more people to test. Ticket " +
					ticket.assemblaId + " requires " + requiredNumTesters +
					" testers to ensure it will not be assigned to the person that fixed it.";
				throw new Meteor.Error(401, errorMessage);
			}

			var ticketTesters = [];
			var assemblaUserId = ticket.assignedToId;
			var assignedToLogin = AssemblaUsers.findOne({id: assemblaUserId});
			if (!assignedToLogin) {
				return;
			}
			assignedToLogin = assignedToLogin.login;

			while (ticketTesters.length < numTesters) {
				// reset queue of testers when empty
				if (testers.length === 0) {
					testers = _.shuffle(testersCollection.fetch());
				}

				// validate potential tester for ticket
				var potentialTester = testers.pop();
				// 1. can't test your own ticket
				if (potentialTester.name === assignedToLogin) {
					continue;
				}

				// 2. can't test the same ticket twice
				if (_.contains(ticketTesters, potentialTester.name)) {
					continue;
				}

				potentialTester.tickets.push(ticket);
				TestingAssignments.update(
					{milestoneId: currentMilestone.id, name: potentialTester.name},
					{$set: {tickets: potentialTester.tickets}});

				ticketTesters.push(potentialTester.name);
			}

			Tickets.update(
				{assemblaId: ticket.assemblaId},
				{$set: {testers: ticketTesters}}
			)
		});
	},

	updateTickets: function() {
		if (Meteor.isServer) {
			Assembla.populateTicketCollection();
		}
	}
})
