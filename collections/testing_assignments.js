TestingAssignments = new Mongo.Collection('testingAssignments');

var getCurrentMilestone = function() {
  var currentMilestoneId = Milestones.findOne({current: true});
  if (currentMilestoneId) {
    currentMilestoneId = currentMilestoneId.id;
  }
  return currentMilestoneId;
};

Meteor.methods({
  resetTesters: function() {
    TestingAssignments.remove();
  },

  assignTestUser: function(user) {
    TestingAssignments.insert({
      milestoneId: getCurrentMilestone(),
      name: user,
      tickets: []
    });
  },

  excuseTester: function(user) {
    TestingAssignments.insert({
      milestoneId: getCurrentMilestone(),
      name: user,
      notTesting: true
    });
  }
});
