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
 * @file all code regarding phonebook 
 */
$("document").ready(function() {
	
});
fonb_phonebook = {
	init : function(){
		$("#phonebookpage, #importCSVModal").remove();
		$.ajax({
			url : "templates/" + I18n.template + "/phonebook.html",
			async : false,
			success : function(data){
				var phonebookTemplate = Handlebars.compile(data);
				$("#pagebox").append(phonebookTemplate());
				$.ajax({
					url : "templates/" + I18n.template + "/importphonebook.html",
					success : function(data){
						var importPhonebookTemplate = Handlebars.compile(data);
						$("#importCSVModal .modal-body").html(importPhonebookTemplate());					
					}
				})
			}
		});
		$("body").on("click", ".select-links .all", function(){
			$(".contact_check.internal, .contact_check.mycontacts").prop("checked", true);
		});
		$("body").on("click", ".select-links .none", function(){
			$(".contact_check.internal, .contact_check.mycontacts").prop("checked", false);
		});
		$("#phonebooksearch").on("keyup", function(){
			PhonebookShowSource(contactssource,1,false);
		});
		$("#phonebooksearch_cancel").on("click", function(){
			$('#phonebooksearch').val('');
			PhonebookShowSource(contactssource,1,false);
		});
		$("#phonebookpage").on("click", ".CONTACT_row .edit-contact", contactEdit);
	}
}

function PhonebookRefreshSource() {
	//$.get('debug/json/listphonebooksource.json', function(data) 
	$.get('php/listphonebooksource.php', function(data)
	{
		var html = PhonebookListSourceTemplate(data);
		$('#sourceselect').html(html);
		checkForSync();
		$('.tooltip1').tooltip();
	},'json');
};



function PhonebookSync( source ) { 
	$('#' + source + 'source img.sync').hide();
	$('#' + source + 'source img.syncactive').show();
	/* run the syncml */
	$.post('php/phonebook_sync.php?source=' + source ,function(data) {
		/* report the sync result back  */
		$('#' + source + 'source img.sync').show();
		$('#' + source + 'source img.syncactive').hide();
		show_phonebook();
	});
	window.setTimeout(function(){
		if(source == "gcontacts"){
				setGcontactsSyncStatus();
		}
		else if(source == "highrise"){
				setHighriseSyncStatus();
		}
	}, 1000);
};

function PhonebookShowSource(source,pageNumber,restFilterSearch, updatedTime) {
	var filterSearch;

	if (restFilterSearch) { 
		// Reset the filter search
		filterSearch = "";
		$('#phonebooksearch').val(filterSearch);
	} else {
		filterSearch = $('#phonebooksearch').val();
	}

	/* update the display  */
	$(".phonebookpagenumber").html("");
	$('#phonebook').html("");

	$.ajax({
		url : 'php/listphonebook.php',
		data : {Source: source, PageNumber: pageNumber, FilterSearch: filterSearch, UpdatedTime : updatedTime},
		dataType : "json",
		success: function(data) {
			if(data){
				console.log("got phonebook");
				console.log(data);
				ContactsList = data.Contacts;
				if($("#general_orderby_lastname").prop("checked")){
					data.last_name = true;
				}
				data["Source_"+data.ContactSource] = true;
				if(filterSearch){
					data["FilterSearch"] = filterSearch;
				}
				var html = PhonebookListTemplate(data);
				$('#phonebook').html(html);
				//hide menu untill extensions are configured properly by admin
				if(data.ContactSource == "all" && data.Contacts.length == 0){
					$(".phonebook-meta").hide();
				}
				else{
					$(".phonebook-meta").show();
	  				checkForSync();
					disableChecksForSynchedContacts();
					/* Page Navigation */
					print_pagenavigation(  data.CurrentPageNumber, data.CurrentPageNumber, data.TotalCount, data.PageSize, "phonebook", ".phonebookpagenumber", ".phonebook-pagination-meta");
				}
				contactssource = source;
				if(!rewriteRulesAreSetup){
					$("#rewriteTour").show();
				}
			}
		},
		error : function(xhr, status, thrownError){			
			if(thrownError === "Forbidden"){
				window.location.href = "logout";
			}
		}
	});
};

