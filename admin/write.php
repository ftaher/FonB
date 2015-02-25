<?php

require_once 'preload.inc';



$data = getExtensions() + getRingGroups() + getQueues() + getDeletedExtensions();

// Save the file
$data = removeNonIntSections($data);
$data = removeEmptyPasswords($data);
prepareContext();
//print_r($data);exit;
$fonb->write_users($data);

// Exit with a seccess
exit(DONE);
