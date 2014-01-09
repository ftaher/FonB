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
 * @file Main file for inclusion of scripts. Global variables for templates and initial loaded data are declared here.
 * You may include all re-usable code here this file is loaded before all other js files other than 
 * jQuery.min which is loaded before this file
 */
/**
 * @namespace global
 */
if (typeof console == "undefined" || typeof console.log == "undefined") 
{
	
	/**
	 * @memberOf global
	 * @name console
	 * @class
	 */
	var console = {
		/**
		 * console.log() we use console.log method ,if it's not available, we just make a dummy object
		 * @example console.log(CallHistoryList)
		 * @memberOf global.console
		 */ 
		log:function() {} 
	}; 
}
/**
 * @var {string} ActiveCallsRowTemplate
 * @memberOf global
 */
var ActiveCallsRowTemplate;
/**
 * @var {string} CallHistoryShowUserTemplate
 * @memberOf global
 */
var CallHistoryShowUserTemplate;
/**
 * @var {string} CallHistoryListTemplate
 * @memberOf global
 */
var CallHistoryListTemplate;
/**
 * @var {string} CallHistoryDetailedTemplate
 * @memberOf global
 */
var CallHistoryDetailedTemplate;
/**
 * @var {string} PhonebookListSourceTemplate
 * @memberOf global
 */
var PhonebookListSourceTemplate;
/**
 * @var {string} PhonebookListTemplate
 * @memberOf global
 */
var PhonebookListTemplate;
/**
 * @var {string} SwitchboardTemplate
 * @memberOf global
 */
var SwitchboardTemplate;
/**
 * @var {string} SettingsTemplate
 * @memberOf global
 */
var SettingsTemplate;
/**
 * @var {string} ReWriteRulesListTemplate
 * @memberOf global
 */
var ReWriteRulesListTemplate;
/**
 * @var {string} ch_pagenumber
 * @memberOf global
 */
var ch_pagenumber = 1;
/**
 * @var {string} ph_pagenumber
 * @memberOf global
 */
var ph_pagenumber = 1;
/**
 * @var {string} CallHistoryList
 * @memberOf global
 */
var CallHistoryList;
/**
 * @var {string} ContactsList
 * @memberOf global
 */
var ContactsList;
var Settings;
/**
 * @var {function} conference calls template
 */
var ConferenceTemplate;
/**
 * @var {function} new conference call template
 */
var ConferenceRowTemplate;

var AddContactTemplate;
/**
 * @var {string} contactssource
 * @memberOf global
 */
var contactssource = "all";
/**
 * check rewrite rules are setup or not, if not, show wizard for rewrite rules
 * @type {Boolean}
 */
var rewriteRulesAreSetup = false;

/**
 * print page navigation
 * @param  {Number} firstli
 * @param  {Number} currentli
 * @param  {Number} totalrecordcount
 * @param  {Number} pagesize
 * @param  {string} page
 * @param  {string} pagination_links_container
 * @param  {string} pagination_meta_container
 * @return {string}
 * @memberOf global
 */
