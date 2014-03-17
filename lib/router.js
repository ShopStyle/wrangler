Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() { 
    return [
		Meteor.subscribe('notifications'),
		Meteor.subscribe('milestones'),
		Meteor.subscribe('users'), 
		Meteor.subscribe('stream'),
		Meteor.subscribe('userData')
	];
  },
  after: function() {
	  var currentMilestone = Milestones.findOne({current: true});
	  Meteor.subscribe('tickets', currentMilestone.id);
	  Meteor.subscribe('browserAssignments', currentMilestone.id);
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
		if (this.assignedTo !== undefined && this.assignedTo !== null) {
			options.assignedToId = this.assignedTo();
			delete options.statusName;
		}
		if (this.statusName !== undefined) {
			options.statusName = this.statusName;
		}
		if (this.tester !== undefined) {
			var tester = this.tester();
			options.testers = {$in: [tester]};
		}
		if (this.noTesting !== undefined) {
			options.noTesting = this.noTesting;
		}
		return options;
	},
	data: function() {
		return {
		  tickets: Tickets.find(this.findOptions()),
		  route: this.path,
		  options: this.findOptions()
	    }
	}
});

FailedTicketsListController = TicketsListController.extend({
	status: 'fail'
});

IncompleteTicketsListController = TicketsListController.extend({
	status: '',
	noTesting: false
});

PassedTicketsListController = TicketsListController.extend({
	status: 'pass'
});

ToDoTicketsListController = TicketsListController.extend({
	tester: function() { return Meteor.user().username; }
})

YourTicketsListController = TicketsListController.extend({
	assignedTo: function() { 
		var username = Meteor.user().username; 
		var user = AssemblaUsers.findOne({login: username});
		if (user) {
			return user.id;	
		}
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
			Meteor.subscribe('testscripts', assemblaId)
		},
		data: function() { 
			var assemblaId = parseInt(this.params.assemblaId);
			return Tickets.findOne({ assemblaId: assemblaId }); 
		}
	});
	
	this.route('ticketEdit', {
		path: 'tickets/:assemblaId/edit',
		waitOn: function() {
			var assemblaId = parseInt(this.params.assemblaId);
			Meteor.subscribe('testscripts', assemblaId)
		},
		data: function() { 
			var assemblaId = parseInt(this.params.assemblaId);
			return Tickets.findOne({ assemblaId: assemblaId }); 
		}
	});
	
	this.route('admin', {
		path: '/admin',	
		before: function() {
			Meteor.call('updateMilestones');
		}
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

