Assembla = {
	milestonesUrl: 'https://api.assembla.com/v1/spaces/shopstyle/milestones.json',
	ticketsUrl: 'https://api.assembla.com/v1/spaces/shopstyle/tickets/milestone/',
	usersUrl: 'https://api.assembla.com/v1/spaces/shopstyle/users.json',
	assemblaUrl: 'https://www.assembla.com/spaces/shopstyle/tickets/',
	ticketUrl: 'https://api.assembla.com/v1/spaces/shopstyle/tickets/',
	testscriptsAndcommentRegex: /TESTING([\s\S]*)END/,
	commentRegex: /COMMENTS([\s\S]*?)(?=TESTSCRIPT)/,
	testscriptsRegex: /TESTSCRIPT([\s\S]*)/,
	streamUrl: 'https://api.assembla.com/v1/activity.json',
	_headers: {
		'X-Api-Key': Meteor.settings.API_KEY,
	    'X-Api-Secret': Meteor.settings.API_SECRET
	}
};

Assembla.makeGetRequest = function(url, params) {
	return Meteor.http.get(url, {
		headers: Assembla._headers,
		params: params
	});
}

Assembla.makePutRequest = function(url, data) {
	return Meteor.http.put(url, {
		headers: Assembla._headers,
		data: data
	});
}

Assembla.updateMilestoneCollection = function() {
	if (!Meteor.settings.API_KEY || !Meteor.settings.API_SECRET) {
		throw new Meteor.Error(500, 'Please provide secret/key in Meteor.settings');
	}

	var milestoneResponse = Assembla.makeGetRequest(Assembla.milestonesUrl, {per_page: 50});
	if (milestoneResponse.statusCode == 200) {
		_.each(milestoneResponse.data, function(milestone) {
			Milestones.update({id: milestone.id}, {
				$set: {
					id: milestone.id,
					title: milestone.title
				}}, {upsert: true});
		})
	}
	else {
		throw new Meteor.Error(500, 'Assembla call failed');
	}
	Milestones.remove({ title: { $in:
		["Bug Backlog", "Enhancement Backlog", "Bug Hit List", "Pending Prioritization",
		 "Reports ", "Ongoing Tasks", "Monday Meeting Discussion", "Android Fixes for Mobile Web", "Testing"]
	}});
}

Assembla.extractTicketInfoFromDescription = function(description, ticketNumber) {
	if (description) {
		var innerDescription = description.match(Assembla.testscriptsAndcommentRegex);
		if (innerDescription) {
			Assembla._extractTestscriptsFromInnerDescription(innerDescription[1], ticketNumber);
			return Assembla._extractCommentFromInnerDescription(innerDescription[1]);
		}
	}
	return '';
}

Assembla._extractTestscriptsFromInnerDescription = function(innerDescription, ticketNumber) {
	var testscriptsString = innerDescription.match(Assembla.testscriptsRegex);
	if (!testscriptsString) {
		return;
	}
	var testscripts = testscriptsString[1].split("TESTSCRIPT");

	var testscriptNum = 1;
	var currentTestscripts = [];
	_.each(testscripts, function(testscript) {
		if (testscript.length === 0) {
			return;
		}
		currentTestscripts.push(testscriptNum);
		var testscriptSteps = testscript.replace(/^\s+|\s+$/g, '');
		Testscripts.update({ ticketAssemblaId: ticketNumber, testscriptNum: testscriptNum },
			{ $set:
				{
					steps: testscriptSteps,
					ticketAssemblaId: ticketNumber,
					testscriptNum: testscriptNum
				}
			},
			{ upsert: true }
		);
		testscriptNum += 1;
	});

	Testscripts.remove({ticketAssmblaId: ticketNumber, testscriptNum: {$nin: currentTestscripts}});

	//better way for this??
	Testscripts.update({ passers: { $exists: false }}, { $set: { passers: [] }}, { multi: true });
	Testscripts.update({ failers: { $exists: false }}, { $set: { failers: [] }}, { multi: true });
	Testscripts.update({ status: { $exists: false }}, { $set: { status: '' } }, { multi: true });
}

Assembla._extractCommentFromInnerDescription = function(innerDescription) {
	var comment = innerDescription.match(Assembla.commentRegex);

	if (comment) {
		if (comment[1]) {
			return	comment[1].replace(/^\s+|\s+$/g, '');
		}
		return ' ';
	}
	return '';
}

Assembla.updateSingleTicket = function(ticket) {
	if (ticket == null) {
		return;
	}
	var assemblaUrl = Assembla.assemblaUrl + ticket.number;
	var extractedComments = Assembla.extractTicketInfoFromDescription(ticket.description, ticket.number);
	var statusName = ticket.status;
	if (statusName === 'Verified on Dev') {
		Tickets.update({assemblaId: ticket.number}, {$set: {status: 'pass'}});
	}
	var description = ticket.description;
	if (!description) {
		description = '';
	}

	var noTesting = false;
	if (ticket.custom_fields["No Testing Required"]) {
		if (ticket.custom_fields["No Testing Required"] === "yes") {
			noTesting = true;
		}
	}

	Tickets.update({assemblaId: ticket.number},
		{
			$set:
			{
				assignedToId: ticket.assigned_to_id,
				assemblaId: ticket.number,
				milestoneId: ticket.milestone_id,
				updatedAt: ticket.updated_at,
				summary: ticket.summary,
				statusName: statusName,
				component: ticket.custom_fields.Component,
				browser: ticket.custom_fields.Browser,
				os: ticket.custom_fields.OS,
				assemblaUrl: assemblaUrl,
				description: description,
				comments: extractedComments,
				noTesting: noTesting
			}
		}, { upsert: true }
	);
}

