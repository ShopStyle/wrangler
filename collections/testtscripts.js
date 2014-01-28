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
		var ticket = Tickets.findOne({ assemblaId: attributes.ticketAssemblaId });

		if (!user) {
			throw new Meteor.Error(401, "You need to login to make a testscript");
		}
			
		if (!attributes.steps)
 			throw new Meteor.Error(422, "Please write some steps");
		
		if (!ticket) {
			throw new Meteor.Error(422, "You must create a testscript for a ticket");
		}
		var testscriptNum =  1;
		var allTestscriptsForTicket = Testscripts.find(
			{ticketAssemblaId: attributes.ticketAssemblaId},
			{sort: {testscriptNum: -1}}
		);
		if (allTestscriptsForTicket.count() > 0) {
			testscriptNum = allTestscriptsForTicket.fetch()[0].testscriptNum + 1;
		} 
		var testscript = _.extend(_.pick(attributes, 
				'ticketAssemblaId', 'steps'), 
			{
				userId: user._id,
				submitted: new Date().getTime(),
				testscriptNum: testscriptNum,
				failers: [],
				passers: []
			}
		);
		Testscripts.insert(testscript);
		Meteor.call('updateTicketStatus', ticket);
		if (Meteor.isServer) {
			Assembla.createTestscript(testscript, ticket);
		}
	},
	updateTicketStatus: function(ticket) {
		var status = '';
		var passers = [];
		var failers = [];
		var testscripts = Testscripts.find({ ticketAssemblaId: ticket.assemblaId });
		var numTestersReq = ticket.testersReq || 3;
		var numTestScripts = testscripts.count();
		
		testscripts.forEach(function(testscript) {
			failers = failers.concat(testscript.failers);
			passers = passers.concat(testscript.passers);
		});
		
		var numPassers = 0;
		var passersCounts = {};
		var allTestscriptPassers = [];
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
				allTestscriptPassers.push(key);
			}
		}

		failers = _.uniq(failers);
		
		if (failers.length > 0) {
			status = 'fail';
		}
		else if (numPassers >= numTestersReq) {
			status = 'pass';
		}

		Tickets.update(ticket._id, {
			$set: {
				status: status,
				failers: failers,
				passers: allTestscriptPassers
			}
		});
	},
	updateTestscriptResult: function(id, passTest, failReason) {
		var user = Meteor.user();
		if (!user) {
			throw new Meteor.Error(401, "You need to login to post test results");
		}

		var testscript = Testscripts.findOne(id);
		var ticket = Tickets.findOne({ assemblaId: testscript.ticketAssemblaId });
		if (passTest === '') {
			Testscripts.update(testscript._id, {
				$pull: { 
					failers: { username: user.username },
					passers: user.username 
				}
			});
		}
		else if (passTest) {
			Testscripts.update(testscript._id, {
				$pull: { failers: { username: user.username }},
				$addToSet: { passers: user.username }
			});
		}
		else {
			createFailNotification(ticket._id, user.username);
			Testscripts.update(testscript._id, {
				$pull: { passers: user.username },
				$addToSet: { 
					failers:  {
						username: user.username,
						failReason: failReason
					}
				}
			});
		}
		Meteor.call('updateTicketStatus', ticket);
	}
});



