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
 * @file contains all javascript related with active calls
 */
/**
 * @namespace activecalls
 */


// XXX TODO try to delete ActiveCalls[]
var ActiveCalls = [];

/**
 * [WebPhoneSipId description]
 * @type {String}
 * @memberOf activecalls
 */
var WebPhoneSipId = "";

/**
 * [QuickDialChannels description]
 * @type {Array}
 */
var QuickDialChannels = [];
/**
 * [QuickDialChannelCount description]
 * @type {Array}
 */
var QuickDialChannelCount = 0;


/**
 * [OurChannels description]
 * @type {Array}
 */
var OurChannels = [];
/**
 * [NewChannels description]
 * @type {Array}
 */
var NewChannels = [];
/**
 * we use WebSocket to communicate with socket
 * @type {WebSocket}
 * @memberOf activecalls
 * @name WebSocket
 * @class
 */
var url = window.location.host;
var socket = new WebSocket("ws://"+ url +"/socket");
/**
 * on error, logout and force re-login
 * @memberOf activecalls.WebSocket
 */
socket.onerror = function() {
	console.log("socket connect failed");
	//window.location.href = "/logout";
};
/**
 * @class MessageEvent is event object passed when socket.onmessage is triggered
 * @example
 * 	//Sample event object for reference:
 * 	var e = {
 * 		bubbles: false
 * 		cancelBubble: false
 * 		cancelable: false
 * 		clipboardData: undefined
 * 		currentTarget: WebSocket
 * 		data: "{"Channel":"SIP/000E08D05C94-00000081","DialStatus":"CANCEL","Event":"Dial",
 * 		"Privilege":"call,all","SubEvent":"End","UniqueID":"1361796425.162"}"
 * 		defaultPrevented: false
 * 		eventPhase: 0
 * 		lastEventId: ""
 * 		origin: "ws://10.0.8.5"
 * 		ports: Array[0]
 * 		returnValue: true
 * 		source: null
 * 		srcElement: WebSocket
 * 		target: WebSocket
 * 		timeStamp: 1361796442406
 * 		type: "message"
 * 	};
 * @name MessageEvent
 * @memberOf activecalls.WebSocket
 */
/**
 * call parseData function when some message is sent from web server socket
 * @param  {activecalls.WebSocket.MessageEvent} e event object that contains info 
 * @memberOf activecalls.WebSocket
 */
socket.onmessage = function(e) {
	parseData(e.data);
};
/**
 * called to parse incoming message from socket on server by {@link activecalls.WebSocket.MessageEvent.socket.onmessage}
 * @param  {activecalls.WebSocket.MessageEvent} data it's data property of onmessageevent from web socket
 * @see {@link activecalls.WebSocket.socket.onmessage}
 * @memberOf activecalls
 */
function parseData( data ) {
	var packet = $.parseJSON(data);

	switch ( packet.MessageType ) {
	case 'ChannelsSummary':
		if ( packet.Calls != null ){
			handleChannelUpdates(packet.Calls);
		}
		break;
	}

};

function FindCall( ID ) {

	if ( NewChannels == null || NewChannels == undefined )
		return null;

	for ( var i=0; i<NewChannels.length; i++ ){
		var newcall = NewChannels[i];
		if ( newcall.ID == ID ) return newcall;
	}

	return null;
}

function CheckOldID( oldID ) {

	if ( NewChannels == null || NewChannels == undefined )
		return false;

	for ( var i=0; i<NewChannels.length; i++ ){
		var newcall = NewChannels[i];
		if ( newcall.ID == oldID ) return true;
	}

	return false;
}

/**
 * [handleChannelUpdates description]
 * @param  {[type]} packet [description]
 * @return {[type]}        [description]
 */
