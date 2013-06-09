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
		<div id="prev-beer-chart" class="beer-chart"></div>
		<div id="prev-beer-chart-controls" class="beer-chart-controls" style="visibility: hidden">
			<button class="toggle-line-0" onClick="toggleLine(this)">
			<button class="toggle-line-1" onClick="toggleLine(this)">
			<button class="toggle-line-2" onClick="toggleLine(this)">
			<button class="toggle-line-3" onClick="toggleLine(this)">
			<button class="toggle-line-4" onClick="toggleLine(this)">
		</div>
	</div>
	<script>
		$("button#prev-beer-show").button({ icons: {primary: "ui-icon-circle-triangle-e"} }).click(function(){
			drawBeerChart(String($("select#prev-beer-name").val()), "prev-beer-chart" );
		});
		$("button#download-csv").button({ icons: {primary: "ui-icon-arrowthickstop-1-s"} }).click(function(){
			var url = "data/" + String($("select#prev-beer-name").val()) + "/" + String($("select#prev-beer-name").val()) + ".csv";
			window.open(encodeURI(url), 'Download CSV' );
		});
	</script>
</body>
</html>
