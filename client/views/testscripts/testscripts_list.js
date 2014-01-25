Template.testscriptList.helpers({
	testscripts: function() {
		var ticketId = Router.current().params._id;
		var assemblaId = Tickets.findOne('' + ticketId).assemblaId;
		return Testscripts.find({ ticketAssemblaId: assemblaId });
	}
});



