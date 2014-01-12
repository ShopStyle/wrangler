Tickets = new Meteor.Collection('tickets');

Tickets.allow({
	update: function() {
		return Meteor.user();
	}
})

Meteor.methods({
	updateTestResult: function(ticketId, passTest) {
		var user = Meteor.user();
		if (!user) {
			throw new Meteor.Error(401, "You need to login to post test results");
		}
		var ticket = Tickets.findOne(ticketId);
		Tickets.update(ticket._id, {
			$addToSet: {testers: user._id},
			$set: { pass: passTest }
		});
	}
})