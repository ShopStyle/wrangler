Template.ticket.helpers({
	passed: function(ticket) {
		var status = ticket.pass === true ? "pass" : "fail";
		return status;
	}
});

// Template.ticketsList.helpers({
// 	tickets: function() {
// 		return Tickets.find();
// 	}
// });

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