function print_pagenavigation( firstli, currentli, totalrecordcount, pagesize, page, pagination_links_container, pagination_meta_container ) {
	//	var pagenumber;
	var max_pages = 10;	
	// determin the last page: lastpage
	var lastpage = Math.ceil(totalrecordcount / pagesize);
	// determin the first page: firstli
	if (firstli == currentli )  firstli = currentli - parseInt(max_pages/2);
	if ( firstli < 1 ) firstli = 1;
	if ( ( lastpage - firstli ) < max_pages && lastpage > (max_pages-1) ) firstli = lastpage - (max_pages-1);
	if ( lastpage < (max_pages+1) ) firstli = 1;

	// determin the currentli
	//if ( currentli < max_pages ) currentli = '0' + currentli; else currentli = currentli;


	/* first step, reset the navigation tool */
	var html_li = ""
	$(pagination_links_container).html("");
	$(pagination_meta_container).html("");
	if ( firstli > 1 && lastpage >= max_pages ) html_li = html_li + '<li><a href="javascript:;">1</a></li>'; 
	if ( lastpage > max_pages && firstli > 1 ) html_li = html_li + '<li><a href="javascript:;">«</a></li>'; 

	for ( var i = 0 ; i < max_pages;  i++ ) 
		{
		var sum = i+firstli;
		if ( sum > lastpage ) break;
		if ( i==0 ) 
			{ 
			if ( currentli == sum )
				html_li = html_li + '<li class="firstli currentli active"><a href="javascript:;">' + sum + "</a></li>";
			else
				html_li = html_li + '<li class="firstli"><a href="javascript:;">' + sum + "</a></li>";
			} 
		else if (i==(max_pages-1)) 
			{ 
			if ( currentli == sum )
				html_li = html_li + '<li class="lastli currentli active"><a href="javascript:;">' + sum + "</a></li>"; 
			else
				html_li = html_li + '<li class="lastli"><a href="javascript:;">' + sum + "</a></li>"; 
			} 
		else 
			{ 
			if ( currentli == sum )
				html_li = html_li + '<li class="currentli active"><a href="javascript:;">' + sum + "</a></li>"; 
			else
				html_li = html_li + '<li><a href="javascript:;">' + sum + "</a></li>"; 
			}
		};

	if ( lastpage > max_pages && (lastpage - firstli) > max_pages ) html_li = html_li + '<li><a href="javascript:;">»</a></li>';
	if ( lastpage > max_pages && (lastpage - firstli) >= max_pages ) html_li = html_li + '<li><a href="javascript:;">' + lastpage + '</a></li>';

	/* last step, write the navigation tool */ 
	$(pagination_links_container).html(html_li);
	var recordstart = ( pagesize * (currentli - 1 ) ) + 1;
	if  ( totalrecordcount > (recordstart + pagesize) ) var recordend = parseInt(recordstart) + parseInt(pagesize) - 1;
	else var recordend = totalrecordcount;
	if(recordend > totalrecordcount){
		recordend = totalrecordcount;
	}
	if ( totalrecordcount > 2 ) $(pagination_meta_container).html( I18n.t("Records")+ " " + recordstart + " - " + recordend + " " + I18n.t("of") + " " + totalrecordcount );//Records 1 - 25 of max_pages0

	/* add the click event */
	$(pagination_links_container + ">li>a").click( function (event) {
		pagenumber = $(this).text(); 
		firstli = Number( $(pagination_links_container + ">.firstli:first>a").text() ) ;
		lastli = Number( $(pagination_links_container + ">lastli:first>a").text() );

		if ( pagenumber == '»' ) 
			{
			firstli = parseInt(firstli) + parseInt(max_pages);
			print_pagenavigation( firstli, currentli, totalrecordcount, pagesize ,page, pagination_links_container,pagination_meta_container);
			}
		if ( pagenumber == '«' ) 
			{
			firstli = firstli - max_pages;
			if ( firstli < 1 ) firstli = 1;
			print_pagenavigation( firstli, currentli, totalrecordcount, pagesize, page, pagination_links_container,pagination_meta_container);
			}
		if ( Number(pagenumber) > 0 ) {
			pagenumber = Number(pagenumber);
			switch(page){
				case "callhistory":
					search_request(pagenumber);
					break;
				case "phonebook":
					PhonebookShowSource(contactssource,pagenumber,false);
					break;
			}
		};
	});
}

/**
 * Using jquery autocomplete plugin for showing suggestions on quick dial box in header
 * @class
 * @param {string} url url of server side script that will output result of matches in json
 * @param {object} options autocomplete options
 * @see {@link https://github.com/agarzola/jQueryAutocompletePlugin} for details about plugin
 * @author ftaher
 * @name autocomplete
 * @memberOf common
 */
