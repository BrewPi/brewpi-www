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
	$beerName = $_REQUEST["name"];
  	$beerProfile = 'data/profiles/' . $beerName . ".csv";
	if(!file_exists($beerProfile)){
		echo json_encode( array( "error" => "beer profile does not exist for beer: $beerProfile" ) );
		return;
	}
	
	$lines = file($beerProfile, FILE_IGNORE_NEW_LINES) or die(json_encode( array( "error" => "Unable to open profile for beer: " + $beerName ) ));
	$rows = array();
	foreach( $lines as $line) {
		$row = explode(",", $line);
		array_push( $rows, array( "days" => $row[0], "temperature" => $row[1]) );
	}

	$resp = array( "name" => $beerName, "profile" => $rows );

	echo json_encode($resp);
?>
