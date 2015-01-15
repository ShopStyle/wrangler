var ticketSkipped = false;

var countType = function(tickets, type) {
  var countType = _.reduce(_.pluck(tickets, type), function(count, testers) {
    if (testers) {
      return count + testers.length;
    }
    else {
      ticketSkipped = true;
      return count;
    }
  }, 0);

  return countType;
}

Template.home.helpers({
  totalTickets: function() {
    var tickets = Tickets.find();
    return tickets.count();
  },

  totalTestableTickets: function() {
    var tickets = Tickets.find({noTesting: false});
    return tickets.count();
  },

  totalTests: function() {
    var tickets = Tickets.find({noTesting: false}).fetch();
    var totalTests = countType(tickets, 'testers')
    return totalTests;
  },

  milestoneName: function() {
    var currentMilestone = Milestones.findOne({current: true});
    if (currentMilestone) {
      return currentMilestone.title;
    }
    return null;
  },

  userTicketsIncomplete: function(username) {
    return Tickets.find({testers: {$in: [username]},
      passers: {$nin: [username]},
      failers: {$nin: [username]}}).count();
  },

  userTicketsComplete: function(username) {
    return Tickets.find({allStepsCompleted: {$in: [username]}}).count();
  },

  userTicketsAssigned: function(username) {
    return Tickets.find({testers: {$in: [username]}}).count();
  },

  hasTesterCompletedTests: function(username) {
    var count = Tickets.find({testers: {$in: [username]},
      passers: {$nin: [username]},
      failers: {$nin: [username]}}).count();

    if (count === 0) {
      return 'complete';
    }
  },

  testingAssignments: function() {
    return TestingAssignments.find();
  }
});

var getTestStatusData = function() {
  var tickets = Tickets.find({noTesting: false}).fetch();

  var passed = countType(tickets, 'passers');
  var failed = countType(tickets, 'failers');
  var incomplete = countType(tickets, 'testers') - passed - failed;

  var data = [];
  data.push({
    label: "passed",
    value: passed
  });
  data.push({
    label: "failed",
    value: failed
  });
  data.push({
    label: "incomplete",
    value: incomplete
  });

  return data;
};

Template.home.rendered = function() {
  var data = getTestStatusData();

  var chart = nv.models.pieChart()
    .x(function(d) { return d.label })
    .y(function(d) { return d.value })
    .showLabels(false)
    .donut(true)
    .donutRatio(0.3)
    .color(['#2eb82e', '#f22613', '#e0e0e0']);

  nv.addGraph(function() {
    d3.select("#chart svg")
      .datum(data)
      .transition().duration(1200)
      .call(chart);

    return chart;
  });

  Tracker.autorun(function() {
    var updatedData = getTestStatusData();

    d3.select('#chart svg')
      .datum(updatedData)
      .call(chart);

    chart.update();
  });
};
