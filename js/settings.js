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
 * @file all js for settings file
 */
jQuery(document).ready(function(){

	/* Build the Settings Page */
	SettingsGetSettingsPage();
	/* check for gContacts Token */

	$("#settingspage").on('keydown','.numberOnly', function(e) {
	    if ((e.which > 47 && e.which < 58) || (e.which > 95 && e.which < 106) || $.inArray(e.which, new Array(46,8,9,187,106,107))) return true;
	    else return false;
  	});

}); // end document ready


function SettingsGetSettingsPage(){
	$.ajax({url : 'php/settings.php', dataType : 'json', async : false,
		success: function(data) {
			ourmobile = data.general_mobile_phone;
			Settings = data;
			var html = SettingsTemplate(data );
			$('#settingspage').remove();
			$('#pagebox').append(html);
			var html = getRewriteRulesHTML(data);
			$('#current_rewrite_rules').html(html);
			$( "#current_rewrite_rules" ).sortable( {update: SettingsReOrderReWriteRule} );
			SettingsSelectOrderBy(data);
			SettingsSelectPagesize(data);
			SettingsSelectLanguage(data);
			setGcontactsSyncStatus();
			setHighriseSyncStatus();
		},
		error : function(jqXHR, textStatus, thrownError){
			if(thrownError === "Forbidden"){
				window.location.href = "/logout";
			}
		}
	});
}

function SettingsCancelChanges(){
	SettingsGetSettingsPage();
}

function SettingsPostData() {
	var form_data = {}
	form_data['general_language'] = $("#general_language").val();
	form_data['general_pagesize'] = $("#general_pagesize").val();
	form_data['general_mobile_phone'] = $("#general_mobile_phone").val();
	form_data['general_orderby'] = $('input[name=general_orderby]:checked').val();
	form_data['highrise_sitename'] = $("#highrise_sitename").val();
	form_data['highrise_token'] = $("#highrise_token").val();
	form_data['save_settings'] = "save";
	$.post("php/settings.php", form_data , function(response) {
		Settings = response;
		ourmobile = Settings.general_mobile_phone;
		$(".tab-pane.active").append('<div id="settings-message" class="alert alert-success"><a href="#" class="close" data-dismiss="alert">&times;</a>Settings saved successfully.</div>');
		setHighriseSyncStatus();
		window.setTimeout(function(){
			$("#settings-message").alert('close');
		},5000);

	},"json");
	return false;
}


