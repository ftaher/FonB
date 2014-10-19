<?php

require_once 'preload.inc';

$Json = Array();
$Json['SpeedDials'] = getSpeedDials();


echo json_encode($Json);

?>

