Template.ticketEdit.events({
	'submit form': function(e) {
		e.preventDefault();
		$('.edit-ticket').hide();
		$('.main.ticket').show();
		
		var currentTicketId = this._id;
		
		var ticketProperties = {
			comments: $.trim($(e.target).find('[name=comments]').val()) + "\n"
		};

		var oldComments = Tickets.findOne(currentTicketId).comments;
		Tickets.update(currentTicketId, {$set: ticketProperties}, function(error) {
			if (error) {
				//display the error to the user
				throwError(error.reason);
			}
		});
		
		Meteor.call('updateTicketCommentDescription', oldComments, ticketProperties.comments, currentTicketId);
	}// ,
// 	'click .btn-delete': function(e) {
// 		e.preventDefault();
// 		
// 		if (confirm('Delete this ticket?')) {
// 			var currentTicketId = this._id;
// 			Meteor.call('removeTicket', currentTicketId, function(error) {
// 				Router.go('ticketsList');
// 				if (error) {
// 					throwError(error.reason);
// 				}
// 			});
// 			
// 		}
// 	}
});

Template.ticketEdit.helpers({
	assignedTo: function() {
		if (AssemblaUsers.findOne({ id: this.assignedToId })) {
			return AssemblaUsers.findOne({ id: this.assignedToId }).login;
		}
		return '';
	}
})
