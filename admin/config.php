<?php

require_once 'preload.inc';

$Json = array();
$Json['Config'] = $fonbconfig;

### Enable Debug button
if (  isset($_POST['action']) && $_POST['action'] == "EnableDebug" ) {
	// Save the file
	$data = removeUnnecessaryKeys($_POST,$fonbconfig);
	$data = array_merge($fonbconfig,$data);
	$data['AMI']['Debug'] = 1;
	$fonb->write_phoneb($data);
	header("Location: config.php");
	exit;
}


### Disable Debug button
if (  isset($_POST['action']) && $_POST['action'] == "DisableDebug" ) {
	// Save the file
	$data = removeUnnecessaryKeys($_POST,$fonbconfig);
	$data = array_merge($fonbconfig,$data);
	unset($data['WebSocket']);
	$fonb->write_phoneb($data);
	header("Location: config.php");
	exit;
}


### UPDATE button
if (  isset($_POST['action']) && $_POST['action'] == "SAVE" ) {
	// Save the file
	$data = removeUnnecessaryKeys($_POST,$fonbconfig);
	$data = array_merge($fonbconfig,$data);
	$fonb->write_phoneb($data);
	header("Location: config.php");
	exit;
}


### VIEW the edit user form

// Get the Handlebars Template
$ConfigTemplateFilePath = realpath("../templates/admin/config.html");
if ( $ConfigTemplateFilePath === false ) { // Error
	exit("Template config.html was not found");
}
$ConfigTemplate = file_get_contents($ConfigTemplateFilePath);

// Last step, output the html file
require 'Handlebars/Autoloader.php';
Handlebars\Autoloader::register();
use Handlebars\Handlebars;
$engine = new Handlebars;
echo $engine->render( $ConfigTemplate , $fonbconfig );


?>
