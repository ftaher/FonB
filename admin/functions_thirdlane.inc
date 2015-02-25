<?php

function GetPlatform(){
	return "Thirdlane";
}

function GetIfSet(& $key ) {
	if ( isset($key) ) {
		return $key;
	} else {
		return "";
	}
}

function MustacheReformatExtensions( $extensions ) {
	foreach ( $extensions as &$extension ) {
		$extension['Product'] = MustacheReformatProduct( $extension['Product'] );
	}
	return $extensions;
}

function MustacheReformatProduct( $selected ) {

	$Products = array();
	$Products[] = array( 'val' => 'combo', 'text' => 'Web + Mobile', 'selected' => '');
	$Products[] = array( 'val' => 'web', 'text' => 'Web', 'selected' => '');
	$Products[] = array( 'val' => 'mobile', 'text' => 'Mobile', 'selected' => '');
	$Products[] = array( 'val' => 'none', 'text' => 'No Password', 'selected' => '');
	
	foreach ( $Products as &$Product ) {
		if ( in_array( $selected , $Product ) ) {
			$Product['selected'] = 'selected';
		} 
	}
	return $Products;
}

function getNoExtensionErrorMessage() {
	global $pDB;
	$platform = GetPlatform();
	$query = "select count(*) as total from user_extensions";
	$rs = $pDB->query($query);
	$result = $rs->fetch_all(MYSQLI_ASSOC);
	if($result[0]["total"] == 0)
		return "Please add your extensions from $platform Interface, then click the Update button below.";
	else
		return "";
}

function getExtensions() {
	global $pDB, $users;
	$query = "";
	$thirdlaneversion = "SELECT system_type FROM pbxconf_version ";
	$rs=$pDB->query($thirdlaneversion);
	$version = $rs->fetch_all(MYSQLI_ASSOC);
	//print_r($version);
	$system_type = $version[0]['system_type'];
	//echo $system_type;
	switch ($system_type) {
		case 'M':case 'm':
			$query = "SELECT tenants.tenant, user_extensions.first_name, user_extensions.last_name , user_extensions.ext as extension  FROM user_extensions,tenants WHERE user_extensions.tenantid = tenants.id ORDER BY ext";
			break;
		
		case 'S':case 's':
			$query = "SELECT first_name, last_name , ext as extension  FROM user_extensions ORDER BY ext";
			break;
	}

	// Get all the Users
	
	$rs = $pDB->query($query);
	if($rs === FALSE) {
		return array();
	}
	$extensions = $rs->fetch_all(MYSQLI_ASSOC);
	$arrExtensions = array();
	foreach($extensions as $extension) {
		$arrExtensions[$extension["extension"]] = array( "Extension" => $extension["extension"], "Name" => $extension["first_name"]. " ".$extension["last_name"] , "Type" => "internal");
		// Set the Password
		$arrExtensions[$extension["extension"]]["Password"] = GetIfSet($users[$extension["extension"]]["Password"]);
		// Set the Product
		$arrExtensions[$extension["extension"]]["Product"] = GetIfSet($users[$extension["extension"]]["Product"]);
		// Set the Department
		$arrExtensions[$extension["extension"]]["Department"] = GetIfSet($users[$extension["extension"]]["Department"]);
		// Set the Company
		//$arrExtensions[$extension["extension"]]["Company"] = GetIfSet($users[$extension["extension"]]["Company"]);
		//if($arrExtensions[$extension["extension"]]["Company"] == "")
		if ($system_type == "M" || $system_type == "m"){
			$arrExtensions[$extension["extension"]]["Company"] = $extension['tenant'];
			$arrExtensions[$extension["extension"]]["Terminal"] = "SIP/".$extension['extension']."-".$extension['tenant'];
		}
		else{
			$arrExtensions[$extension["extension"]]["Company"] = GetIfSet($users[$extension["extension"]]["Company"]);
			$arrExtensions[$extension["extension"]]["Terminal"] = "SIP/".$extension['extension'];

		}
		$arrExtensions[$extension["extension"]]["Context"] = "fonb-from-internal";
		
		///// Set the BaseDir
		///$arrExtensions[$extension["extension"]]["BaseDir"] = GetIfSet($users[$extension["extension"]]["BaseDir"]);
		///// Set the Language
		///$arrExtensions[$extension["extension"]]["Language"] = GetIfSet($users[$extension["extension"]]["Language"]);
		// Set the Spy
		$arrExtensions[$extension["extension"]]["Spy"] = GetIfSet($users[$extension["extension"]]["Spy"]);
		// Set the RingGroups
		if ( isset($users[$extension["extension"]]["HaveRingGroups"]) ) {
			$arrExtensions[$extension["extension"]]["HaveRingGroups"] = GetIfSet($users[$extension["extension"]]["HaveRingGroups"]) != 'yes'  ? "no":"yes";
		} else {
			$arrExtensions[$extension["extension"]]["HaveRingGroups"] = "yes";
		}
		//echo  $arrExtensions[$extension["extension"]]["ElastixRingGroups"];
		if ( $arrExtensions[$extension["extension"]]["HaveRingGroups"] == "yes" ) {
			$arrExtensions[$extension["extension"]]["RingGroups"] = RingGroupsOf($extension["extension"]);
		} else {
			$arrExtensions[$extension["extension"]]["RingGroups"] = GetIfSet($users[$extension["extension"]]["RingGroups"]);
		}
		// Set the Queues
		if ( isset($users[$extension["extension"]]["HaveQueues"]) ) {
			$arrExtensions[$extension["extension"]]["HaveQueues"] = GetIfSet($users[$extension["extension"]]["HaveQueues"]) != 'yes'  ? "no":"yes";
		} else {
			$arrExtensions[$extension["extension"]]["HaveQueues"] = "yes";
		}
		if ( $arrExtensions[$extension["extension"]]["HaveQueues"] == "yes" ) {
			$arrExtensions[$extension["extension"]]["Queues"] = QueuesOf($extension["extension"]);
		} else {
			$arrExtensions[$extension["extension"]]["Queues"] = GetIfSet($users[$extension["extension"]]["Queues"]);
		}
		
	}
	return $arrExtensions;
}

