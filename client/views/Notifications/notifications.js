Template.notifications.helpers({
	notifications: function() {
		var notes = Notifications.find({ 
			dev: Meteor.user().username,
			read: false
		});
		return notes;
	},
	notificationCount: function() {
		var notes = Notifications.find({ 
			dev: Meteor.user().username, 
			read: false 
		});
		return notes.count();
	}
});

Template.notification.helpers({
	notificationPostPath: function() {
		return Router.routes.ticketPage.path({ assemblaId: this.assemblaId });
	}
});

Template.notification.events({
	'click a': function() {
		Notifications.update(this._id, { 
			$set: { read: true } 
		});
	}
});

Template.notifications.events({
	'click .dropdown-toggle': function(e) {
		e.preventDefault();
		e.stopPropagation();
		$('.notification.dropdown-menu').show();
		$(document).on('click', function(e) {
			$('.notification.dropdown-menu').hide();
			$(document).off('click');
		})
	}
});