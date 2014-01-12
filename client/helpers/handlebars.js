Handlebars.registerHelper('passed', function(ticket) {
	var status = ticket.pass === true ? "pass" : "fail";
	return status;
});