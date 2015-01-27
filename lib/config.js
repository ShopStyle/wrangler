Config = {
  jira: {
    protocol: 'https://',
    host: 'shopstyle.atlassian.net',
    user: 'shopstylebot'
  }
}

if (Meteor.isClient) {
  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
  });
}
