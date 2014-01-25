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
			$(e.currentTarget).find('.testscript-steps').show();

			if (confirm("Delete this testscript?")) {
				var id = this._id;
				Testscripts.remove(id);
			}
		}
	},
	'click .btn-test': function(e) {
		e.preventDefault();
		var pass = $(e.currentTarget).filter(".pass").length > 0;
		var fail = $(e.currentTarget).filter(".fail").length > 0;
		if (fail === true) {
			if (Meteor.user()) {
				$(e.currentTarget).parents('.btn-holder').hide();
				$(e.currentTarget).parents('.btn-holder').siblings('.failure-reason').show();	
			} 
			else {
				throwError("You need to login to post test results");
			}
			return;
		}
		if (pass === false && fail === false) {
			pass = '';
		}
		Meteor.call('updateTestscriptResult', this._id, pass, function(error) {
			if (error) {
				throwError(error.reason);
			}
		});
	},
	'keydown, click .btn-test.fail.interior': function(e) {
		if (e.type === 'keydown' && e.which !== 13) {
			return;
		}
		e.preventDefault();
		var failReason = $(e.currentTarget).parents().find('input').val();
		Meteor.call('updateTestscriptResult', this._id, false, failReason, function(error) {
			if (error) {
				throwError(error.reason);
			}
		});
	},
	'click .testscript-results': function(e) {
		e.preventDefault();
		$(e.currentTarget).find('.results-inner').show();
		$(e.currentTarget).find('.results').hide();
	},
	'click .results-inner': function(e) {
		e.preventDefault();
		e.stopPropagation();
		$(e.currentTarget).hide();
		$(e.currentTarget).siblings('.results').show();
	}
})