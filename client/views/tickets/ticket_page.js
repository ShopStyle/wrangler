Template.ticketPage.helpers({
  ticketTesters: function() {
    if (this.testers) {
      var testers = _.filter(this.testers, function(tester) {
        return tester !== '' && tester !== null;
      });
      if (testers.length > 0) {
        return testers.join(', ');
      }
    }
    return 'No Testers Assigned';
  },

  nextTicketNumber: function() {
    return Tickets.findOne({jiraId: {$gt: this.jiraId}}, {sort: {jiraId: 1}});
  },

  previousTicketNumber: function() {
    return Tickets.findOne({jiraId: {$lt: this.jiraId}}, {sort: {jiraId: -1}});
  }
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
