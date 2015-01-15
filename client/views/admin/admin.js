BROWSER_OPTIONS = ["IE9", "IE10", "IE11", "Chrome",
  "Firefox", "iPad", "iPhone", "Android", "Safari"];
LOCALE_OPTIONS = ["UK", "AU", "JP", "DE", "FR", "CA"];

Template.admin.helpers({
  streamOn: function() {
    var stream = Stream.findOne();
    if (stream) {
      return Stream.findOne().on;
    }
    else {
      return false;
    }
  },

  users: function() {
    return Meteor.users.find();
  }
});

Template.admin.events({
  'click .streamer': function() {
    Meteor.call('handleInterval');
  },

  // 'click .randomize': function() {
  //   var browsers = [], locales = [];
  //
  //   _.each($('.user'), function(user) {
  //     // if we've run through all the locale/browsers, refill the queues
  //     if (locales.length === 0) {
  //       locales = _.shuffle(LOCALE_OPTIONS);
  //     }
  //     if (browsers.length === 0) {
  //       browsers = _.shuffle(BROWSER_OPTIONS);
  //     }
  //
  //     // set browser and locale
  //     $(user).find('.browser').val(browsers.pop());
  //     $(user).find('.locale').val(locales.pop());
  //   });
  // },
  //
  // 'click .assign-browsers': function() {
  //   // Remove all testers from this milestone
  //   Meteor.call('resetTesters');
  //
  //   var users = $('.user');
  //   for (var i = 0, len = users.length; i < len; i++) {
  //     var $user = $(users.get(i));
  //     var username = $user.find('span').text();
  //
  //     // skip users who are not testing
  //     if (!$user.find('input').prop('checked')) {
  //       Meteor.call('excuseTester', username);
  //       continue;
  //     }
  //
  //
  //     var browser = $user.find('.browser').val();
  //     var locale = $user.find('.locale').val();
  //     Meteor.call('assignTestUser', username, browser, locale, function(error) {
  //       if (error) {
  //         throwError(error.reason);
  //       }
  //     });
  //   }
  //
  //   // display success to browser
  //   $('.browser-alert').css("opacity", "0.8");
  //   Meteor.setTimeout(function() {
  //     $('.browser-alert').fadeTo(500, 0);
  //   }, 4000);
  // },
  'click .reset-tickets': function() {
    Meteor.call('resetTicketsWithoutResetingTesters', function(error) {
      if (error) {
        throwError(error.reason);
      }
      else {
        $('.reset-alert').css("opacity", "0.8");
        Meteor.setTimeout(function() {
          $('.reset-alert').fadeTo(500, 0);
        }, 4000);
      }
    });
  },

  'click .delete-user': function(e) {
    var user = $(e.target).siblings('input').attr('name');
    if (confirm('Delete ' + user + '? Warning, this action is permanent!')) {
      Meteor.call('deleteUser', user);
    }
  },

  'click .assign-tickets': function() {
    if (confirm("Assigning tickets will reset current testers. Proceed?")) {
      // Remove all testers from this milestone
      Meteor.call('resetTesters');

      var users = $('.user');
      for (var i = 0, len = users.length; i < len; i++) {
        var $user = $(users.get(i));
        var username = $user.find('span').text();

        // skip users who are not testing
        if (!$user.find('input').prop('checked')) {
          Meteor.call('excuseTester', username);
          continue;
        }

        Meteor.call('assignTestUser', username, function(error) {
          if (error) {
            throwError(error.reason);
          }
        });
      }

      Meteor.call('assignTickets', function(error) {
        if (error) {
          throwError(error.reason);
        }
        else {
          $('.ticket-alert').css("opacity", "0.8");
          Meteor.setTimeout(function() {
            $('.ticket-alert').fadeTo(500, 0);
          }, 4000);
        }
      });
    }
  }
});

Template.browserLocaleOptions.helpers({
  browserOptions: function() {
    return BROWSER_OPTIONS;
  },

  localeOptions: function() {
    return LOCALE_OPTIONS;
  },

  isCurrentlyAssigned: function(username, locale) {
    var assignment = this.toString();
    var currentMilestone = Milestones.findOne({current: true});

    if (currentMilestone) {
      var tester = TestingAssignments.findOne({milestoneId: currentMilestone.id, name: username});
      if (tester) {
        if (locale) {
          return tester.locale === assignment;
        } else {
          return tester.browser === assignment;
        }
      }
    }

    return false;
  }
});

Template.user.helpers({
  userAssignedToTest:  function(username) {
    var currentMilestone = Milestones.findOne({current: true});
    if (currentMilestone) {
      var tester = TestingAssignments.findOne({milestoneId: currentMilestone.id, name: username});
      if (!tester) {
        return true;
      } else if (tester.notTesting === true) {
        return false;
      }
    }

    return true;
  }
});

Template.userStatus.helpers({
  userTicketsIncomplete: function(username) {
    return Tickets.find({testers: {$in: [username]},
      passers: {$nin: [username]},
      failers: {$nin: [username]}});
  },

  userTicketsPassed: function(username) {
    return Tickets.find({passers: {$in: [username]}});
  },

  userTicketsFailed: function(username) {
    return Tickets.find({failers: {$in: [username]}});
  }
});
