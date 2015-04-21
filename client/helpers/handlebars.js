Handlebars.registerHelper('numFailers',function(ticket) {
  var length = ticket.failers ? ticket.failers.length : 0;
  return length;
});

Handlebars.registerHelper('numPassers', function(ticket) {
  var length = ticket.passers ? ticket.passers.length : 0;
  return length;
});

Handlebars.registerHelper('failersConcat', function(ticket) {
  if (ticket.failers && ticket.failers[0] && ticket.failers[0].username) {
    var failersReason = [];
    _.each(ticket.failers, function(failerObj) {
      failersReason.push(failerObj.username + ' (' + failerObj.failReason + ')');
    })
    return failersReason.join(', ');
  }
  else if (ticket.failers) {
    return ticket.failers.join(', ');
  }
  else {
    return '';
  }
});

Handlebars.registerHelper('activeRouteClass', function() {
  if (Router.current() === null) {
    return
  }

  var args = Array.prototype.slice.call(arguments, 0);
  args.pop();

  var active = _.any(args, function(name) {
    return Router.current().route.getName() === name;
  });

  return active && 'active';
});

Handlebars.registerHelper('passersConcat', function(ticket) {
  var names = ticket.passers ? ticket.passers.join(', ') : '';
  return names;
});

Handlebars.registerHelper('testscriptStatus', function(testscript) {
  var user = Meteor.user();
  if (user === null) {
    return;
  }

  var pass = _.contains(testscript.passers, user.username);
  var fail = _.filter(testscript.failers, function(failer) {
    return failer.username === user.username;
  });
  fail = fail.length > 0;
  if (fail) {
    return 'fail';
  }
  else if (pass) {
    return 'pass';
  }
  else {
    return '';
  }
});

Handlebars.registerHelper('showUndo', function(testscript) {
  var user = Meteor.user();
  if (user === null) {
    return;
  }
  var status;
  // should probably put this repeated logic into a global method,
  // or find another way to do it
  var pass = _.contains(testscript.passers, user.username);
  var fail = _.filter(testscript.failers, function(failer) {
    return failer.username === user.username;
  });
  fail = fail.length > 0;
  if (fail) {
    return 'fail';
  }
  else if (pass) {
    return 'pass';
  }
  else {
    return '';
  }

  if (status === 'fail' || status === 'pass') {
    return true;
  }
  return false;
});

Handlebars.registerHelper('userAdmin', function() {
  if (Meteor.user()) {
    return Meteor.user().isAdmin;
  }

  return false;
});

//modified from https://github.com/stu-smith/Handlebars-Helpers/blob/2c2232b8c466414a4faa364710e99ad8c3f22462/helpers.js
Handlebars.registerHelper('breakLines', function (text) {
  if (!text) {
    return;
  }
  var lines = text.split(/\r\n|\r|\n/),
    result = '', first = true, i;
  for (i = 0; i < lines.length; ++i) {
      if (!first) {
              result += ' <br> ';
      }
      result += Handlebars._escape(lines[i]);
      first = false;
  }

  // convert links to clickable links
  // Regex from http://codegolf.stackexchange.com/questions/464/shortest-url-regex-match-in-javascript
  var matchUrls = /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
  var extractedUrls = result.match(matchUrls);
  _.each(extractedUrls, function(url) {

    var regex = new RegExp(url, "g");
    var url = url.trim();
    var protocol = '';

    if (_.contains(url, "http") === -1) {
      protocol = "http://";
    }

    var anchorTag = " <a target=\"_blank\" href=\"" + protocol + url + "\">" + url + "</a>";
    result = result.replace(regex, anchorTag);
  });

  // // add images that are attached to ticket
  // var matchImages = /!!(\S+(?=\|))[^\s!]*!/gi;
  // var imageUrls = matchImages.exec(result);
  // if (imageUrls && imageUrls.length) {

  //   var regex = new RegExp(imageUrls[0]);
  //   var url = imageUrls[1].trim();
  //   var imageTag = " <br><image src=\"" + url + "\"/><br>";
  //   result = result.replace(regex, imageTag);
  // }


  return new Handlebars.SafeString(result);
});
