<?php


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
		///// Set the BaseDir
		///$arrExtensions[$extension["extension"]]["BaseDir"] = GetIfSet($users[$extension["extension"]]["BaseDir"]);
		///// Set the Language
		///$arrExtensions[$extension["extension"]]["Language"] = GetIfSet($users[$extension["extension"]]["Language"]);
		// Set the Spy
		$arrExtensions[$extension["extension"]]["Spy"] = GetIfSet($users[$extension["extension"]]["Spy"]);
		// Set the RingGroups
		if ( isset($users[$extension["extension"]]["ElastixRingGroups"]) ) {
			$arrExtensions[$extension["extension"]]["ElastixRingGroups"] = GetIfSet($users[$extension["extension"]]["ElastixRingGroups"]) != 'yes'  ? "no":"yes";
		} else {
			$arrExtensions[$extension["extension"]]["ElastixRingGroups"] = "yes";
		}
		if ( $arrExtensions[$extension["extension"]]["ElastixRingGroups"] === "yes" ) {
			$arrExtensions[$extension["extension"]]["RingGroups"] = RingGroupsOf($extension["extension"]);
		} else {
			$arrExtensions[$extension["extension"]]["RingGroups"] = GetIfSet($users[$extension["extension"]]["RingGroups"]);
		}
		// Set the Queues
		if ( isset($users[$extension["extension"]]["ElastixQueues"]) ) {
			$arrExtensions[$extension["extension"]]["ElastixQueues"] = GetIfSet($users[$extension["extension"]]["ElastixQueues"]) != 'yes'  ? "no":"yes";
		} else {
			$arrExtensions[$extension["extension"]]["ElastixQueues"] = "yes";
		}
		if ( $arrExtensions[$extension["extension"]]["ElastixQueues"] === "yes" ) {
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

function getDeletedExtensions()
{
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

function getSpeedDials()
{
	global $FonbDB, $users;
	$query = "SELECT * FROM asteriskphonebook";
	
	$rs = $FonbDB->query($query);
	if($rs === FALSE) {
		return array();
	}
	$extensions = $rs->fetch_all(MYSQLI_ASSOC);
	return $extensions;
	$arrExtensions = array();
	foreach($extensions as $extension) {
		$arrExtensions[$extension["grpnum"]] = array( "Extension" => $extension["grpnum"], "Name" => $extension["description"], "Type" => "ringgroup");
	}
	return $arrExtensions;
}

function getSpeedDial($id)
{
	global $FonbDB, $users;
	$query = "SELECT * FROM asteriskphonebook where id = '$id'";
	
	$rs = $FonbDB->query($query);
	if($rs === FALSE) {
		return array();
	}
	$extensions = $rs->fetch_all(MYSQLI_ASSOC);
	return $extensions;
	$arrExtensions = array();
	foreach($extensions as $extension) {
		$arrExtensions[$extension["grpnum"]] = array( "Extension" => $extension["grpnum"], "Name" => $extension["description"], "Type" => "ringgroup");
	}
	return $arrExtensions;
}


function getRingGroups()
{
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

function getQueues()
{
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