function SettingsSelectOrderBy( data ) {
	var orderby = data['general_orderby']
	switch ( orderby ) {
		case "fname":
			$('#general_orderby_firstname').prop('checked', true);
			break;
		case "lname":
			$('#general_orderby_lastname').prop('checked', true);
			break;
	}
}
var TIME_OUT_SECONDS = 15;
var highrisePending = 0;
var highriseSamePercentageCount = 0;
var highriseLastPercentage = 0;
function setHighriseSyncStatus(){
	var $highriseProgress = $("#highriseProgress");
	var $contactsHighriseProgress = $("#contactsHighriseProgress");
	$btn = $('#highrise_verify');
	$.ajax({
		url : 'php/highrise_sync_status.php',
		type : 'get',
		dataType : 'json'
	}).done(function(data){
		console.log("---------------------------starting highrise sync---------------------------------");
		console.log("got data");
		console.log(data);
		if(data.OnSync == false){
			console.log("OnSync is false");
			if($btn.data("originalText") != null){
				$btn.html($btn.data("originalText")).prop("disabled", false);
			}
			if(typeof data.ZERO !== "undefined"){
				console.log("got zero error");
				if(data.ZERO.StatusCode == "NotConfigured"){//not configured
					console.log("not configured hiding highrise progress div in settings");
					$highriseProgress.hide();
				}
				else if(data.ZERO.StatusCode == "Empty"){//configured, but not synced or no contacts found in sync source
					console.log("Empty, showing progress in settings showing status message in help-block hiding progress");
					$highriseProgress.show().find(".help-block").html(data.ZERO.StatusMessage);
					$highriseProgress.find(".progress").hide();
				}
				console.log("Hidhing .progress in contacts highrise progress showing progress and help-block");
				$contactsHighriseProgress.find(".progress").hide();
				$contactsHighriseProgress.show().find(".help-block").html(data.ZERO.StatusMessage).fadeOut(5000, function(){
						$contactsHighriseProgress.hide();
					});
			}
			else{//configured and already synched
				console.log("synched and configured! show progress in settings show helpBlock");
				$highriseProgress.show().find(".help-block").html(data.CurrentTelephonesCount + " contacts imported from Highrise");
				console.log("hide .progress");
				$highriseProgress.find(".progress").hide();
				var $helpBlock = $contactsHighriseProgress.show().find(".help-block");
				if(!$helpBlock.is(":hidden")){//hide stuff on page load and first request
					console.log("help block is shown in contacts highrise. Making fadeout effect and closing");
					$helpBlock.html(data.CurrentTelephonesCount + " contacts imported from Highrise");
					$contactsHighriseProgress.fadeOut(5000, function(){
						$contactsHighriseProgress.hide();
					});
				}
				else{
					console.log("help block is hidden. Hide contacts progress");
					$contactsHighriseProgress.hide();
					$helpBlock.show();
				}
				$contactsHighriseProgress.find(".progress").hide();
			}
		}
		else if(data.OnSync === true){//in progress
			console.log("in sync");
			$('#highrise_verify').html("Synching...").prop("disabled", true);
			if(data.TotalFeedFound == "Pending" || !data.CurrentFeedCount){//waiting for server response for first time
				console.log("pending sync");
				if(highrisePending == TIME_OUT_SECONDS){
					console.log("a lot of pending, may be request was not completed! resetting sync");
					PhonebookSync("highrise");
					highrisePending = 0;
					return;
				}
				highrisePending++;
				$highriseProgress.show().find(".help-block").html("Waiting for Highrise server...");
				$contactsHighriseProgress.show().find(".help-block").html("Waiting for Highrise server...").show();
				$highriseProgress.find(".progress").show().find(".bar").css({
					width : "0%"
				});
				$contactsHighriseProgress.find(".progress").show().find(".bar").css({
					width : "0%"
				});
			}
			else{//show progress
				highrisePending = 0;//reset pending counter
				if(highriseLastPercentage == data.CurrentFeedCount){//check if percentage is stuck somewhere
					highriseSamePercentageCount++;
				}
				else{
					highriseSamePercentageCount = 0;//if different perentage was given, reset counter
				}
				if(highriseSamePercentageCount == TIME_OUT_SECONDS){//if for TIME_OUT_SECONDS seconds there's no change in sync %age something is wrong on server
					console.log("no change for 5 seconds in highrise, resetting sync");
					highriseSamePercentageCount = 0;
					PhonebookSync("highrise");
					return;
				}
				highriseLastPercentage = data.CurrentFeedCount;
				var html = "Processing record "+ data.CurrentFeedCount  +" of "+ data.TotalFeedFound +". Total " + data.CurrentTelephonesCount + " contacts imported.";
				if(typeof data.LastImports !== "undefined" && data.LastImports.length > 0){
					html+= " Importing " + data.LastImports[0]["FirstName"] + " - " + data.LastImports[0]["PhoneNumber"];
				}
				$highriseProgress.show().find(".help-block").html(html);
				$contactsHighriseProgress.show().find(".help-block").html(html).show();
				$highriseProgress.find(".progress").show().find(".bar").animate({
					width : data.CompletedSyncPercentage + "%"
				});
				$contactsHighriseProgress.find(".progress").show().find(".bar").animate({
					width : data.CompletedSyncPercentage + "%"
				});
			}
			window.setTimeout(function(){setHighriseSyncStatus();}, 1000);
			//keep on looping unless onsync is false
		}
	});
}
/**
 * Sets progress bar or message according to current output from php/gcontacts_sync_status.php
 *	CASE 1 : {
				OnSync: false,
				ZERO: {
				StatusCode: "Empty",
				StatusMessage: "No contacts were imported from Google. To import your contacts from Google, you need to click on Synchronize Google Contacts."
				},
				CurrentTelephonesCount: 0,
				CompletedSyncPercentage: 100
			}
	CASE 2: {
				OnSync: false,
				ZERO: {
				StatusCode: "NotConfigured",
				StatusMessage: "Google Contacts is not configured"
				},
				CurrentTelephonesCount: 0,
				CompletedSyncPercentage: 100
			}
	CASE 3: {
				OnSync: false,
				CurrentTelephonesCount: 295,
				CompletedSyncPercentage: 100
			}
	case 4: {
				TotalFeedFound: 883,
				OnSync: true,
				CurrentTelephonesCount: 5,
				CurrentFeedCount: 25,
				CompletedSyncPercentage: 3,
				LastImports: [
								{
								Id: "46206bbc-b0b4-11e2-918d-902b347f4d98",
								FirstName: "Ahmad m",
								LastName: "m",
								Company: "",
								PhoneType: "phone",
								Label: "other",
								Groups: [
								""
								],
								Source: "gcontacts",
								PhoneNumber: 923012249609
								}
							]
			}
	case 5: {
		TotalFeedFound: "Pending",
		OnSync: true,
		CurrentTelephonesCount: 0,
		CurrentFeedCount: null,
		CompletedSyncPercentage: 0
	}
 */	

