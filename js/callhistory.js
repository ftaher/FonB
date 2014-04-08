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
 * @file contains all javascript related with call history page
 */
/**
 * @namespace callhistory
 */

fonb_callhistory = {
	init : function(){
		$("#callhistorypage").remove();
		$.ajax({
			url : "templates/" + I18n.template + "/callhistory.html",
			async : false,
			success : function(data){
				var chTemplate = Handlebars.compile(data);
				$("#pagebox").append(chTemplate());
			}
		});
		$.ajax({
			url : "php/listdepartments.php",
			dataType: 'json',
			async : false,
			success: function(data) 
			{
				console.log(data);
				var html = CallHistoryShowUserTemplate(data);
				$('#ShowByUser select').html(html);
				$("#ShowByUser").fancyselect({showValue : true, filter: true}).find('.btn').addClass("btn-primary").prepend("<i class='icon icon-user icon-white'></i>&nbsp;").width(140);
				$("#ShowByDirection,#ShowByDate").fancyselect().find(".dropdown-toggle").on("click",function(){
					$(this).parent().toggleClass('open');
					$("#search-dropdown").find(".open").not($(this).parent()).removeClass("open");
				});
				$("#search-dropdown").on("click", function(e){
					if(!($(e.target).hasClass("dropdown-toggle"))){
						$("#search-dropdown").find(".open").removeClass("open");
					}
				})
			},
			error : function(jqXHR, textStatus, thrownError){
				if(thrownError === "Forbidden"){
					window.location.href = "logout";
				}
			}
		});
		$( "#slider-range" ).slider({
			min: 0,
			max: 180,
			value: $("#morethan").val(),
			step: 1,
			slide: function( event, ui ) {
				$("#amount").text( ui.value + " " + I18n.t("minutes") );
				$("#morethan").val( ui.value );
			}
		});

		$( "#amount" ).text( $("#slider-range").slider("value") + " " + I18n.t("minutes") );
		$( "#morethan" ).val( $("#slider-range").slider("value") );

		$( "#datepicker" ).datepicker({onClose  : function(date, obj){
			$("#search-dropdown").parent().addClass("open");
		}});
		/*Stop datepicker from closing dropdown menu*/
	  	$("#ui-datepicker-div").click( function(event) {
			event.stopPropagation();
		});

		$( "#search-dropdown").click(function(e){
			/**
			 * this trick is required because clicking on span element inside a, stopped event propagation
			 * and select box couldn't be opened. To fix this bug and enable click on span we add a trick class
			 * and toggle it with clicks.
			 * this is dirty, i know... but it's important 
			 */
			$me = $(e.target);
			$parent = $me.parent();
			$grandpa = $parent.parent();
	  		if($parent.is(".btn.dropdown-toggle") || $me.is(".btn.dropdown-toggle")){
	  			if($parent.hasClass("trick")){
	  				$parent.removeClass("trick open");
	  			}
	  			else if($grandpa.hasClass("trick")){
	  				$grandpa.removeClass("trick open");
	  			}
	  			else if(!$me.is(".btn.dropdown-toggle") && !$grandpa.is(".open,.trick")){
	  				$grandpa.addClass("open trick");
	  			}
	  		}
	  		/**
	  		 * Don't close dropdown if any click happens inside it
	  		 */
			e.stopPropagation();
		});

		/* finaly load the call History page */
		search_request( 1 );

	},
	deleteVoicemail : function(id, url){
		$(".btn.voicemail_" +id).prop("disabled", true);
		if(confirm("Are you sure you want to delete voicemail?")){
			$(".btn.voicemail_" +id).siblings("img").show();
			$.ajax({
				url : url,
				success : function(data){
					CallHistoryList[15]["VoiceMail"] = "";
					$(".btn.voicemail_" +id).prop("disabled", false);
					$(".btn.voicemail_" +id).siblings("img").hide();
					$(".note.voicemail_" +id).after('<div class="alert alert-success"><a href="#" class="close" data-dismiss="alert">&times;</a>Voicemail deleted successfully.</div>');
					$(".voicemail_" +id).fadeOut("slow", function(){
						$(".voicemail_" +id).remove();
					});
				},
				error : function(){
					$(".btn.voicemail_" +id).prop("disabled", false);
					$(".btn.voicemail_" +id).after('<div class="alert alert-danger"><a href="#" class="close" data-dismiss="alert">&times;</a>Error occured in deleting voicemail.</div>');
				}
			});
		}
	}
}