function RingGroupsOf ($exten) {
	global $pDB, $users;
	$query = "SELECT huntlist_name FROM huntlist_items WHERE extensions like '%$exten%' ORDER BY huntlist_name";
	$rs = $pDB->query($query);
	if($rs === FALSE) {
		return array();
	}
	$extensions = $rs->fetch_all(MYSQLI_ASSOC);
	$arrExtensions = array();
	foreach($extensions as $extension) {
		$arrExtensions[] = $extension['huntlist_name'];
	}
	return implode(",", array_unique($arrExtensions) );
}

function QueuesOf ($exten) {
	global $pDB, $users;
	$query = "SELECT queue_name FROM queue_members WHERE membername LIKE '%$exten%' OR interface LIKE '%$exten%' ORDER BY uniqueid";
	$rs = $pDB->query($query);
	if($rs === FALSE) {
		return array();
	}
	$extensions = $rs->fetch_all(MYSQLI_ASSOC);
	$arrExtensions = array();
	foreach($extensions as $extension) {
		$arrExtensions[] = $extension['queue_name'];
	}
	return implode(",", array_unique($arrExtensions) );
}

function getDeletedExtensions(){
	global $pDB, $users;
	// Get all the Elastix Extensions
	$extensions = getExtensions();
	foreach ( $extensions as $Key => $Data  )
		unset($users[$Key]);
	// Get all the Elastix RingGroups
	$ringgroups = getRingGroups();
	foreach ( $ringgroups as $Key => $Data )
		unset($users[$Key]);
	// Get all the Elastix Queues
	$queues = getQueues();
	foreach ( $queues as $Key => $Data )
		unset($users[$Key]);
	
	// Reformating
	foreach ( $users as $ext => $user ) {
		$users[$ext]['Type'] = "deleted";
	}
		
	// Return the result
	return $users;
}

function add_speed_dial($data){
	global $FonbDB;
	if(!table_exist('asteriskphonebook')){
  		create_asterisk_table();
  	}
	$query = "INSERT INTO asteriskphonebook(id,updated,created,fname,lname,company,tags,type,label,value,source,sourceid) VALUES(UUID(),NULL,NULL,'".$data['First_name']."','".$data['Last_name']."','".$data['Company']."','*0"
		.$data['Speed_Dial_Code']."','phone','','".trim($data['Phone'])."','asterisk','')";
	$rs=$FonbDB->query($query);
}

