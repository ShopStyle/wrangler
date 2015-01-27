GIF_OPTIONS = ['cat', 'dog', 'beyonce', 'goat', 'ferret', 'sloth'];

Template.account.helpers({
  getJira: function() {
    if (Meteor.user.profile) {
      return Meteor.user().profile.jiraName;
    } else if (Meteor.user()){
      return Meteor.user().username;
    } else {
      return ''
    }
  },

  getHipchat: function() {
    if (Meteor.user.profile) {
      return Meteor.user().profile.hipchatName;
    } else if (Meteor.user()){
      return Meteor.user().username
    } else {
      return ''
    }
  },

  isCurrentGif: function(option) {
    if (Meteor.user().profile) {
      return Meteor.user().profile.gif === option;
    } else {
      return false;
    }
  },

  getGifOptions: function() {
    return GIF_OPTIONS;
  }
});

Template.account.events({
  'submit #account-form': function(e) {
    e.preventDefault();

    clearErrors();
    var user = Meteor.user();
    if(!user)
      throwError(i18n.t('You must be logged in.'));

    var $e = $(e.target);

    var update = {
      "profile.jiraName": $e.find('[name=jira]').val(),
      "profile.hipchatName": $e.find('[name=hipchat]').val(),
      "profile.gif": $e.find('[name=gif]').val()
    };

    Session.set('gifResponse', {msg: 'wait'});

    Meteor.users.update({_id: user._id}, {
      $set: update
    }, function(error){
      if (error){
        throwError(error.reason);
      } else {
        $('.update-success').css('opacity', '1');
        Meteor.setTimeout(function() {
          $('.update-success').fadeTo(500, 0);
        }, 4000);
      }
    });
  }
});
