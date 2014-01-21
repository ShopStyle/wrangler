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
	var currentSpaceId = "cbm-TcMkOr4OkpacwqjQYw"; // stand in for development, 1/28/2014
	var ticketsUrl = 'spaces/' + currentSpaceId + '/tickets';
	var url = 'https://api.assembla.com/v1/' + ticketsUrl + '.json';
	var ticketResponse = Meteor.http.get(url, {
		params: {
			report: 3
		},
		headers: {
           'X-Api-Key': Meteor.settings.API_KEY,
           'X-Api-Secret': Meteor.settings.API_SECRET
		}
	});
	if (ticketResponse.statusCode == 200) {
		_.each(ticketResponse.data, function(ticket) {
			Tickets.update({ assemblaId: ticket.id }, {
				$set: {
					assignedToId: ticket.assigned_to_id,
					assemblaId: ticket.id,
					spaceId: ticket.space_id,
					customFields: ticket.custom_fields,
					updatedAt: ticket.updated_at,
					summary: ticket.summary,
					statusName: ticket.status_name
				}
				}, 
				{ upsert: true }
			);	
		})
	}
	else {
		throw new Meteor.Error(500, 'Assembla call failed');
	}
}

if (Meteor.isServer) {
	Meteor.startup(Assembla.updateMilestoneCollection);
	Meteor.startup(Assembla.populateTicketCollection);
}
