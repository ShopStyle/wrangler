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
	
	var ticket1 = Tickets.insert({
		title: "Get some stuff breh",
		userId: korey._id,
		dev: korey.profile.name,
		url: "http://google.com",
		pass: false
	});
	
	var ticket2 = Tickets.insert({
		title: "I dunno some more ticket",
		userId: korey._id,
		dev: korey.profile.name,
		url: "http://google.com",
		pass: true
	});
	
	var ticket1 = Tickets.insert({
		title: "i hate dis :)",
		userId: frank._id,
		dev: frank.profile.name,
		url: "http://google.com",
		pass: false
	})
}