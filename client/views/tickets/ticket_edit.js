var localeDep = new Deps.Dependency;
var browserDep = new Deps.Dependency;
var numTestersDep = new Deps.Dependency;

Template.ticketEdit.events({
  'click .submit-edit-ticket': function(e, template) {
    var ticket = this;
    var numTesters = ticket.numTesters || Config.defaultNumTestersPerTicket;
    var currentTicketId = ticket._id;
    var testerValues = $('.tester-select').find('select');
    var browsersToTest = ticket.browsersToTest || [];
    var localesToTest = ticket.localesToTest || [];
    var isRegression = ticket.isRegression;
    var testers = [];
    var newBrowserLocaleAssignments = {};

    if (_.isEmpty(ticket.browserLocaleAssignments)) {
      ticket.browserLocaleAssignments = {};
    }

    clearErrors();

    if (browsersToTest.length > numTesters) {
      throwError("Too many browsers for current number of testers");
      return false;
    }

    if (localesToTest.length > numTesters) {
      throwError("Too many locales for current number of testers");
      return false;
    }

    for (var i = 0; i < numTesters; i++) {
      var option = testerValues[i];
      var testerName = $(option).val();

      if (testerName && testerName.length > 0) {
        if (testerName !== Config.notAssignedName && _.contains(testers, testerName)) {
          throwError("Cannot assign tester: " + testerName + " more than once");
          return false;
        }
        testers.push(testerName);
      }
    }

    var hashedTesters = _.map(testers, function(tester) {
      return Helpers.hashCode(tester);
    });
    var browsersAndLocalesAlreadyAssigned = [];

    for (var i = 0; i < hashedTesters.length; i++) {
      var assignment = ticket.browserLocaleAssignments[hashedTesters[i]];

      if (!assignment) {
        continue;
      }

      var testerHashCode = hashedTesters[i];

      var validBrowser = assignment.browser
        && _.indexOf(browsersToTest, assignment.browser) > -1
        && (_.indexOf(browsersAndLocalesAlreadyAssigned, assignment.browser) === -1);

      var validLocale = assignment.locale
        && (_.indexOf(localesToTest, assignment.locale) > -1)
        && (_.indexOf(browsersAndLocalesAlreadyAssigned, assignment.locale) === -1);

      if (validLocale || validBrowser) {
        newBrowserLocaleAssignments[testerHashCode] = assignment;

        if (assignment.locale) {
          browsersAndLocalesAlreadyAssigned.push(assignment.locale);
        }
        if (assignment.browser) {
          browsersAndLocalesAlreadyAssigned.push(assignment.browser);
        }
      }
    }

    Tickets.update({_id: currentTicketId}, {$set: {
      testers: testers,
      numTesters: numTesters,
      browsersToTest: browsersToTest,
      localesToTest: localesToTest,
      browserLocaleAssignments: newBrowserLocaleAssignments,
      isRegression: isRegression
    }},
      function(error, num) {
        if (error) {
          throwError(error.reason);
        }
        else {
          $('.changes-saved').css("opacity", "1");
        Meteor.setTimeout(function() {
          $('.changes-saved').fadeTo(500, 0);
        }, 4000);
        }
      }
    );
    return true;
  },

  'change .num-testers': function(e, template) {
    var newNumTesters = parseInt(e.target.value);
    var ticket = Template.parentData(1);
    ticket.numTesters = newNumTesters;
    numTestersDep.changed();
  },

  'change .is-regression': function(e, template) {
    var ticket = this;
    var isRegression = e.target.checked;
    ticket.isRegression = isRegression;
  },

  'change .locale-tester': function(e, template) {
    var tester = e.target.value;
    var ticket = Template.parentData(1);
    var testerHashCode = Helpers.hashCode(tester);
    var ticketAssignment = ticket.browserLocaleAssignments[testerHashCode];
    var locale = this.locale;

    if (!ticket.browserLocaleAssignments) {
      ticket.browserLocaleAssignments = {};
    }

    // remove locale from browserLocaleAssignments
    var assignmentsToDelete = []
    _.forEach(ticket.browserLocaleAssignments, function(assignment, testerCode) {
      if (assignment.locale === locale && assignment.browser == null) {
        assignmentsToDelete.push(testerCode);
      }
      else if (assignment.locale === locale) {
        assignment.locale = null;
      }
    });

    if (ticketAssignment) {
      ticketAssignment.locale = locale;
    }
    else if (tester !== Config.notAssignedName) {
      ticket.browserLocaleAssignments[testerHashCode] = {
        locale: locale
      }
    }
  },

  'change .browser-tester': function(e, template) {
    var tester = e.target.value;
    var ticket = Template.parentData(1);
    var testerHashCode = Helpers.hashCode(tester);
    var ticketAssignment = ticket.browserLocaleAssignments[testerHashCode];
    var browser = this.browser;

    if (!ticket.browserLocaleAssignments) {
      ticket.browserLocaleAssignments = {};
    }

    // remove browser from browserLocaleAssignments
    _.forEach(ticket.browserLocaleAssignments, function(assignment, testerCode) {
      if (assignment.browser === browser && assignment.locale == null) {
        assignmentsToDelete.push(testerCode);
      }
      else if (assignment.browser === browser) {
        assignment.browser = null;
      }
    });

    if (ticketAssignment) {
      ticketAssignment.browser = browser;
    }
    else if (tester !== Config.notAssignedName) {
      ticket.browserLocaleAssignments[testerHashCode] = {
        browser: browser
      }
    }
  },

  'click .locale-checkmark': function(e, template) {
    var locale = this.locale;
    var ticket = Template.parentData(1);
    if (!ticket.localesToTest) {
      ticket.localesToTest = [];
    }

    var localeIndex = _.indexOf(ticket.localesToTest, locale);
    if (localeIndex > -1) {
      ticket.localesToTest.splice(localeIndex, 1);
    }
    else {
      ticket.localesToTest.push(locale);
    }

    localeDep.changed();
  },

  'click .browser-checkmark': function(e, template) {
    var browser = this.browser;
    var ticket = Template.parentData(1);
    if (!ticket.browsersToTest) {
      ticket.browsersToTest = [];
    }

    var browserIndex = _.indexOf(ticket.browsersToTest, browser);
    if (browserIndex > -1) {
      ticket.browsersToTest.splice(browserIndex, 1);
    }
    else {
      ticket.browsersToTest.push(browser);
    }

    browserDep.changed();
  }
});

