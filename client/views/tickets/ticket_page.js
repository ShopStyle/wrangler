Template.ticketPage.events({
	'click #add-testscript': function(e) {
		e.preventDefault();
		e.stopPropagation;
		if (Meteor.user()) {
			$('#new-testscript').show();
		}
	},
	'dblclick .main.ticket': function(e) {
		e.preventDefault();
		if (Meteor.user()) {
			$(e.currentTarget).hide();
			$('.edit-ticket').show();
		}
	}
});

Template.ticketPage.helpers({
	assignedTo: function() {
		if (AssemblaUsers.findOne({ id: this.assignedToId })) {
			return AssemblaUsers.findOne({ id: this.assignedToId }).login;
		}
		return '';
	}
})
