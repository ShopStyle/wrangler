Template.testscript.events({
  'click .failure-reason-cancel': function(e) {
    failReason = $(e.currentTarget).parents('.failure-reason');
    failReason.hide();
    failReason.siblings('.btn-holder').show();
  },
  'click .btn-test': function(e, template) {
    e.preventDefault();
    var pass = $(e.currentTarget).filter(".pass").length > 0;
    var fail = $(e.currentTarget).filter(".fail").length > 0;
    if (fail === true) {
      var username = Meteor.user() ? Meteor.user().username : null;
      if (username) {
        var failers = template.data.failers;
        var alreadyFailed = false;
        _.each(failers, function(failerObj) {
          if (failerObj.username === username) {
            alreadyFailed = true;
          }
        });
        if (!alreadyFailed) {
          $(e.currentTarget).parents('.btn-holder').hide();
          $(e.currentTarget).parents('.btn-holder').siblings('.failure-reason').show();
        }
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
    Meteor.call('reOpenAndCommentTicket', this._id, failReason, function(error) {
      if (error) {
        throwError(error.reason);
      }
    });
    $(e.currentTarget).hide()
    $(e.currentTarget).siblings('.btn-holder').show()
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
