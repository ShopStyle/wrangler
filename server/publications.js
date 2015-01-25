//this is used to turn off and on the stream from assembla
intervalHandle = null;

Meteor.publish('tickets', function() {
  var currentMilestone = Milestones.findOne({current: true});
  if (currentMilestone) {
    currentMilestone = currentMilestone.id;
  }
  else {
    return Tickets.findOne();
  }

  // return Tickets.find({$or: [
  //   { "fixVersions.id": currentMilestone, statusName: {$in: ["Done", "Verified on Dev"]} },
  //   {isRegression: true}
  // ]});

  return Tickets.find({jiraId: {$nin: [null, undefined]}});
});

// Meteor.publish('users', function() {
//   return JiraUsers.find({}, { fields: { login: 1, id: 1 }});
// });

Meteor.publish('testscripts', function(ticketJiraId) {
  return Testscripts.find({ ticketJiraId: ticketJiraId }, {sort: {testscriptNum: 1}});
});

Meteor.publish('milestones', function() {
  return Milestones.find();
});

Meteor.publish('stream', function() {
  return Stream.find();
});

Meteor.publish('userData', function() {
  return Meteor.users.find({}, {fields: {username: 1, isAdmin: 1}});
});

Meteor.publish('testingAssignments', function() {
  return TestingAssignments.find();
});
