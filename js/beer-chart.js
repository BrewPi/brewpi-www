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

/* Give name of the beer to display and div to draw the graph in */
function drawBeerChart(beerToDraw, div){
    "use strict";
	var beerChart;
	var beerData;
	$.post("get_beer_files.php", {"beername": beerToDraw}, function(answer){
		var combinedJson;
		var first = true;
		var files = eval(answer);
		if(typeof files === 'undefined'){
            return;
        }
		for(var i=0;i<files.length;i++){
			var fileLocation = files[i];
			var jsonData = $.ajax({
					url: fileLocation,
					dataType:"json",
					async: false
					}).responseText;
			if(jsonData === ''){
				// skip empty responses
				continue;
			}

			var evalledJsonData = eval("("+jsonData+")");
			if(first){
				combinedJson = evalledJsonData;
				first = false;
			}
			else{
				combinedJson.rows  = combinedJson.rows.concat(evalledJsonData.rows);
			}
		}
		var beerData = new google.visualization.DataTable(combinedJson);
		var beerChart = new google.visualization.AnnotatedTimeLine(document.getElementById(div));
		beerChart.draw(beerData, {
			'displayAnnotations': true,
			'scaleType': 'maximized',
			'displayZoomButtons': false,
			'allValuesSuffix': "\u00B0 " + window.tempFormat,
			'numberFormats': "##.00",
			'displayAnnotationsFilter' : true});
	});
}