Template.ticketsList.helpers({
	allPassed: function() {
		var allPassed = Tickets.find({pass: false}).count() === 0;
		return allPassed;
	}
});

