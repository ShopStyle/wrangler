Tickets = new Meteor.Collection('tickets');
if (Meteor.isServer) {
  // Tickets._dropIndex({ "assemblaId": 1 }, { unique: true });
}

var userIsAdmin = function() {
  if (Meteor.user()) {
    return Meteor.user().isAdmin;
  }

  return false;
}

Tickets.allow({
  update: userIsAdmin,
  remove: userIsAdmin,
  insert: userIsAdmin
});

Meteor.methods({
  resetTicketsWithoutResetingTesters: function() {
    var currentMilestone = Milestones.findOne({current: true});
    if (!currentMilestone) {
      throw new Meteor.Error(401, "Milestone not found");
    }

    Tickets.update({"fixVersion.name": currentMilestone.name},
      {$set: {passers: [], failers: [], status: '', allStepsCompleted: []}}, {multi: true});
    // set milestone id on testscripts too, so this does not update all
    Testscripts.update({},
      {$set: {passers: [], failers: [], status: ''}}, {multi: true});
  },

  resetTickets: function() {
    var currentMilestone = Milestones.findOne({current: true});
    if (!currentMilestone) {
      throw new Meteor.Error(401, "Milestone not found");
    }

    Tickets.update({"fixVersion.name": currentMilestone.name},
      {$set: {passers: [], failers: [], testers: [], browserLocaleAssignments: {}, status: '', allStepsCompleted: []}}, {multi: true});
    // set milestone id on testscripts too, so this does not update all
    Testscripts.update({},
      {$set: {passers: [], failers: [], status: ''}}, {multi: true});
  },

  assignTickets: function() {
    if (Meteor.isClient) {
      // results will be different on client and server due to shuffling
      // (random draw), so wait for server to get back with results
      return;
    }

    Meteor.call('resetTickets');

    var currentMilestone = Milestones.findOne({current: true});
    var testersCollection = TestingAssignments.find({milestoneName: currentMilestone.name, notTesting: {$ne: true}});

    if (testersCollection.count() < Config.defaultNumTestersPerTicket) {
      throw new Meteor.Error(401, "Please assign at least " + Config.defaultNumTestersPerTicket + " people to test");
    }

    // remove testers from all tickets with no-testing required
    Tickets.update({"fixVersion.name": currentMilestone.name, statusName: Config.jira.mergedStatusName, noTesting: true},
      {$set: {testers: []}},
      {multi: true});

    // get all tickets that need testers assigned
    var tickets = Tickets.find({"fixVersion.name": currentMilestone.name, statusName: Config.jira.mergedStatusName, noTesting: false}).fetch();
    var testers = _.shuffle(testersCollection.fetch());

    _.each(tickets, function(ticket, idx) {
      // some tickets might have a tester num override, check that here.
      var numTesters = ticket.numTesters || Config.defaultNumTestersPerTicket;
      if (numTesters >= testersCollection.count()) {
        var requiredNumTesters = parseInt(numTesters) + 1;
        var errorMessage = "Please assign more people to test. Ticket " +
          ticket.jiraId + " requires " + requiredNumTesters +
          " testers to ensure it will not be assigned to the person that fixed it.";
        throw new Meteor.Error(401, errorMessage);
      }

      // Every ticket needs to be assigned to someone
      if (!ticket.assignedTo) {
          var errorMessage = "Looks like there is not a user assigned to ticket"
          + " " + ticket.jiraId + ". Go to " + ticket.jiraUrl + " and assign "
          + "someone to the 'assignee' field. Then wait for the stream to update "
          + "the ticket or update milestone to manually update tickets.";

        throw new Meteor.Error(401, errorMessage);
      }

      var ticketTesters = [];
      var browserLocaleAssignments = {};
      var usersAssignedRegressions = {};
      var browsersToTest = [];
      var localesToTest = [];

      if (ticket.browsersToTest && ticket.browsersToTest.length) {
        browsersToTest = _.shuffle(ticket.browsersToTest)
      }

      if (ticket.localesToTest && ticket.localesToTest.length) {
        localesToTest = _.shuffle(ticket.localesToTest)
      }

      var maxIterations = 1000;
      var counter = 0;
      while ((ticketTesters.length < numTesters) && (counter < maxIterations)) {
        counter++
        // reset queue of testers when empty
        if (testers.length === 0) {
          testers = _.shuffle(testersCollection.fetch());
        }

        // validate potential tester for ticket
        var potentialTester = testers.pop();
        // 1. can't test your own ticket
        assignedTo = ticket.assignedTo.name;
        if ((potentialTester.name === assignedTo) || (potentialTester.jiraName === assignedTo)) {
          // put tester back in so testing is distributed more equally
          testers.unshift(potentialTester);
          continue;
        }

        // 2. can't test the same ticket twice
        if (_.contains(ticketTesters, potentialTester.name)) {
          // put tester back in so testing is distributed more equally
          testers.unshift(potentialTester);
          continue;
        }

        // each person gets one regression max, unless we need to assign it twice
        // because not enough people
        var skipRegression = ticket.isRegression && usersAssignedRegressions[potentialTester.name]
        var countOverride = counter > 500
        if (skipRegression && !countOverride) {
          // put tester back in so testing is distributed more equally
          testers.unshift(potentialTester);
          continue;
        }

        if (ticket.isRegression) {
          usersAssignedRegressions[potentialTester.name] = true;
        }

        potentialTester.tickets.push(ticket);
        TestingAssignments.update(
        {milestoneName: currentMilestone.name, name: potentialTester.name},
          {$set: {tickets: potentialTester.tickets}});

        ticketTesters.push(potentialTester.name);
        var testerHashCode = Helpers.hashCode(potentialTester.name);
        if (browsersToTest.length) {
          browserData = browserLocaleAssignments[testerHashCode]
          if (browserData) {
            browserData.browser = browsersToTest.pop()
          }
          else {
            browserData = browserLocaleAssignments[testerHashCode] = {};
            browserData.browser = browsersToTest.pop()
          }
        }
        if (localesToTest.length) {
          browserData = browserLocaleAssignments[testerHashCode]
          if (browserData) {
            browserData.locale = localesToTest.pop()
          }
          else {
            browserData = browserLocaleAssignments[testerHashCode] = {};
            browserData.locale = localesToTest.pop()
          }
        }
      }

      Tickets.update({jiraId: ticket.jiraId}, {$set: {
        testers: ticketTesters,
        browserLocaleAssignments: browserLocaleAssignments
      }});
    });
  },

  updateTickets: function() {
    if (Meteor.isServer) {
      Jira.populateTicketCollection();
    }
  }
});
