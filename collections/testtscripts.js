Testscripts = new Meteor.Collection('testscripts');

Testscripts.allow({
  update: function() {
    return Meteor.user();
  }
});


Meteor.methods({
  updateTicketStatus: function(ticket) {
    var status = '';
    var passers = [];
    var failers = [];
    var testscripts = Testscripts.find({ ticketJiraId: ticket.jiraId });
    var numTestersReq = ticket.numTesters || 2;
    var numTestScripts = testscripts.count();

    testscripts.forEach(function(testscript) {
      _.each(testscript.failers, function(failerObj) {
        failers.push(failerObj.username);
      });
      passers = passers.concat(testscript.passers);
    });

    var numPassers = 0;
    var passersCounts = {};
    var allTestscriptPassers = [];

    passers.forEach(function(elem) {
      if (passersCounts[elem] == null) {
        passersCounts[elem] = 1;
      }
      else {
        passersCounts[elem] += 1;
      }
    });

    for (var key in passersCounts) {
      if (passersCounts[key] >= numTestScripts) {
        numPassers += 1;
        allTestscriptPassers.push(key);
      }
    }

    //this is pretty much the same logic as above, but decides who has completed all the testscripts for a ticket
    var completedCounts = {};
    var allStepsCompleted = [];
    var allFailPass = [];
    allFailPass = allFailPass.concat(passers);
    allFailPass = allFailPass.concat(failers);

    allFailPass.forEach(function(elem) {
      if (completedCounts[elem] == null) {
        completedCounts[elem] = 1;
      }
      else {
        completedCounts[elem] += 1; 
      }
    });

    for (var key in completedCounts) {
      if (completedCounts[key] >= numTestScripts) {
        allStepsCompleted.push(key);
      }
    }

    failers = _.uniq(failers);

    if (failers[0] != undefined && failers.length > 0) {
      status = 'fail';
    }
    else if (numPassers >= numTestersReq) {
      status = 'pass';
      Tickets.update(ticket._id, {
        $set: {
          status: status,
          statusName: Config.jira.verifiedStatusName,
          failers: failers,
          passers: allTestscriptPassers
        }
      });

      if (Meteor.isServer) {
        Jira.verifyTicketOnDev(ticket);
      }
    }

    Tickets.update(ticket._id, {
      $set: {
        status: status,
        failers: failers,
        passers: allTestscriptPassers,
        allStepsCompleted: allStepsCompleted
      }
    });
  },

  updateTestscriptResult: function(id, passTest, failReason) {
    var user = Meteor.user();
    if (!user) {
      throw new Meteor.Error(401, "You need to login to post test results");
    }

    var testscript = Testscripts.findOne(id);
    var ticket = Tickets.findOne({ jiraId: testscript.ticketJiraId });
    if (passTest === '') {
      Testscripts.update(testscript._id, {
        $pull: {
          failers: { username: user.username },
          passers: user.username
        }
      });
    }
    else if (passTest) {
      Testscripts.update(testscript._id, {
        $pull: { failers: { username: user.username }},
        $addToSet: { passers: user.username }
      });
    }
    else {
      Testscripts.update(testscript._id, {
        $pull: { passers: user.username },
        $addToSet: {
          failers:  {
            username: user.username,
            failReason: failReason
          }
        }
      });
    }
    Meteor.call('updateTicketStatus', ticket);
  },

  reOpenAndCommentTicket: function(id, failReason) {
    var user = Meteor.user();
    if (!user) {
      throw new Meteor.Error(401, "You need to login to post test results");
    }

    var testscript = Testscripts.findOne(id);
    var ticket = Tickets.findOne({ jiraId: testscript.ticketJiraId });
    var comments = "Failed by wrangler. ";

    if (Meteor.isServer) {
      Jira.reOpenTicket(ticket);

      if (!failReason) {
        comments += "Tester did not provide comments.";
      } else {
        comments += "Tester's comments: " + failReason;
      }
      Jira.commentTicket(ticket, comments)
    }
  }
});
