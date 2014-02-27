Template.testscriptSubmit.events({
	'click .cancel': function() {
		$('#new-testscript').hide();
	},
	'submit form': function(e) {
		e.preventDefault();
		
		$('#new-testscript').hide();
		var attributes = {
			steps: $.trim($(e.target).find('[name=steps]').val()),
			ticketAssemblaId: parseInt(Router.current().params.assemblaId),
			testscriptNum: 1000
		};
		
		var _id = Testscripts.insert(attributes);
		Meteor.call('createNewTestscript', attributes, _id, function(error) {
			if (error) {
				throwError(error.reason);
			}
		});
	}
});