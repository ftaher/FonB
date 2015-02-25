<?php


$output = shell_exec('yum --disablerepo=* --enablerepo=aptus check-update ');

if(stripos($output,"fonb") != FALSE){
	echo "YES";
}
else{
	echo "NO";
}
?>