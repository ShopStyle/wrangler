var tickets = [
	{
		title: 'I made a change',
		author: 'Korey',
		url: 'http://www.google.com'
	},
	{
		title: 'did a thing',
		author: 'Randy',
		url: 'http://www.google.com'
	},
	{
		title: 'Look a thing',
		author: 'timmy',
		url: 'http://www.google.com'
	}
];

Template.ticketsList.helpers({
	tickets: tickets
})