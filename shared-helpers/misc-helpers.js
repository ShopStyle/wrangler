Helpers = {
  // Taken from http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
  // Used to prevent the mongo error "MongoError: not okForStorage" that results from having periods or $ in an object key.
  // This can happen when using a username as an object key (like in browserLocaleAssignments)
  hashCode: function(string){
      var hash = 0;
      if (string.length == 0) return hash;
      for (i = 0; i < string.length; i++) {
          char = string.charCodeAt(i);
          hash = ((hash<<5)-hash)+char;
          hash = hash & hash; // Convert to 32bit integer
      }
      return hash.toString();
  },

  getTicketTesters: function(ticket) {
    if (ticket.testers && ticket.testers.length) {
      var testers = _.filter(ticket.testers, function(tester) {
        return tester !== '' && tester !== null;
      });
      var mappedTesters = _.map(testers, function(tester) {
        var newTester = tester;
        var testerHashCode = Helpers.hashCode(tester);
        var browsersAndLocales = [];
        if (ticket.browserLocaleAssignments[testerHashCode]) {
          var assignment = ticket.browserLocaleAssignments[testerHashCode];
          if (assignment.locale) {
            browsersAndLocales.push(assignment.locale);
            browsersAndLocales.push("US");
          }
          if (assignment.browser) {
            browsersAndLocales.push(assignment.browser);
          }
        }
        if (browsersAndLocales.length) {
          newTester += " (" + browsersAndLocales.join(", ") + ")";
        }

        return newTester;
      });

      if (mappedTesters.length > 0) {
        return mappedTesters.join(', ');
      }
    }
    else {
      return 'No Testers Assigned';
    }
  }
}

