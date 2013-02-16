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

<div style="font-family: Arial;">
<button id="refresh-logs" style="float:right">Refresh</button>
<h3>stderr:</h3>
<div id="stderr" style="background:black; overflow:auto; height:200px; color:white; border-color:#ADD6FF; border-style:ridge; border-width:5px; padding: 10px 10px">
	<?php
		$file = file("$scriptPath/logs/stderr.txt");
		foreach($file as $line) {
			echo $line . "<br>";
		}
	?>
</div>
<h3>stdout:</h3>
<div id="stdout" style="background:black; overflow:auto; height:200px; color:white; border-color:#ADD6FF; border-style:ridge; border-width:5px; padding: 10px 10px">
	<?php
	$file = file("$scriptPath/logs/stdout.txt");
	foreach($file as $line) {
		echo $line . "<br>";
	}
	?>
</div>

<script>
	// Scroll both logs to bottom
	var stderrDiv = document.getElementById('stderr');
	stderrDiv.scrollTop = stderrDiv.scrollHeight;

	var stdoutDiv = document.getElementById('stdout');
	stdoutDiv.scrollTop = stdoutDiv.scrollHeight;

	// create refresh button
	$("#refresh-logs").button({ icons: {primary: "ui-icon-refresh"}	}).click(function(){
		$('#maintenance-panel').tabs( "load" , 1);
	});
</script>
</div>
