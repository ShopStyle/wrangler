Milestones = new Meteor.Collection('milestones');
if (Meteor.isServer) {
  // Milestones._dropIndex({ "id": 1 }, { unique: true });
}

Meteor.methods({
  setCurrentMilestone: function(milestoneId) {
    Milestones.update({}, {$set: {current: false}}, {multi: true});
    Milestones.update({id: milestoneId}, {$set: {current: true}});
    if (Meteor.isServer) {
      Jira.populateTicketCollection();
    }
  },
  setDefaultMilestone: function() {
    if (!Milestones.findOne({current: true})) {
      Milestones.update({}, {$set: {current: true}});
    }
    if (Stream.find().count() !== 1) {
      Stream.remove({});
      Stream.insert({on: false});
    }
  },
  updateMilestones: function() {
    if (Meteor.isServer) {
      Jira.updateMilestoneCollection();
    }
  }
});
