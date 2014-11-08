Template.milestones.events({
	'click .select-milestone': function(e) {
		e.preventDefault();
		var milestoneId = $('#milestone-choice').val();
		Meteor.call('setCurrentMilestone', milestoneId, function(error) {
			if (error) {
				throwError(error.reason);
			} else {
				$('.milestone-alert').css("opacity", "0.8");
				Meteor.setTimeout(function() {
					$('.milestone-alert').fadeTo(500, 0);
				}, 4000);
			}
		});
	}
});

Template.milestones.helpers({
	milestones: function() {
		return Milestones.find();
	}
});

Template.milestone.helpers({
	currentMilestone: function() {
		return this.current === true;
	}
});
