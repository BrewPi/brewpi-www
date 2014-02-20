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
$contents = $_REQUEST["profile"];

if ( file_put_contents($beerProfile, $contents) ) {
    $resp = array( "status" => "success", "message" => $profile . " saved successfully");
    echo json_encode($resp);
} else {
    echo json_encode( array( "status" => "error", "message" => "Error saving profile: $profile" ) );
}
