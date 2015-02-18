userAdmins = Meteor.settings.userAdmins;

try {
  Meteor.users.update({username: {$in: userAdmins}}, {$set: {isAdmin: true}}, {multi: true});
}
catch (error) {

}
