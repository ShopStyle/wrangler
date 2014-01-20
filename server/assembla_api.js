// ACTIVITY = 'activity'
// TICKET = 'spaces/%s/tickets'
// TICKETS = 'spaces/%s/tickets/%i'
// USERS = 'spaces/%s/users'
// MILESTONES = 'spaces/%s/milestones'
// COMPONENTS = 'spaces/%s/ticket_components'


Meteor.methods({
	updateMilestoneCollection: function() {
		var MILESTONES = 'spaces/shopstyle/milestones';
		var url = 'https://api.assembla.com/v1/' + MILESTONES + '.json';
		try {
			var result = HTTP.get(url, {
				headers: {
	               'X-Api-Key': API_CODES.KEY,
	               'X-Api-Secret': API_CODES.SECRET
				}
			});
			return true;
		}
		catch (e) {
			return false;
		}
		debugger;
		
	}
})