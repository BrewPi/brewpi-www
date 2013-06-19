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
?>

<?php

$settings = file_get_contents('wwwSettings.json');
if($settings == false){
	die("Cannot open settings file");
}
$settingsArray = json_decode(prepareJSON($settings), true);
if(is_null($settingsArray)){
	die("Cannot decode webSettings.json");
}
$beerName = $settingsArray["beerName"];
$tempFormat = $settingsArray["tempFormat"];
$profileKey = $settingsArray["profileKey"];
?>

<!DOCTYPE html >
<html>
	<head>
		<meta http-equiv="content-type" content="text/html; charset=utf-8" />
		<title>BrewPi reporting for duty!</title>
		<link type="text/css" href="css/redmond/jquery-ui-1.10.3.custom.css" rel="stylesheet" />
		<link type="text/css" href="css/style.css" rel="stylesheet"/>
	</head>
	<body>
		<div id="beer-panel" class="ui-widget ui-widget-content ui-corner-all">
			<?php
				include 'beer-panel.php';
			?>
		</div>
		<div id="control-panel" style="visibility:hidden"> <!--// hide while loading -->
			<?php
				include 'control-panel.php';
			?>
		</div>
		<div id="maintenance-panel" style="visibility:hidden"> <!--// hide while loading -->
			<?php
				include 'maintenance-panel.php';
			?>
		</div>
		<!-- Load scripts after the body, so they don't block rendering of the page -->
		<script type="text/javascript" src="js/jquery-1.9.1.js"></script>
		<script type="text/javascript" src="js/jquery-ui-1.10.3.custom.min.js"></script>
		<script type="text/javascript" src="http://www.google.com/jsapi"></script>
		<script type="text/javascript" src="js/spin.js"></script>
		<script type="text/javascript">
			// pass parameters to JavaScript
			window.tempFormat = <?php echo "'$tempFormat'" ?>;
			window.googleDocsKey = <?php echo "\"$profileKey\""?>;
			window.beerName = <?php echo "\"$beerName\""?>;
		</script>
		<script type="text/javascript" src="js/main.js"></script>
		<script type="text/javascript" src="js/device-config.js"></script>
		<script type="text/javascript" src="http://dygraphs.com/dygraph-combined.js"></script>
		<script type="text/javascript" src="js/control-panel.js"></script>
		<script type="text/javascript" src="js/maintenance-panel.js"></script>
		<script type="text/javascript" src="js/beer-chart.js"></script>
	</body>
</html>

<?php
function prepareJSON($input) {
    //This will convert ASCII/ISO-8859-1 to UTF-8.
    //Be careful with the third parameter (encoding detect list), because
    //if set wrong, some input encodings will get garbled (including UTF-8!)
    $input = mb_convert_encoding($input, 'UTF-8', 'ASCII,UTF-8,ISO-8859-1');

    //Remove UTF-8 BOM if present, json_decode() does not like it.
    if(substr($input, 0, 3) == pack("CCC", 0xEF, 0xBB, 0xBF)) $input = substr($input, 3);

    return $input;
}
?>
