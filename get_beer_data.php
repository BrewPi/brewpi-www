<?php

error_reporting(E_ERROR);
ini_set('display_errors', '1');

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
	$beerName = $_GET["beername"];
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

	$jsonCols = array();
	$jsonRows = array();

	if ( !empty($fileNames) ) {

		sort($fileNames, SORT_NATURAL); // sort files to return them in order from oldest to newest
		array_walk($fileNames, function(&$value) { $value .= '.json'; }); // add .json again

		// aggregate all json data for the beer
		foreach ( $fileNames as $fileName ) {
			$contents = file_get_contents(dirname(__FILE__) . '/' . $fileName);
			if ( strlen($contents) != 0 ) {
				$json = json_decode($contents, false);
				foreach( $json as $k => $v ) {
					// echo "_json key: " . $k . ", value: " . $v . "<br/>";
					if ( $k == 'cols' && empty($jsonCols) ) {
						foreach( $v as $id => $nm ) {
							// echo "col key: " . $id . "<br/>";
							array_push( $jsonCols, $nm );
						}
					} elseif ( $k == 'rows' ) {
						foreach( $v as $id1 => $nm1 ) {
							// echo "row key: " . $id1 . "<br/>";
							if ( $id1 == 'c' ) {
								foreach( $nm1 as $id2 => $nm2 ) {
									array_push( $jsonRows, $nm1 );
								}
							}
						}
					}
				}
			}
		}
		echo json_encode( array( "cols" => $jsonCols, "rows" => $jsonRows ) );
	}
?>
