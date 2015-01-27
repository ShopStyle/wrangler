BROWSER_OPTIONS = ["IE9", "IE10", "IE11", "Chrome",
"Firefox", "iPad", "iPhone", "Android", "Safari"];

Template.regressionEdit.helpers({
  browsers: function() {
    return BROWSER_OPTIONS;
  },
  selected: function(currentBrowser) {
    var browsers = this.browsers || [];
    if (browsers.indexOf(currentBrowser) !== -1) {
      return true;
    } else {
      return false;
    }
  }
})
