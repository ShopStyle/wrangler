Template.testscriptList.helpers({
	testscripts: function() {
		var assemblaId = parseInt(Router.current().params._assemblaId);
		return Testscripts.find({ ticketAssemblaId: assemblaId });
	}
});