function search_request( ch_pagenumber ) {
	// set the ch_pagenubmer to 1 as default value
	ch_pagenumber = typeof ch_pagenumber !== 'undefined' ? ch_pagenumber : 1;

	// get some values from elements on the page:
	var any = $("#callhistorysearch").val();
	var hasattachment = $("#hasattachment").prop('checked')?"on":"off";
	var datepicker = $("#datepicker").val();
	var morethan = $("#morethan").val();
	var ShowByUser = $('#ShowByUser select').val();
	var ShowByDate = $('#ShowByDate select').val();
	var ShowByDirection = $('#ShowByDirection select').val();

	var html_li = ""
	$(".ch_pagenumber").html(html_li);
	$('#callhistory tbody').html("");
	dataObj = {pagenumber: ch_pagenumber, ShowByDirection: ShowByDirection, ShowByUser: ShowByUser, ShowByDate: ShowByDate, any: any, hasattachment: hasattachment, calldate: datepicker, morethan: morethan, submit: "search1"};
	$.ajax({
		url : 'php/listcallhistory.php',
		data : dataObj ,
		dataType : 'json',
		success : function(data) {
			CallHistoryList = data.CallHistoryList
			data.last_name = $("#general_orderby_lastname").prop("checked");
			var renderoutput = CallHistoryListTemplate(data);
			$('#callhistory_list_div').html(renderoutput);

			// apply js dynamic CSS
			$('.Duration:empty').html("XXXX").css("color","#ff9999")
			
			$('.CallerClid').each(function (index) {
				var dst = $(this).find('span.dst').text();
				var crm = $(this).find('span.crm').text();
				var asterisk = $(this).find('span.asterisk').text();
				var personal = $(this).find('span.personal').text();
				var gcontacts = $(this).find('span.gcontacts').text();
				var internal = $(this).find('span.internal').text();
				var deleted = $(this).find('span.deleted').text();
				var queue = $(this).find('span.queue').text();
				var ringgroup = $(this).find('span.ringgroup').text();
				var iphone = $(this).find('span.iphone').text();
				if ( crm != "" ) $(this).find('img.crm').show();
				if ( personal != "" ) $(this).find('img.personal').show();
				if ( asterisk != "" ) $(this).find('img.asterisk').show();
				if ( gcontacts != "" ) $(this).find('img.gcontacts').show();
				if ( internal != "" ) $(this).find('img.internal').show();
				if ( deleted != "" ) $(this).find('img.deleted').show();
				if ( queue != "" ) $(this).find('img.queue').show();
				if ( ringgroup != "" ) $(this).find('img.ringgroup').show();
				if ( iphone != "" ) $(this).find('img.iphone').show();
				
				if ( internal != "" ) $(this).find('span.internal').show();
				else if ( deleted != "" ) $(this).find('span.deleted').show();
				else if ( queue != "" ) $(this).find('span.queue').show();
				else if ( ringgroup != "" ) $(this).find('span.ringgroup').show();
				else if ( iphone != "" ) $(this).find('span.iphone').show();
				else if ( gcontacts != "" ) $(this).find('span.gcontacts').show();
				else if ( personal != "" ) $(this).find('span.personal').show();
				else if ( crm != "" ) $(this).find('span.crm').show();
				else if ( asterisk != "" ) $(this).find('span.asterisk').show();
				else $(this).find('span.dst').show();
			});
			/* interna.prop("checked");l mouseover action */
			$('.CallerClid img.internal').mouseover( function (event) {
				var $dstobj = $(this).parent();
				$dstobj.find('span').not('.queue').hide();
				$dstobj.next().find('span').hide();
				$dstobj.next().find('.internal').show();
				$dstobj.find('span.internal').show();
			});
			$('.CallerClid img.deleted').mouseover( function (event) {
				var $dstobj = $(this).parent();
				$dstobj.find('span').hide();
				$dstobj.next().find('span').hide();
				$dstobj.next().find('.deleted').show();
				$dstobj.find('span.deleted').show();
			});
			$('.CallerClid img.queue').mouseover( function (event) {
				var $dstobj = $(this).parent();
				$dstobj.find('span').hide();
				$dstobj.next().find('span').hide();
				$dstobj.next().find('.queue').show();
				$dstobj.find('span.queue').show();
			});
			$('.CallerClid img.ringgroup').mouseover( function (event) {
				var $dstobj = $(this).parent();
				$dstobj.find('span').hide();
				$dstobj.next().find('span').hide();
				$dstobj.next().find('.ringgroup').show();
				$dstobj.find('span.ringgroup').show();
			});
		
			/* gcontacts mouseover action */
			$('.CallerClid img.gcontacts').mouseover( function (event) {
				var $dstobj = $(this).parent();
				$dstobj.find('span').hide();
				$dstobj.next().find('span').hide();
				$dstobj.next().find('.gcontacts').show();
				$dstobj.find('span.gcontacts').show();
			});
		
			/* personal mouseover action */
			$('.CallerClid img.personal').mouseover( function (event) {
				var $dstobj = $(this).parent();
				$dstobj.find('span').hide();
				$dstobj.next().find('span').hide();
				$dstobj.find('span.personal').show();
			});
			/* crm mouseover action */
			$('.CallerClid img.crm').mouseover( function (event) {
				var $dstobj = $(this).parent();
				$dstobj.find('span').hide();
				$dstobj.next().find('span').hide();
				$dstobj.next().find('.crm').show();
				$dstobj.find('span.crm').show();
			});

			$('.CallerClid img.asterisk').mouseover( function (event) {
				var $dstobj = $(this).parent();
				$dstobj.find('span').hide();
				$dstobj.next().find('span').hide();
				$dstobj.next().find('.asterisk').show();
				$dstobj.find('span.asterisk').show();
			});

			/* iphone mouseover action */
			$('.CallerClid img.iphone').mouseover( function (event) {
				var $dstobj = $(this).parent();
				$dstobj.find('span').hide();
				$dstobj.next().find('span').hide();
				$dstobj.next().find('.iphone').show();
				$dstobj.find('span.iphone').show();
			});
			
			/* checkbox highlight */
			$(".close-detail").click( function (event) {
				var detailedrecord = $(this).parents('.Detailed');
				//var callhistoryitem = detailedrecord.prev();
				//callhistoryitem.show();
				detailedrecord.slideUp();
			});
			
			$(".Summary").click(getSummary);
			

			/* Page Navigation */
			print_pagenavigation(  data.CurrentPageNumber, data.CurrentPageNumber, data.TotalCount, data.PageSize, "callhistory", ".ch_pagenumber", ".pagination-meta");
			//setCallHistoryFilter();
			clearCommas();
		},
		error : function(xhr, status, thrownError){
			if(thrownError === "Forbidden"){
				window.location.href = "/logout";
			}
		}
	});
};

