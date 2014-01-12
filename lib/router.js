Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() { 
    return [Meteor.subscribe('tickets'), Meteor.subscribe('testscripts')]
  }
});

TicketsListController = RouteController.extend({
  template: 'ticketsList',
  findOptions: function() {
	  if (this.pass !== undefined) {
		  return {pass: this.pass};
	  }
	  // else if (this.dev) {
	  // 		  return {dev: {$ne: this.dev}};
	  // }
	  else if (this.incomplete) {
		  return {incomplete: true};
	  }
	  return {};
  },
  data: function() {
    return {
      tickets: Tickets.find(this.findOptions()),
    };
  }
});

PassedTicketsListController = TicketsListController.extend({
	pass: true
});

FailedTicketsListController = TicketsListController.extend({
	pass: false
});

IncompleteTicketsListController = TicketsListController.extend({
	incomplete: true
});

// TodoTicketsListController = TicketsListController.extend({
// 	dev: Meteor.user().username
// });

Router.map(function() {
	this.route('ticketsList', {
		path: '/',
		controller: TicketsListController
	});
	
	this.route('passed', {
		path: '/passed',
		controller: PassedTicketsListController
	});
	
	this.route('failed', {
		path: '/failed',
		controller: FailedTicketsListController
	});
	
	this.route('incomplete', {
		path: '/incomplete',
		controller: IncompleteTicketsListController
	});
	
	// this.route('toDo', {
	// 	path: '/to-do',
	// 	controller: TodoTicketsListController
	// });	
});