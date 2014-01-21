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

// Assembla.populateTicketCollection = function() {
// 	if (!Meteor.settings.API_KEY || !Meteor.settings.API_SECRET) {
// 		throw new Meteor.Error(500, 'Please provide secret/key in Meteor.settings');
// 	}
// 	
// 	TICKETS = 'spaces/shopstyle/tickets';
// 	var url = 'https://api.assembla.com/v1/' + TICKETS + '.json';
// 	var ticketResponse = Meteor.http.get(url, {
// 		params: {
// 			report: 3
// 		},
// 		headers: {
//            'X-Api-Key': Meteor.settings.API_KEY,
//            'X-Api-Secret': Meteor.settings.API_SECRET
// 		}
// 	});
// 	if (ticketResponse.statusCode == 200) {
// 		Tickets.remove({})
// 		_.each(ticketResponse.data, function(ticket) {
// 			Milestones.insert(ticket);	
// 		})
// 	}
// 	else {
// 		throw new Meteor.Error(500, 'Assembla call failed');
// 	}
// }

if (Meteor.isServer) {
	Meteor.startup(Assembla.updateMilestoneCollection);
	// Meteor.startup(Assembla.populateTicketCollection);
}
