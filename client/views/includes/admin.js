Template.admin.helpers({
	streamOn: function() {
		var stream = Stream.findOne();
		if (stream){
			return Stream.findOne().on;
		}
		else {
			return false;
		}
	},
	users: function() {
		return Meteor.users.find();
	}
});

Template.admin.events({
	'click .streamer': function() {
		Meteor.call('handleInterval');
	}
});

Template.user.helpers({
	browserOptions: function() {
		return ["IE8", "IE9", "Chrome", "Firefox", "iPad", "iPhone", "Android", "Safari"];
	},
	localeOptions: function() {
		return ["UK", "AU", "JP", "DE", "FR", "CA"];
	}
});