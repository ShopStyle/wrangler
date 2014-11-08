Template.ticketsList.helpers({
	allPassed: function() {
		var allPassed = Tickets.find({ status: 'pass' }).count() === Tickets.find({ noTesting: false }).count();
		return allPassed;
	},

	testingUserAssignment: function() {
		var user = Meteor.user();
		var currentMilestone = Milestones.findOne({ current: true });
		if (currentMilestone) {
			var testingAssignment = TestingAssignments.findOne({ milestoneId: currentMilestone.id, name: user.username });
		}
		if (user && testingAssignment) {
			var browser = testingAssignment.browser;
			var locale = testingAssignment.locale;
			if (browser === undefined || locale === undefined) {
				return 'nothing, yet...';
			}
			return browser + ' - US, ' + locale;
		}
	},

	noTickets: function(options) {
		return Tickets.find(options).count() === 0;
	},

	userTestedTickets: function() {
		if (Meteor.user()) {
			var username = Meteor.user().username;
			var testedTickets = Tickets.find({
				testers: {$in: [username]},
				allStepsCompleted: {$in: [username]}
			});
			return testedTickets;
		}
	},
	userUntestedTickets: function() {
		if (Meteor.user()) {
			var username = Meteor.user().username;
			var untestedTickets = Tickets.find({
				testers: {$in: [username]},
				allStepsCompleted: {$nin: [username]}
			});
			return untestedTickets;
		}
	},
	userAllDone: function() {
		//should probably get rid of this duplicate logic
		if (Meteor.user()) {
			var username = Meteor.user().username;
			var untestedTickets = Tickets.find({
				testers: {$in: [username]},
				allStepsCompleted: {$nin: [username]}
			});
			return untestedTickets.count() === 0;
		}
	}
});

Template.ticket.helpers({
	assignedTo: function() {
		var user = AssemblaUsers.findOne({ id: this.assignedToId });
		if (user) {
			return user.login;
		}
	},
	ticketTesters: function() {
		if (this.testers) {
			var testers = _.filter(this.testers, function(tester) {
				return tester !== '' && tester !== null;
			});
			if (testers.length > 0) {
				return testers.join(', ');
			}
		}
		return 'No Testers Assigned';
	}
});

Template.ticket.events({
	'click .testscript-results': function(e) {
		e.preventDefault();
		$(e.currentTarget).find('.results-inner').show();
		$(e.currentTarget).find('.results').hide();
	},
	'click .results-inner': function(e) {
		e.preventDefault();
		e.stopPropagation();
		$(e.currentTarget).hide();
		$(e.currentTarget).siblings('.results').show();
	}
});


