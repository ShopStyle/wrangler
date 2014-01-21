Meteor.subscribe('milestones');

Template.milestone.events({
	'click a': function(e) {
		e.preventDefault();
		$('#spinner').show();
		$('.milestones').hide();
		Meteor.call('populateTicketCollection', this.space_id);
	}
});

Template.milestones.helpers({
	milestones: function() {
		return Milestones.find();
	}
})