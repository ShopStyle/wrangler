Template.testscriptSubmit.events({
	'submit form': function(e) {
		e.preventDefault();
		
		$('#new-testscript').hide();
		var attributes = {
			steps: $(e.target).find('[name=steps]').val(),
			ticketId: Router.current().params._id
		};
		
		Meteor.call('createNewTestscript', attributes, function(error, id) {
			if (error) {
				throwError(error);
			}
		});
	}
});