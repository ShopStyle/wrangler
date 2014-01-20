Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() { 
    return [
		Meteor.subscribe('tickets'), 
		Meteor.subscribe('notifications')
	];
  }
});

TicketsListController = RouteController.extend({
  template: 'ticketsList',
  findOptions: function() {
	  if (this.status !== undefined) {
		  return { status: this.status };
	  }
	  else if (this.dev !== undefined) {
		  return { dev: this.dev() };
	  }
	  return {};
  },
  data: function() {
    return {
      tickets: Tickets.find(this.findOptions()),
	  route: this.path
    };
  }
});

PassedTicketsListController = TicketsListController.extend({
	status: 'pass'
});

FailedTicketsListController = TicketsListController.extend({
	status: 'fail'
});

IncompleteTicketsListController = TicketsListController.extend({
	status: ''
});

YourTicketsListController = TicketsListController.extend({
	dev: function() { return Meteor.user().username; }
});

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
	
	this.route('yours', {
		path: '/yours',
		controller: YourTicketsListController
	});	
	
	this.route('ticketPage', {
		path: '/tickets/:_id',
		waitOn: function() {
			return Meteor.subscribe('testscripts', this.params._id);
		},
		data: function() { 
			return Tickets.findOne(this.params._id) 
		}
	});
	
	this.route('ticketNew', {
		path: '/new-ticket'
	});
});


var requireMilestoneId = function() {
	if (!Session.get('sessionMilestoneSpaceId')) {
		this.render('milestones')
		this.stop();
	}
}


Router.before(requireMilestoneId);
Router.before(function() { clearErrors() });