function handleChannelUpdates(packet) {
	console.log("-----------got packet-----------");
	console.log(packet);
	NewChannels = packet;
	var newcallbox = null;
	// loop over all oldcalls and do any need hangups
		console.log("Our channel:");console.log(OurChannels);
		console.log("New channel:");console.log(NewChannels);
	for ( var i=0; i<OurChannels.length; i++ ){
		var oldcall = OurChannels[i];
		if ( CheckOldID(oldcall.ID) ) continue; 
		hangupActiveCall(oldcall);
	}
	// start freesh and unset all old calls 
	OurChannels = [];

	// loop over all NewChannels and Update the ActiveCalls
	for ( var i=0; i<NewChannels.length; i++ ){
		var newcall = NewChannels[i];

		// only process the calls we are part in
		// don't show it while calling party is trying
		// check for extream cases first
		if ( newcall == null ) continue;
		if ( newcall.CallingParty == null && newcall.CalledParty == null ) continue;
		// cases with one hangup segment
		if ( newcall.CallingParty == null && newcall.CalledParty.Extension != ourextension ) continue;
		if ( newcall.CalledParty == null && newcall.CallingParty.Extension != ourextension ) continue;
		// both segments are up
		if ( newcall.CallingParty != null && newcall.CalledParty != null )						// Both Segment are up 
			if ( newcall.CallingParty.Extension != ourextension && newcall.CalledParty.Extension != ourextension ) // AND none of the segments has our extension
				continue;
		//if(newcall.CalledParty.State == "Down") continue;
		// create an active box if not yet created
		console.log("sending for Conference");
		console.log(newcall);
		// then create a new channel in our list
		OurChannels.push(newcall);
		newcallbox = makeConference(newcall);
		console.log("newcallbox length: " + newcallbox.length);
		if (newcallbox.length == 0 && !((newcall.CallingParty.Trying != "" || newcall.CalledParty.Type == "QuickDial") && newcall.CalledParty.State == "Down" && newcall.CalledParty.Extension == ourextension)) {
			var renderoutput = ActiveCallsRowTemplate(newcall);
			//console.log(renderoutput)
			$('#activecalls').append(renderoutput);
			newcallbox = $('#line'+newcall.ID);
			bindActiveCallEvents(newcallbox);
		}
		console.log("i have the packet");
		console.log(newcallbox);
		if(newcall.CallingParty.Trying !== '' && newcall.CallingParty.Extension == ourextension){
			newcallbox.removeClass("trying WebPhone Phone Mobile");
			newcallbox.addClass("trying " + newcall.CallingParty.Trying);
		}
		else if(newcall.CalledParty.Trying !== '' && newcall.CalledParty.Extension == ourextension){
			newcallbox.removeClass("trying WebPhone Phone Mobile");
			newcallbox.addClass("trying " + newcall.CalledParty.Trying);
		}
		else{
			newcallbox.removeClass("trying WebPhone Phone Mobile");
		}
		updateActiveDirection(newcall, newcallbox);
		updateActiveState(newcall, newcallbox);
		updateActivePhone(newcall, newcallbox);
		updateActiveClidNum(newcall, newcallbox);
		//updateActiveClidName(newcall, newcallbox);
	}
};
/**
 * checks packet for conference call
 * @param  {object} newcall an element of NewChannels array containing calledParty and callingParty objects
 * @return {jQuery object} an object of jQuery representing div that contains active call
 */
function makeConference(newcall){
	var $line = $("#line" + newcall.ID);
	var isConference = (newcall.CallingParty.MeetmeRoom == ourextension) || (newcall.CalledParty.MeetmeRoom == ourextension);
	$conferenceLines = $("#conferenceLines").find(".activecall");
	if(isConference === true){
		/**
		 * Scenario one: 
		 * There's no active call and no conferenceCall and call is in conference mode
		 */
		if($conferenceLines.length === 0 && $line.length === 0){
			var renderoutput = ConferenceTemplate(newcall);
			$("#activecalls").prepend(renderoutput);
			renderoutput = ConferenceRowTemplate(newcall);
			$("#conferenceLines").append(renderoutput);
			$line = $("#line" + newcall.ID + ",#conferenceLine"+ newcall.ID);
			console.log("inside scenario one:" + $line.length); 
			$line.effect("slide");
			bindActiveCallEvents($line);
		}
		/**
		 * Scenario two:
		 * There are active calls present but there's no conference call
		 */
		else if($conferenceLines.length === 0 && $line.length === 1){
			var renderoutput = ConferenceTemplate(newcall);
			$("#activecalls").prepend(renderoutput);
			renderoutput = ConferenceRowTemplate(newcall);
			$line.remove();
			$("#conferenceLines").append(renderoutput);
			$line = $("#line" + newcall.ID + ",#conferenceLine"+ newcall.ID);
			console.log("inside scenario two:" + $line.length); 
			bindActiveCallEvents($line);
		}
		/**
		 * Scenario three:
		 * Conference calls exist and this active call doesn't exist inside conference calls
		 */
		else if($conferenceLines.length > 0){
			var renderoutput = ConferenceRowTemplate(newcall);
			$line.remove();
			$("#conferenceLines").append(renderoutput);
			var confAdmin = getConferenceAdminId();
			$(".conferenceLine").attr("id", "conferenceLine"+confAdmin).data("id", confAdmin);
			$line = $("#line" + newcall.ID+ ",#conferenceLine"+ confAdmin);
			console.log("inside scenario three:" + $line.length); 
			bindActiveCallEvents($line);
		}
		/**
		 * This block should never be executed, until some problem occurs
		 */
		else{
			console.log("wtf conference! seriously?");
		}
	}
	/**
	 * If line is not a conference, but is present inside conferences, remove it from conferences
	 */
	else if($line.parents("#conferenceLines").length === 1){
		console.log("it's not a conference, but it's inside a conference");
		$line.remove();
		if($("#conferenceLines").find(".activecall").length === 0){
			$("#conferenceCall").remove();
		}
		$line = $("#line"+newcall.ID);
	}
	/**
	 * it's not a conference, and not even present in conferenceLines
	 */
	else{
		console.log("it's not a conference, and not even present in conferenceLines");
	}
	return $line;
}

