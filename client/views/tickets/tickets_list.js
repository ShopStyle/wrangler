Template.ticket.helpers({
	passed: function(ticket) {
		var status = ticket.pass === true ? "pass" : "fail";
		return status;
	}
});

Template.ticketsList.helpers({
	tickets: function() {
		return Tickets.find();
	}
});

Template.ticket.events({
	'click .btn-test.fail': function(e) {
		e.preventDefault();
		Meteor.call('updateTestResult', this._id, false);
	},
	'click .btn-test.pass': function(e) {
		e.preventDefault();
		Meteor.call('updateTestResult', this._id, true);
	}
});