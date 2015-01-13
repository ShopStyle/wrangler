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

  nv.addGraph(function() {
    var chart = nv.models.pieChart()
      .x(function(d) { return d.label })
      .y(function(d) { return d.value })
      .showLabels(false)
      .donut(true)
      .donutRatio(0.3)
      .color(['#2eb82e', '#f22613', '#e0e0e0']);

    d3.select("#chart svg")
      .datum(data)
      .transition().duration(1200)
      .call(chart);

    return chart;
  });
};
