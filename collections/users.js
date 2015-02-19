Meteor.methods({
  deleteUser: function(user) {
    Meteor.users.remove({username: user});
  },
  resetUserPassword: function(username, newPassword) {
    if (Meteor.user().isAdmin) {
      var user = Meteor.users.findOne({username: username});
      if (user) {
        Accounts.setPassword(user["_id"], newPassword);
      }
    }
  }
});
