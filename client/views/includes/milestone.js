Meteor.subscribe('milestones');

Template.milestone.events({
	'click a': function(e) {
		e.preventDefault();
		Session.set('sessionMilestoneSpaceId', this.space_id);
	}
});

Template.milestones.helpers({
	milestones: function() {
		return Milestones.find();
	}
})