var gcontactsPending = 0;
var gcontactsSamePercentageCount = 0;
var gcontactsLastPercentage = 0;
function setGcontactsSyncStatus(){
	var $gontactsProgress = $("#gcontactsProgress");
	var $contactsGcontactsProgress = $("#contactsGcontactsProgress");
	$.ajax({
		url : 'php/gcontacts_sync_status.php',
		type : 'get',
		dataType : 'json'
	}).done(function(data){
		console.log("-----------------------starting gcontacts sync--------------------------");
		console.log("got gContacts data");
		console.log(data);
		if(data.OnSync === false){
			console.log("on sync is false");
			$("#gcontactsrevoke").prop("disabled", false);
			if(typeof data.ZERO !== "undefined"){
				console.log("got a zero error");
				if(data.ZERO.StatusCode == "NotConfigured"){//not configured
					console.log("not configured. hiding revoke, showing configure, hiding settings progress");
					$('.grant-google').show();
					$('#gcontactsrevoke').hide();
					$gontactsProgress.hide();
				}
				else if(data.ZERO.StatusCode == "Empty"){//configured, but not synced or no contacts found in sync source
					console.log("empty! hiding grant, showing revoke, showing help block in settings, hiding progress");
					$('.grant-google').hide();
					$('#gcontactsrevoke').show();
					$gontactsProgress.show().find(".help-block").html(data.ZERO.StatusMessage);
					$gontactsProgress.find(".progress").hide();
				}
				console.log("hiding progress in contacts page, showing help-block");
				$contactsGcontactsProgress.find(".progress").hide();
				$contactsGcontactsProgress.show().find(".help-block").html(data.ZERO.StatusMessage).show().fadeOut(5000, function(){$contactsGcontactsProgress.hide();});
			}
			else{//configured and already synched
				console.log("already configured! hiding grant in settings, showing revoke");
				$('.grant-google').hide();
				$('#gcontactsrevoke').show();
				console.log("showing gcontactsProgress help block in settings hiding progress... change help-block in contacts page. leave progress unaltered.. show div");
				$gontactsProgress.show().find(".help-block").html(data.CurrentTelephonesCount + " contacts imported");
				$gontactsProgress.find(".progress").hide();
				var $helpBlock = $contactsGcontactsProgress.show().find(".help-block");
				if(!$helpBlock.is(":hidden")){//hide stuff on page load and first request
					console.log("help block is hidden, hide contacts progress after fading out");
					$helpBlock.html(data.CurrentTelephonesCount + " " + I18n.t("contacts imported from Google contacts"));
					$contactsGcontactsProgress.fadeOut(5000, function(){
						$contactsGcontactsProgress.hide();						
					});
				}
				else{
					console.log("help block is shown, hide contacts progress div and display block to help-block");
					$contactsGcontactsProgress.hide();
					$helpBlock.show();
				};
			}
		}
		else if(data.OnSync === true){//in progress
			$("#gcontactsrevoke").prop("disabled", true);
			if(data.TotalFeedFound == "Pending" || !data.CurrentFeedCount){//waiting for server response for first time
				if(gcontactsPending == TIME_OUT_SECONDS){
					console.log("a lot of pending, may be request was not completed! resetting sync");
					PhonebookSync("gcontacts");
					gcontactsPending = 0;
					return;
				}
				gcontactsPending++;

				console.log("on sync but waiting..");
				$('.grant-google').hide();
				$('#gcontactsrevoke').show();
				$gontactsProgress.show().find(".help-block").show().html("Waiting for Google server...");
				$gontactsProgress.find(".progress").addClass("active").show().find(".bar").css({
					width : "0%"
				});
				$contactsGcontactsProgress.show().find(".help-block").show().html("Waiting for Google server...");
				$contactsGcontactsProgress.find(".progress").show().find(".bar").css({
					width : "0%"
				});
			}
			else{//show progress
				gcontactsPending = 0;//reset pending counter
				if(gcontactsLastPercentage == data.CurrentFeedCount){//check if percentage is stuck somewhere
					gcontactsSamePercentageCount++;
				}
				else{
					gcontactsSamePercentageCount = 0;//if different perentage was given, reset counter
				}
				if(gcontactsSamePercentageCount == TIME_OUT_SECONDS){//if for TIME_OUT_SECONDS seconds there's no change in sync %age something is wrong on server
					console.log("no change for " + TIME_OUT_SECONDS + " seconds in gcontacts, resetting sync");
					PhonebookSync("gcontacts");
					gcontactsSamePercentageCount = 0;
					return;
				}
				gcontactsLastPercentage = data.CurrentFeedCount;
				console.log("in progress");
				$('.grant-google').hide();
				$('#gcontactsrevoke').show();
				var html = "Processing record "+ data.CurrentFeedCount  +" of "+ data.TotalFeedFound +". Total " + data.CurrentTelephonesCount + " contacts imported.";
				if(typeof data.LastImports !== "undefined" && data.LastImports.length > 0){
					html+= " Importing " + data.LastImports[0]["FirstName"] + " - " + data.LastImports[0]["PhoneNumber"];
				}
				$gontactsProgress.show().find(".help-block").html(html);
				$gontactsProgress.find(".progress").show().find(".bar").animate({
					width : data.CompletedSyncPercentage + "%"
				});
				$contactsGcontactsProgress.show().find(".help-block").html(html).show();
				$contactsGcontactsProgress.find(".progress").show().find(".bar").animate({
					width : data.CompletedSyncPercentage + "%"
				});
			}
			window.setTimeout(function(){setGcontactsSyncStatus();}, 500);
			//keep on looping unless onsync is false
		}
	});
}

