Notifications = new Meteor.Collection('notifications');

Notifications.allow({
	update: function() {
		return Meteor.user();
	}
});

createFailNotification = function(ticketId, username) {
	var ticket = Tickets.findOne(ticketId);
	if (username !== ticket.dev) {
		Notifications.insert({
			dev: ticket.dev,
			ticketId: ticketId,
			failerName: username,
			read: false
		});
	}
};