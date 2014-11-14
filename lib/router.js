Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() {
    return [
    // Meteor.subscribe('notifications'),
    Meteor.subscribe('milestones'),
    Meteor.subscribe('users'),
    Meteor.subscribe('stream'),
    Meteor.subscribe('userData'),
    Meteor.subscribe('tickets'),
    Meteor.subscribe('testingAssignments')
  ];
  }
});

TicketsListController = RouteController.extend({
  loadingTemplate: 'loading',
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
    if (this.noTesters === true) {
      options.testers = [];
      options.noTesting = false;
    }

    return options;
  },

  data: function() {
    return {
      tickets: Tickets.find(this.findOptions()),
      route: this.path,
      options: this.findOptions()
    };
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

NoTestersTicketsListController = TicketsListController.extend({
  noTesters: true
});

ToDoTicketsListController = TicketsListController.extend({
  tester: function() {
    if (Meteor.user()) {
      return Meteor.user().username;
    }
  }
});

YourTicketsListController = TicketsListController.extend({
  assignedTo: function() {
    if (Meteor.user()) {
      var username = Meteor.user().username;
      var user = AssemblaUsers.findOne({login: username});
      if (user) {
        return user.id;
      }
    }
  }
});

HomeController = TicketsListController.extend({
  template: 'home'
});

AccountController = RouteController.extend({
  template: 'account'
});

Router.map(function() {
  this.route('home', {
    path: '/',
    controller: HomeController
  });

  this.route('all', {
    path: '/all',
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

  this.route('noTesters', {
    path: '/no-testers',
    controller: NoTestersTicketsListController
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
      Meteor.subscribe('testscripts', assemblaId);
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
      Meteor.subscribe('testscripts', assemblaId);
    },
    data: function() {
      var assemblaId = parseInt(this.params.assemblaId);
      return Tickets.findOne({ assemblaId: assemblaId });
    }
  });

  this.route('admin', {
    path: '/admin',
    onBeforeAction: function() {
      Meteor.call('updateMilestones');
      this.next();
    }
  });

  this.route('account', {
    path: '/account',
    controller: AccountController
  });

});

var requireLogin = function() {
  if (!Meteor.user()) {
    if (Meteor.loggingIn())
      this.render(this.loadingTemplate);
    else
      this.render('ticketsList');

    this.stop();
  } else {
    this.next();
  }
};

Router.onBeforeAction(requireLogin, {only: 'admin'});
Router.onBeforeAction(function() { clearErrors(); this.next();});
Router.onBeforeAction('loading');
