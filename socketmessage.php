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
?>

<?php

error_reporting(E_ALL ^ E_WARNING);
if(isset($_POST['messageType'])){
	$messageType = $_POST['messageType'];
}
else{
	die("messageType not set");
}
if(isset($_POST['message'])){
	$data = $_POST['message'];
}
$sock = open_socket();
if($sock !== false){
	switch($messageType){
		case "checkScript":
			socket_write($sock, "ack", 1024);
			$answer = socket_read($sock, 1024);
			if($answer = "ack"){
				echo 1;
			}
			else{
				echo 0;
			}
			break;
		case "getBeer":
			socket_write($sock, "getBeer", 1024);
			echo socket_read($sock, 1024);
			break;
		case "getFridge":
			socket_write($sock, "getFridge", 1024);
			echo socket_read($sock, 1024);
			break;
		case "getMode":
			socket_write($sock, "getMode", 1024);
			echo socket_read($sock, 1024);
			break;
		case "setProfile":
			socket_write($sock, "setProfile", 1024);
			break;
		case "setBeer":
			socket_write($sock, "setBeer=" . $data, 1024);
			break;
		case "setFridge":
			socket_write($sock, "setFridge=" . $data, 1024);
			break;
		case "setOff":
			socket_write($sock, "setOff", 1024);
			break;
		case "stopScript":
			socket_write($sock, "stopScript", 1024);
			break;
		case "getControlConstants":
			socket_write($sock, "getControlConstants", 1024);
			echo socket_read($sock, 1024);
			break;
		case "getControlSettings":
			socket_write($sock, "getControlSettings", 1024);
			echo socket_read($sock, 1024);
			break;
		case "getControlVariables":
			socket_write($sock, "getControlVariables", 1024);
			echo socket_read($sock, 1024);
			break;
		case "refreshControlConstants":
			socket_write($sock, "refreshControlConstants", 1024);
			break;
		case "refreshControlSettings":
			socket_write($sock, "refreshControlSettings", 1024);
			break;
		case "refreshControlVariables":
			socket_write($sock, "refreshControlVariables", 1024);
			break;
		case "loadDefaultControlSettings":
			socket_write($sock, "loadDefaultControlSettings", 1024);
			break;
		case "loadDefaultControlConstants":
			socket_write($sock, "loadDefaultControlConstants", 1024);
			break;
		case "setParameters":
			socket_write($sock, "setParameters=" . $data, 1024);
			break;
		case "lcd":
			socket_write($sock, "lcd", 1024);
			$lcdText = socket_read($sock, 1024);
			if($lcdText !== false){
				echo str_replace(chr(0xB0), "&deg;", $lcdText); // replace degree sign with &Deg
			}
			else{
				echo false;
			}
			break;
		case "interval":
			socket_write($sock, "interval=" . $data, 1024);
			break;
		case "name":
			socket_write($sock, "name=" . $data, 1024);
			break;
		case "profileKey":
			socket_write($sock, "profileKey=" . $data, 1024);
			break;
		case "uploadProfile":
			socket_write($sock, "uploadProfile", 1024);
			echo socket_read($sock, 1024);
			break;
	}
	socket_close($sock);
}

function open_socket()
{	
	global $useInetSocket;
	if ($useInetSocket)
		$sock = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
	else		
		$sock = socket_create(AF_UNIX, SOCK_STREAM, 0);
	if (!($sock === false)) 
	{		
		if(
			((!$useInetSocket) && socket_connect($sock, "$GLOBALS[scriptPath]/BEERSOCKET"))
		     || (($useInetSocket) && socket_connect($sock, $GLOBALS["scriptAddress"], $GLOBALS["scriptPort"])))
		{
			socket_set_option($sock, SOL_SOCKET, SO_RCVTIMEO, array('sec' => 15, 'usec' => 0));
		}
		else {
			socket_close($sock);
			echo "Not connected";
			if ($GLOBALS->debug===true) 
				echo socket_strerror(socket_last_error($sock));			
		}
	}
	return $sock;
}
?>
