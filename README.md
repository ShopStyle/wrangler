# Wrangler

Wrangler helps teams to organize testing. It pulls in and organizes tickets to be verified as being fixed, making it much easier to get through any testing your team needs to do. Testing goes faster, admins have more control over who is doing what, and best part is that each user gets a rad .gif when they complete their testing!

It is currently set up to work with Jira, but can easily be modified to work with any other ticket/workspace management software that has an API.


### Setup
Pre-reqs:
I would suggest using [nvm](https://github.com/creationix/nvm) to manage node versions if you have to use different versions of node for different projects. Follow the directions on the **nvm** gihub page for installation. This project relies on **node 6.10.3**, so make sure to install and use that particular version to run this project.

1) `git clone git@github.com:mrkoreye/wrangler.git`

2) Install
 `curl "https://install.meteor.com/?release=1.3.5.1" | sh` 

3) Create a file called settings.json in the root directory of the project. This is git ignored and contains sensitive information like your jira password and api key/secret. Here is an example of what it should look like:

```
{
  "API_KEY": "",
  "API_SECRET": ""
  "userAdmins": [
    <your-user-name>
  ]
}
```
### Run the project
```
meteor --settings settings.json
```
### Extra Notes

Transition ID's in JIRA: Go to Administration > Issues > Workflows > ShopStyle Issue Workflow 07/15 > Edit to see the state changes and transition ID's. You might need to set the view to 'text' mode
