Template.userMenu.helpers({
  isLoggedIn: function () {
    return !!Meteor.user();
  },
  name: function () {
    return Meteor.user().username;
  },
  profileUrl: function () {
    return getProfileUrl(Meteor.user());
  }
});
