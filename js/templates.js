// ###############################################################################
// #
// # APTUS FonB is Copyright (c) 2013 by APTUS, Inc.
// # All rights reserved.
// #
// # APTUS FonB is confidential to APTUS and protected by Copyright and
// # other bodies of law protecting intellectual property rights.
// #
// # Redistribution, reproduction and use in source and binary forms, with or without
// # modification, are NOT permitted.
// #
// # A non­exclusive and
// # non-transferable license for the internal evaluation and production use of
// # this product is available from APTUS.
// #
// # Unless enforcement is prohibited by applicable law, you may not modify,
// # decompile, or reverse engineer APTUS FonB. No right, title or interest
// # in or to any trademark, service mark, logo or trade name of APTUS or its
// # licensors is granted.
// #
// # APTUS FONB IS PROVIDED "AS IS," WITHOUT WARRANTY. ALL WARRANTIES,
// # EXPRESS OR IMPLIED, CONDITIONS, AND REPRESENTATIONS, INCLUDING ANY IMPLIED
// # WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE OR
// # NON­INFRINGEMENT ARE DISCLAIMED
// #
// ###############################################################################
/**
 * @file load templates
 */

/* ActiveCalls templates */
$.ajax({
	url : "templates/" + I18n.template + "/activecall.row.html",
	async:false,  
	success: function( data ) { 
		ActiveCallsRowTemplate = Handlebars.compile(data); 
	}
});

/* callhistory templates */
$.ajax({
	url : "templates/" + I18n.template + "/callhistoryshowusers.html",
	async:false,  
	success: function( data ) { 
		CallHistoryShowUserTemplate = Handlebars.compile(data); 
	}
});
$.ajax({
	url:"templates/" + I18n.template + "/listcallhistory.html",
	async:false,
	success:function( data ) {
		CallHistoryListTemplate = Handlebars.compile(data);
	}
});
$.ajax({
	url : "templates/" + I18n.template + "/detailedcallhistory.html",
	async:false,
	success: function( data ) {
		CallHistoryDetailedTemplate = Handlebars.compile(data); 
	}
});

/* phonebook templates */
$.ajax({
	url :"templates/" + I18n.template + "/listphonebooksource.html",
	async:false,
	success: function( data ) {
		PhonebookListSourceTemplate = Handlebars.compile(data); 
	}
});
$.ajax({
	url :"templates/" + I18n.template + "/listphonebook.html",
	async:false,
	success: function( data ) {
		PhonebookListTemplate = Handlebars.compile(data);
	}
});

/* settings templates */
$.ajax({
	url : "templates/" + I18n.template + "/settings.html",
	async: false,
	success: function( data ) {
		SettingsTemplate = Handlebars.compile(data);
	}
});
$.ajax({
	url : "templates/" + I18n.template + "/listrewriterules.html",
	async:false,
	success: function( data ) {
		ReWriteRulesListTemplate = Handlebars.compile(data);
	}
});
$.ajax({
	url : "templates/" + I18n.template + "/conference.html",
	async:false,
	success: function( data ) {
		ConferenceTemplate = Handlebars.compile(data);
	}
});
$.ajax({
	url : "templates/" + I18n.template + "/conference.row.html",
	async:false,
	success: function( data ) {
		ConferenceRowTemplate = Handlebars.compile(data);
	}
});
$.ajax({
	url : "templates/" + I18n.template + "/addcontact.html",
	async:false,
	success: function( data ) {
		AddContactTemplate = Handlebars.compile(data);
	}
});