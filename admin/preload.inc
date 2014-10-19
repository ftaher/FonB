<?php

require_once 'FonBConfig.class.php';
require_once 'functions.inc';
$fonb = new FonBConfig("/etc/phoneb/phoneb.cfg", "/etc/phoneb/users.cfg");

$fonbconfig = $fonb->get_phoneb();


$DBServer = $fonbconfig['MysqlFonB']['Hostname']; // e.g 'localhost' or '192.168.1.100'
$DBUser   = $fonbconfig['MysqlFonB']['Username']; 
$DBPass   = $fonbconfig['MysqlFonB']['Password'];
$DBFonB   = $fonbconfig['MysqlFonB']['Database'];
$DBName   = "asterisk";

$pDB = new mysqli($DBServer, $DBUser, $DBPass, $DBName);
// check connection
if ($pDB->connect_error) {
	trigger_error('Database connection failed: '  . $pDB->connect_error, E_USER_ERROR);
}


$FonbDB = new mysqli($DBServer, $DBUser, $DBPass, $DBFonB);
// check connection
if ($FonbDB->connect_error) {
	trigger_error('Database connection failed: '  . $FonbDB->connect_error, E_USER_ERROR);
}


$users = $fonb->get_users();


?>