function SettingsDisplayGcontactsButton( data ) {
	if ( data['cal_token'] == undefined ) {
		$('#gcontactsgrant').show();
		$('#gcontactsrevoke').hide();
	} else {
		$('#gcontactsgrant').hide();
		$('#gcontactsrevoke').show();
	}
}


function SettingsSelectLanguage( data ) {
	var language = data['general_language'];
	$('#general_language').val(language);
}

function SettingsSelectPagesize( data ) {
	var pagesize = data['general_pagesize'];
	$('#general_pagesize').val(pagesize);
}


function SettingsHighriseConfigure() {
    $highriseBtn = $('#highrise_verify');
    $highriseBtn.data("originalText" , $highriseBtn.html());
    $highriseBtn.prop('disabled', true).html('Trying...');
	var highrise_sitename = $('#highrise_sitename').val();
	var highrise_token = $('#highrise_token').val();
	$.post('php/phonebook_sync.php', {highrise_configure: "YES", highrise_sitename: highrise_sitename, highrise_token: highrise_token} ,function(data) 
		{ 
		if (data.match(/error/im)){
			$('#highrise_verify').prop('disabled', false).html($highriseBtn.data("originalText"));
			console.log("Highrise error: " + data);
			$('.top-right').notify({
				message: "<strong>Highrise Connection Failed</strong><br/>The provided highrise credentials were rejected. Please verify your input and try again.",
				type  : "error"
			}).show();
		}
		else{
			PhonebookSync('highrise');
			window.setTimeout(function(){setHighriseSyncStatus();}, 1000);
		}
	});
};

function SettingsGrantGoogleContacts() {
	var url = "https://www.google.com/accounts/AuthSubRequest?next="+ encodeURI(window.location.origin)+"&scope=" + encodeURI("https://www.google.com/m8/feeds/&secure=0&session=1"); 
	var win = window.open(url, "windowname1", 'width=800, height=600');
    var pollTimer   =   window.setInterval(function() { 
        try {
            console.log(win.document.URL);
            if (win.document.URL.indexOf("token") != -1) {
                window.clearInterval(pollTimer);
                var url =   win.document.URL;
				var gcontacts_token = $.url(url).param('token'); // parse the current page URL and return the token param
                win.close();
				if ( gcontacts_token != undefined ) SettingsSaveGoogleToken( gcontacts_token );
            }
        } catch(e) {
        }
    }, 100);
}