/**
 * [callswitch description]
 * @param  {[type]} device    [description]
 * @param  {[type]} activenum [description]
 * @return {[type]}           [description]
 */
function callswitch( device , ID ) {
	console.log("Switch to: " + device + " , Call.ID: " + ID );
	var $line = $("#line"+ID);
	if($line.is(".dialing")){
		console.log("rejecting switch request, in dialing state");
		return;
	}
	var call = FindCall(ID);
	if ( call === null ) return;

	if ( call.CallingParty.Extension === ourextension ) {
		var OurSeg = call.CallingParty;
	} else { 
		var OurSeg = call.CalledParty;
	}

	// ignore switching to self
	if (OurSeg.Type == device && OurSeg.State == "Up" )
		return;
	//Don't switch to phone if ringing
	if(device == "Phone" && OurSeg.State == "Ringing")
		return;

	var action = {};
	action.Action = "CallSwitch";
	action.Via = device;
	if ( device == "Mobile" ) action.Mobile = ourmobile;
	if ( device == "WebPhone" ) action.WebPhone = WebPhoneSipId;
	action.Call = ID;
	console.log("switching call.. sending packet to socket");
	console.log(action);
	channel = getLineChannel(ID);
	if(channel.CalledParty.Extension == ourextension && channel.CalledParty.State == "Ringing" && (device == "Mobile" || device == "WebPhone")){
		console.log("holding before sending");
		holdAction = {Action : "Hold", Call : ID};
		socket.send( JSON.stringify(holdAction) );
		window.setTimeout(function(){
		socket.send( JSON.stringify(action) );}, 1000);
	}
	else{
		socket.send( JSON.stringify(action) );
	}
}

/**
 * [hangupActiveCall description]
 * @param  {[type]} activecallnum [description]
 * @return {[type]}               [description]
 */
function hangupActiveCall( oldcall ) {
	var activecallnum = oldcall.ID;
	var activecallbox = $('#line'+activecallnum + ",#conferenceLine"+activecallnum);
	activecallbox.trigger("ac-hangup");
}

/**
 * We use findDialedNumber to trigger the WasDialed ac-warning and to trigger ac-dial-failed,
 *  which are very important triggers in the case IP Phones are not registered or the dialednumber
 *  can't be processed by asterisk. these triggers are for usability and to indecate to our users that
 *  the Quick Dial was taken by the FonB interface but Asterisk as rejected the Call. 
 * @param  {[type]} dialednumber [description]
 * @param  {[type]} via          [description]
 * @param  {[type]} dialedname   [description]
 * @return {[type]}              [description]
 */
function findDialedNumber( dialednumber, via, dialedname ) {
	// First loop over all OurChannels 
	for ( var i=0; i<OurChannels.length; i++ ){
		var oldcall = OurChannels[i];
		if ( oldcall.CalledParty.Extension == dialednumber && oldcall.CallingParty.Type == via ) {
			// if found then please flash this active line back to the user
			//$("#line" + oldcall.ID ).effect("bounce", { times:3 }, 300).effect("bounce", { times:3 }, 300).effect("shake", { times:3 }, 300);
			$("#line" + oldcall.ID ).trigger("ac-warning", "WasDialed");
			return "WasDialed"; // then return
		};
	}

	// Loop over all QuickDialChannels 
	for ( var i=0; i<QuickDialChannels.length; i++ ){
		var oldDial = QuickDialChannels[i];
		if ( oldDial.CalledParty.Extension == dialednumber && oldDial.CallingParty.Type == via ) {
			// if found then please flash this active line back to the user
			//$("tr#line" + activelinenum ).effect("bounce", { times:3 }, 300).effect("bounce", { times:3 }, 300).effect("shake", { times:3 }, 300);
			$("#line" + oldDial.ID ).trigger("ac-warning", "WasDialed");
			return "WasDialed"; // then return
		};
	}
	// Create a new QuickDialChannel and then push to to QuickDialChannels
	newdial = {};
	newdial.ID = getRandomId();
	newdial.CallingParty = {};
	newdial.CallingParty.Extension = ourextension;
	newdial.CallingParty.Type = via;
	newdial.CallingParty.State = "Down";
	newdial.CallingParty.Direction = "Outbound";
	newdial.CalledParty = {};
	newdial.CalledParty.Extension = dialednumber;
	newdial.CalledParty.Type = "QuickDial"; // XXX Not important to us. we always use the phonebook_lookup_number.php to determin both the ClidName and the Type
	newdial.CalledParty.State = "Down";
	newdial.CalledParty.Direction = "Inbound";

	

	var newdialnum = newdial.ID;

	// Don't print the WebPhone Box
	if ( via == "WebPhone" ) return getRandomId();
	// Print the QuickDial Box
	var newdialbox = $('#line'+newdialnum);
	if (newdialbox.length == 0) {
		newdial.ID = getRandomId();
		newdialnum = newdial.ID;
		var renderoutput = ActiveCallsRowTemplate(newdial);
		$('#activecalls').append(renderoutput);
		newdialbox = $('#line'+newdialnum);
		bindActiveCallEvents(newdialbox);
	};
	// Distroy the QuickDial Box if the call was not placed in Asterisk
	newdialbox.delay(2000,"ac-dial").queue("ac-dial" , function (next) { 
		if ( !CheckOldID(newdialnum) ) {
			var newdialbox = $('#line'+newdialnum+',#conferenceLine'+newdialnum);
			newdialbox.trigger("ac-dial-failed"); 
		}
		DeleteQuickDial(newdialnum);
		next();
	}).dequeue('ac-dial');
	// then create a new channel in our list
	QuickDialChannels.push(newdial);

	return newdialnum;
};


