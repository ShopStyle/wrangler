Template.testscriptList.helpers({
	testscripts: function() {
		var ticketId = Router.current().params._id;
		return Testscripts.find({ ticketId: ticketId });
	}
});

Template.testscript.helpers({
	numFailers: function() {
		return this.failers.length;
	},
	numPassers: function() {
		return this.passers.length;
	},
	passersConcat: function() {
		return this.passers.join(', ')
	},
	failersConcat: function() {
		return this.failers.join(', ')
	}
});

