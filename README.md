#Wrangler

Wrangler helps teams to organize testing. It pulls in and organizes tickets to be verified as being fixed, making it much easier to get through any testing your team needs to do. Testing goes faster, admins have more control over who is doing what, and best part is that each user gets a rad .gif when they complete their testing!

It is currently set up to work with Jira, but can easily be modified to work with any other ticket/workspace management software that has an API.


###Setup
Pre-reqs:
[npm](https://www.npmjs.org/), [sass](http://sass-lang.com/install)

1) `git clone git@github.com:mrkoreye/wrangler.git`

2) Install
 [meteor](https://www.meteor.com/install) this app uses version 1.0.0

3) from within the wrangler repo `meteor run` to get all the dependancies


###To run
```
meteor --settings settings.json
```
####Using testing-app

You will need to create a wrangler/setings.json file for the assembla api keys (this is git ignored)

```
{
  "API_KEY": "",
  "API_SECRET": ""
  "userAdmins": [
    "wonderwoman",
    "superman"
  ]
}
```

To test, you may want to add yourself as an admin, add your username to

`wrangler/client/helpers/handlebars.js`

###Extra Notes

Transition ID's in JIRA: Go to Administration > Issues > Workflows > ShopStyle Issue Workflow 07/15 > Edit to see the state changes and transition ID's. You might need to set the view to 'text' mode
