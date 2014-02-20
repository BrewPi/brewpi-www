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

$profile = $_REQUEST["name"];
	$beerProfile = 'data/profiles/' . $profile . ".csv";
if(!file_exists($beerProfile)){
	echo json_encode( array( "error" => "beer profile does not exist for beer: $profile" ) );
	return;
}

$lines = file($beerProfile, FILE_IGNORE_NEW_LINES) or die(json_encode( array( "error" => "Unable to open profile for beer: " + $profile ) ));
$rows = array();
$idx = 0;
foreach( $lines as $line) {
	if ( $idx > 0 ) {
		$row = explode(",", $line);
		array_push( $rows, array( "date" => $row[0], "temperature" => $row[1], "days" => $row[2]) );
	}
	$idx++;
}

$resp = array( "name" => $profile, "profile" => $rows );

echo json_encode($resp);
