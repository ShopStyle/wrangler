Template.ticketEdit.events({
	//change all this logic to just be selecting the testers
	'submit form': function(e) {
		e.preventDefault();
		setEditingStatus(this, false, false);
		
		var currentTicketId = this._id;
		var testers = []
		var ticket = Tickets.findOne(currentTicketId);
		var oldComments = ticket.comments;
		
		var testerValues = $(e.target).find('select');
		_.each(testerValues, function(option) {
			testers.push($(option).val());
		})

		var ticketProperties = {
			comments: $.trim($(e.target).find('[name=comments]').val()) + "\n",
			testers: testers
		};

		Meteor.call('updateTicketCommentDescription', oldComments, 
			ticketProperties, ticket.assemblaId, ticket, function(error) {
				if (error) {
					throwError(error.reason);
				}
			}
		);
	},
	'click .cancel': function() {
		setEditingStatus(this, false, false);
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
		var testers;
		if (this.testers) {
			while (this.testers.length < 3) {
				this.testers.push('');
			}
			testers = this.testers;
			
		}
		else {
			testers = ['', '', ''];
		}
		
		return _.map(testers, function(tester, index) {
			return {index: index, tester: tester};
		});
	}
});

Template.testerUsers.helpers({
	testers: function() {
		selectedTesterEditPage = this.tester.toString();
		var currentMilestone = Milestones.findOne({current: true});
		var browsersObj = BrowserAssignments.findOne({milestoneId: currentMilestone.id})
		
		if (browsersObj) {
			browsersObj = browsersObj.assignments[0];
			var testers = [];
			_.each(browsersObj, function(browser, username) {
				testers.push(username);
			})
			return testers;
		}
	}
})

Template.testerUser.helpers({
	selected: function() {
		return selectedTesterEditPage == this.toString();
	}
})


