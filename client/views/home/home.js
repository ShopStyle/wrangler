Template.home.helpers({
  totalTickets: function() {
    var tickets = Tickets.find();
    return tickets.count();
  },

  // total tests are #tickets * #people testing each ticket.
  totalTests: function() {
    var tickets = Tickets.find().fetch();
    var passed = _.reduce(_.pluck(tickets, 'testers'), function(count, testers) {
      return count + testers.length;
    }, 0);

    return passed;
  },

  milstoneName: function() {
    var currentMilestone = Milestones.findOne({current: true});
    if (currentMilestone) {
      return currentMilestone.title;
    }
    return null;
  }
});

var getTestStatusData = function() {
    var tickets = Tickets.find().fetch();

  var passed = _.reduce(_.pluck(tickets, 'passers'), function(count, testers) {
    return count + testers.length;
  }, 0);

  var failed = _.reduce(_.pluck(tickets, 'failers'), function(count, testers) {
    return count + testers.length;
  }, 0);

  var incomplete = _.reduce(_.pluck(tickets, 'testers'), function(count, testers) {
    return count + testers.length;
  }, 0) - (passed + failed);

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
      .showLabels(true)
      .color(['#62bd19', '#ff3737', '#e0e0e0']);

    d3.select("#chart svg")
      .datum(data)
      .transition().duration(1200)
      .call(chart);

    return chart;
  });
};
