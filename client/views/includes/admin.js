browserOptions = ["IE8", "IE9", "Chrome", "Firefox", "iPad", "iPhone", "Android", "Safari"];
localeOptions = ["UK", "AU", "JP", "DE", "FR", "CA"];

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
	},
	'click .randomize': function() {
		
	}
});

Template.user.helpers({
	browserOptions: function() {
		return browserOptions;
	},
	localeOptions: function() {
		return localeOptions;
	}
});