function getSummary(event) {
	var detailedrecord = $(this).next();
	
	//we want to slide up on second click
	if($(this).data("slideUp") == true){
		$(detailedrecord).slideUp("slow", function(){$(this).prev().animate({"backgroundColor":"#FFF"});});
		$(this).data("slideUp",false);
		return;
	}
	//outbound call color
	var backgroundColor = "#ECFAFF";
	if($(this).is(".Inbound")){
		backgroundColor = "#DEFFDE";
	}
	else if($(this).is(".Missed")){
		backgroundColor = "#FFF2F2";
	}
	$(this).data("slideUp", true).css("backgroundColor", backgroundColor);

	var recordid = $(this).attr("id").substr(8);
	//$(this).hide();
	var CallHistoryRecord = CallHistoryList[recordid];
	CallHistoryRecord.recordid = recordid;
	console.log(CallHistoryRecord);
	var renderoutput =	CallHistoryDetailedTemplate(CallHistoryRecord);
	detailedrecord.find('DIV.main').html(renderoutput);
	detailedrecord.slideDown();
	//for destination hover events
	var dst = $(detailedrecord).find('.dst span.dstnum').text();
	var crm = $(detailedrecord).find('.dst span.crm').text();
	var asterisk = $(detailedrecord).find('.dst span.asterisk').text();
	var personal = $(detailedrecord).find('.dst span.personal').text();
	var gcontacts = $(detailedrecord).find('.dst span.gcontacts').text();
	var internal = $(detailedrecord).find('.dst span.internal').text();
	var deleted = $(detailedrecord).find('.dst span.deleted').text();
	var queue = $(detailedrecord).find('.dst span.queue').text();
	var ringgroup = $(detailedrecord).find('.dst span.ringgroup').text();
	var iphone = $(detailedrecord).find('.dst span.iphone').text();
	if ( crm != "" ) $(detailedrecord).find('.dst img.crm').show();
	if ( personal != "" ) $(detailedrecord).find('.dst img.personal').show();
	if ( gcontacts != "" ) $(detailedrecord).find('.dst img.gcontacts').show();
	if ( internal != "" ) $(detailedrecord).find('.dst img.internal').show();
	if ( deleted != "" ) $(detailedrecord).find('.dst img.deleted').show();
	if ( queue != "" ) $(detailedrecord).find('.dst img.queue').show();
	if ( ringgroup != "" ) $(detailedrecord).find('.dst img.ringgroup').show();
	if ( asterisk != "" ) $(detailedrecord).find('.dst img.asterisk').show();
	if ( iphone != "" ) $(detailedrecord).find('.dst img.iphone').show();
	if(dst != ourextension && dst != "hold"){
	 	$(detailedrecord).find('.dst .dial').show();
		if($(detailedrecord).find('.dst img').length == 0){
			$(detailedrecord).find('.dst .addcontact').show();
		}
	}
	

	if ( internal != "" ) {$(detailedrecord).find('.dst span.internal').show();console.log(internal);}
	else if ( deleted != "" ) {$(detailedrecord).find('.dst span.deleted').show();console.log(deleted);}
	else if ( queue != "" ) {$(detailedrecord).find('.dst span.queue').show();console.log(queue);}
	else if ( ringgroup != "" ) {$(detailedrecord).find('.dst span.ringgroup').show();console.log(ringgroup);}
	else if ( gcontacts != "" ){ $(detailedrecord).find('.dst span.gcontacts').show(); console.log("showing");}
	else if ( personal != "" ) $(detailedrecord).find('.dst span.personal').show();
	else if ( crm != "" ) $(detailedrecord).find('.dst span.crm').show();
	else if ( asterisk != "" ) $(detailedrecord).find('.dst span.asterisk').show();
	else if ( iphone != "" ) $(detailedrecord).find('.dst span.iphone').show();
	else $(detailedrecord).find('.dst span.dst').show();
	//for source hover events
	dst = $(detailedrecord).find('.src span.dstnum').text();
	crm = $(detailedrecord).find('.src span.crm').text();
	personal = $(detailedrecord).find('.src span.personal').text();
	gcontacts = $(detailedrecord).find('.src span.gcontacts').text();
	asterisk = $(detailedrecord).find('.src span.asterisk').text();
	internal = $(detailedrecord).find('.src span.internal').text();
	deleted = $(detailedrecord).find('.src span.deleted').text();
	queue = $(detailedrecord).find('.src span.queue').text();
	ringgroup = $(detailedrecord).find('.src span.ringgroup').text();
	iphone = $(detailedrecord).find('.src span.iphone').text();
	if ( crm != "" ) $(detailedrecord).find('.src img.crm').show();
	if ( personal != "" ) $(detailedrecord).find('.src img.personal').show();
	if ( gcontacts != "" ) $(detailedrecord).find('.src img.gcontacts').show();
	if ( iphone != "" ) $(detailedrecord).find('.src img.iphone').show();
	if ( asterisk != "" ) $(detailedrecord).find('.src img.asterisk').show();
	if ( internal != "" ) $(detailedrecord).find('.src img.internal').show();
	if ( internal != "" ) {$(detailedrecord).find('.src span.internal').show();console.log(internal);}
	if ( deleted != "" ) $(detailedrecord).find('.src img.deleted').show();
	if ( deleted != "" ) {$(detailedrecord).find('.src span.deleted').show();console.log(deleted);}
	if ( queue != "" ) $(detailedrecord).find('.src img.queue').show();
	if ( queue != "" ) {$(detailedrecord).find('.src span.queue').show();console.log(queue);}
	if ( ringgroup != "" ) $(detailedrecord).find('.src img.ringgroup').show();
	if ( ringgroup != "" ) {$(detailedrecord).find('.src span.ringgroup').show();console.log(ringgroup);}
	else if ( iphone != "" ) $(detailedrecord).find('.src span.iphone').show();
	else if ( gcontacts != "" ){ $(detailedrecord).find('.src span.gcontacts').show(); console.log("showing");}
	else if ( personal != "" ) $(detailedrecord).find('.src span.personal').show();
	else if ( crm != "" ) $(detailedrecord).find('.src span.crm').show();
	else $(detailedrecord).find('.src span.dst').show();

	if(dst != ourextension && dst != "hold"){
	 	$(detailedrecord).find('.src .dial').show();
		if($(detailedrecord).find('.src img').length == 0){
			$(detailedrecord).find('.src .addcontact').show();
		}
	}

	/* gcontacts mouseover action */
	$(detailedrecord).find('img.gcontacts').mouseover( function (event) {
		var $dstobj = $(this).parent();
		$dstobj.find('span').not(".from,.dial,.dial span").hide();
		$dstobj.find('span.gcontacts').show();
	});

	/* personal mouseover action */
	$(detailedrecord).find('img.personal').mouseover( function (event) {
		var $dstobj = $(this).parent();
		$dstobj.find('span').not(".from,.dial,.dial span").hide();
		$dstobj.find('span.personal').show();
	});
	/* crm mouseover action */
	$(detailedrecord).find('img.crm').mouseover( function (event) {
		var $dstobj = $(this).parent();
		$dstobj.find('span').not(".from,.dial,.dial span").hide();
		$dstobj.find('span.crm').show();
	});

	/* asterisk mouseover action */
	$(detailedrecord).find('img.asterisk').mouseover( function (event) {
		var $dstobj = $(this).parent();
		$dstobj.find('span').not(".from,.dial,.dial span").hide();
		$dstobj.find('span.asterisk').show();
	});
	/* iphone mouseover action */
	$(detailedrecord).find('img.iphone').mouseover( function (event) {
		var $dstobj = $(this).parent();
		$dstobj.find('span').not(".from,.dial,.dial span").hide();
		$dstobj.find('span.iphone').show();
	});
	/* internal mouseover action */
	$(detailedrecord).find('img.internal').mouseover( function (event) {
		var $dstobj = $(this).parent();
		$dstobj.find('span').not(".from,.dial,.dial span").hide();
		$dstobj.find('span.internal').show();
	});	
	$(detailedrecord).find('img.deleted').mouseover( function (event) {
		var $dstobj = $(this).parent();
		$dstobj.find('span').not(".from,.dial,.dial span").hide();
		$dstobj.find('span.deleted').show();
	});	
	$(detailedrecord).find('img.queue').mouseover( function (event) {
		var $dstobj = $(this).parent();
		$dstobj.find('span').not(".from,.dial,.dial span").hide();
		$dstobj.find('span.queue').show();
	});	
	$(detailedrecord).find('img.ringgroup').mouseover( function (event) {
		var $dstobj = $(this).parent();
		$dstobj.find('span').not(".from,.dial,.dial span").hide();
		$dstobj.find('span.ringgroup').show();
	});			
	$(detailedrecord).find('.Duration:empty').html("XXXX").css("color","#ff9999");
	$mp3player = $(detailedrecord).find('.mp3player');
	if($mp3player.length > 0){
		var flashHtml = '<object type="application/x-shockwave-flash" data="flash/player.swf" height="20" width="290">\
    <param name="movie" value="flash/player.swf">\
    <param name="FlashVars" value="playerID=audioplayer' + recordid + '&amp;soundFile=' + encodeURIComponent($mp3player.data("url")) + '&amp;noinfo=yes">\
    <param name="quality" value="high">\
    <param name="menu" value="false">\
    <param name="wmode" value="transparent">\
  </object>';
	    $mp3player.html(flashHtml);
	}
}

