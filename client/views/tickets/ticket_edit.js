Template.ticketEdit.events({
	'change select': function(e, template) {
		var numTesters = $('.num-testers').find('select').val();
		var currentTicketId = template.data._id;
		var testerValues = $('.tester-select').find('select');
		var testers = []
		for (var i = 1; i <= numTesters; i++) {
			var option = testerValues[i - 1];
			if (option && option.value.length > 0) {
				testers.push($(option).val());
			}
		}

		Tickets.update({_id: currentTicketId}, {$set: {testers: testers, numTesters: numTesters}},
			function(error, num) {
				if (error) {
					throwError(error.reason);
				}
			}
		);
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
		var numTesters = this.numTesters ? this.numTesters : 2;
		if (this.testers) {
			while (this.testers.length < numTesters) {
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
	},
	numTesters: function() {
		var numTesters = this.numTesters ? this.numTesters : 2;
		var numTestersRange = [];
		for (var i = 1; i <= 10; i++) {
			var testObj = {};
			testObj.number = i;
			testObj.selected = false;

			if (numTesters == i) {
				testObj.selected = true;
			}

			numTestersRange.push(testObj);
		}
		return numTestersRange;
	}
});

Template.testerUsers.helpers({
	testers: function() {
		selectedTesterEditPage = this.tester.toString();
		var currentMilestone = Milestones.findOne({current: true});
		var browsersObj = BrowserAssignments.findOne({milestoneId: currentMilestone.id})

		if (browsersObj) {
			browsersObj = browsersObj.assignments[0];
			var testers = [''];
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