function SettingsSaveGoogleToken( token ) {
	$.post('php/gcontacts_authorization.php', {action: "save", token: token} ,function(data) {
		if(data){
			if ( data.Save == "OK" ) {
				PhonebookSync('gcontacts');
				window.setTimeout(function(){setGcontactsSyncStatus();}, 1000);
			} else {
				$('.top-right').notify({
					message: "<strong>Synching with Google Contacts Failed</strong><br/>Something went wrong. Please go to your Google Accounts and revoke your token there. <a href='http://support.google.com/accounts/bin/answer.py?hl=en&answer=41236'>Learn more</a>",
					type : "error"
				}).show();
			}	
		}
	},'json');

}

function SettingsRevokeGoogleContacts() {
	$.post('php/gcontacts_authorization.php', {action: "revoke"} ,function(data) {
		if ( data.Revoke === "OK" ) {
			PhonebookSync('gcontacts');
			window.setTimeout(function(){setGcontactsSyncStatus();}, 1000);
		} else {
			$('.top-right').notify({
				message: "<strong>Google Contacts Revoke Failed</strong><br/>Something went wrong. Please go to your Google Accounts and revoke your token there. <a href='http://support.google.com/accounts/bin/answer.py?hl=en&answer=41236'>Learn more</a>",
				type : "error"
			}).show();
		}	
	},'json');
};

function SettingsDeleteAllContacts() {
	$("#deleteAll").prop("disabled", true);
	$.post('php/uploadphonebook.php', {deletephonebook: "YES"} ,function(data) {
		$("#deleteAll").prop("disabled", false);
		$(".tab-pane.active").append('<div id="delete-message" class="alert alert-info"><a href="#" class="close" data-dismiss="alert">&times;</a>' + I18n.t("All contacts deleted.") +  '</div>');
		window.setTimeout(function(){
			$("#delete-message").remove();
		}, 3000);
	});
};

function SettingsDeleteReWriteRule( Id , matchrule ) {
	$.post("php/settings_rewriterule.php", { action:"delete", Id:Id, matchrule:matchrule },
		function(data) {
			if ( data.Delete === "OK" ) {
				var html = getRewriteRulesHTML(data.NewSettings);
				$('#current_rewrite_rules').html(html);
				$( "#current_rewrite_rules" ).sortable( {update: SettingsReOrderReWriteRule} );
				$( "#current_rewrite_rules" ).disableSelection();
			}
			if ( data.Delete === "ERROR" ) console.log("Failed to Delete Re-Write Rule # " + data.Id );
		},'json');
};

function SettingsAddReWriteRule() {
	if(!SettingsCheckRule()){
		return;
	}	
	rules = getRuleForAdd();
	var matchrulestr = rules.rule;
	var prefixstr = rules.replacement;
	$.post("php/settings_rewriterule.php", { matchrule: matchrulestr, prefix: prefixstr },
		function(data){
			if ( data.Add === "OK" ) {
				var html = getRewriteRulesHTML(data.NewSettings);
				$('#current_rewrite_rules').html(html);
				$( "#current_rewrite_rules" ).sortable( {update: SettingsReOrderReWriteRule} );
				$( "#current_rewrite_rules" ).disableSelection();
			}
			if ( data.Add === "ERROR" ) alert(data.Why);
		},'json');
};

function SettingsReOrderReWriteRule() {
	serial = $('#current_rewrite_rules').sortable('serialize') + '&action=reorder';
	$.post("php/settings_rewriterule.php", serial ,
		function(data){
			if ( data.ReOrder === "OK" ) {
				var html = getRewriteRulesHTML(data.NewSettings);
				$('#current_rewrite_rules').html(html);
				$( "#current_rewrite_rules" ).sortable( {update: SettingsReOrderReWriteRule} );
				$( "#current_rewrite_rules" ).disableSelection();
			}
			if ( data.ReOrder === "ERROR" ) console.log("Failed to ReOrder Re-Write Rules as per # " + data.Order );
		},'json');
}


