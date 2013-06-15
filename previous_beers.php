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

<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<title>BrewPi: previous beers</title>
</head>
<body>
	<div id="beer-selector">
		<span>Select the beer you would like to view:</span>
		<select id="prev-beer-name">
			<?php
				foreach(glob('data/*', GLOB_ONLYDIR) as $dir)
				{
					$dir = basename($dir);
					echo '<option value="', $dir, '">', $dir, '</option>';
				}
			?>
		</select>
		<button id="prev-beer-show">Show</button>
		<button id="download-csv">Download CSV</button>
	</div>
	<div class="chart-container">
		<div id="prev-beer-chart-label" class="beer-chart-label"></div>
		<div id="prev-beer-chart" class="beer-chart" style="width:800px; height:500px"></div>
		<div id="prev-beer-chart-controls" class="beer-chart-controls" style="visibility: hidden">
			<button class="chart-help"></button>
			<button class="toggle beerTemp" title="Beer temperature" onClick="toggleLine(this)">
			<button class="toggle beerSet" title="Beer setting" onClick="toggleLine(this)">
			<button class="toggle fridgeTemp" title="Fridge temperature" onClick="toggleLine(this)">
			<button class="toggle fridgeSet" title="Fridge setting" onClick="toggleLine(this)">
			<button class="toggle roomTemp" title="Room temperature" onClick="toggleLine(this)">
			<button class="toggleAnnotations" title="Annotations" onClick="toggleAnnotations(this)">A</button>
		</div>
	</div>
	<script>
		$(document).ready(function(){
			$("button#prev-beer-show").button({ icons: {primary: "ui-icon-circle-triangle-e"} }).click(function(){
				drawBeerChart(String($("select#prev-beer-name").val()), "prev-beer-chart" );
			});
			$("button#download-csv").button({ icons: {primary: "ui-icon-arrowthickstop-1-s"} }).click(function(){
				var url = "data/" + String($("select#prev-beer-name").val()) + "/" + String($("select#prev-beer-name").val()) + ".csv";
				window.open(encodeURI(url), 'Download CSV' );
			});
			$("#prev-beer-chart-controls button.chart-help").button({	icons: {primary: "ui-icon-help" } }).click(function(){
				$("#chart-help-popup").dialog("open");
			});
		});
	</script>
</body>
</html>
