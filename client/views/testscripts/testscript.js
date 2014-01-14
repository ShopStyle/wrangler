Template.testscript.events({
	'dblclick .text': function(e) {
		$(e.currentTarget).find('.invisible').show();
		$(e.currentTarget).find('.testscript-steps').hide()
	}
})