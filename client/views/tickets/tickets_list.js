Template.ticketsList.helpers({
	allPassed: function() {
		var allPassed = Tickets.find({ status: 'pass' }).count() === Tickets.find().count();
		return allPassed;
	},
	testingUserAssignment: function() {
		var user = Meteor.user();
		var currentMilestone = Milestones.findOne({current: true});
		var browserAssignments = BrowserAssignments.findOne({milestoneId: currentMilestone.id})
		if (user && browserAssignments) {
			var assignment, browser, locale;
			user = user.username;
			assignment = browserAssignments.assignments;
			browser = assignment[0][user];
			locale = assignment[1][user];
			return browser + ' - US, ' + locale; 
		}
	},
	noTickets: function(tickets) {
		return tickets.count() === 0;
	}
});

Template.ticket.helpers({
	assignedTo: function() {
		var user = AssemblaUsers.findOne({ id: this.assignedToId });
		if (user) {
			return user.login;
		}
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

