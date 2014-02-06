selectedTesterEditPage = '';

Template.ticketEdit.events({
	'submit form': function(e) {
		e.preventDefault();
		$('.edit-ticket').hide();
		$('.main.ticket').show();
		
		var currentTicketId = this._id;
		var testers = []
		var testerValues = $(e.target).find('select');
		_.each(testerValues, function(option) {
			testers.push($(option).val());
		})

		var ticketProperties = {
			comments: $.trim($(e.target).find('[name=comments]').val()) + "\n",
			testers: testers
		};

		Tickets.update(currentTicketId, {$set: ticketProperties}, function(error) {
			if (error) {
				throwError(error.reason);
			}
		});
		
		var oldComments = Tickets.findOne(currentTicketId).comments;
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
});

Template.testerUsers.helpers({
	testers: function() {
		selectedTesterEditPage = this.toString();
		var currentMilestone = Milestones.findOne({current: true});
		var browsersObjs = BrowserAssignments.findOne({milestoneId: currentMilestone.id}).assignments[0];
		var testers = [];
		_.each(browsersObjs, function(username, browser) {
			testers.push(username);
		})
		return testers;
	}
})

Template.testerUser.helpers({
	selected: function() {
		return selectedTesterEditPage == this.toString();
	}
})


