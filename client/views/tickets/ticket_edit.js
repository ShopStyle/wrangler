Template.genericTicketEdit.events({
  // change this to 'click .submit-edit-ticket'

  'click .submit-edit-ticket': function(e, template) {
    debugger;
    var numTesters = $('.num-testers').find('select').val();
    var currentTicketId = template.data._id;
    var testerValues = $('.tester-select').find('select');
    var testers = []
    clearErrors();

    for (var i = 0; i < numTesters; i++) {
      var option = testerValues[i];
      var testerName = $(option).val();

      if (testerName && testerName.length > 0) {
        // if (_.contains(testers, testerName)) {
        //   throwError("Cannot assign tester: " + testerName + " more than once");
        //   return false;
        // }
        testers.push(testerName);
      }
    }

    Tickets.update({_id: currentTicketId}, {$set: {testers: testers, numTesters: numTesters}},
      function(error, num) {
        if (error) {
          throwError(error.reason);
        }
      }
    );
    return true;
  }
});

Template.ticketEdit.helpers({
  assignedTo: function() {
    if (AssemblaUsers.findOne({ id: this.assignedToId })) {
      return AssemblaUsers.findOne({ id: this.assignedToId }).login;
    }
    return '';
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
    var testers;
    var numTesters = this.numTesters ? this.numTesters : 2;
    if (this.testers) {
      while (this.testers.length < numTesters) {
        this.testers.push('');
      }
      testers = this.testers;
    }
    else {
      testers = ['', '', ''];
    }

    return _.map(testers, function(tester, index) {
      return {index: index, tester: tester};
    });
  }
});

Template.testerUsers.helpers({
  testers: function() {
    selectedTesterEditPage = this.tester.toString();
    var currentMilestone = Milestones.findOne({current: true});
    var testers = TestingAssignments.find({milestoneId: currentMilestone.id, notTesting: {$nin: [true]}});

    if (testers) {
      return testers.fetch();
    }
  }
});

Template.testerUser.helpers({
  selected: function() {
    return selectedTesterEditPage == this.toString();
  }
});
