<?php
/* Copyright 2012 BrewPi/Elco Jacobs.
 * This file is part of BrewPi.

 * BrewPi is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * BrewPi is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with BrewPi.  If not, see <http://www.gnu.org/licenses/>.
 */

// Read config settings
if(file_exists('config.php')) {
	require_once('config.php');
}
else {
	die('ERROR: Unable to open required file (config.php)');
}

$response = array();
if(isset($_GET['stdout'])){
	if($_GET['stdout']== '1'){
		$stdout = getEndOfFile("$scriptPath/logs/stdout.txt");
		$response['stdout'] = utf8_decode($stdout);
	}
}
if(isset($_GET['stderr'])){
	if($_GET['stderr']== '1'){
		$stderr = getEndOfFile("$scriptPath/logs/stderr.txt");
		$response['stderr'] = utf8_decode($stderr);
	}
}
header('Content-Type: application/json');
echo json_encode($response);

function getEndOfFile($filename){
	$output = "";
	$fp = fopen($filename,'rb');
	if($fp === false){
		$output = "Cannot open log file $filename";
	}
	else{
		$stat = fstat($fp);
		$size = $stat['size'];
		if($size > 16384){
			fseek($fp, -16384, SEEK_END);
		}
		$output = fread($fp, 16384);
	}
	return str_replace(array("\r\n", "\n", "\r"), '<br />', $output);
}