function setCallHistoryFilter(){
	var typeaheadSource = Array('Outbound', 'Inbound', 'Missed', 'VoiceMail');
	for(i=0;i<CallHistoryList.length;i++){
		if(($.inArray(CallHistoryList[i].CallOwner.Internal, typeaheadSource)) == -1){
			typeaheadSource.push(CallHistoryList[i].CallOwner.Internal);
		}
		if(typeof CallHistoryList[i].CallerClid.Crm != "undefined" && ($.inArray(CallHistoryList[i].CallerClid.Crm, typeaheadSource)) == -1){
			typeaheadSource.push(CallHistoryList[i].Dst.Crm);
		}
		if(($.inArray(CallHistoryList[i].Dst.Num, typeaheadSource)) == -1){
			typeaheadSource.push(CallHistoryList[i].Dst.Num);
		}
	}
	$.expr[':'].containsi = function(a,i,m){
			return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase())>=0;
	};
	typeaheadInput = $("INPUT#callhistorysearch");
	callhistoryRows = $(".call-history-grid-row");
	typeaheadInput.typeahead({
		source : typeaheadSource,
		updater : function(item){
			if($.trim(item) == ""){
				callhistoryRows.removeClass("hide");
			}
			else{
				item = item.replace(/(\(|\)).*/g,"");
				filtered = callhistoryRows.not(":containsi(" + item +")");
				filtered.addClass("hide");
				callhistoryRows.not(filtered).removeClass("hide");
			}
			return item;
		}
	}).keyup(function(){
		item = $(this).val();
		if($.trim(item) == ""){
			callhistoryRows.removeClass("hide");
		}
		else{
			item = item.replace(/(\(|\)).*/g,"");
			filtered = callhistoryRows.not(":containsi(" + item +")");
			filtered.addClass("hide");
			callhistoryRows.not(filtered).removeClass("hide");
		}
	});
}

