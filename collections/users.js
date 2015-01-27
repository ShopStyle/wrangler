Meteor.methods({
  deleteUser: function(user) {
    Meteor.users.remove({username: user});
  }
});
