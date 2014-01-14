Template.ticketsList.helpers({
	allPassed: function() {
		var allPassed = Tickets.find({pass: false}).count() === 0;
		return allPassed;
	}
});

Template.ticket.events({
	'click .btn-test': function(e) {
		e.preventDefault();
		var pass = $(e.target).filter(".pass").length > 0;
		Meteor.call('updateTestResult', this._id, pass, function(error) {
			if (error) {
				throwError(error.reason);
			}
		});
	}
});