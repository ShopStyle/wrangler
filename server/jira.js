var AUTH_TOKEN = Meteor.call('base64Encode', Config.jira.user + ':' + Meteor.settings.jiraPassword);
var API_URL = Config.jira.protocol + Config.jira.host + '/rest/api/2/';

Jira = {
  _headers: {
    Method: 'GET',
    Authorization: 'Basic ' + AUTH_TOKEN
  },
  // Jira has versions, but we call them milestones to keep them consistent with
  // the originally named Milestone collection from Assembla. TODO: Change to make more generic.
  // 'project/BE/versions' is used because versions are specific to projects.
  // PM's keep all versions on all prjects, so we just hit the BE project endpoint
  // and get its versions, which should be shopstyle wide
  milestonesUrl: 'project/BE/versions',
  usersUrl: 'group',
  ticketUrl: 'search',
  testscriptCustomField: 'customfield_10111',
  ticketTestingRequiredField: 'customfield_10219',
  ticketTestingCommentsField: 'customfield_10303',
};

Jira.ticketFields = [
  Jira.testscriptCustomField,
  Jira.ticketTestingRequiredField,
  Jira.ticketTestingCommentsField,
  'assignee',
  'status',
  'summary',
  'description',
  'fixVersions',
  'attachment'
].join(',');

Jira.fieldsWithImages = [
  Jira.testscriptCustomField,
  Jira.ticketTestingCommentsField,
  'description'
]

Jira.getStandardJqlQueryString = function() {
  if (!Milestones.findOne({current: true})) {
    throw new Meteor.Error(500, 'Please set a current milestone');
  }

  var versionTitle = Milestones.findOne({ current: true }).name;
  var jqlQueryString = "fixVersion IN ('"
    + versionTitle
    + "') AND status IN ('"
    + Config.jira.mergedStatusName
    + "', '"
    + Config.jira.verifiedStatusName
    + "', '"
    + Config.jira.toDoStatusName
    + "')"

  return jqlQueryString;
};

Jira.makeGetRequest = function(endpoint, params) {
  var url = API_URL + endpoint;
  return Meteor.http.get(url, {
    headers: Jira._headers,
    params: params
  });
};

Jira.makePostRequest = function(endpoint, data) {
  var url = API_URL + endpoint;
  if (!data) {
    var data = {};
  }
  return Meteor.http.post(url, {
    headers: Jira._headers,
    data: data
  });
};

Jira.updateMilestoneCollection = function() {
  if (!AUTH_TOKEN) {
    throw new Meteor.Error(500, 'Please provide correct username and password in config.js and settings.json');
  }

  var milestoneResponse = Jira.makeGetRequest(Jira.milestonesUrl);

  if (milestoneResponse.statusCode == 200) {
    _.each(milestoneResponse.data, function(milestone) {
      var milestoneId = parseInt(milestone.id);
      if (milestone.archived) {
        Milestones.remove({id: milestone.id});
      } else {
        Milestones.update({id: milestoneId}, {$set: {id: milestoneId, name: milestone.name, isJira: true}}, {upsert: true});
      }
    });
  } else {
    throw new Meteor.Error(500, 'Jira call failed');
  }

  Milestones.remove({isJira: {$ne: true}});
};

Jira.updateSingleTicket = function(ticket) {
  if (ticket == null) {
    return;
  }

  if (ticket.fields.attachment && ticket.fields.attachment.length) {
    _.each(ticket.fields.attachment, function(attachment) {
      _.each(Jira.fieldsWithImages, function(field) {
        if (ticket.fields[field]) {
          var regex = new RegExp(attachment.filename, "gi");
          console.log(regex)
          var replacement = "!" + attachment.content;
          ticket.fields[field] = ticket.fields[field].replace(regex, replacement);
        }
      })
    });
  }

  Jira.updateTestscripts(ticket);

  var jiraUrl = 'https://shopstyle.atlassian.net/browse/' + ticket.key;
  var statusName = ticket.fields.status.name;
  var jiraId = parseInt(ticket.id);
  if (statusName === Config.jira.verifiedStatusName) {
    Tickets.update({jiraId: jiraId}, {$set: {status: 'pass'}});
  }
  var description = ticket.fields.description;
  if (!description) {
    description = '';
  }

  var noTesting = false;
  if (ticket.fields[Jira.ticketTestingRequiredField]) {
    if (ticket.fields[Jira.ticketTestingRequiredField].value === "No") {
      noTesting = true;
    }
  }

  Tickets.update({jiraId: jiraId},
    {
      $set:
      {
        assignedTo: ticket.fields.assignee,
        jiraId: jiraId,
        fixVersion: ticket.fields.fixVersions[0],
        summary: ticket.fields.summary,
        statusName: statusName,
        jiraUrl: jiraUrl,
        jiraKey: ticket.key,
        description: description,
        comments: ticket.fields[Jira.ticketTestingCommentsField],
        noTesting: noTesting
      }
    }, { upsert: true }
  );
};