function SettingsCheckRule() {
	$(".new_rules.alert").hide();
	var selectedOption = $("#rewrite-rule-select>option:selected").val();
	var replace = $("#rewrite-rule-replacement").val();
	var match = $("#rewrite-rule-text").val();
	if((isEmpty(match) || match.match(/[^\d\#\*\+]/)) && (selectedOption == 0 || selectedOption == 1)){
		$(".new_rules.alert").text(I18n.t("There should be a number to match against when using match or replace rules. Only numeric values and +, * and # signs are acceptable.")).show();
		return false;
	}
	else if((isEmpty(replace) || replace.match(/[^\d]/)) && (selectedOption == 0 || selectedOption == 2)){
		$(".new_rules.alert").text(I18n.t("There should be a number for replacement when using match or match all rule.")).show();
		return false;
	}
	else if(selectedOption != 2 && match!="" && match.match(/[^\d\#\*\+]/)){
		$(".new_rules.alert").text(I18n.t("Number for matching should be numeric or may contain +, * and # signs")).show();
		return false;
	}
	else if(replace != "" && replace.match(/[^\d]/)){
		$(".new_rules.alert").text(I18n.t("Number for replacement should be numeric")).show();
		return false;
	}
	else{
		return true;
	}
}

function ruleChange(select){
	/**
	 * Possible values: 
	 *  0 => match   .beginning, .with, .and, .prefix
	 *  1 => replace  .beginning, .with
	 *  2 => Match All .and , .prefix, .with
	 * @type {number}
	 */
	var selectedOption = parseInt($(select).val());
	var rule = "";
	var replacement = "";
	switch(selectedOption){
		case 0:
			$(".rewrite.beginning, .rewrite.with, .rewrite.and, .rewrite.prefix, .rewrite.match").css("visibility", "visible");
			$("#rewrite-rule-text").prop("disabled", false);
			break;
		case 1:
			$(".rewrite").css({"visibility":"visible"}).not(".beginning, .with, .rewrite.match").css({"visibility":"hidden"});
			$("#rewrite-rule-text").prop("disabled", false);
			break;
		case 2:
			$(".rewrite").css({"visibility":"visible"}).not(".and, .prefix, .with").css({"visibility":"hidden"});
			$("#rewrite-rule-text").prop("disabled", true);
			break;
	}
}

function getRuleForAdd(){

	/**
	 * Possible values: 
	 *  0 => match   .beginning, .with, .and, .prefix
	 *  1 => replace  .beginning, .with
	 *  2 => Match All .and , .prefix, .with
	 * @type {number}
	 */
	var selectedOption = parseInt($("#rewrite-rule-select>option:selected").val());
	var rule = "";
	var replacement = "";
	switch(selectedOption){
		case 0:
			rule = "{rewrite-rule-text}X*";
			replacement = "{rewrite-rule-replacement}";
			break;
		case 1:
			rule = "({rewrite-rule-text})X*";
			replacement = "{rewrite-rule-replacement}";
			break;
		case 2:
			rule = "X*";
			replacement = "{rewrite-rule-replacement}";
			break;
	}
	rule = rule.replace(/\{rewrite\-rule\-text\}/g, $("#rewrite-rule-text").val());
	replacement = replacement.replace(/\{rewrite\-rule\-replacement\}/g, $("#rewrite-rule-replacement").val());
	return {
		rule : rule,
		replacement : replacement
	};
}

function getRewriteRulesHTML(data){
	obj = data.rewrite;
	temp = new Array();
	for(var i=0; i<obj.length;i++){
		if(obj[i].print_start == ""){
			if(obj[i].prefix == ""){
				obj[i].prefix = I18n.t("Nothing");
			}
			temp.push({
				Id : obj[i].Id,
				matchrule  : obj[i].matchrule,
				typeReplace : "replace",
				match : obj[i].print_del,
				replace : obj[i].prefix
			});
		}
		else if(obj[i].print_start == "X*"){
			temp.push({
				Id : obj[i].Id,
				matchrule  : obj[i].matchrule,
				typeMatchAll : "match-all",
				match : "",
				replace : obj[i].prefix
			});
		}else{
			temp.push({
				Id : obj[i].Id,
				matchrule  : obj[i].matchrule,
				typeMatch : "match",
				match : obj[i].print_start.substr(0, obj[i].print_start.length - 2),//eliminate X* in the end
				replace : obj[i].prefix
			});
		}
	}
	rewriteRulesAreSetup = true;
	if(temp.length == 0){
		rewriteRulesAreSetup = false;
		$("#rewriteTour").show();
	}
	data.rewrite =temp;
	return ReWriteRulesListTemplate(data);
}

function isEmpty( inputStr ) { if ( null == inputStr || "" == inputStr ) { return true; } return false; }
