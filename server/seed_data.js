if (Tickets.find().count() === 0) {
	var now = new Date().getTime();
	
	var koreyId = Meteor.users.insert({
		profile: { name: 'Korey K'}
	});
	var korey = Meteor.users.findOne(koreyId);
	
	var frankId = Meteor.users.insert({
		profile: { name: 'Frank'}
	});
	var frank = Meteor.users.findOne(frankId);
	
	var ticket1Id = Tickets.insert({
		title: "Get some stuff breh",
		userId: korey._id,
		dev: korey.profile.name,
		devEmail: "kkassir@popsugar.com",
		url: "http://google.com",
		pass: false,
		incomplete: true,
		component: "mobile"
	});
	
	var ticket2Id = Tickets.insert({
		title: "I dunno some more ticket",
		userId: korey._id,
		dev: korey.profile.name,
		devEmail: "kkassir@popsugar.com",
		url: "http://google.com",
		pass: true,
		incomplete: false
	});
	
	var ticket3Id = Tickets.insert({
		title: "i am a kitty :)",
		userId: frank._id,
		dev: frank.profile.name,
		devEmail: "frank@popsugar.com",
		url: "http://google.com",
		pass: false,
		incomplete: true
	});
	
	Testscripts.insert({
		steps: "1. take a drive 2. something else 3. voila!",
		ticketId: ticket1Id,
		pass: false
	});
	
	Testscripts.insert({
		steps: "1. take a drive \n 2. something else \n 3. voila!",
		ticketId: ticket1Id,
		pass: true
	});
	
	Testscripts.insert({
		steps: "1. take a drive \n 2. something else \n 3. voila!",
		ticketId: ticket2Id,
		pass: false
	});
	
	Testscripts.insert({
		steps: "1. take a drive \n 2. something else \n 3. voila!",
		ticketId: ticket3Id,
		pass: false
	});
}