function DeleteQuickDial( ID ) {
	for ( var i=0; i<QuickDialChannels.length; i++ ){
		var OldDial = QuickDialChannels[i];
		if ( OldDial.ID == ID ) { 
			QuickDialChannels.splice(i,1);
			return true;
		}
	}
return undefined;
}


/**
 * [stopActiveDuration description]
 * @param  {[type]} activecall [description]
 * @return {[type]}            [description]
 */
function stopActiveDuration( activecall ) { 
	activecall.stopTime();
};
/**
 * [startActiveDuration description]
 * @param  {[type]} activecall [description]
 * @return {[type]}            [description]
 */
function startActiveDuration( activecall ) { 
	console.log("starting duration");
	if ( activecall.find(".duration").html() == "" ){
		channel = getLineChannel(activecall.data("id"), true);
		var answerTime = parseInt(channel.AnswerTime);
		setInterval(function(){
			activecall.find(".duration").html( printtime(answerTime) );
			answerTime++;
		},1000);
	}
};

/**
 * [printtime description]
 * @param  {[type]} sec [description]
 * @return {[type]}     [description]
 */
function printtime(sec) {
	var hr = Math.floor(sec / 3600);
	var min = Math.floor((sec - (hr * 3600))/60);
	sec -= ((hr * 3600) + (min * 60));
	sec += ''; min += '';
	while (min.length < 2) {min = '0' + min;}
	while (sec.length < 2) {sec = '0' + sec;}
	hr = (hr)?  hr + ':' : '';
	return hr + min + ':' + sec;
};





/**
 * [updateActiveDirection description]
 * @param  {[type]} activechannel [description]
 * @param  {[type]} activecall    [description]
 * @return {[type]}               [description]
 */
function updateActiveDirection( newcall, activecallbox ) {
	console.log("updaing active direction");
	console.log(activecallbox);
	if ( newcall.CallingParty.Extension == ourextension )
		var ourDirection = "outbound";
	else
		var ourDirection ="inbound";
		
	activecallbox.trigger('ac-currentdirection', [ ourDirection ]);
};
/**
 * [updateActivePhone description]
 * @param  {[type]} activechannel [description]
 * @param  {[type]} activecall    [description]
 * @return {[type]}               [description]
 */
function updateActivePhone( newcall, activecallbox ) {
	if ( newcall.CallingParty.Extension == ourextension )
		var OurCallSegment = newcall.CallingParty;
	else
		var OurCallSegment = newcall.CalledParty;

	var CallType = OurCallSegment.Type; //.toLowerCase();

	activecallbox.trigger('ac-currentphone', [ CallType ]);
};
/**
 * [updateActiveState description]
 * @param  {[type]} activechannel [description]
 * @param  {[type]} activecall    [description]
 * @return {[type]}               [description]
 */
function updateActiveState( newcall, activecallbox ) {
	var OurCallSegment = {};
	if ( newcall.CallingParty.Extension == ourextension )
		OurCallSegment = newcall.CallingParty;
	else if ( newcall.CalledParty.Extension == ourextension )
		OurCallSegment = newcall.CalledParty;
	if(OurCallSegment == newcall.CallingParty && newcall.CalledParty.State == "Ringing"){
		OurCallSegment.State = "Ring";
	}
	console.log(OurCallSegment);
	console.log("updating active state");
	activecallbox.trigger('ac-currentstate', [ OurCallSegment.State ]);
};
/**
 * [updateActiveClidNum description]
 * @param  {[type]} activechannel [description]
 * @param  {[type]} activecall    [description]
 * @return {[type]}               [description]
 */
function updateActiveClidNum( newcall, activecallbox ) {

	// check if all this call is about to hangup
	if ( newcall.CallingParty == null || newcall.CalledParty == null ) 
		return;

	if ( newcall.CallingParty.Extension == ourextension )
		var OurCallSegment = newcall.CalledParty;
	else
		var OurCallSegment = newcall.CallingParty;

	var CurrentClidNum = OurCallSegment.Extension; //.toLowerCase()

	activecallbox.trigger('ac-currentclidnum', [ CurrentClidNum ]);
};
/**
 * [updateActiveClidName description]
 * @param  {[type]} activechannel [description]
 * @param  {[type]} activecall    [description]
 * @return {[type]}               [description]
 */
