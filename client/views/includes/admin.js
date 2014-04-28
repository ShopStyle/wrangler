browserOptions = ["IE8", "IE9", "IE10", "IE11", "Chrome",
	"Firefox", "iPad", "iPhone", "Android", "Safari"];
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
		var browsers = {};
		var locales = {};
		for (var i = 0, len = users.length; i < len; i++) {
			var $user = $(users.get(i));
			if (!$user.find('input').prop('checked')) {
				continue;
			}

			var username = $user.find('span').text();
			browsers[username] = $user.find('.browser').val();
			locales[username] = $user.find('.locale').val();
		}

		Meteor.call('assignBrowsers', browsers, locales);
	},
	'click .assign-tickets': function() {
		if (confirm("Assigning tickets will reset current testers. Proceed?")) {
			Meteor.call('assignTickets', function(error) {
				if (error) {
					throwError(error.reason);
				}
				else {
					$('.ticket-alert').css("opacity", "0.8");
					Meteor.setTimeout(function() {
						$('.ticket-alert').fadeTo(500, 0)
					}, 4000);
				}
			})
		}
	},
	'click .select-update': function(e) {
		Meteor.call('updateTickets');
		$('.update-alert').css("opacity", "0.8");
		Meteor.setTimeout(function() {
			$('.update-alert').fadeTo(500, 0)
		}, 4000);
	}
});

Template.browserLocaleOptions.helpers({
	browserOptions: function() {
		return browserOptions;
	},
	localeOptions: function() {
		return localeOptions;
	},
	isCurrentlyAssigned: function(username, locale) {
		var browser = this.toString();
		var current;
		var choice = locale === true ? 1 : 0;
		var currentMilestone = Milestones.findOne({current: true});
		if (currentMilestone) {
			var current = BrowserAssignments.findOne({milestoneId: currentMilestone.id});
			if (current) {
				current = current.assignments[choice];
				return current[username] === browser;
			}
		}
	}
});

Template.user.helpers({
	userAssignedToTest:	function(username) {
		var currentMilestone = Milestones.findOne({current: true});
		if (currentMilestone) {
			var current = BrowserAssignments.findOne({milestoneId: currentMilestone.id});
			if (current) {
				current = current.assignments[0];
				return current[username] != undefined;
			}
			else {
				return true;
			}
		}
	}
});

Template.userStatus.helpers({
	userTicketsIncomplete: function(username) {
		return Tickets.find({testers: {$in: [username]},
			passers: {$nin: [username]},
			failers: {$nin: [username]}});
	},
	userTicketsPassed: function(username) {
		return Tickets.find({passers: {$in: [username]}});
	},
	userTicketsFailed: function(username) {
		return Tickets.find({failers: {$in: [username]}});
	}
});