Assembla.populateTicketCollection = function() {
	// TODO: clean this up. not very nice last minute code!
	if (!Meteor.settings.API_KEY || !Meteor.settings.API_SECRET) {
		throw new Meteor.Error(500, 'Please provide secret/key in Meteor.settings');
	}
	var allTickets = [];
	var ticketPage = 1;
	var currentMilestoneId = Milestones.findOne({ current: true }).id;
	var url = Assembla.ticketsUrl + currentMilestoneId + '.json';
	var ticketResponseAll = Assembla.makeGetRequest(url, {per_page: 100, ticket_status: "all", page: ticketPage});

	while ((ticketResponseAll.statusCode).toString()[0] != 204 && ticketResponseAll.data.length === 100) {
		allTickets = allTickets.concat(ticketResponseAll.data);
		ticketPage = ticketPage + 1;
		ticketResponseAll = Assembla.makeGetRequest(url, {per_page: 100, ticket_status: "all", page: ticketPage});
	}

	allTickets = allTickets.concat(ticketResponseAll.data);

	var ticketResponseClosed = Assembla.makeGetRequest(url, {per_page: 100, ticket_status: "closed"});

	//need a way to deal with over 100 tickets. maybe have a counter, and then just ping again looking for page 2
	if ((ticketResponseAll.statusCode).toString()[0] == 2 && (ticketResponseClosed.statusCode).toString()[0] == 2) {
		var ticketResponse = allTickets.concat(ticketResponseClosed.data);

		//hack way to deal with a ticket changing milestones and not changing in the app
		Tickets.update({milestoneId: currentMilestoneId}, {$set: {milestoneId: 0}}, {multi: true});

		//I really don't like how I am querying the database and setting things in a loop...
		_.each(ticketResponse, function(ticket) {
			Assembla.updateSingleTicket(ticket);
		});

		//this is only to make sure tickets have these fields. it might be better to set them when setting
		//properties on the ticket in updateSingleTicket?
		Tickets.update({ passers: { $exists: false }}, { $set: { passers: [] }}, { multi: true });
		Tickets.update({ failers: { $exists: false }}, { $set: { failers: [] }}, { multi: true });
		Tickets.update({ status: { $exists: false }}, { $set: { status: '' } }, { multi: true });
		Tickets.update({ allStepsCompleted: { $exists: false }}, { $set: { allStepsCompleted: [] }}, { multi: true });
		Tickets.update({ noTesting: true }, { $set: { testers: [] }}, { multi: true });
	}
	else {
		throw new Meteor.Error(500, 'Assembla call failed');
	}
}

Assembla.populateAssemblaUsers = function() {
	var userResponse = Assembla.makeGetRequest(Assembla.usersUrl, {per_page: 500});
	if (userResponse.statusCode == 200) {
		AssemblaUsers.remove({});
		_.each(userResponse.data, function(user) {
			AssemblaUsers.insert(user);
		});
	}
	else {
		throw new Meteor.Error(500, 'Assembla call failed');
	}
}

Assembla.watchTicketStream = function() {
	console.log("called ticket stream");
	var stream = Assembla.makeGetRequest(Assembla.streamUrl, {page: 1, per_page: 50}).data;
	if (!stream) {
		return;
	}
	var lastTime = LastTime.findOne();
	if (!lastTime) {
		var date = new Date(stream[stream.length - 1].date);
		lastTime = {date: date};
		LastTime.insert(lastTime);
	}
	lastTime = lastTime.date;

	_.each(stream, function(item) {
		var date = new Date(item.date);
		if (date < lastTime) {
			return;
		}
		if (item.ticket && item.author_name !== "shopstylebot") {
			var url = Assembla.ticketUrl + item.ticket.number + '.json';
			var ticket = Assembla.makeGetRequest(url, {});
			Assembla.updateSingleTicket(ticket.data);
		}
	})
}

Assembla.verifyTicketOnDev = function(assemblaId) {
	if (assemblaId == 4929 || assemblaId == 5026 || assemblaId == 5154 || assemblaId == 6399) {
		return;
	}
	var url = Assembla.ticketUrl + assemblaId + '.json';
	Assembla.makePutRequest(url, {"ticket": {"status": "Verified on Dev"}});
}

if (Meteor.isServer) {
	Meteor.startup(function() {
		Assembla.populateAssemblaUsers();
		Assembla.updateMilestoneCollection();
		Meteor.call('setDefaultMilestone');
	});
}
