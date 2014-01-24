// // ACTIVITY = 'activity'
// // TICKET = 'spaces/%s/tickets'
// // TICKETS = 'spaces/%s/tickets/%i'
// // USERS = 'spaces/%s/users'
// // MILESTONES = 'spaces/%s/milestones'
// // COMPONENTS = 'spaces/%s/ticket_components'

Assembla = {
	milestonesUrl: 'https://api.assembla.com/v1/spaces/shopstyle/milestones.json',
	ticketsUrl: 'https://api.assembla.com/v1/spaces/shopstyle/tickets/milestone/',
	usersUrl: 'https://api.assembla.com/v1/spaces/shopstyle/users.json',
	assemblaUrl: 'https://www.assembla.com/spaces/shopstyle/tickets/'
};

Assembla.testscriptsAndcommentRegex = /##TESTING\n*([\s\S]*)##END$/i;
Assembla.commentRegex = /#COMMENTS\n*([\s\S]*)#TESTSCRIPTS/i;
Assembla.testscriptsRegex = /#TESTSCRIPTS\n*([\s\S]*)/i;
Assembla.singleTestscriptRegex = /#(\d+)([\s\S]*)/i

Assembla.makeApiRequest = function(url) {
	return Meteor.http.get(url, {
		headers: {
	       'X-Api-Key': Meteor.settings.API_KEY,
	       'X-Api-Secret': Meteor.settings.API_SECRET
		},
		params: {
			per_page: 500
		}
	});
}

Assembla.updateMilestoneCollection = function() {
	if (!Meteor.settings.API_KEY || !Meteor.settings.API_SECRET) {
		throw new Meteor.Error(500, 'Please provide secret/key in Meteor.settings');
	}
	
	var milestoneResponse = Assembla.makeApiRequest(Assembla.milestonesUrl);
	if (milestoneResponse.statusCode == 200) {
		Milestones.remove({})
		_.each(milestoneResponse.data, function(milestone) {
			Milestones.insert(milestone);	
		})
	}
	else {
		throw new Meteor.Error(500, 'Assembla call failed');
	}
	Milestones.remove({ title: { $in: 
		["Bug Backlog", "Enhancement Backlog", "Bug Hit List", "Pending Prioritization",
		 "Reports ", "Ongoing Tasks", "Monday Meeting Discussion", "Android Fixes for Mobile Web"] 
	}});
}

Assembla.extractTicketInfoFromDescription = function(description, ticketNumber) {
	if (description) {
		var innerDescription = description.match(Assembla.testscriptsAndcommentRegex);
		if (innerDescription) {
			Assembla._extractTestscriptsFromInnerDescription(innerDescription[1]);
			return Assembla._extractCommentFromInnerDescription(innerDescription[1]);
		}
	}
	return '';
}

Assembla._extractTestscriptsFromInnerDescription = function(innerDescription, ticketNumber) {
	//split testscripts on #ENDSCRIPT
	return '';
}	
	
Assembla._extractCommentFromInnerDescription = function(innerDescription) {
	var comment = innerDescription.match(Assembla.commentRegex);
	return comment[1];
}

Assembla.updateSingleTicket = function(ticket) {
	var assemblaUrl = Assembla.assemblaUrl + ticket.number;
	var description = Assembla.extractTicketInfoFromDescription(ticket.description);
	Tickets.update({ assemblaId: ticket.number }, {
		$set: {
			assignedToId: ticket.assigned_to_id,
			assemblaId: ticket.number,
			milestoneId: ticket.milestone_id,
			updatedAt: ticket.updated_at,
			summary: ticket.summary,
			statusName: ticket.status,
			component: ticket.custom_fields.Component,
			browser: ticket.custom_fields.Browser,
			os: ticket.custom_fields.OS,
			assemblaUrl: assemblaUrl,
			comments: description
		}
		}, 
		{ upsert: true }
	);	
}

Assembla.populateTicketCollection = function() {
	if (!Meteor.settings.API_KEY || !Meteor.settings.API_SECRET) {
		throw new Meteor.Error(500, 'Please provide secret/key in Meteor.settings');
	}
	
	// var currentMilestoneId = Milestones.findOne({ current: true }).id;
	var currentMilestoneId = "4853043"; // stand in for development, 1/28/2014
	var url = Assembla.ticketsUrl + currentMilestoneId + '.json';
	var ticketResponse = Assembla.makeApiRequest(url);
	
	if (ticketResponse.statusCode == 200) {
		//I really don't like how I am qerying the database and setting things in a loop...
		_.each(ticketResponse.data, function(ticket) {
			Assembla.updateSingleTicket(ticket);
		});
		Tickets.update({ 
			passers: { $exists: false }, 
			failers: { $exists: false }, 
			status: { $exists: false }
		}, {
			$set: {
				passers: [],
				failers: [],
				status: ''
			}
		}, { multi: true });
	}
	else {
		throw new Meteor.Error(500, 'Assembla call failed');
	}
}

Assembla.populateAssemblaUsers = function() {
	var userResponse = Assembla.makeApiRequest(Assembla.usersUrl);
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

if (Meteor.isServer) {
	Meteor.startup(function() {
		Assembla.populateAssemblaUsers();
		Assembla.updateMilestoneCollection();
		Assembla.populateTicketCollection();
	});
}
