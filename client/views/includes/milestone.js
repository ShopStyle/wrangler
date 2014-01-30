Template.milestones.events({
	'click .select-milestone': function(e) {
		e.preventDefault();
		var milestoneId = document.getElementById('milestone-choice').value;
		Meteor.call('setCurrentMilestone', milestoneId);
		$('.milestone-alert').css("opacity", "1");
		Meteor.setTimeout(function() {
			$('.milestone-alert').fadeTo(500, 0)
		}, 4000);
	}
});

Template.milestones.helpers({
	milestones: function() {
		return Milestones.find();
	}
})

Template.milestone.helpers({
	currentMilestone: function() {
		return this.current === true;
	}
})