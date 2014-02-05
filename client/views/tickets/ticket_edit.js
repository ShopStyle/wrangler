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
				throwError(error.reason);
			}
		});
		
		Meteor.call('updateTicketCommentDescription', oldComments, ticketProperties.comments, currentTicketId);
	}
});

Template.ticketEdit.helpers({
	assignedTo: function() {
		if (AssemblaUsers.findOne({ id: this.assignedToId })) {
			return AssemblaUsers.findOne({ id: this.assignedToId }).login;
		}
		return '';
	},
	ticketTesters: function() {
		if (this.testers) {
			while (this.testers.length < 3) {
				this.testers.push('');
			}
			return this.testers;
		}
		else {
			return ['', '', ''];
		}
	}
})


