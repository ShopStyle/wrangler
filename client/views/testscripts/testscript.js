Template.testscript.events({
	'dblclick .text': function(e) {
		if (Meteor.user()) {
			$(e.currentTarget).find('.invisible').show();
			$(e.currentTarget).find('.testscript-steps').hide()
		}
	},
	'click .btn-new-testscript.edit.update': function(e) {
		if (Meteor.user()) {
			$(e.currentTarget).find('.invisible').hide();
			$(e.currentTarget).find('.testscript-steps').show()
			var steps = $(e.currentTarget).siblings('textarea').val();
			var id = this._id;
			Testscripts.update(id, { $set: { steps: steps }});
		}
	},
	'click .btn-new-testscript.edit.delete': function(e) {
		if (Meteor.user()) {
			$(e.currentTarget).find('.invisible').hide();
			$(e.currentTarget).find('.testscript-steps').show()

			if (confirm("Delete this testscript?")) {
				var id = this._id;
				Testscripts.remove(id);
			}
		}
	}
})