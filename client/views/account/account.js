GIF_OPTIONS = ['cat', 'dog', 'beyonce', 'goat', 'ferret'];

Template.account.helpers({
  getAssembla: function() {
    return Meteor.user().profile.assembaName;
  },

  getHipchat: function() {
    return Meteor.user().profile.hipchatName;
  },

  isCurrentGif: function(option) {
    return Meteor.user().profile.gif === option;
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
      "profile.assembaName": $e.find('[name=assembla]').val(),
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
        throwError('Profile updated');
      }
    });
  }
});
