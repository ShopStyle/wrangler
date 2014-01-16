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
	updateTicketStatus: function(ticket) {
		var status = '';
		var passers = [];
		var failers = [];
		var testscripts = Testscripts.find({ ticketId: ticket._id });
		var numTestersReq = ticket.testersReq || 3;
		var numTestScripts = testscripts.count();
		
		testscripts.forEach(function(testscript) {
			failers = failers.concat(testscript.failers);
			passers = passers.concat(testscript.passers);
		});
		
		var numPassers = 0;
		var passersCounts = {};
		passers.forEach(function(elem) {
			if (passersCounts[elem] == null) {
				passersCounts[elem] = 1;
			}
			else {
				passersCounts[elem] += 1;
			}
		});

		for (var key in passersCounts) {
			if (passersCounts[key] >= numTestScripts) {
				numPassers += 1;
			}
		}
		
		passers = _.uniq(passers);
		failers = _.uniq(failers);
		
		if (failers.length > 0) {
			status = 'fail';
		}
		if (numPassers >= numTestersReq) {
			status = 'pass';
		}

		Tickets.update(ticket._id, {
			$set: {
				passers: passers,
				failers: failers,
				status: status
			}
		});
	},
	updateTestscriptResult: function(id, passTest) {
		var user = Meteor.user();
		if (!user) {
			throw new Meteor.Error(401, "You need to login to post test results");
		}

		var testscript = Testscripts.findOne(id);
		var ticket = Tickets.findOne(testscript.ticketId);
		if (passTest === '') {
			Testscripts.update(testscript._id, {
				$pull: { 
					failers: user.username,
					passers: user.username 
				}
			});
		}
		else if (passTest) {
			Testscripts.update(testscript._id, {
				$pull: { failers: user.username },
				$addToSet: { passers: user.username }
			});
		}
		else {
			Testscripts.update(testscript._id, {
				$pull: { passers: user.username },
				$addToSet: { failers: user.username }
			});
		}
		Meteor.call('updateTicketStatus', ticket);
	}
})