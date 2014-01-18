Template.ticketPage.events({
	'click #add-testscript': function(e) {
		e.preventDefault();
		e.stopPropagation;
		$('#new-testscript').show();
	},
	'dblclick .main.ticket': function(e) {
		e.preventDefault();
		$(e.currentTarget).hide();
		$('.edit-ticket').show();
	}
});
