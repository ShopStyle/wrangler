Template.testscript.events({
	'dblclick .text': function(e) {
		if (Meteor.user()) {
			$(e.currentTarget).find('.invisible').show();
			$(e.currentTarget).find('.testscript-steps').hide()
		}
	}
})