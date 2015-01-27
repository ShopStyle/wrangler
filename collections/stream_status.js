Stream = new Meteor.Collection('stream');

Meteor.methods({
  handleInterval: function() {
    if (Meteor.isServer) {
      var streamOn = Stream.findOne({on: true});
      if (streamOn) {
        Stream.update({}, {$set: {on: false}});
      } else {
        Stream.update({}, {$set: {on: true}});
      }
    }
  }
});
