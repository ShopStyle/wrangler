// if (Tickets.find().count() === 0) {
// 	var now = new Date().getTime();
// 	
// 	var koreyId = Meteor.users.insert({
// 		profile: { name: 'Korey K'}
// 	});
// 	var korey = Meteor.users.findOne(koreyId);
// 	
// 	var frankId = Meteor.users.insert({
// 		profile: { name: 'Frank'}
// 	});
// 	var frank = Meteor.users.findOne(frankId);
// 	
// 	var ticket1Id = Tickets.insert({
// 		title: "Get some stuff breh",
// 		userId: korey._id,
// 		dev: korey.profile.name,
// 		devEmail: "kkassir@popsugar.com",
// 		url: "http://google.com",
// 		status: '',
// 		component: "mobile"
// 	});
// 	
// 	var ticket2Id = Tickets.insert({
// 		title: "I dunno some more ticket",
// 		userId: korey._id,
// 		dev: korey.profile.name,
// 		devEmail: "kkassir@popsugar.com",
// 		url: "http://google.com",
// 		status: '',
// 	});
// 	
// 	var ticket3Id = Tickets.insert({
// 		title: "i am a kitty :)",
// 		userId: frank._id,
// 		dev: frank.profile.name,
// 		devEmail: "frank@popsugar.com",
// 		url: "http://google.com",
// 		status: '',
// 	});
// 	
// 	Testscripts.insert({
// 		steps: "1. take a drive \n 2. something else \n 3. voila!",
// 		ticketId: ticket1Id,
// 	});
// 	
// 	Testscripts.insert({
// 		steps: "1. take a drive \n 2. something else \n 3. voila!",
// 		ticketId: ticket1Id,
// 	});
// 	
// 	Testscripts.insert({
// 		steps: "1. take a drive \n 2. something else \n 3. voila!",
// 		ticketId: ticket2Id,
// 	});
// 	
// 	Testscripts.insert({
// 		steps: "1. take a drive \n 2. something else \n 3. voila!",
// 		ticketId: ticket3Id,
// 	});
// }

if (Milestones.find().count() === 0) {
	Milestones.insert({
		title: "1/21/2014 Release",
		assemblaId: 1234
	});
	Milestones.insert({
		title: "1/28/2014 Release",
		assemblaId: 12345678
	});
}