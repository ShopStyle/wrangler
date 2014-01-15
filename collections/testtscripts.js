Testscripts = new Meteor.Collection('testscripts');

Testscripts.allow({
	update: function() {
		return Meteor.user();
	},
	remove: function() {
		return Meteor.user();
	}
});

Meteor.methods({
	createNewTestscript: function(attributes) {
		var user = Meteor.user();
		var ticket = Tickets.findOne(attributes.ticketId);

		if (!user) {
			throw new Meteor.Error(401, "You need to login to make a testscript");
		}
			
		if (!attributes.steps)
 			throw new Meteor.Error(422, "Please write some steps");
		
		if (!ticket) {
			throw new Meteor.Error(422, "You must create a testscript for a ticket");
		}
			
		var testscript = _.extend(_.pick(attributes, 
				'ticketId', 'steps'), 
			{
				userId: user._id,
				submitted: new Date().getTime()
			}
		);
		testscript._id = Testscripts.insert(testscript);
		return testscript._id;
	},
	updateTestscriptResult: function(id, passTest) {
		var user = Meteor.user();
		if (!user) {
			throw new Meteor.Error(401, "You need to login to post test results");
		}
		var testscript = Testscripts.findOne(id);
		if (passTest === '') {
			Testscripts.update(testscript._id, {
				$pull: { 
					failers: user._id,
					passers: user._id 
				}
			});
		}
		else if (passTest) {
			Testscripts.update(testscript._id, {
				$pull: { failers: user._id },
				$addToSet: { passers: user._id }
			});
		}
		else {
			Testscripts.update(testscript._id, {
				$pull: { passers: user._id },
				$addToSet: { failers: user._id }
			});
		}
		
	},
})