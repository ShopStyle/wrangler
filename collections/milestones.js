Milestones = new Meteor.Collection('milestones');
if (Meteor.isServer) {
	Milestones._ensureIndex({ "id": 1 }, { unique: true });
}

Meteor.methods({
	setCurrentMilestone: function(milestoneId) {
		Milestones.update({current: true, id: {$nin: [milestoneId]}}, {$set: {current: false}}, {multi: true});
		Milestones.update({id: parseInt(milestoneId)}, {$set: {current: true}});
		if (Meteor.isServer) {
			Assembla.populateTicketCollection();			
		}	
	},
	setDefaultMilestone: function() {
		Milestones.update({title: "Testing App"}, {$set: {current: true}});		
	}
})