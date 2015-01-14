userAdmins = Meteor.settings.userAdmins;

Meteor.users.update({username: {$in: userAdmins}}, {$set: {isAdmin: true}}, {multi: true});
