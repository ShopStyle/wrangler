Template.ticketNew.events({
	'submit form': function(e) {
		e.preventDefault();

		var ticketProperties = {
			dev: $(e.target).find('[name=assigned]').val(),
			title: $(e.target).find('[name=title]').val(),
			whatChanged: $(e.target).find('[name=what-changed]').val(),
			referencePages: $(e.target).find('[name=reference-pages]').val(),
			typeTesting: $(e.target).find('[name=test-req]').val(),
			comments: $(e.target).find('[name=comments]').val(),
			status: ''
		};

		Meteor.call('newTicket', ticketProperties, function(error, id) {
			if (error) {
				//display the error to the user
				throwError(error.reason);
			}
			
			Router.go('ticketPage', { _id: id });
		});
	}
});

Template.ticketNew.helpers({
	defaultDev: function() {
		if (this.dev) {
			return this.dev;
		}
		if (Meteor.user()) {
			return Meteor.user().username;
		}
	}
})