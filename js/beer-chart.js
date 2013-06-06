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

var beerChart;

/* Give name of the beer to display and div to draw the graph in */
function drawBeerChart(beerToDraw, div){
    "use strict";
	var beerData;
	$.post("get_beer_files.php", {"beername": beerToDraw}, function(answer) {
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
		var useGViz = false;

        if (useGViz) {
            beerChart = new google.visualization.AnnotatedTimeLine(document.getElementById(div));
            beerChart.draw(beerData, {
                'displayAnnotations': true,
                'scaleType': 'maximized',
                'displayZoomButtons': false,
                'allValuesSuffix': "\u00B0 " + window.tempFormat,
                'numberFormats': "##.00",
                'displayAnnotationsFilter' : true});
        }
        else {

            var tempFormat = function(y) {
                return parseFloat(y).toFixed(2) + "\u00B0 " + window.tempFormat;
            };

            var stateFormat = function(y) {
                switch (parseInt(y)) {
                    case 0 : return "Off";
                    case 4: return 'Cooling';
                    case 5: return 'Heating';
                    default: return "--";
                }
            };

            var chart = new Dygraph.GVizChart(document.getElementById(div));
            chart.draw(
                    beerData, {
                    colors: [ 'rgb(70,132,238)', 'rgb(220,57,18)', 'rgb(255, 153, 0)', 'rgb(0, 128, 0)', 'rgb(73,66,204)', 'rgb(153,0,153)' ],
                    axisLabelFontSize:12,
                    animatedZooms: true,
                    gridLineColor:'#ccc',
                    gridLineWidth:'0.1px',
                    labelsDiv: document.getElementById(div+"-label"),
                    legend: 'always',
                    displayAnnotations:true,
                    displayAnnotationsFilter:true,
                    labelsDivStyles: { 'textAlign': 'right' },
                    showRangeSelector: false,
                    strokeWidth: 0.6,
                    axes: {
                        y : { valueFormatter: tempFormat }
                    },
                    underlayCallback: function(canvas, area, g) {

                        /**
                         * Find the row in the data that corresponds with the given x value (or closest.)
                         * @param target
                         * @param start
                         * @param end
                         * @returns {*}
                         */
                        function findDataRow(target) {
                            var low = 0, high = g.numRows()-1;
                            var mid, comparison;

                            while (low <= high) {
                                mid = Math.floor((low + high) / 2);
                                comparison = g.getValue(mid,0)-target;
                                if (comparison < 0) { low = mid+1; continue; }
                                if (comparison > 0) { high = mid-1; continue; }
                                return mid;
                            }
                            return mid;
                        }

                        function getState(row) {
                            return g.getValue(row, 6);
                        }

                        function findStateBlocks(start, end) {
                            var result = [];
                            var state = getState(start);
                            var newState;
                            for (var i=start; i<end; i++) {
                                newState = getState(i);
                                if (newState!==state) {
                                    result.push({start: i, state:state});
                                    state = newState;
                                }
                            }
                            result.push({start: end, state:state});
                            return result;
                        }


                        var xRange = [g.toDataXCoord(area.x), g.toDataXCoord(area.x+area.w)];
                        var xStart = xRange[0];
                        var xEnd = xRange[1];

                        // the data rows for the range we are interested in.
                        var rowStart = findDataRow(xStart);
                        var rowEnd = findDataRow(xEnd);
                        if (rowStart==null || rowEnd==null)
                            return;
                        var blocks = findStateBlocks(rowStart, rowEnd);

                        var startCoord = 0;
                        for (i=0; i<blocks.length; i++) {
                            var block = blocks[i];
                            var row = block.start;
                            var r = (row-rowStart)/(rowEnd+1-rowStart);   // as a fraction of the entire display
                            var endCoord = area.x + (area.w  * r);
                            var color = "#fff";
                            switch (parseInt(block.state)) {
                                case 4:
                                    color = "rgba(255, 64, 64, 0.15)";
                                    break;
                                case 5:
                                    color = "rgba(64, 64, 255, 0.15)";
                                    break;
                            }
                            canvas.fillStyle = color;
                            canvas.fillRect(startCoord, area.y, endCoord, area.h);
                            startCoord = endCoord;
                        }
                    }
                }
            );

            beerChart = chart.date_graph;
            beerChart.setVisibility(5, 0);

            var controls = document.getElementById('beer-chart-controls');
            if (controls) {
                controls.style.visibility="visible";
            }
        }
    });
}

function change(el) {
    beerChart.setVisibility(el.id, el.checked);
}
