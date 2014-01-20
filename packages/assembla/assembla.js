// // ACTIVITY = 'activity'
// // TICKET = 'spaces/%s/tickets'
// // TICKETS = 'spaces/%s/tickets/%i'
// // USERS = 'spaces/%s/users'
// // MILESTONES = 'spaces/%s/milestones'
// // COMPONENTS = 'spaces/%s/ticket_components'
// 
// 
// Meteor.methods({
// 	updateMilestoneCollection: function() {
// 		var MILESTONES = 'spaces/shopstyle/milestones';
// 		var url = 'https://api.assembla.com/v1/' + MILESTONES + '.json';
// 		try {
// 			var result = HTTP.get(url, {
// 				headers: {
// 	               'X-Api-Key': API_CODES.KEY,
// 	               'X-Api-Secret': API_CODES.SECRET
// 				}
// 			});
// 			return true;
// 		}
// 		catch (e) {
// 			return false;
// 		}
// 		debugger;
// 		
// 	}
// })

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
		_.each(milestoneResponse.data, function(milestone) {
			Milestones.insert(milestone);	
		})
	}
	else {
		throw new Meteor.Error(500, 'Assembla call failed');
	}
}

Meteor.startup(Assembla.updateMilestoneCollection);