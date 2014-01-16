Template.ticketsList.helpers({
	allPassed: function() {
		var allPassed = Tickets.find({ status: 'pass' }).count() === Tickets.find().count();
		return allPassed;
	}
});

