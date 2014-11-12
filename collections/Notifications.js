Notifications = new Meteor.Collection('notifications');

Notifications.allow({
  update: function() {
    return Meteor.user();
  }
});

createFailNotification = function(ticketId, username) {
  var ticket = Tickets.findOne(ticketId);
  var dev = AssemblaUsers.findOne({ id: ticket.assignedToId });
  if (dev && username !== dev.login) {
    Notifications.insert({
      dev: dev.login,
      assemblaId: ticket.assemblaId,
      failerName: username,
      read: false
    });
  }
};