function clearCommas(){
	$("#callhistory_list_div").find(".contact-name").each(function(){
		var content = $(this).text();
		newContent = $.trim(content).replace(/,\s*$/g, '');
		$(this).text(newContent);
	});
}

function search_submit() {
	search_request( 1 );
	return false;
};

function getcrmnote( recordid ) {
	/* get the crm note */
	$('#detailed_' + recordid + ' .option_update_crmnote a').hide();
	$('#detailed_' + recordid + ' .option_update_crmnote img').show();
	var CallHistoryRecord = CallHistoryList[recordid];
	var HighriseNoteId = CallHistoryRecord['HighriseNoteId'];

	$.get('php/updatecrmnote.php', { CrmNoteId: HighriseNoteId } ,function(data){
		if (typeof data.error !== "undefined" ){
			$('#detailed_' + recordid + ' .option_update_crmnote a').show();
			$('#detailed_' + recordid + ' .option_update_crmnote img').hide();
		}
		else{
			if(typeof data.body == "string"){
				$('#detailed_' + recordid + ' textarea').val(data.body);
			}
			$('#detailed_' + recordid + ' .option_update_crmnote a').show();
			$('#detailed_' + recordid + ' .option_update_crmnote img').hide();
			$("#note_error_"+recordid).hide("slow");
		}

	},'json');
}