function disableChecksForSynchedContacts(){
	$(".contact_check.highrise").replaceWith('<a class="contact_check highrise" href="javascript:;"><i class="icon  icon-exclamation-sign"></i></a>');
	$(".contact_check.gcontacts").replaceWith('<a class="contact_check gcontacts" href="javascript:;"><i class="icon  icon-exclamation-sign"></i></a>');
	$(".contact_check.iphone").replaceWith('<a class="contact_check iphone" href="javascript:;"><i class="icon  icon-exclamation-sign"></i></a>');
	$(".contact_check.asterisk").replaceWith('<a class="contact_check asterisk" href="javascript:;"><i class="icon  icon-exclamation-sign"></i></a>');

	var gcontactsContent = 'To edit this contact, first <strong>edit it from your google contacts</strong> and <strong>re-synchronize<strong>.';
	var highriseContent = 'To edit this contact, first <strong>edit it from your highrise contacts</strong> and <strong>re-synchronize</strong>.';
	var iphoneContent = 'To edit this contact, first <strong>edit it from your iphone contacts</strong> and <strong>re-synchronize</strong>.';
	var asteriskContent = 'To edit this contact, first <strong>edit it from Freepbx</strong> and then import from Freepbx FonB GUI module.';

	$("a.contact_check.highrise").popover({html : true, content: highriseContent, trigger : 'hover', placement : "top", title : "This contact can't be edited locally"});
	$("a.contact_check.gcontacts").popover({html : true, content: gcontactsContent, trigger : 'hover', placement : "top", title : "This contact can't be edited locally"});
	$("a.contact_check.iphone").popover({html : true, content: iphoneContent, trigger : 'hover', placement : "top", title : "This contact can't be edited locally"});
	$("a.contact_check.asterisk").popover({html : true, content: asteriskContent, trigger : 'hover', placement : "top", title : "This contact can't be edited locally"});

	$(".contact_check.internal,.contact_check.deleted").replaceWith('<a class="contact_check internal" href="javascript:;"><i class="icon  icon-exclamation-sign"></i></a>');
	internalContent = 'To delete/edit this contact, ask your admin to edit users.cfg file.';
	$("a.contact_check.internal,.contact_check.deleted").popover({html : true, content: internalContent, trigger : 'hover', placement : "top", title : "This contact can't be deleted on web interface"});

	$(".edit-contact").not(".mycontacts").contents().unwrap();
}

function addClidContact(index){
	data = {
		Add: true,
		GContacts: (typeof Settings.GoogleZERO == "undefined"),
		Highrise : (typeof Settings.HighriseZERO == "undefined"),
		PhoneNumber : CallHistoryList[index].CallerClid.Num
	}
	showContactForm(data);
}

hasGContacts = false;
hasHighrise = false;
function addContact(){
	$.ajax({
		async : false,
		url : 'php/gcontacts_sync_status.php',
		dataType : 'json',
		success : function(data){
			if(typeof data.ZERO !== "undefined" && data.ZERO.StatusCode === "NotConfigured"){
				hasGContacts = false;
			}
			else{
				hasGContacts = true;
			}
		}
	});
	$.ajax({
		async : false,
		url : 'php/highrise_sync_status.php',
		dataType : 'json',
		success : function(data){
			if(typeof data.ZERO !== "undefined" && data.ZERO.StatusCode === "NotConfigured"){
				hasHighrise = false;
			}
			else{
				hasHighrise = true;
			}
		}
	});
	data = {
		Add : true,
		GContacts: hasGContacts,
		Highrise : hasHighrise
	};
	showContactForm(data);
}

function showContactForm(data){
	$("#addContactModal").remove();
	var html = AddContactTemplate(data);
	$("body").append(html);
	$("#addContactModal").modal();
}

function deleteContact(){
	$.ajax({
		type : "post",
		data : {"contacts[]" : $.map($(".contact_check:checked"), function(e,i){ return $(e).val(); })},
		url : "php/phonebook_delete.php",
		dataType : "json",
		success : function(data){
			if(typeof data.ERROR != "undefined"){
				$(".top-right").notify({
					message : data.ERROR,
					type : "error"
				}).show();
			}
			else if(typeof data.OK != "undefined"){
				$(".top-right").notify({
					message : data.OK
				}).show();
			}
			PhonebookRefreshSource();
			PhonebookShowSource("all", 1, false);
		},
		error : function(xhr, status, error){
			console.log(error);
		}
	});
}
function contactEdit(event){
	if($(this).parents("tr").find(".contact_check.mycontacts").length != 0){
		var index = $(this).data("index");
		data = {
			Edit : true,
			Id : ContactsList[index].Id,
			FirstName:ContactsList[index].FirstName,
			LastName: ContactsList[index].LastName,
			Company: ContactsList[index].Company,
			Type: ContactsList[index].Label,
			PhoneNumber: ContactsList[index].PhoneNumber
		};
		showContactForm(data);
	}
}
/**
 * This code is supposed to check for blank state.
 * @type {Boolean}
 */