function updateActiveClidName( newcall, activecallbox ) {
	if ( newcall.CallingParty.Extension == ourextension )
		var OurCallSegment = newcall.CalledParty;
	else
		var OurCallSegment = newcall.CallingParty;

	var CurrentClidNum = OurCallSegment.Extension; //.toLowerCase()

	activecallbox.trigger('ac-currentclidname', [ CurrentClidNum ]);
};


/**
 * [QuickConference description]
 * @param {[type]} via [description]
 */
function QuickConference(via) {
	var dialstr = 'Conference';
	var dialnum = 'Conference';
	var clidname = '';
	if ( dialstr != ""){
		if ( findDialedNumber( dialstr , via , clidname ) != "WasDialed" ){
			dialwithami( dialstr , via , clidname);
		}
	}
};
/**
 * [Quickdial description]
 * @param {[type]} via      [description]
 * @param {[type]} dial     [description]
 * @param {[type]} clidname [description]
 */
function Quickdial(via, dial, clidname) {
	/**
	 * highlight active call if it is already dialed, no need to dial it again
	 */
	for(i=0;i<OurChannels.length;i++){
		if(OurChannels[i].CalledParty.Extension == dial){
			$("#line" + OurChannels[i].ID).stop(true, true).effect("highlight", {}, 2000);
			return;
		}
	}
	if(dial == ourextension || dial.match(/^\+?\d+$/) == null){
		$("#quickdial").effect("highlight",{color: '#f6a6a6'});
	}
	else{
		var ReqID = findDialedNumber( dial , via , clidname );
		if ( ReqID != "WasDialed" ){
			dialwithami( dial , via , ReqID);
		}
	}
};
/**
 * [dialwithami description]
 * @param  {[type]} dial_str [description]
 * @param  {[type]} via      [description]
 * @param  {[type]} clidname [description]
 * @return {[type]}          [description]
 */
function dialwithami(dial_str, via, ReqID) {
	var action = {};
	action.Action = "Dial";
	action.Via = via;
	if ( via == "Mobile" ) action.Mobile = ourmobile;
	if ( via == "WebPhone" ) action.WebPhone = WebPhoneSipId;
	action.Dial = dial_str;
	action.ReqID = ReqID;
	console.log("dialing");
	console.log(action);
	socket.send( JSON.stringify(action) );
};
/**
 * Active Call Buttons
 * @param  {[type]} Action    [description]
 * @param  {[type]} activenum [description]
 * @return {[type]}           [description]
 */
function callaction( Action , activenum ) {
	// Action could be one of UnHold, Hold, Drop, Transfer, Conference, Answer 
	console.log("Action: " + Action + " , activenum: " + activenum );

	switch ( Action ) {
		case "Transfer":
			Transfer( activenum );
			break;
		case "Conference":
			Conference( activenum );
			break;
		case "Mute":
			var action = {};
			$mute = $("#mute"+activenum);
			if($mute.data("mute") !== true){
				action.Action = "Mute";
				action.Call = activenum;
				$mute.data("mute", true).parent().removeClass("acmute").addClass("acunmute");
			}
			else{
				action.Action = "Unmute";
				action.Call = activenum;
				$mute.data("mute", false).parent().removeClass("acunmute").addClass("acmute");
			}
			console.log("muting/unmuting call");
			console.log(action);
			socket.send( JSON.stringify(action) );
			break;
		case "Hold":
			if($("#line"+activenum).is(".dialing")){
				console.log("can't hold rejecting request, call on dialing");
				return;
			}
			// no break; is intentional! we want default to run
		default:
			var action = {};
			action.Action = Action;
			action.Call = activenum;
			console.log("sending data to socket");
			console.log(action);
			socket.send( JSON.stringify(action) );
			break;
	}
}
/**
 * [blindTransfer description]
 * @param  {[type]} dial [description]
 * @return {[type]}      [description]
 */
function blindTransfer( dial ) {
	if(dial.match(/\d+/)){
		/**
		 * highlight active call if it is already dialed, no need to dial it again
		 */
		for(i=0;i<OurChannels.length;i++){
			if(OurChannels[i].CalledParty.Extension == dial || OurChannels[i].CallingParty.Extension == dial){
				$("#line" + OurChannels[i].ID).stop(true, true).effect("highlight", {}, 2000);
				Transfer(OurChannels[i].ID);
				return;
			}
		}
		Transfer(dial , true);
	}
}
/**
 * [Transfer description]
 * @param {[type]} activenum [description]
 */
