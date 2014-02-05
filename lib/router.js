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
		options.statusName = "Done";
		if (this.status !== undefined) {
		  options.status = this.status;
		}
		if (this.dev !== undefined) {
		  options.dev = this.dev();
		}
		if (this.statusName !== undefined) {
		  options.statusName = this.statusName;
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

YourTicketsListController = TicketsListController.extend({
	dev: function() { return Meteor.user().username; },
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


// var requireMilestoneId = function() {
// 	if (!Milestones.findOne({current: true})) {
// 		this.render('admin')
// 		this.stop();
// 	}
// }
// // var requireLogin = function() {
// //   if (!Meteor.user()) {
// //     if (Meteor.loggingIn())
// //       this.render(this.loadingTemplate);
// //     else
// //       this.render('ticketsList');
// //     
// //     this.stop();
// //   }
// // }
// // 
// // Router.before(requireLogin, {only: 'admin'})
// Router.before(requireMilestoneId);
//maybe add something that makes sure you are a user from the assemblalist to see things
Router.before(function() { clearErrors() });