function updatecrmnote( recordid ) {
	var CallHistoryRecord = CallHistoryList[recordid];
	var HighriseNoteId = CallHistoryRecord['HighriseNoteId'];
	var CrmCallerId = CallHistoryRecord['CallerClid']['HighriseId'];
	var CrmOwnerId = CallHistoryRecord['CallOwner']['HighriseId'];
	var note = $('#detailed_' + recordid + ' textarea').val();
	if ( note == "" ) note = " ";
	$('#detailed_' + recordid + ' textarea').prop('disabled', true);
	$('#detailed_' + recordid + ' .option_update_crmnote a').hide();
	$('#detailed_' + recordid + ' .option_update_crmnote img').show();
	//console.log("The recordid:" + recordid);
	//console.log("The note is:" + note);
	postData = {CallHistoryRecord: CallHistoryRecord, CrmNoteId: HighriseNoteId, CrmCallerId: CrmCallerId, CrmOwnerId: CrmOwnerId, note: note};
	$.ajax({
		url : 'php/updatecrmnote.php', 
		data : postData ,
		dataType : "json",
		type : "post",
		success: function(data) 
		{	
			console.log("===============got crm response===========");
			console.log(data);
			/* notify to the user the result of the return */
			if (data != null && typeof data.error != "undefined" ){
				$('#detailed_' + recordid + ' textarea').prop('disabled',false);
				$('#detailed_' + recordid + ' .option_update_crmnote a').show();
				$('#detailed_' + recordid + ' .option_update_crmnote img').hide();
				$("#note_error_"+recordid).removeClass("alert-success").addClass("alert-error").html(data.error).show("slow");
			}
			else{
				//	console.log(data)
				$('#detailed_' + recordid + ' textarea').removeAttr('disabled');
				$('#detailed_' + recordid + ' .option_update_crmnote a').show();
				$('#detailed_' + recordid + ' .option_update_crmnote img').hide();
				if(HighriseNoteId == ""){
					CallHistoryList[recordid]['HighriseNoteId'] = data.id;
				}
			}

		},
		error : function(xhr,error,message){
			console.log("chutiyapa ho gaya");
		}
	});


}

function gotocrmpage( recordid ) {
	var CallHistoryRecord = CallHistoryList[recordid];
	var CrmCallerId = CallHistoryRecord['CallerClid']['HighriseId'];
	var CrmOwnerId = CallHistoryRecord['CallOwner']['HighriseId'];
	window.open("http://" + $("#highrise_sitename").val() + ".highrisehq.com/people/" + CrmCallerId);
	$.get('php/gotocrmpage.php', { CrmCallerId: CrmCallerId , CrmOwnerId: CrmOwnerId } ,function(data){
		if (data && data.error != undefined ){
			$('#detailed_' + recordid + ' .option_goto_crmpage').hide();			
			$("#note_error_"+recordid).removeClass("alert-success").addClass("alert-error").html(data.error).show("slow");
		}
		else{
			$('#detailed_' + recordid + ' .option_goto_crmpage>a').attr({
				href : data.url,
				target : "_blank"
			}).removeAttr("onclick");
		}
	},'json');

}