Jira.populateTicketCollection = function() {
  if (!AUTH_TOKEN) {
    throw new Meteor.Error(500, 'Please provide correct username and password in config.js and settings.json');
  }

  var jqlQueryString = Jira.getStandardJqlQueryString();
  var params = {
    jql: jqlQueryString,
    maxResults: 1000,
    fields: Jira.ticketFields
  }

  var tickets = Jira.makeGetRequest(Jira.ticketUrl, params);

  if (tickets.statusCode === 200) {
    _.each(tickets.data.issues, function(ticket) {
      Jira.updateSingleTicket(ticket);
    });

    Jira.addPassersAndFailersArrays()
  }
  else {
    throw new Meteor.Error(500, 'Jira ticket call failed');
  }
};

Jira.updateTestscripts = function(ticket) {
  fields = ticket.fields;
  if (!fields[Jira.testscriptCustomField]) {
    return;
  }
  var ticketJiraId = parseInt(ticket.id);
  var testscripts = fields[Jira.testscriptCustomField].split("***");

  var testscriptNum = 1;
  var currentTestscripts = [];
  _.each(testscripts, function(testscript) {
    var testscriptSteps = testscript.replace(/^\s+|\s+$/g, '');
    if (testscriptSteps.length === 0) {
      return;
    }
    currentTestscripts.push(testscriptNum);
    Testscripts.update({ ticketJiraId: ticketJiraId, testscriptNum: testscriptNum },
      { $set:
        {
          steps: testscriptSteps,
          ticketJiraId: ticketJiraId,
          testscriptNum: testscriptNum
        }
      },
      { upsert: true }
    );
    testscriptNum += 1;
  });

  Testscripts.remove({ticketJiraId: ticketJiraId, testscriptNum: {$nin: currentTestscripts}});
};

Jira.addPassersAndFailersArrays = function() {
  //this is only to make sure tickets have these fields. it might be better to set them when setting
  //properties on the ticket in updateSingleTicket?
  Tickets.update({ passers: { $exists: false }}, { $set: { passers: [] }}, { multi: true });
  Tickets.update({ testers: { $exists: false }}, { $set: { testers: [] }}, { multi: true });
  Tickets.update({ failers: { $exists: false }}, { $set: { failers: [] }}, { multi: true });
  Tickets.update({ status: { $exists: false }}, { $set: { status: '' } }, { multi: true });
  Tickets.update({ allStepsCompleted: { $exists: false }}, { $set: { allStepsCompleted: [] }}, { multi: true });
  Tickets.update({ noTesting: true }, { $set: { testers: [] }}, { multi: true });
  Testscripts.update({ passers: { $exists: false }}, { $set: { passers: [] }}, { multi: true });
  Testscripts.update({ failers: { $exists: false }}, { $set: { failers: [] }}, { multi: true });
  Testscripts.update({ status: { $exists: false }}, { $set: { status: '' } }, { multi: true });
};

Jira.fetchLatestChanges = function() {
  if (!Stream.findOne({on: true})) {
    return;
  }

  var jqlQueryString = Jira.getStandardJqlQueryString() + " AND updated > '-1m'";
  var params = {
    jql: jqlQueryString,
    maxResults: 1000,
    fields: Jira.ticketFields
  }

  var request = Jira.makeGetRequest(Jira.ticketUrl, params);

  if (!request.data) {
    return;
  }

  _.each(request.data.issues, function(ticket) {
    Jira.updateSingleTicket(ticket);
  });
};

Jira.verifyTicketOnDev = function(ticket) {
  if (ticket.statusName === Config.jira.verifiedStatusName) {
    return;
  }

  if (ticket.isRegression) {
    return;
  }

  var jiraId = ticket.jiraId;
  var url =  "issue/" + jiraId + "/transitions";
  // Perform transition id 131, aka "Verify" action
  var data = {
    transition: {
      id: 131
    }
  };

  Jira.makePostRequest(url, data);
};

Jira.reOpenTicket = function(ticket) {
  // Don't re-open ticket if it's already re-opened (in the to do state). 
  if (ticket.statusName !== Config.jira.toDoStatusName) { 

    var jiraId = ticket.jiraId;
    var url =  "issue/" + jiraId + "/transitions";
    // Perform transition id 201, aka "Reopen" action
    var data = {
      transition: {
        id: 201
      }
    };

    Jira.makePostRequest(url, data);
  }
};

Jira.commentTicket = function(ticket, comment) {

  var jiraId = ticket.jiraId;
  var url = "issue/" + jiraId + "/comment";
  var data = {
    body: comment
  };

  Jira.makePostRequest(url, data);
}

if (Meteor.isServer) {
  Meteor.startup(function() {
    Jira.updateMilestoneCollection();
    Meteor.call('setDefaultMilestone');
    Meteor.setInterval(Jira.fetchLatestChanges, 30000);
  });
}