function checkForSync(){
	$.ajax({
		url : "php/gcontacts_sync_status.php",
		dataType : 'json',
		success : function(data){
			if(typeof data.ZERO !== "undefined" && data.ZERO.StatusCode === "NotConfigured"){
				$("#gcontactsTour").show();
				$("#gcontactssource").hide();
				$("#menuSynchronizeGcontacts").hide();
				$("#menuFilterGcontacts").hide();
			}
			else{
				$("#gcontactssource").show();
				$("#menuSynchronizeGcontacts").show();
				$("#menuFilterGcontacts").show();
			}
		},
		error : function(){
			$("#gcontactsTour").show();
			$("#gcontactssource").hide();
			$("#menuSynchronizeGcontacts").hide();
			$("#menuFilterGcontacts").hide();
		}
	});
	$.ajax({
		url : "php/highrise_sync_status.php",
		dataType : 'json',
		success : function(data){
			console.log(data);
			if(typeof data.ZERO !== "undefined" && data.ZERO.StatusCode === "NotConfigured"){
				$("#highrisesource").hide();
				$("#menuSynchronizeHighrise").hide();
				$("#menuFilterHighrise").hide();
			}
			else{
				$("#highrisesource").show();	
				$("#menuSynchronizeHighrise").show();
				$("#menuFilterHighrise").show();
			}
		},
		error : function(){
			$("#highrisesource").hide();
			$("#menuSynchronizeHighrise").hide();
			$("#menuFilterHighrise").hide();
		}
	});
}

function googleContactsTour(){
	options = [
		{
			// CSS selector of desired stop element
			selector: '#nav-settings',               
			// text about stop point
			text    : "Click here to get inside settings"
		},
		{
			selector : ".nav-tabs li:nth-child(2)",
			text : "Click here to switch to contacts settings"
		},
		{
			selector : "#gcontactsgrant",
			text : "Click here to grant access to google contacts and begin synching"
		}
	];
	boneVojage(options, {map : false,
		onNavigation: function(position){
			switch (position){
				case 2:
					$(".nav-tabs li:nth-child(2) a").click();
					break;
			}
		}
	});
	window.setTimeout(function(){$('#nav-settings').find("a").click()},2000);
}
function rewriteTour(){
	options = [
		{
			// CSS selector of desired stop element
			selector: '#nav-settings',               
			// text about stop point
			text    : "Click here to get inside settings"
		},
		{
			selector : ".nav-tabs li:nth-child(3)",
			text : "Click here to switch to rewrite rules settings"
		},
		{
			selector : "#rewrite-rule-select-container",
			text : "Define your rule here"
		}
	];
	boneVojage(options, {map : false,
		onNavigation: function(position){
			switch (position){
				case 2:
					$(".nav-tabs li:nth-child(3) a").click();
				case 3:
					$("#rewrite-rule-select").val(1).change();
					$("#rewrite-rule-text").val("+");
					$("#rewrite-rule-replacement").val("00");
					break;
			}
		}
	});
	window.setTimeout(function(){$('#nav-settings').find("a").click()},2000);
}

function addContactTour(){
	options = [
		{
			// CSS selector of desired stop element
			selector: '#phonebookpage .action-button:eq(0)',               
			// text about stop point
			text    : "Click here to perform any actions for contacts"
		},
		{
			selector : "#phonebookpage .action-button:eq(0) .dropdown-menu>li:eq(0)",
			text : "You can add contact by clicking here"
		}
	];
	boneVojage(options, {map : false, buttons:false});
	window.setTimeout(function(){
		$("#phonebookpage .action-button:eq(0) .dropdown-toggle").click();
		window.boneVojage_main.O.next();
		window.setTimeout(function(){
			window.boneVojage_main.O.hideModal();
			$("#tooltip , div[id*=modal_]").remove();
		}, 3000);
	}
	,3000);
}

function csvTour(){
	options = [
		{
			// CSS selector of desired stop element
			selector: '#importCSVLink',               
			// text about stop point
			text    : "Click here to import a csv"
		}
	];
	boneVojage(options, {map : false, buttons:false});
	window.setTimeout(function(){
		window.boneVojage_main.O.hideModal();
		$("#tooltip , div[id*=modal_]").remove();
	}, 3000);
}
