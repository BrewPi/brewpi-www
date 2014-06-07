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

$profiles = array();
	$profilesDir = 'data/profiles';
if(!file_exists($profilesDir)){
	echo json_encode( array( "error" => "directory: $profilesDir, does not exist" ) );
	return;
}
	$handle = opendir($profilesDir);
	if($handle == false){
    die("Cannot retrieve profiles directory: " . $profilesDir);
	}
	$i=0;
	while (false !== ($file = readdir($handle))){  // iterate over all csv files in directory
	$extension = strtolower(substr(strrchr($file, '.'), 1));
	if($extension == 'csv' ){
		$profiles[$i] = str_replace(".csv", "", $file); // strip extension for sorting
		$i=$i+1;
	}
}
closedir($handle);
echo json_encode( array( "profiles" => $profiles) );
