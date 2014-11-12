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
    TestingAssignments.remove({milestoneId: getCurrentMilestone()});
  },

  assignTestUser: function(user, browser, locale) {
    TestingAssignments.insert({
      milestoneId: getCurrentMilestone(),
      name: user,
      browser: browser,
      locale: locale,
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
