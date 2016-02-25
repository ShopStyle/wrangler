Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'home',
  waitOn: function() {
    return [
    Meteor.subscribe('milestones'),
    // Meteor.subscribe('users'),
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
    options.statusName = {$in: [Config.jira.mergedStatusName, Config.jira.verifiedStatusName, Config.jira.toDoStatusName]};
    if (this.status !== undefined) {
      options.status = this.status;
    }
    if (this.assignedTo !== undefined && this.assignedTo !== null) {
      options["assignedTo.name"] = this.assignedTo();
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
    if (this.isRegression !== undefined) {
      options.isRegression = this.isRegression;
    }
    if (this.noTesters) {
      var query = "(!this.testers) || "
        + "this.testers && (this.testers.length < (this.numTesters || "
        + Config.defaultNumTestersPerTicket
        + ")) || this.testers && (this.testers.indexOf(\""
        + Config.notAssignedName
        +"\") > -1)";

      options.$where = query;
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
  noTesters: true,
  noTesting: false
});

RegressionsTicketsListController = TicketsListController.extend({
  isRegression: true
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
      var username;
      if (Meteor.user().profile && Meteor.user().profile.jiraName) {
        username = Meteor.user().profile.jiraName;
      } else {
        username = Meteor.user().username;
      }

      return username;
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

  this.route('account', {
    path: '/account',
    controller: AccountController
  });

  this.route('other-home', {
    path: '/home',
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

  this.route('regressions', {
    path: 'regressions',
    controller: RegressionsTicketsListController
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
    path: '/tickets/:jiraId',
    waitOn: function() {
      var jiraId = parseInt(this.params.jiraId);
      Meteor.subscribe('testscripts', jiraId);
    },
    data: function() {
      var jiraId = parseInt(this.params.jiraId);
      return Tickets.findOne({ jiraId: jiraId });
    }
  });

  this.route('ticketEdit', {
    path: 'tickets/:jiraId/edit',
    template: 'ticketEdit',
    waitOn: function() {
      var jiraId = parseInt(this.params.jiraId);
      Meteor.subscribe('testscripts', jiraId);
    },
    data: function() {
      var jiraId = parseInt(this.params.jiraId);
      return Tickets.findOne({ jiraId: jiraId });
    }
  });

  this.route('admin', {
    path: '/admin',
    onBeforeAction: function() {
      Meteor.call('updateMilestones');
      this.next();
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
  } else {
    this.next();
  }
};

Router.onBeforeAction(requireLogin, {only: 'admin'});
Router.onBeforeAction(function() { clearErrors(); this.next();});
Router.onBeforeAction('loading');
