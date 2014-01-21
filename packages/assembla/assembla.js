// // ACTIVITY = 'activity'
// // TICKET = 'spaces/%s/tickets'
// // TICKETS = 'spaces/%s/tickets/%i'
// // USERS = 'spaces/%s/users'
// // MILESTONES = 'spaces/%s/milestones'
// // COMPONENTS = 'spaces/%s/ticket_components'

Assembla = {};

Assembla.updateMilestoneCollection = function() {
	if (!Meteor.settings.API_KEY || !Meteor.settings.API_SECRET) {
		throw new Meteor.Error(500, 'Please provide secret/key in Meteor.settings');
	}
	
	var MILESTONES = 'spaces/shopstyle/milestones';
	var url = 'https://api.assembla.com/v1/' + MILESTONES + '.json';
	var milestoneResponse = Meteor.http.get(url, {
		headers: {
           'X-Api-Key': Meteor.settings.API_KEY,
           'X-Api-Secret': Meteor.settings.API_SECRET
		}
	});
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

Assembla.populateTicketCollection = function() {
	if (!Meteor.settings.API_KEY || !Meteor.settings.API_SECRET) {
		throw new Meteor.Error(500, 'Please provide secret/key in Meteor.settings');
	}
	//make an api call to only the "current" milestone, set by admin, get new tickets from 
	//current milestone on interval, update test scripts manually, update milestones automatically
	
	
	// var currentSpaceId = Milestones.findOne({ current: true }).space_id;
	var currentMilestoneId = "4853043"; // stand in for development, 1/28/2014
	var ticketsUrl = 'spaces/shopstyle/tickets/milestone/' + currentMilestoneId;
	var url = 'https://api.assembla.com/v1/' + ticketsUrl + '.json';
	var ticketResponse = Meteor.http.get(url, {
		headers: {
           'X-Api-Key': Meteor.settings.API_KEY,
           'X-Api-Secret': Meteor.settings.API_SECRET
		}
	});
	if (ticketResponse.statusCode == 200) {
		//I really don't like how I am qerying the database and setting things in a loop...
		_.each(ticketResponse.data, function(ticket) {
			var assemblaUrl = 'https://www.assembla.com/spaces/shopstyle/tickets/' + ticket.number;
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
					assemblaUrl: assemblaUrl
				}
				}, 
				{ upsert: true }
			);	
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
	var assemblaUrl = 'https://api.assembla.com/v1/spaces/shopstyle/users.json';
	var userResponse = Meteor.http.get(assemblaUrl, {
		headers: {
           'X-Api-Key': Meteor.settings.API_KEY,
           'X-Api-Secret': Meteor.settings.API_SECRET
		}
	});
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
