<?php

### CANCEL button
if ( isset($_POST['action']) && $_POST['action'] != "SAVE" ) {
	header("Location: users.php");
	exit;
}

require_once 'preload.inc';

/// Get the Extension number from $_POST
$exten = $_GET["exten"];


### SAVE button
if ( isset($_POST['action']) && $_POST['action'] == "SAVE" ) {

	// Get the Extension
	$exten = $_POST['data']['Extension'];

	// ReFormat the Submission Form (Extension Settings)
	$extendata = $_POST['data'];
	$extension = array();
	$extension['Extension'] = $exten;
	$extension['Password'] = $extendata['Password'];
	$extension['Type'] = $extendata['Type'];
	$extension['Department'] = $extendata['Department'];
	$extension['Company'] = $extendata['Company'];
	$extension['Product'] = $extendata['Product'];
//	$extension['BaseDir'] = $extendata['BaseDir'];
//	$extension['Language'] = $extendata['Language'];
	$extension['Spy'] = TextBoxToArray($extendata['Spy']);
	$extension['HaveRingGroups'] = $extendata['HaveRingGroups'] != 'yes'  ? "no":"yes";
	$extension['RingGroups'] = TextBoxToArray($extendata['RingGroups']);
	$extension['HaveQueues'] = $extendata['HaveQueues'] != 'yes'  ? "no":"yes";
	$extension['Queues'] = TextBoxToArray($extendata['Queues']);
	$extension['Context'] = "fonb-from-internal";
	$extension['Terminal'] = "SIP/".$exten;

	/// Get Users Configuration
	$data = $users;
	if ( !array_key_exists($exten,$data) ) { /// Error NoExtension
		header("Location: users.php");
		exit;
	}

	// Update Users Configuration
	$data[$exten] = $extension;

	// Reformat the $data
	$data = removeNonIntSections($data);
	$data = removeEmptyPasswords($data);

	// Save the file
	$fonb->write_users($data);

	header("Location: users.php");
	exit;
}


### VIEW the edit user form

// Creat the listusers object
$Json = Array();
$Json['EditExtension'] =  $users[$exten];
$Json['EditExtension']['Platform'] = GetPlatform();
$Json['Departments'] = $fonb->getDepartments();
//$Json['RingGroups'] = getRingGroups();
$Json['RingGroups'] = RingGroupsOf($exten);
//$Json['Queues'] = getQueues();
$Json['Queues'] = QueuesOf($exten);
$Json['DeletedExtensions'] = getDeletedExtensions();
$Json['Extensions'] = MustacheReformatExtensions( getExtensions() );
$Json['License'] = $fonb->getTotalUsersAllowed();




if ( $_GET['encode'] == 'json' ) {
	echo json_encode($Json);
	exit;
}

// Get the Handlebars Template
$EditUserTemplateFilePath = realpath("../templates/admin/edituser.html");
if ( $EditUserTemplateFilePath === false ) { // Error
	exit("Template edituser.html was not found");
}

$EditUserTemplate = file_get_contents($EditUserTemplateFilePath);

// Last step, output the html file
require 'Handlebars/Autoloader.php';
Handlebars\Autoloader::register();
use Handlebars\Handlebars;
$engine = new Handlebars;
echo $engine->render( $EditUserTemplate , $Json );





?>
