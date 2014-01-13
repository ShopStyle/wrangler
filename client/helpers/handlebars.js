Handlebars.registerHelper('passed', function(ticket) {
	var status = ticket.pass === true ? "pass" : "fail";
	return status;
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