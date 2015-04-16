TestingAssignments = new Mongo.Collection('testingAssignments');

var getCurrentMilestone = function() {
  var currentMilestone = Milestones.findOne({current: true});
  if (currentMilestone) {
    currentMilestoneName = currentMilestone.name;
  }
  return currentMilestoneName;
};

var getJiraName = function(user) {
  var userObject = Meteor.users.findOne({username: user});
  var jiraName = '';

  if (userObject.profile && userObject.profile.jiraName) {
    jiraName = userObject.profile.jiraName
  }

  return jiraName;
};

Meteor.methods({
  resetTesters: function() {
    TestingAssignments.remove({});
  },

  assignTestUser: function(user) {
    var jiraName = getJiraName(user);

    TestingAssignments.update({name: user},
    {
      milestoneName: getCurrentMilestone(),
      name: user,
      jiraName: jiraName,
      tickets: [],
      notTesting: false
    }, {upsert: true});
  },

  excuseTester: function(user) {
    var jiraName = getJiraName(user);

    TestingAssignments.update({name: user},
    {
      milestoneName: getCurrentMilestone(),
      name: user,
      jiraName: jiraName,
      tickets: [],
      notTesting: true
    }, {upsert: true});
  }
});