function update_SpeedDial($data){
	global $FonbDB;
	$query = "UPDATE asteriskphonebook set fname='".$data['fname']."',lname='".$data['lname']."',company='".$data['company']."',tags='*0".$data['tags']."',value='".$data['value']."' where id='".$data['id']."'";
	$rs = $FonbDB->query($query);
}

function delete_SpeedDial($id){
	global $FonbDB;
	$query = "DELETE FROM asteriskphonebook where id='$id'";
	$rs = $FonbDB->query($query);
}

function getSpeedDials(){
	global $FonbDB, $users;
	$query = "SELECT * FROM asteriskphonebook";
	
	$rs = $FonbDB->query($query);
	if($rs === FALSE) {
		return array();
	}
	$extensions = $rs->fetch_all(MYSQLI_ASSOC);
	$arrExtensions = array();
	foreach($extensions as $extension) {
		$arrExtensions[$extension["tags"]] = array( "id" => $extension["id"],"Speed_Dial_Code" => ltrim($extension["tags"],"*0"), "First_Name" => $extension["fname"],"Last_Name" => $extension["lname"],"Company" => $extension["company"], "Phone" => $extension["value"], "Type" => "SpeedDial");
	}
	return $arrExtensions;
}

function getSpeedDial($id){
	global $FonbDB, $users;
	$query = "SELECT * FROM asteriskphonebook where id = '$id'";
	
	$rs = $FonbDB->query($query);
	if($rs === FALSE) {
		return array();
	}
	$extensions = $rs->fetch_all(MYSQLI_ASSOC);
	$arrExtensions = array();
	foreach($extensions as $extension) {
		$arrExtensions = array( "id" => $extension["id"],"Extension" => ltrim($extension["tags"],"*0"), "First_Name" => $extension["fname"], "Last_Name" => $extension["lname"], "Company" => $extension["company"], "Phone" => $extension["value"], "Type" => "SpeedDial");
	}

	return $arrExtensions;
}

function create_asterisk_table(){
      global $FonbDB;
      $query = "CREATE TABLE if not exists `asteriskphonebook` (
          id CHAR(36) NOT NULL,
          updated timestamp,
          created timestamp, 
          fname VARCHAR(80) NOT NULL,
          lname VARCHAR(80) NOT NULL,
          company VARCHAR(80) NOT NULL,
          tags varchar(80) NOT NULL,
          type VARCHAR(80) NOT NULL,
          label VARCHAR(80) NOT NULL,
          value VARCHAR(80) NOT NULL,
          source VARCHAR(80) NOT NULL,
          sourceid VARCHAR(80) NOT NULL,
          PRIMARY KEY (fname, lname, source, value )
      )";
	$rs = $FonbDB->query($query);
}

function table_exist($table){
  	global $FonbDB;
  	$query = "SHOW TABLES LIKE '".$table."'";
  	$rs = $FonbDB->query($query);
  	
  	if ($rs === false)
  			return false;
  	else
  		{
  			if($rs->fetch_row() == NULL)
  				return false;
  			else
  				return true;
  		}
  }

function getRingGroups(){
	global $pDB,$pDB2, $users;
	$query = "SELECT name FROM huntlists ORDER BY id ";
	
	$rs = $pDB->query($query);
	if($rs === FALSE) {
		return array();
	}
	$extensions = $rs->fetch_all(MYSQLI_ASSOC);
	$arrExtensions = array();
	foreach($extensions as $extension) {
		$RGExtenQuery = "SELECT * FROM extensions WHERE appdata LIKE '%huntlist%".$extension["name"]."%' ORDER BY exten ";
		$rs2 = $pDB2->query($RGExtenQuery);
		if($rs2 === FALSE) {
		return array();
		}
		$RGExts = $rs2->fetch_all(MYSQLI_ASSOC);
		foreach ($RGExts as $RGExt ) {
			$arrExtensions[$RGExt['exten']] = array( "Extension" => $RGExt['exten'], "Name" => $extension["name"], "Type" => "ringgroup");
		}


		//$arrExtensions[$extension["grpnum"]] = array( "Extension" => $extension["name"], "Name" => $extension["description"], "Type" => "ringgroup");
	}
	return $arrExtensions;
}

