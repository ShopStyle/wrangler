Template.testscriptList.helpers({
  testscripts: function() {
    var ticketJiraId = parseInt(Router.current().params.jiraId);
    return Testscripts.find({ ticketJiraId: ticketJiraId });
  }
});
