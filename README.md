Learning meteor by doing. This is an app that syncs up with Assembla in order to simplify any group manual testing that should be done for tickets. It started as a little side project. You will see things being done differently throughout the app (just because I wanted to learn different things), and there are many areas asking to be refactored/made more efficient. Please feel free to make a pull request to fix things or add a feature!

*Originally the app pushed changes to assembla as well as pulling, but then I figured no one was using the adding/edit features from the app and removed them. You can check out the old implementation on the master-old branch.


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
}
```

To test, you may want to add yourself as an admin, add your username to

`wrangler/client/helpers/handlebars.js`
