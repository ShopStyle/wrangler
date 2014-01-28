Template.testscriptSubmit.events({
	'submit form': function(e) {
		e.preventDefault();
		
		$('#new-testscript').hide();
		var attributes = {
			steps: $(e.target).find('[name=steps]').val(),
			ticketAssemblaId: parseInt(Router.current().params.assemblaId)
		};
		
		Meteor.call('createNewTestscript', attributes, function(error, id) {
			if (error) {
				throwError(error.reason);
			}
		});
	}
});