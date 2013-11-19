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
 * @file this file has common js code after loading every other file
 * 	make sure you don't include code that is supposed to be re-used in other files here
 * 	since this is last js file loaded.
 */
/**
 * @namespace common
 */

fonb_main = {

	init : function(){
		/**
		 * Responsive select box navigation
		 */
		// Create the dropdown base
		  $("<select />").attr("id", "navSelectBox").appendTo(".boxWide:eq(0)");

		  // Create default option "Go to..."
		  $("<option />", {
		     "selected": "selected",
		     "value"   : "",
		     "text"    : "Go to..."
		  }).appendTo("#navSelectBox");

		  // Populate dropdown with menu items
		  $(".nav-text a[href^=#]").each(function() {
		   var el = $(this);
		   $("<option />", {
		       "value"   : el.attr("onclick"),
		       "text"    : el.text()
		   }).appendTo("#navSelectBox");
		  });
		  $("#navSelectBox").on("change",function() {
		    eval($(this).find("option:selected").val());
		  });
		/**
		 * @see {@link ../header.html} for ourcontext and ourmobile definitions
		 */
		if ( ourcontext !== "" ){
			jQuery("#activecalls").removeClass("nophone");
			jQuery('#quickdialbox').removeClass("nophone");
		}
		if ( ourmobile !== "" ){
			jQuery("#activecalls").removeClass("nomobile");
			jQuery('#quickdialbox').removeClass("nomobile");
		}
		/**
		 * triggered on successful flash phone setup
		 * @event flashphoneready
		 * @memberOf common
		 */
		jQuery("body").bind("flashphoneready", function() {
			console.log("Event triggered: flashphoneready");
			jQuery("#activecalls").removeClass("noflash");
			if ( jQuery("#quickdialbox").hasClass("noflash") ){
				$('.top-right').notify({
					message: "<strong>" + I18n.t("Your Flashphone is now Ready") +"</strong><br/>" + I18n.t("You are now able to make & receive calls from your web browser. Though you are strongly adviced to always test your mic before dialing or answering calls. Go to your <strong>Settings</strong> tab & configure your <span style='color:fb8a31;''>Flash Mic Settings</span>")
				}).show();
			}
			jQuery("#quickdialbox").removeClass("noflash");
		});
	},
	/**
	 * helps navigation according to hash tag in url
	 * @name navigation
	 * @param {string} contacts if found in url after hash,  shows phonebook page
	 * @param {string} callhistory if found in url after hash, lists call history (default option)
	 * @param {string} settings if found in url after hash, shows settings page
	 * @author haisum
	 * @memberOf common#
	 */	
	fetchHashPage : function(){
		if (location.href.indexOf("#") != -1) {
			var hash = location.href.substr(location.href.indexOf("#")+1);
			switch(hash){
				case "contacts":
					show_phonebook();
					break;
				case "callhistory":
					show_callhistory();
					break;
				case "settings":
					show_settings();
					break;
			}
		}
	},
	/**
	 * 
	 */
	setupQuickDial : function(){
		/**
		 * Quick dial and other auto completes
		 */
		setupContactsAutoComplete("#quickdial");
		$("#quickdial").autocomplete("option", "select", function(e, ui){updateQuickDialMeta(ui.item.value);});
		$("#quickdial").keyup(function(e){
				updateQuickDialMeta($(this).val());
		}).change(function(){
				updateQuickDialMeta($(this).val());
		});
		$("#quickdial-info").on("click", "a", function(){
			$("#quickdial").autocomplete("search", $(this).attr("rel")).focus();
		});
	
	},
}
/**
 * Load base template
 */
$(function(){
	$.ajax({
		url : "templates/" + I18n.template + "/base.html",
		success : function(data){
			var baseTemplate = Handlebars.compile(data);
			$("body").html(baseTemplate({
				"Extension" : ourextension,
				"Name" : ourname
			}));
			fonb_main.init();
			fonb_callhistory.init();
			fonb_phonebook.init();
			fonb_settings.init();
			fonb_main.fetchHashPage();
			fonb_main.setupQuickDial();

		}
	});
});

/**
 * hides other sections and makes switch board feature visible
 * We have hid switchboard for now, will release it with future versions
 * @memberOf common
 */
function show_switchboard() {
	$(".nav-active").removeClass("nav-active");
	$(".nav-after-active").removeClass("nav-after-active");
	$("#nav-switchboard").addClass("nav-active");
	$("#nav-callhistory").addClass("nav-after-active");
	$("div.pagebox").hide();
	$("div#switchboardpage").show();
}
/**
 * shows call history page and hides rest
 * @memberOf common
 */
function show_callhistory() {
	$(".nav-active").removeClass("nav-active");
	$(".nav-after-active").removeClass("nav-after-active");
	$("#nav-callhistory").addClass("nav-active");
	$("#nav-phonebook").addClass("nav-after-active");
	$("div.pagebox").hide();
	$("div#callhistorypage").show();
	search_request( 1 );
}
/**
 * shows phonebook page hides rest
 * @memberOf common
 */
function show_phonebook() {
	$(".nav-active").removeClass("nav-active");
	$(".nav-after-active").removeClass("nav-after-active");
	$("#nav-phonebook").addClass("nav-active");
	$("#nav-settings").addClass("nav-after-active");
	$("div.pagebox").hide();
	$("div#phonebookpage").show();
	PhonebookShowSource("all",1,true);
	PhonebookRefreshSource();
}
/**
 * shows settings page general settings tab, hides rest
 * @memberOf common
 */
function show_settings() {
	$(".nav-active").removeClass("nav-active");
	$(".nav-after-active").removeClass("nav-after-active");
	$("#nav-settings").addClass("nav-active");
	$("#nav-username").addClass("nav-after-active");
	$("div.pagebox").hide();
	SettingsGetSettingsPage();
	$("div#settingspage").show();
}
/**
 * check for demo version and show countdown
 */
/*function checkDemo(){
	if(DemoRemaining != 0){
		var DemoRemainingDays = Math.floor(DemoRemaining / -24)
		$("#pagebox").append('<p>' + DemoRemainingDays +' days remaining, <a href="#">upgrade now</a>.</p>')
	}
}*/
