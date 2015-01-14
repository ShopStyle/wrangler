//this is used to turn off and on the stream from assembla
intervalHandle = null;

Meteor.publish('tickets', function() {
  var currentMilestone = Milestones.findOne({current: true});
  if (currentMilestone) {
    currentMilestone = currentMilestone.id;
  }
  else {
    currentMilestone = 5194263;
  }
  return Tickets.find({ milestoneId: currentMilestone, statusName: {$in: ["Done", "Verified on Dev"]} });
});

Meteor.publish('users', function() {
  return AssemblaUsers.find({}, { fields: { login: 1, id: 1 }});
});

Meteor.publish('testscripts', function(assemblaId) {
  return Testscripts.find({ ticketAssemblaId: assemblaId },
    {sort: {testscriptNum: 1}});
});

Meteor.publish('milestones', function() {
  return Milestones.find();
});

Meteor.publish('stream', function() {
  return Stream.find();
});

Meteor.publish('userData', function() {
  return Meteor.users.find({}, {fields: {username: 1}});
});

Meteor.publish('testingAssignments', function() {
  return TestingAssignments.find();
});
