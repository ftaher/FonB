<?php

function GetPlatform(){
	return "Elastix";
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
	$query = "select count(*) as total from users";
	$rs = $pDB->query($query);
	$result = $rs->fetch_all(MYSQLI_ASSOC);
	if($result[0]["total"] == 0)
		return "Please add your extensions from $platform tab, then click the Update button below.";
	else
		return "";
}

function getExtensions() {
	global $pDB, $users;
	// Get all the Users
	$query = "SELECT * FROM users ORDER BY extension";
	$rs = $pDB->query($query);
	if($rs === FALSE) {
		return array();
	}
	$extensions = $rs->fetch_all(MYSQLI_ASSOC);
	$arrExtensions = array();
	foreach($extensions as $extension) {
		$arrExtensions[$extension["extension"]] = array( "Extension" => $extension["extension"], "Name" => $extension["name"], "Type" => "internal");
		// Set the Password
		$arrExtensions[$extension["extension"]]["Password"] = GetIfSet($users[$extension["extension"]]["Password"]);
		// Set the Product
		$arrExtensions[$extension["extension"]]["Product"] = GetIfSet($users[$extension["extension"]]["Product"]);
		// Set the Department
		$arrExtensions[$extension["extension"]]["Department"] = GetIfSet($users[$extension["extension"]]["Department"]);
		// Set the Company
		$arrExtensions[$extension["extension"]]["Company"] = GetIfSet($users[$extension["extension"]]["Company"]);
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
	$query = "SELECT grpnum FROM ringgroups WHERE grplist like '%$exten%' ORDER BY grpnum";
	$rs = $pDB->query($query);
	if($rs === FALSE) {
		return array();
	}
	$extensions = $rs->fetch_all(MYSQLI_ASSOC);
	$arrExtensions = array();
	foreach($extensions as $extension) {
		$arrExtensions[] = $extension['grpnum'];
	}
	return implode(",", array_unique($arrExtensions) );
}

function QueuesOf ($exten) {
	global $pDB, $users;
	$query = "SELECT id FROM queues_details WHERE data LIKE '%$exten%' ORDER BY id";
	$rs = $pDB->query($query);
	if($rs === FALSE) {
		return array();
	}
	$extensions = $rs->fetch_all(MYSQLI_ASSOC);
	$arrExtensions = array();
	foreach($extensions as $extension) {
		$arrExtensions[] = $extension['id'];
	}
	return implode(",", array_unique($arrExtensions) );
}

function getDeletedExtensions(){
	global $pDB, $users;
	// Get all the Extensions
	$extensions = getExtensions();
	foreach ( $extensions as $Key => $Data  )
		unset($users[$Key]);
	// Get all the  RingGroups
	$ringgroups = getRingGroups();
	foreach ( $ringgroups as $Key => $Data )
		unset($users[$Key]);
	// Get all the Queues
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
	global $pDB, $users;
	$query = "SELECT * FROM ringgroups ORDER BY grpnum";
	
	$rs = $pDB->query($query);
	if($rs === FALSE) {
		return array();
	}
	$extensions = $rs->fetch_all(MYSQLI_ASSOC);
	$arrExtensions = array();
	foreach($extensions as $extension) {
		$arrExtensions[$extension["grpnum"]] = array( "Extension" => $extension["grpnum"], "Name" => $extension["description"], "Type" => "ringgroup");
	}
	return $arrExtensions;
}

function getQueues(){
	global $pDB, $users;
	$query = "SELECT * FROM queues_config ORDER BY extension";
	
	$rs = $pDB->query($query);
	if($rs === FALSE) {
		return array();
	}
	$extensions = $rs->fetch_all(MYSQLI_ASSOC);
	$arrExtensions = array();
	foreach($extensions as $extension) {
		$arrExtensions[$extension["extension"]] = array( "Extension" => $extension["extension"], "Name" => $extension["descr"], "Type" => "queue");
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


?>
