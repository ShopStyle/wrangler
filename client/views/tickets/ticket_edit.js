Template.ticketEdit.events({
	'submit form': function(e) {
		e.preventDefault();
		
		var currentTicketId = this._id;
		
		var ticketProperties = {
			dev: $(e.target).find('[name=assigned]').val(),
			title: $(e.target).find('[name=title]').val(),
			whatChanged: $(e.target).find('[name=what-changed]').val(),
			referencePages: $(e.target).find('[name=reference-pages]').val(),
			typeTesting: $(e.target).find('[name=test-req]').val(),
			comments: $(e.target).find('[name=comments]').val()
		};
		
		Tickets.update(currentTicketId, {$set: ticketProperties}, function(error) {
			if (error) {
				//display the error to the user
				throwError(error.reason);
			}
			else {
				Router.go('ticketPage', {_id: currentTicketId});
			}
		});
	}
});