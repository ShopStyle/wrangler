Template.admin.helpers({
	streamOn: function() {
		var stream = Stream.findOne();
		if (stream){
			return Stream.findOne().on;
		}
		else{
			return false;
		}
	}
});

Template.admin.events({
	'click .streamer': function() {
		Meteor.call('handleInterval');
	}
})