function getQueues(){
	global $pDB,$pDB2, $users;
	$query = "SELECT name FROM queues ORDER BY id";
	
	$rs = $pDB->query($query);
	if($rs === FALSE) {
		return array();
	}
	$extensions = $rs->fetch_all(MYSQLI_ASSOC);
	$arrExtensions = array();
	foreach($extensions as $extension) {
		$QExtenQuery = "SELECT * FROM extensions WHERE appdata LIKE '%queue%".$extension["name"]."%' ORDER BY exten ";
		$rs2 = $pDB2->query($QExtenQuery);
		if($rs2 === FALSE) {
		return array();
		}
		$QExts = $rs2->fetch_all(MYSQLI_ASSOC);
		foreach ($QExts as $QExt ) {
			$arrExtensions[$QExt['exten']] = array( "Extension" => $QExt['exten'], "Name" => $extension["name"], "Type" => "queue");
		}
	}
	return $arrExtensions;
}

function TextBoxToArray($permissions) {
//	$allperm = strtolower($permissions);
	$allperm = $permissions;
	$allpermarr = preg_split("/\s+/",$allperm);
	$allpermarr = array_unique($allpermarr);
	$allpermarr = array_filter($allpermarr);

//	if(in_array('all',$allpermarr)) {
//		$allpermarr = "all";
//	}

	return implode(",",$allpermarr);
}

function removeNonIntSections($destination){
  foreach($destination as $key1 => $value1){
    if(!intval($destination[$key1])){// XXX TODO $destination[$key1] != $value1 TEST the logic
      unset($destination[$key1]);
    }
  }
  return $destination;
}

function removeEmptyPasswords($data){
  foreach ($data as $key => $value) {
    if(empty($value["Password"]) && $value["Product"] == "none" ){
      unset($data[$key]['Password']);
      $data[$key][';Password'] = "";
    }
  }
  return $data;
}


function removeUnnecessaryKeys($destination, $source){
	foreach($destination as $key1 => $value1){
		if(!isset($source[$key1])){
			unset($destination[$key1]);
		}
	}
	return $destination;
}

function prepareContext()
{
	global $pDB;
	$currentFile ="[Conference]\nexten =>  Conference,1,MeetMe(\${MEETME_ROOMNUM},dqMx)\n;Conference test extension: admin\nexten =>  admin,1,MeetMe(\${MEETME_ROOMNUM},qdMxp)\n".
	"exten =>  admin,n,MeetMeAdmin(\${MEETME_ROOMNUM},K)\n[Hangup]\nexten => Hangup,1,NoCDR()\nexten => Hangup,n,Hangup()\n[OnHold]\nexten => s,1,Answer()\n;exten => s,2,MusicOnHold()\n".
	"exten => s,2,Hangup\nexten => hold,1,Answer()\nexten => hold,n,MusicOnHold(,3600)\nexten => hold,n,Hangup\nexten => wait,1,NoCDR()\n;exten => wait,n,StopMixMonitor()\n".
	"exten => wait,n,Answer()\nexten => wait,n,UserEvent(FonBCallSwitch,Channel: \${CHANNEL(name)})\nexten => wait,n,Wait(50)\nexten => wait,n,Hangup\n";
	$configFile="/etc/asterisk/extensions_fonb.conf";
	//Steps, 1. get Thirdlane version (Single=S,s Multitenant=M,m),
	$versionQuery = "SELECT system_type FROM pbxconf_version ";
	$context = "[fonb-from-internal]\n";
	$result = $pDB->query($versionQuery);
	$versionRows = $result->fetch_all(MYSQLI_ASSOC);
	switch ($versionRows[0]['system_type']) {
		case "M": case "m":
			$contextQuery = "SELECT tenant FROM tenants ORDER BY id ";
			$result = $pDB->query($contextQuery);
			$tenants = $result->fetch_all(MYSQLI_ASSOC);
			//while($tenant = $pDB->getRow())
			foreach($tenants as $tenant)
			{
				$context = $context."include => from-inside-".$tenant['tenant']."\n";
			} 
			break;
		case "S": case "s":
			$context = $context."include => from-inside\n";
			break;
	}
	$context = $context."include => OnHold";
	file_put_contents($configFile, $currentFile.$context);
}

?>
