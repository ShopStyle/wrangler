Meteor.subscribe('milestones');

Template.milestone.events({
	'click a': function(e) {
		e.preventDefault();
		Session.set('sessionMilestoneId', this.assemblaId);
	}
});

Template.milestones.helpers({
	milestones: function() {
		return Milestones.find();
	}
})