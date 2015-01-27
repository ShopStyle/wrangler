TestingAssignments = new Mongo.Collection('testingAssignments');

var getCurrentMilestone = function() {
  var currentMilestone = Milestones.findOne({current: true});
  if (currentMilestone) {
    currentMilestoneName = currentMilestone.name;
  }
  return currentMilestoneName;
};

Meteor.methods({
  resetTesters: function() {
    TestingAssignments.remove({});
  },

  assignTestUser: function(user) {
    TestingAssignments.insert({
      milestoneName: getCurrentMilestone(),
      name: user,
      tickets: [],
      notTesting: false
    });
  },

  excuseTester: function(user) {
    TestingAssignments.insert({
      milestoneName: getCurrentMilestone(),
      name: user,
      tickets: [],
      notTesting: true
    });
  }
});
