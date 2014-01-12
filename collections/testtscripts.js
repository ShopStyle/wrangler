Testscripts = new Meteor.Collection('testscripts');

Meteor.methods({
	createNewTestscript: function(attributes) {
		var user = Meteor.user();
		var ticket = Tickets.findOne(attributes.ticketId);

		if (!user) {
			throw new Meteor.Error(401, "You need to login to make a testscript");
		}
			
		// if (!commentAttributes.body)
// 			throw new Meteor.Error(422, "Please write some content");
		
		if (!ticket) {
			throw new Meteor.Error(422, "You must create a testscript for a ticket");
		}
			
		var testscript = _.extend(_.pick(attributes, 
				'ticketId', 'steps', 'result', 'expectedOutcome'), 
			{
				userId: user._id,
				author: user.username,
				submitted: new Date().getTime()
			}
		);
		testscript._id = Testscripts.insert(testscript);
		return testscript._id;
	}
})