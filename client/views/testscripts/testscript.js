Template.testscript.events({
	'dblclick .text': function(e) {
		if (Meteor.user()) {
			setEditingStatus(this, true, true);
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
	'keydown .failure-reason, click .btn-test.fail.interior': function(e) {
		if (e.type === 'keydown' && e.which !== 13) {
			return;
		}
		e.preventDefault();
		var failReason = $(e.currentTarget).parents().first().find('input').val();
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
});

Template.testscript.helpers({
	stepsInvisible: function() {
		var testscript = this;
		if (getEditingStatus(testscript, true)) {
			return 'invisible';
		}
	}
});

Template.testscript.preserve({
	'textarea[name]': function(node) {
		return node.name;
	},
	'select[name]': function(node) {
		return node.name;
	}
});

Template.testscriptEdit.events({
	'click .btn-new-testscript.edit.update': function(e) {
		if (Meteor.user()) {
			var testscript = this;
			setEditingStatus(testscript, true, false)
			var steps = $(e.currentTarget).siblings('textarea').val();
			Testscripts.update(testscript._id, { $set: { steps: $.trim(steps) }});
			
			Meteor.call('editTestscriptTicketDescription', id);
		}
	},
	'click .btn-new-testscript.edit.delete': function(e) {
		if (Meteor.user()) {
			if (confirm("Delete this testscript?")) {
				var testscript = this;
				setEditingStatus(testscript, true, false);
				Meteor.call('editTestscriptTicketDescription', id, true);
			}
		}
	},
	'click .cancel': function() {
		var testscript = this;
		setEditingStatus(testscript, true, false);
		$('.editor').hide();
	}
});

Template.testscriptEdit.helpers({
	editingInvisible: function() {
		var testscript = this;
		if (!getEditingStatus(testscript, true)) {
			return 'invisible';
		}
	}
});

Template.testscriptEdit.preserve({
	'textarea[name]': function(node) {
		return node.name;
	}
});

setEditingStatus = function(testscript, isTestscript, status) {
	var sessionVariable = _getSessionVariable(testscript, isTestscript);
	Session.set(sessionVariable, status);
}

getEditingStatus = function(testscript, isTestscript) {
	var sessionVariable = _getSessionVariable(testscript, isTestscript);
	return Session.get(sessionVariable);
}

_getSessionVariable = function(testscript, isTestscript) {
	var prefix = 'currentlyEditingTestscript-';
	if (!isTestscript) {
		prefix = 'currentlyEditingTicket-'
	}
	return 'currentlyEditingTestscript-' + testscript._id;
}