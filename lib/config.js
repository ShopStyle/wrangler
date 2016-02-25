Config = {
  jira: {
    protocol: 'https://',
    host: 'shopstyle.atlassian.net',
    user: 'shopstylebot',
    verifiedStatusName: 'Verified on QA',
    mergedStatusName: 'Merged',
    toDoStatusName: 'To Do',
    inProgressStatusName: 'In Progress',
    inReviewStatusName: 'In Review',
    closedStatusName: 'Closed'
  },
  defaultNumTestersPerTicket: 2,
  notAssignedName: '-- Not Assigned',
  browserOptions: [
    'IE9',
    'IE10',
    'IE11',
    'Chrome',
    'Firefox',
    'iPad',
    'iPhone',
    'Android',
    'Safari'
  ],
  localeOptions: [
    'UK',
    'AU',
    'JP',
    'DE',
    'FR',
    'CA'
  ],
  entranceAnimationClasses: [
    'bigEntrance',
    'slideUp',
    'slideRight',
    'slideDown',
    'slideLeft',
    'slideExpandUp',
    'expandUp',
    'fadeIn',
    'expandOpen',
    'hatch'
  ]
}

if (Meteor.isClient) {
  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
  });
}
