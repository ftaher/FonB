<?php

require_once 'preload.inc';

$Json = Array();
$Json['Extensions'] = MustacheReformatExtensions( getExtensions() );
$Json['NoExtensionErrorMessage'] =  getNoExtensionErrorMessage();
$Json['RingGroups'] = getRingGroups();
$Json['Queues'] = getQueues();
$Json['DeletedExtensions'] = getDeletedExtensions();
$Json['License'] = $fonb->getTotalUsersAllowed();


echo json_encode($Json);

?>