function setupContactsAutoComplete(selector){
	jQuery(selector).autocomplete({
		"source" : function(request, response){
			$.ajax({
				url : "php/phonebook_search.php",
				data: {
		            timestamp: Math.round(new Date().getTime() / 1000),
		            limit: 12,
		            Search: request.term
          		},
          		dataType : "json",
          		success: function( data ) {
		        	response( $.map( data.Contacts, function( row ) {
						if($.trim(row.ContactName) == ""){
							row.ContactName = row.ContactTelephoneNumber;
							if(row.ContactTelephoneNumber == "")
								return;
						}
			            return {
			            	label:row.ContactName,
			            	value: row.ContactTelephoneNumber,
			            	row : row
			            }
		            }));
		        },
				error : function(jqXHR, textStatus, thrownError){
					if(thrownError === "Forbidden"){
						window.location.href = "/logout";
					}
				}
			});
		},
		open: function(){
        	$('.ui-autocomplete').css({"width" : ($(this).width() + 55) + "px" , "left" : $(this).offset().left - 25 + "px"});
        }
	}).data("ui-autocomplete")._renderItem = function( ul, item ) {
		row = item.row;
		var imgHtml = "";
			switch ( row.ContactSourceType ){
			case "internal":
				var printdepartment = "";
				if ( row.ContactDepartment == null ){
					printdepartment = row.ContactName;
				}
				else{
					printdepartment = row.ContactDepartment + ": " + row.ContactName;
				}
				imgHtml = '<img src="images/qd_internal.png"> ' + printdepartment + "<BR>" + "<strong>" + row.ContactTelephoneNumber + "</strong>";
				break;
			case "mycontacts":
				var printtypenum = "";
				if ( row.ContactTelephoneType == "" ){
					printtypenum = "<strong>" + row.ContactTelephoneNumber + "</strong>";
				}
				else{
					printtypenum = row.ContactTelephoneType + ": <strong>" + row.ContactTelephoneNumber + "</strong>"
				};
				imgHtml = '<img src="images/qd_mycontacts.png"> ' + row.ContactName + "<BR>" + printtypenum;
				break;
			case "gcontacts":
				var printtypenum ="";
				if ( row.ContactTelephoneType == "" ){
					printtypenum = "<strong>" + row.ContactTelephoneNumber + "</strong>";
				}
				else{
					printtypenum = row.ContactTelephoneType + ": <strong>" + row.ContactTelephoneNumber + "</strong>";
				}
				imgHtml = '<img src="images/qd_gcontacts.png"> ' + row.ContactName + "<BR>" + printtypenum;
				break;
			case "iphone":
				var printtypenum ="";
				if ( row.ContactTelephoneType == "" ){
					printtypenum = "<strong>" + row.ContactTelephoneNumber + "</strong>";
				}
				else{
					printtypenum = row.ContactTelephoneType + ": <strong>" + row.ContactTelephoneNumber + "</strong>";
				}
				imgHtml = '<img src="images/qd_iphone.png"> ' + row.ContactName + "<BR>" + printtypenum;
				break;
			case "asterisk":
				var printtypenum ="";
				if ( row.ContactTelephoneType == "" ){
					printtypenum = "<strong>" + row.ContactTelephoneNumber + "</strong>";
				}
				else{
					printtypenum = row.ContactTelephoneType + ": <strong>" + row.ContactTelephoneNumber + "</strong>";
				}
				imgHtml = '<img src="images/ch_asterisk.png"> ' + row.ContactName + "<BR>" + printtypenum;
				break;
			case "crm":
			case "highrise":
				var printtypenum = "";
				if ( row.ContactTelephoneType == "" ){
					printtypenum = "<strong>" + row.ContactTelephoneNumber + "</strong>";
				}
				else{
					var printtypenum = row.ContactTelephoneType + ": <strong>" + row.ContactTelephoneNumber + "</strong>";
				}
				imgHtml = '<img src="images/qd_crm.png"> ' + row.ContactName + "<BR>" + printtypenum;
				break;
		}
		if($.trim(imgHtml) == "")
			return $( "<li></li>" ).css({"display":"none" , "tabindex" : -1});
        else
        	return $( "<li></li>" )
            .data( "item.autocomplete", item )
            .append( "<a>"+ imgHtml + "</a>" ) 
            .appendTo( ul );
    };
}
function getNumberLookupData(obj){
	var contact = {
		number : obj.Num,
		type : "",
		name : "",
		url : "",
		source : ""

	};
	if(typeof obj.Highrise !== "undefined"){
		contact.name = obj.Highrise;
		if(typeof obj.HighriseType !== "undefined"){
			contact.type = obj.HighriseType.toLowerCase();
		}
		if(typeof obj.HighriseId !== "undefined"){
			contact.url = "http://" + $("#highrise_sitename").val() + ".highrisehq.com/people/" + obj.HighriseId;
		}
		contact.source = "highrise";
	}
	else if(typeof obj.GContacts !== "undefined"){
		contact.name = obj.GContacts;
		if(typeof obj.GContactsType !== "undefined"){
			contact.type = obj.GContactsType.toLowerCase();
		}
		if(typeof obj.GContactsId !== "undefined"){
			contact.url = obj.GContactsId;
		}
		contact.source = "gcontacts";
	}
	else if(typeof obj.MyContacts !== "undefined"){
		contact.name = obj.MyContacts;
		if(typeof obj.MyContactsType !== "undefined"){
			contact.type = obj.MyContactsType.toLowerCase();
		}
		contact.source = "mycontacts";
	}
	else if(typeof obj.iPhone !== "undefined"){
		contact.name = obj.iPhone;
		if(typeof obj.iPhoneType !== "undefined"){
			contact.type = obj.iPhoneType.toLowerCase();
		}
		contact.source = "iphone";
	}
	else if(typeof obj.AsteriskPhonebook !== "undefined"){
		contact.name = obj.AsteriskPhonebook;
		if(typeof obj.AsteriskPhonebookSpeedDial !== "undefined"){
			contact.type = obj.AsteriskPhonebookSpeedDial;
		}
		contact.source = "asterisk";
	}
	else if(typeof obj.Internal !== "undefined"){
		contact.name = obj.Internal;
		contact.source = "internal";
	}
	return contact;
}
function updateQuickDialMeta(number){
	$.ajax({
		url : "php/phonebook_number_lookup.php?Num=" + number,
		dataType : "json",
		success : function(data){
			var blankMessage = "Search contacts or type number to dial";
			if(!data){
				$("#quickdial-info").html(blankMessage);
				return;
			}
			$imageElem = $("<span></span>");
			$linkElem = $("<span style='margin-left:10px;'></span>");

			if(typeof data.Internal != "undefined"){
				var rel = data.Internal;
				if(rel.match(/,/)){
					temp = rel.split(",");
					rel = $.trim(temp[1]);
				}
				$imageElem.append('<a style="margin-right:5px;" data-source="internal" href="javascript:;" rel="' + rel + '"><img src="images/ch_internal.png" alt="internal"/></a>');
				$linkElem.append('<a style="color:white;display:none;" class="quickdialmetalink internal" href="javascript:;" rel="' + rel + '">' + data.Internal + '</a>');
			}
			if(typeof data.GContacts != "undefined"){
				$imageElem.append('<a style="margin-right:5px;" data-source="gcontacts" href="javascript:;" rel="' + data.GContacts + '"><img src="images/ch_gcontacts.png" alt="gcontacts"/></a>');
				$linkElem.append('<a style="color:white;display:none;" class="quickdialmetalink gcontacts" href="javascript:;" rel="' + data.GContacts + '">' + data.GContacts + ' <span style="font-size:8px;">&nbsp;'  + data.GContactsType + '</span></a>');
			}
			if(typeof data.iPhone != "undefined"){
				$imageElem.append('<a style="margin-right:5px;" data-source="iphone" href="javascript:;" rel="' + data.iPhone + '"><img src="images/ch_iphone.png" alt="iphone"/></a>');
				$linkElem.append('<a style="color:white;display:none;" class="quickdialmetalink iphone" href="javascript:;" rel="' + data.iPhone + '">' + data.iPhone + ' <span style="font-size:8px;">&nbsp;'  + data.iPhoneType + '</span></a>');
			}
			if(typeof data.AsteriskPhonebook != "undefined"){
				$imageElem.append('<a style="margin-right:5px;" data-source="asterisk" href="javascript:;" rel="' + data.AsteriskPhonebook + '"><img src="images/ch_asterisk.png" alt="asterisk"/></a>');
				$linkElem.append('<a style="color:white;display:none;" class="quickdialmetalink asterisk" href="javascript:;" rel="' + data.AsteriskPhonebook + '">' + data.AsteriskPhonebook + ' <span style="font-size:8px;">&nbsp;'  + data.AsteriskPhonebookSpeedDial + '</span></a>');
			}
			if(typeof data.Highrise != "undefined"){
				$imageElem.append('<a style="margin-right:5px;" data-source="highrise" href="javascript:;" rel="' + data.Highrise + '"><img src="images/ch_highrise.png" alt="highrise"/></a>');
				$linkElem.append('<a style="color:white;display:none;" class="quickdialmetalink highrise" href="javascript:;" rel="' + data.Highrise + '">' + data.Highrise + ' <span style="font-size:8px;">&nbsp;'  + data.HighriseType + '</span></a>');
			}
			if(typeof data.MyContacts != "undefined"){
				$imageElem.append('<a style="margin-right:5px;" data-source="mycontacts" href="javascript:;" rel="' + data.MyContacts + '"><img src="images/ch_mycontacts.png" alt="mycontacts"/></a>');
				$linkElem.append('<a style="color:white;display:none;" class="quickdialmetalink mycontacts" href="javascript:;" rel="' + data.MyContacts + '">' + data.MyContacts + ' <span style="font-size:8px;">&nbsp;'  + data.MyContactsType + '</span></a>');
			}
			if($linkElem.children().length != 0){
				$("#quickdial-info").html($imageElem).append($linkElem);

				$("#quickdial-info").find("a.quickdialmetalink:eq(0)").show();
				$("#quickdial-info").find("a:not(.quickdialmetalink)").on("mouseover", function(){
					$metalinks = $("#quickdial-info").find("a.quickdialmetalink").hide();
					$metalinks.filter("." + $(this).data("source")).show();
				});
			}
			else{
				$("#quickdial-info").html(blankMessage);
			}
		}
	});
}
/**
 * needed for checking for asterisk contacts in contacts listing.
 * @param  {string} source
 */
Handlebars.registerHelper('ifAsterisk', function(source, options) {
  if(source === "asterisk") {
    return options.fn(this);
  }
  return options.inverse(this);
});
//get the settings
$.ajax({
	url : "php/settings.php",
	async: false,
	dataType : "json",
	success : function(data){
		TemplateLanguage = data.general_language;
	}
});
//extend handlebars to include i18n
var I18n = new i18n(TemplateLanguage);
Handlebars.registerHelper('t',
  function(str){
    return (I18n.t(str));
  }
);