Handlebars.registerHelper('ticketStatus', function(ticket) {
	var status = ticket.pass === true ? "pass" : "";
	status = ticket.fail === true ? "fail" : "";
	return status;
});

Handlebars.registerHelper('testscriptStatus', function(testscript) {
	var userId = Meteor.user()._id;
	var pass = _.contains(testscript.passers, userId);
	var fail = _.contains(testscript.failers, userId);
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
	var userId = Meteor.user()._id;
	var pass = _.contains(testscript.passers, userId);
	var fail = _.contains(testscript.failers, userId);
	if (fail || pass) {
		return true;
	}
	return false;
});

//modified from https://github.com/stu-smith/Handlebars-Helpers/blob/2c2232b8c466414a4faa364710e99ad8c3f22462/helpers.js
Handlebars.registerHelper('breakLines', function (text) {
    var lines = text.split(/\r\n|\r|\n/),
    	result = '', first = true, i;
    for (i = 0; i < lines.length; ++i) {
        if (!first) {
                result += '<br>';
        }
        result += Handlebars._escape(lines[i]);
        first = false;
    }

    return new Handlebars.SafeString(result);
});