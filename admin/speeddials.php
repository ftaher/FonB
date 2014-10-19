<?php

require_once 'preload.inc';

### ADD button
if ( isset($_POST['action']) && $_POST['action'] == "Add" ) {
	header("Location: speeddials.php");
	exit;
}


### UPDATE button
if ( isset($_POST['action']) && $_POST['action'] == "Update" ) {
	header("Location: speeddials.php");
	exit;
}


### VIEW the edit user form


// Creat the listusers object
$Json = Array();
$Json['SpeedDials'] = getSpeedDials();

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
