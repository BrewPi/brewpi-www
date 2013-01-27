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
	$beerName = $_POST["beername"];
	$fileNames = array();
  	$currentBeerDir = 'data/' . $beerName;
  	$handle = opendir($currentBeerDir);
  	if($handle == false){
  		die("Cannot retrieve beer files directory: " . $currentBeerDir);
  	}
  	$first = true;
  	$i=0;
  	while (false !== ($file = readdir($handle))){  // iterate over all json files in directory
		  $extension = strtolower(substr(strrchr($file, '.'), 1));
		  if($extension == 'json' ){
		  	$jsonFile =  $currentBeerDir . '/' . $file;
				$filenames[$i] = $jsonFile;
				$i=$i+1;
			}
		}
		closedir($handle);
		if(empty($filenames)){
			echo "";
		}
		else{
			echo json_encode($filenames);
		}
?>
