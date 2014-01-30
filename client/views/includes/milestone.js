Template.milestones.events({
	'click .select-milestone': function(e) {
		e.preventDefault();
		var milestoneId = document.getElementById('milestone-choice').value;
		Meteor.call('setCurrentMilestone', milestoneId);
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