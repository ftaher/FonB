<?php

require_once 'preload.inc';

### ADD button
if ( isset($_POST['action']) && $_POST['action'] == "Add" ) {
	$data = $fonb->get_users();
	if(empty($_POST['new_extension']['Password'])){
	  unset($_POST['new_extension']['Password']);
	}
	$data[$_POST['new_extension']['Extension']] = $_POST['new_extension'];
	$_POST = $data;

	// Save the file
	$data = removeNonIntSections($_POST);
	$data = removeEmptyPasswords($data);
	$fonb->write_users($data);
	header("Location: users.php");
	exit;
}


### UPDATE button
if ( isset($_POST['action']) && $_POST['action'] == "Update" ) {
	// Save the file
	$data = removeNonIntSections($_POST);
	$data = removeEmptyPasswords($data);
	$fonb->write_users($data);
	header("Location: users.php");
	exit;
}


### VIEW the edit user form


// Creat the listusers object
$Json = Array();
$Json['Extensions'] = MustacheReformatExtensions( getExtensions() );
$Json['RingGroups'] = getRingGroups();
$Json['Queues'] = getQueues();
$Json['DeletedExtensions'] = getDeletedExtensions();
$Json['License'] = $fonb->getTotalUsersAllowed();


// Get the Handlebars Template
$UsersTemplateFilePath = realpath("../templates/admin/users.html");
if ( $UsersTemplateFilePath === false ) { // Error
	exit("Template users.html was not found");
}
$UsersTemplate = file_get_contents($UsersTemplateFilePath);

// Last step, output the html file
require 'Handlebars/Autoloader.php';
Handlebars\Autoloader::register();
use Handlebars\Handlebars;
$engine = new Handlebars;
echo $engine->render( $UsersTemplate , $Json );


?>