lastTransferCall = 0;
function Transfer( activenum , isBlind) {
	isBlind = ((typeof isBlind !== "undefined") && isBlind === true);
	if(activenum == ourextension){
		return;
	}
	else if(activenum == lastTransferCall && isBlind == false){
		$activeCall = $("#line"+activenum);
		$activeCall.removeClass("transfer trying");
		$("#quickdialbox").removeClass("transfer");
		lastTransferCall = 0;
	}
	else if(lastTransferCall == 0 && isBlind == false){
		console.log("transferring isBlind:" + isBlind);
		$activeCall = $("#line"+activenum);
		console.log("first transfer click!");
		$activeCall.trigger("ac-settransfer");
		lastTransferCall = activenum;
	}
	else if(isBlind === false){
		$activeCall = $("#line"+activenum);
		console.log("second transfer click now transferring");
		$activeCall.trigger("ac-begintransfer", [lastTransferCall]);
		packet = {
				Action : "Transfer",
				Call1 : lastTransferCall,
				Call2 : activenum
		};
		console.log(packet);
		lastTransferCall = 0;
		socket.send(JSON.stringify(packet));
	}
	else{
		$activeCall = $("#line"+lastTransferCall);
		console.log("beginning blind transfer");
		$activeCall.trigger("ac-blindtransfer");
		packet = {
				Action : "BlindTransfer",
				Call : lastTransferCall,
				Dial : activenum
		};
		console.log(packet);
		lastTransferCall = 0;
		socket.send(JSON.stringify(packet));
	}
}
/**
 * [Conference description]
 * @param {[type]} activenum [description]
 */
function Conference( activenum ) {
	$activeCall = $("#line"+activenum);
	packet = {};
	if($activeCall.is(".conference")){
		$activeCall.removeClass("conference");
		packet = {
			Action : "UnjoinConference",
			Call : activenum
		}
	}
	else if($activeCall.length === 1){
		$activeCall.addClass("conference");
		packet = {
			Action : "JoinConference",
			Call : activenum
		};
	}
	console.log("Conferencing " +activenum);
	console.log(packet);
	socket.send(JSON.stringify(packet));
	/*var activechannel = ActiveCalls[activenum];
	if ( activechannel === undefined ) return;
	var ActiveChannel = activechannel.Channel;
	var action = {};
	action.Action = "Conference";
	action.Channel = ActiveChannel;
	socket.send( JSON.stringify(action) );
	setTimeout( "QuickConference('phone')" , 500 ); 
	return;*/
}

/* WebPhone */
$.phono({

apiKey: "3feb7ec665d9e5b34c47d6087fadf589",

onReady: function() {
	console.log("Phono Connected");
	console.log("Phono Session ID: " + this.sessionId);
	WebPhoneSipId = this.sessionId;
	$('body').trigger('flashphoneready');
	},

onUnready: function() {
	console.log("XXX Phone is Not Ready XXX");
	},

phone:	{
	headset: true,
	wideband: false,

	onError: function() {
		console.log("Call Error");
		},

	onIncomingCall: function(event) {
		call = event.call;
		//console.log("Auto-answering call with ID " + call.id);
		// Answer the call
		call.answer();
		}
	},

});
/**
 * get a unique id for quick dial generated call
 * to test percentage of failure here's a small test you can run on console:
 * var count =0;for(i=0;i<10000;i++){if(getRandomId() == getRandomId())count++;}console.log(((count/10000) * 100)+" percent failure. "+ count + " cases produced dupplicates out of 10000");
 * @return {string} returns string containing milliseconds since 1970 appended by random alphabet(s)
 */
function getRandomId(){
	//3.4 percent average failure append only one random alphabet:
	//return Date.now() + String.fromCharCode(65 + Math.floor(Math.random() * 26));
	//if 3.4 percent failure isn't acceptable use (append two random alphabets):
	return Date.now() + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
	//failure of approx 0.18 percent
}

/**
 * return channel based on line id. 
 */
function getLineChannel(lineId, useNewChannels){
	var myChannel = OurChannels;
	if (useNewChannels === true) myChannel = NewChannels;
	for(var i=0; i<myChannel.length;i++){
		if(myChannel[i].ID == lineId)
			return myChannel[i];
	}
	return false;
}

function playBuzzer(){
	document.getElementById('soundHandle').currentTime = 0;
	document.getElementById('soundHandle').play();
}
function stopBuzzer(){
	var soundHandle = document.getElementById('soundHandle');
	soundHandle.pause();	
}
function muteBuzzer(){
	var soundHandle = document.getElementById('soundHandle');
	soundHandle.muted = !soundHandle.muted;
}

