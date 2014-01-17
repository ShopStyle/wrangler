Template.testscriptList.helpers({
	testscripts: function() {
		var ticketId = Router.current().params._id;
		return Testscripts.find({ ticketId: ticketId });
	}
});