Template.numTesters.helpers({
  numTesters: function() {
    var numTesters = this.numTesters ? this.numTesters : 2;
    var numTestersRange = [];
    for (var i = 1; i <= 10; i++) {
      var testObj = {};
      testObj.number = i;
      testObj.selected = false;

      if (numTesters == i) {
        testObj.selected = true;
      }

      numTestersRange.push(testObj);
    }

    return numTestersRange;
  }
});

Template.testerSelect.helpers({
  ticketTesters: function() {
    numTestersDep.depend();
    var numTesters = this.numTesters ? this.numTesters : 2;
    var testers = this.testers || [];
    testers.splice(numTesters);

    while (testers.length < numTesters) {
      testers.push(Config.notAssignedName);
    }

    var allTesters = _.map(testers, function(tester, index) {
      return {index: index, tester: tester};
    });

    return allTesters;
  }
});

Template.testerUsers.helpers({
  testers: function() {
    var type = this.toString();
    var currentMilestone = Milestones.findOne({current: true});
    var testers = TestingAssignments.find({milestoneName: currentMilestone.name, notTesting: {$nin: [true]}});

    if (testers) {
      var testersToSelectFrom = testers.fetch();
      testersToSelectFrom = _.sortBy(testersToSelectFrom);
      // Want to be able to select no one
      noOneAssigned = {
        name: Config.notAssignedName
      };
      testersToSelectFrom.unshift(noOneAssigned);
      var testersWithType = _.map(testersToSelectFrom, function(tester) {
        return _.extend(tester, {type: type});
      });

      return testersWithType;
    }
  }
});

Template.testerUser.helpers({
  selected: function() {
    var selected = false;
    var tester = this;
    if (tester.type === 'ticket') {
      var assignedTester = Template.parentData(2);
      if (tester.name === assignedTester.tester) {
        selected = true;
      }
    }
    else if (tester.type === 'locale' || tester.type === 'browser') {
      var localeOrBrowser = Template.parentData(2);
      if (Helpers.hashCode(tester.name) === localeOrBrowser.assignee) {
        selected = true;
      }
    }

    return selected;
  }
});


Template.browsersToTest.helpers({
  browsers: function() {
    var browserAssignments = this.browserLocaleAssignments || {};
    var mappedBrowserAssignments = {};

    _.forEach(browserAssignments, function(assignments, name) {
      var browser = assignments.browser;
      if (browser) {
        mappedBrowserAssignments[browser] = name;
      }
    });

    return _.map(Config.browserOptions, function(browser, index) {
      var assignee = mappedBrowserAssignments[browser] || Config.notAssignedName;
      return {browser: browser, assignee: assignee };
    });
  },
  selected: function() {
    browserDep.depend();
    var ticket = Template.parentData(1);
    return _.indexOf(ticket.browsersToTest, this.browser) > -1
  }
});

Template.localesToTest.helpers({
  locales: function() {
    var localeAssignments = this.browserLocaleAssignments || {};
    var mappedLocaleAssignments = {};

    _.forEach(localeAssignments, function(assignments, name) {
      var locale = assignments.locale;
      if (locale) {
        mappedLocaleAssignments[locale] = name;
      }
    });

    return _.map(Config.localeOptions, function(locale, index) {
      var assignee = mappedLocaleAssignments[locale] || Config.notAssignedName;
      return {locale: locale, assignee: assignee };
    });
  },
  selected: function(locale) {
    localeDep.depend();
    var ticket = Template.parentData(1);
    return _.indexOf(ticket.localesToTest, this.locale) > -1
  }
});
