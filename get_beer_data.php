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

$beerName = $_POST["beername"];
$fileNames = array();
	$currentBeerDir = 'data/' . $beerName;
    if(!file_exists($currentBeerDir)){
        echo json_encode( array( "error" => "directory: $beerName, does not exist" ) );
        return;
    }
	$handle = opendir($currentBeerDir);
	if($handle == false){
	echo json_encode( array( "error" => "Cannot retrieve beer files directory: " . $currentBeerDir ) );
	return;
	}
	$first = true;
	$i=0;
	while (false !== ($file = readdir($handle))){  // iterate over all json files in directory
	$extension = strtolower(substr(strrchr($file, '.'), 1));
	if($extension == 'json' ){
	  	$jsonFile =  $currentBeerDir . '/' . $file;
		$fileNames[$i] = str_replace(".json", "", $jsonFile); // strip extension for sorting
		$i=$i+1;
	}
}
closedir($handle);

$cols = "";

if ( !empty($fileNames) ) {

	sort($fileNames, SORT_NATURAL); // sort files to return them in order from oldest to newest
	array_walk($fileNames, function(&$value) { $value .= '.json'; }); // add .json again

	// aggregate all json data for the beer
	$renderedRow = false;
	echo "{\"rows\":[";
	foreach ( $fileNames as $fileName ) {
		$contents = file_get_contents(dirname(__FILE__) . '/' . $fileName);
		if ( strlen($contents) != 0 ) {
			if ( $renderedRow ) {
				echo ","; // comma between each file's rows array
			}
			echo get_list_between($contents, '"rows":' , ']}]');
			$renderedRow = true;

			$colsThisFile = get_list_between($contents, '"cols":' , ']');
			if(strlen($colsThisFile) > strlen($cols)){
			    // use largest column list
			    $cols = $colsThisFile;
			}
		}
	}
    echo '],"cols":[' . $cols . ']}';
}

function get_list_between($string, $start, $end){
    $begin = strpos($string,$start);
    if ($begin == 0) return "[]"; // return empty list when not found
    $begin = strpos($string,"[", $begin) + 1; // start after list opening bracket
    $len = strpos($string,$end,$begin) - $begin + strlen($end) - 1;
    return substr($string,$begin,$len);
}
