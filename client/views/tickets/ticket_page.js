Template.ticketPage.helpers({
  ticketTesters: function() {
    var ticket = this;
    if (ticket.testers) {
      return Helpers.getTicketTesters(this);
    }
    return 'No Testers Assigned';
  },

  nextTicketNumber: function() {
    return Tickets.findOne({jiraId: {$gt: this.jiraId}}, {sort: {jiraId: 1}});
  },

  previousTicketNumber: function() {
    return Tickets.findOne({jiraId: {$lt: this.jiraId}}, {sort: {jiraId: -1}});
  },

  personalBrowserAssignment: function() {
    var assignment = null;
    var ticket = this;
    if (!Meteor.user()) {
      return assignment;
    }

    var username = Meteor.user().username;
    var testerHashCode = Helpers.hashCode(username);
    if (ticket.browserLocaleAssignments && ticket.browserLocaleAssignments[testerHashCode]) {
      assignment = _.clone(ticket.browserLocaleAssignments[testerHashCode]);
      if (!assignment.browser) {
        assignment.browser = "Your choice";
      }
      if (assignment.locale) {
        assignment.locale = assignment.locale + " and US";
      }
      else {
        assignment.locale = "US";
      }
    }
    return assignment;
  },

  animationClass: _.once(function() {
    return _.sample(Config.entranceAnimationClasses);
  })

});

Template.ticketPage.events({
  'click .delete-ticket': function(e) {
    var id = $(e.target).parent().attr('data-id');
    if (id) {
      if (confirm('Are you sure you want to delete that ticket?')) {
        Tickets.remove(id);
        Router.go('/');
      }
    }
  }
})
