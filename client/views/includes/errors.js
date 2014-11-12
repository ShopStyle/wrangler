Template.errors.helpers({
  errors: function() {
    return Errors.find();
  }
});

Template.errors.events({
  'click .close': function(e) {
    e.preventDefault();
    var $errorDiv = $(e.target).parents().first();
    var _id = $errorDiv.data('_id');
    $errorDiv.hide();
    Errors.update(_id, {$set: {seen: true}});
  }
});