function bindActiveCallEvents(line){
	var $activecalls = null;
	if(line instanceof jQuery ){
		$activecalls = line;
	}
	else{
		$activecalls = $("#line_" + line);
	}
	/**
	 * don't know yet it's usage
	 * @event ac-warning
	 * @memberOf common
	 */
	$activecalls.bind("ac-warning", function() {
		console.log("Event triggered: ac-warning");
		$(this).stop(true, true).effect("highlight", {}, 2000);
	});
	/**
	 * event detrmines wheather it's inbound call or outbound
	 * @event ac-currentdirection
	 * @param {string} currentdirection can be one of ("inbound", "outbound")
	 * @memberOf common
	 */
	$activecalls.bind("ac-currentdirection", function(event, currentdirection) {
		console.log("Event triggered: ac-currentdirection: " + currentdirection);
		$(this).show().addClass(currentdirection);
		$("#noline").hide();
	});
	/**
	 * sets phone number in active call
	 * @event ac-currentclidnum
	 * @param {string} currentclidnum number of person calling or being called
	 * @memberOf common
	 */
	$activecalls.bind("ac-currentclidnum", function(event, currentclidnum) {
		console.log("Event triggered: ac-currentclidnum: " + currentclidnum);
		var $this = $(this);
		var $clidnum = $this.find('.clidnum');
		$clidnum.html(currentclidnum);

		$.ajax({
			url : "php/phonebook_number_lookup.php?Num=" + currentclidnum,
			dataType : "json",
			success : function(data){
				var contact = getNumberLookupData(data);
				$elem = $("<span></span>");
				if(contact.source != ''){
					if(contact.url != ''){					
						$elem.prepend("<a href='" + contact.url + "'><img src='images/ch_" + contact.source + ".png'/>&nbsp;</a>");
						$this.find(".highrise").attr("href", contact.url);
					}
					else{
						$elem.prepend("<img src='images/ch_" + contact.source + ".png'/>&nbsp;");
					}
					$this.addClass(contact.source);
				}
				if(contact.name != ""){
					$elem.append(contact.name);	
				}
				if(contact.type != ""){
					$elem.append(" ("  + contact.type + ")");
				}
				if($elem.html() != ""){
					$clidnum.html($elem.html());
					if(contact.source != "internal"){
						$this.find('span.clidname').html(", " + contact.number);
					}
				}
			}
		});
	});
	/**
	 * triggers and gives current contact name for call
	 * @event ac-currentclidname
	 * @memberOf common
	 */
	$activecalls.bind("ac-currentclidname", function(event, currentclidname) {
		console.log("Event triggered: ac-currentclidname: " + currentclidname);
		//now this is done in currentclidnum event by using number lookup
		//$(this).find('span.clidname').html(currentclidname);
	});
	/**
	 * sets css of active call div according to type of phone being used currently
	 * @event ac-currentphone
	 * @param {string} currentphone can be one of ("phone", "flash", "mobile")
	 * @memberOf common
	 */
	$activecalls.bind("ac-currentphone", function(event, currentphone) {
		console.log("Event triggered: ac-currentphone: " + currentphone);
		var activecall = $(this);
		switch ( currentphone ) {
			case 'Phone':
				activecall
					.removeClass("phone")
					.removeClass("flash")
					.removeClass("mobile");
				if(!activecall.is(".ringing"))
					activecall.addClass("phone");
				break;
			case 'WebPhone':
				activecall
					.removeClass("phone")
					.removeClass("flash")
					.removeClass("mobile");
				activecall.addClass("flash");
				break;
			case 'Mobile':
				activecall
					.removeClass("phone")
					.removeClass("flash")
					.removeClass("mobile");
				activecall.addClass("mobile");
				break;
			}
	});
	/**
	 * First event for incoming/outgoing call
	 * @event ac-currentstate
	 * @param {string} currenstate possible values: ("Up", "Ring", "OnHold", "Hold", "Down", "ConferenceDown", "Conference", "Ringing") 
	 * @memberOf common
	 */
	$activecalls.bind("ac-currentstate", function(event, currentstate) {
		console.log("Event triggered: ac-currentstate: " + currentstate);
		var activecall = $(this);
		stopBuzzer();
		switch ( currentstate )	{
			case 'Up':
				activecall.removeClass("hold dialing ringing ring transfer");
				activecall.addClass("busy");
				var channel = getLineChannel(activecall.data("id"));
				if(channel.CallingParty.State == "Up" && channel.CalledParty.State == "Up")
				{
					startActiveDuration( activecall );
				}
				break;
			case 'Ring':
				activecall.removeClass("hold ringing busy dialing transfer");
				activecall.addClass("ring");
				break;
			//onHold is same as Up... only down means hold
			case 'OnHold':
				activecall.removeClass("hold dialing ringing ring transfer");
				activecall.addClass("busy");
				break;
			case 'Dialing':
				// XXX TODO we need to add a new css for dialing instead of hold
				activecall.removeClass("hold ring transfer ringing busy");
				activecall.addClass("dialing");
				break;
			case 'Down':
				activecall.removeClass("phone dialing ring transfer flash mobile hold ringing busy transfer");
				activecall.addClass("hold");
				var channel = getLineChannel(activecall.data("id"));
				if(channel.CallingParty.MeetmeRoom == ourextension || channel.CalledParty.MeetmeRoom == ourextension)
				{
					startActiveDuration( activecall );
				}
				break;
			case 'Ringing':
				activecall.removeClass("hold dialing ring busy transfer").addClass("ringing");
				playBuzzer();
				break;
		}
	});
	/**
	 * @event ac-dial-failed
	 * @memberOf common
	 */
	$activecalls.bind("ac-dial-failed", function() {
		stopBuzzer();
		console.log("Event triggered: ac-dial-failed");
		var activecall = $(this);
		activecall.animate({backgroundColor: "#f7d9d9",
          color: "#fff", opacity : 0}, 1000, function(){
          	$(this).remove();
          });
		/* anamate the hangup in that activecall the delete the channel */

      	//id = OurChannels.indexOf($(this).data("id"));
      	/*index = OurChannels.indexOf(id);
      	OurChannels.splice(index, 1);*/
      	index = QuickDialChannels.indexOf($(this).data("id"));
      	QuickDialChannels.splice(index,1);

		activecall.removeClass("busy hold ringing");
		activecall.addClass("hangup");
		stopActiveDuration( activecall );
		activecall.find(".duration").html('Failed');
	});
	/**
	 * triggered when ending call
	 * @event ac-hangup
	 * @memberOf common
	 */
	$activecalls.bind("ac-hangup", function() {
		stopBuzzer();
		console.log("Event triggered: ac-hangup");
		var activecall = $(this);
		//activecall.hide();
		if ( activecall.hasClass("transfer") ){
			activecall.removeClass("transfer");
			jQuery('#quickdialbox').removeClass("transfer");
		}

	    var $conference = $("#conferenceLines").find(".activecall");
		if($conference.length > 1 && activecall.is(".conferenceLine")){
			activecall.attr("id", "conferenceLine" + getConferenceAdminId());
			return;
		}
		/* animate the hangup in that activecall the delete the channel */
		activecall.removeClass("busy hold ringing transfer mobiletrying");
		activecall.addClass("hangup");
		stopActiveDuration( activecall );
		//Also remove this call from global channel arrays
      	var id = activecall.data("id");
      	//index = OurChannels.indexOf(id);
      	console.log("---hanging up------");
      	console.log(OurChannels);
      	/*OurChannels.splice(index, 1);*/
      	index = QuickDialChannels.indexOf(id);
      	QuickDialChannels.splice(index,1);

		activecall.animate({backgroundColor: "#f7d9d9",
	      color: "#fff", opacity : 0}, 1000, function(){
	      	console.log("animation finish hanging up" + $(this).attr("id"));
	      	activecall.remove();
	      	if($("#conferenceLines").find(".activecall").length == 0){
				$("#conferenceCall").remove();
			}
			if($(".activecall").length == 0){//show no active calls banner if no call
				$("#noline").show();
			}
			try{
				if (ch_pagenumber == 1 ) {
					search_request(1);
				}
			} 
			catch(err) {
				console.log("ERROR: " + err);
			}
	     });
	});
	/**
	 * Transfer events
	 */
	
	/**
	 * triggered when a call is transferred to another extension
	 * @event ac-settransfer
	 * @todo can we invent another smarter way to handle transfer button activation
	 * @memberOf common
	 */
	$activecalls.bind("ac-settransfer", function() {
		console.log("Event triggered: ac-settransfer");
		var activecall = $(this);
		activecall.addClass("transfer trying");
		$('#quickdialbox').addClass("transfer");
	});

	/**
	 * triggered when a call is transferred to another extension
	 * @event ac-settransfer
	 * @todo can we invent another smarter way to handle transfer button activation
	 * @memberOf common
	 */
	$activecalls.bind("ac-begintransfer", function(event, callOne) {
		console.log("Event triggered: ac-begintransfer callOne:" + callOne);
		$(this).removeClass("trying").addClass("transfer");
		$('#quickdialbox').removeClass("transfer");
	});
	/**
	 * triggered when a call is transferred to another extension
	 * @event ac-settransfer
	 * @todo can we invent another smarter way to handle transfer button activation
	 * @memberOf common
	 */
	$activecalls.bind("ac-blindtransfer", function() {
		console.log("Event triggered: ac-blindtransfer");
		var activecall = $(this);
		activecall.removeClass("trying");
		$('#quickdialbox').removeClass("transfer");
	});
}

function getConferenceAdminId(){
	for(var i=0;i<OurChannels.length;i++){
		if((OurChannels[i].CallingParty.MeetmeRoom == ourextension && OurChannels[i].CallingParty.MeetmeRoom == OurChannels[i].CallingParty.Extension && OurChannels[i].CallingParty.State != "Down") || (OurChannels[i].CalledParty.MeetmeRoom == ourextension && OurChannels[i].CalledParty.MeetmeRoom == OurChannels[i].CalledParty.Extension && OurChannels[i].CalledParty.State !="Down")){
			return OurChannels[i].ID;
		}
	}
	for(i=0;i<OurChannels.length;i++){
		if((OurChannels[i].CallingParty.MeetmeRoom == ourextension && OurChannels[i].CallingParty.State != "Down") || (OurChannels[i].CalledParty.MeetmeRoom == ourextension && OurChannels[i].CalledParty.State !="Down")){
			return OurChannels[i].ID;
		}
	}
}
