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

// Set instance root
$instanceRoot = getcwd();

// Read config settings
if(file_exists('config.php')) {
	require_once('config.php');
}
else {
	die('ERROR: Unable to open required file (config.php)');
}
?>

<?php
error_reporting(E_ALL);
if(isset($_POST['boardType'])){
	$boardType = $_POST['boardType'];
}
else{
	die("boardType not specified");
}
if(isset($_POST['eraseEEPROM'])){
	$eraseEEPROM = $_POST['eraseEEPROM'];
}
else{
	die("eraseEEPROM not specified");
}

if ($_FILES["file"]["error"] > 0){
	die("Hex file error: " . $_FILES["file"]["error"]);
}
?>
<!DOCTYPE html>
<head>
  <title>BrewPi programming arduino!</title>
</head>
<body style="font-family: Arial;border: 0 none;">
<?php
$fileName = $_FILES["file"]["name"];
echo "Uploaded " . $fileName . " (size: " . ($_FILES["file"]["size"]) . " bytes)<br />";
$tempFileName = $_FILES["file"]["tmp_name"];
if(move_uploaded_file($tempFileName, "$instanceRoot/uploads/" . $fileName)){
	// succes!
}
else{
	die("cannot move uploaded file");
}

?>
<p> Now requesting Python to invoke avrdude. avrdude output is displayed below. </p>

<?php
$sock = open_socket();
if($sock !== false){
	socket_write($sock, "programArduino={\"boardType\":\"$boardType\",\"fileName\":\"$instanceRoot/uploads/$fileName\",\"eraseEEPROM\":$eraseEEPROM}", 1024);
	$avrdudeOutput = socket_read($sock, 4096);
	socket_close($sock);
}
?>
<h3> avrdude output: </h3>
<div style="background-color:black; color:white; border-color:#ADD6FF; border-style:ridge; border-width:5px; padding: 10px 10px">
<?php
	echo "<pre>$avrdudeOutput</pre>";
?>

</div>
</body>
</html>
<?php
function open_socket()
{
	$sock = socket_create(AF_UNIX, SOCK_STREAM, 0);
	if ($sock === false) {
		return false;
	}
	else{
		if(socket_connect($sock, "$GLOBALS[scriptPath]/BEERSOCKET")){
			socket_set_option($sock, SOL_SOCKET, SO_RCVTIMEO, array('sec' => 15, 'usec' => 0));
			return $sock;
		}
		else{
			echo "Not connected";
			# echo socket_strerror(socket_last_error($sock));
			return false;
		}
	}
}
?>


