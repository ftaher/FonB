<?php

require_once 'preload.inc';


### ADD button
if ( isset($_POST['action']) && $_POST['action'] == "Add" ) {

	//print_r($_POST['new_speed_dial']);
	//exit;
	$data = $_POST['new_speed_dial'];
	add_speed_dial($data);
	
	header("Location: speeddials.php");
	exit;
}


### SAVE button
if ( isset($_POST['action']) && $_POST['action'] == "SAVE" ) {
	$extendata = $_POST['data'];
	update_SpeedDial($extendata);
	header("Location: speeddials.php");
	exit;
}

### DELETE link
if(isset($_GET['action']) && $_GET['action'] == "DELETE"){
	$id = $_GET['id'];
	delete_SpeedDial($id);
	header("Location: speeddials.php");
	exit;
}



### VIEW the edit user form


// Creat the listusers object
$Json = Array();
$Json['SpeedDials'] = getSpeedDials();
//print_r($Json);

// Get the Handlebars Template
$SpeedDialsTemplateFilePath = realpath("../templates/admin/speeddials.html");
if ( $SpeedDialsTemplateFilePath === false ) { // Error
	exit("Template users.html was not found");
}
$SpeedDialsTemplate = file_get_contents($SpeedDialsTemplateFilePath);

// Last step, output the html file
require 'Handlebars/Autoloader.php';
Handlebars\Autoloader::register();
use Handlebars\Handlebars;
$engine = new Handlebars;
echo $engine->render( $SpeedDialsTemplate , $Json );


?>
