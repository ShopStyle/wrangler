Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() { 
    return [
		Meteor.subscribe('tickets'), 
		Meteor.subscribe('notifications'),
		Meteor.subscribe('milestones'),
		Meteor.subscribe('users'), 
		Meteor.subscribe('stream'),
		Meteor.subscribe('userData'),
		Meteor.subscribe('browserAssignments')
	];
  }
});

TicketsListController = RouteController.extend({
	template: 'ticketsList',
	findOptions: function() {
		var options = {};
		options.statusName = {$in: ["Done", "Verified on Dev"]};
		if (this.status !== undefined) {
			options.status = this.status;
		}
		if (this.assignedTo !== undefined) {
			options.assignedToId = this.assignedTo();
			delete options.statusName;
		}
		if (this.statusName !== undefined) {
			options.statusName = this.statusName;
		}
		if (this.tester !== undefined) {
			var tester = this.tester();
			options.testers = {$in: [tester]};
			options.failers = {$nin: [tester]};
			options.passers = {$nin: [tester]};
		}
		return options;
	},
	data: function() {
		return {
		  tickets: Tickets.find(this.findOptions()),
		  route: this.path
		};
	}
});

FailedTicketsListController = TicketsListController.extend({
	status: 'fail'
});

IncompleteTicketsListController = TicketsListController.extend({
	status: ''
});

PassedTicketsListController = TicketsListController.extend({
	status: 'pass',
	statusName: 'Verified on Dev'
});

ToDoTicketsListController = TicketsListController.extend({
	tester: function() { return Meteor.user().username; }
})

YourTicketsListController = TicketsListController.extend({
	assignedTo: function() { 
		var username = Meteor.user().username; 
		var user = AssemblaUsers.findOne({login: username});
		return user.id;
	}
});

Router.map(function() {
	this.route('ticketsList', {
		path: '/',
		controller: TicketsListController
	});
	
	this.route('failed', {
		path: '/failed',
		controller: FailedTicketsListController
	});
	
	this.route('incomplete', {
		path: '/incomplete',
		controller: IncompleteTicketsListController
	});
	
	this.route('passed', {
		path: '/passed',
		controller: PassedTicketsListController
	});
	
	this.route('yours', {
		path: '/yours',
		controller: YourTicketsListController
	});	
	
	this.route('todo', {
		path: '/to-do',
		controller: ToDoTicketsListController	
	});
	
	this.route('ticketPage', {
		path: '/tickets/:assemblaId',
		waitOn: function() {
			var assemblaId = parseInt(this.params.assemblaId);
			return Meteor.subscribe('testscripts', assemblaId);
		},
		data: function() { 
			var assemblaId = parseInt(this.params.assemblaId);
			return Tickets.findOne({ assemblaId: assemblaId }); 
		}
	});
	
	this.route('admin', {
		path: '/admin',	
	});
});


var requireLogin = function() {
  if (!Meteor.user()) {
    if (Meteor.loggingIn())
      this.render(this.loadingTemplate);
    else
      this.render('ticketsList');
    
    this.stop();
  }
}

Router.before(requireLogin, {only: 'admin'})
Router.before(function() { clearErrors() });

