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
		var browsers = _.shuffle(browserOptions);
		var locales = _.shuffle(localeOptions);
		
		_.each($('.user'), function(user) {
			if (locales.length === 0) {
				locales = _.shuffle(localeOptions);
			}
			if (browsers.length === 0) {
				browsers = _.shuffle(browserOptions);
			}
			
			$(user).find('.browser').val(browsers.pop());
			$(user).find('.locale').val(locales.pop());
		})
	},
	'click .assign-browsers': function() {
		$('.browser-alert').css("opacity", "0.8");
		Meteor.setTimeout(function() {
			$('.browser-alert').fadeTo(500, 0)
		}, 4000);
		
		var userBrowsers = [];
		var users = $('.user');
		
		for (var i = 0, len = users.length; i < len; i++) {
			var $user = $(users.get(i));
			if (!$user.find('input').prop('checked')) {
				continue;
			}
			
			var user = {};
			user.username = $user.find('span').text();
			user.browser = $user.find('.browser').val();
			user.locale = $user.find('.locale').val();
			userBrowsers.push(user);
		}
		
		Meteor.call('assignBrowsers', userBrowsers);
	},
	'click .assign-tickets': function() {
		$('.ticket-alert').css("opacity", "0.8");
		Meteor.setTimeout(function() {
			$('.ticket-alert').fadeTo(500, 0)
		}, 4000);
		
		Meteor.call('assignTickets', function(error) {
			if (error) {
				throwError(error.reason);
			}
		})
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