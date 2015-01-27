Session.setDefault('gifResponse', {msg: 'wait'});

Template.userGif.helpers({
  showCats: function() {
    var profile = Meteor.user().profile;
    if (profile) {
      var gif = Meteor.user().profile.gif;
      if (gif) {
        return gif.toLowerCase() === 'cats';
      }
    }

    //if the user has not specified a perference, show cats
    return true;
  },

  gifySrc: function() {
    var gifResponse =  Session.get('gifResponse');
    return gifResponse.image_url;
  },

  getGifType: function() {
    var profile = Meteor.user().profile;
    if (profile) {
      return profile.gif || 'cats';
    } else {
      return 'cats';
    }
  }
});

Template.userGif.rendered = function() {
  var gif = Meteor.user().profile.gif || 'cats';

  var tag = gif.toLowerCase()
  var apiUrl = "http://api.giphy.com/v1/gifs/random?tag="+tag+"&api_key=dc6zaTOxFJmzC&limit=1";
  Meteor.http.get(apiUrl, function (error, result) {
    if (!error && result.statusCode === 200) {
        var respJson = JSON.parse(result.content);
        Session.set('gifResponse', respJson.data);
    }
  });
};
