Template.testscriptList.helpers({
  testscripts: function() {
    var assemblaId = parseInt(Router.current().params.assemblaId);
    return Testscripts.find({ ticketAssemblaId: assemblaId });
  }
});



