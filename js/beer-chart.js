/*
 * Copyright 2012-2013 BrewPi/Elco Jacobs.
 * Copyright 2013 Matthew McGowan
 * This file is part of BrewPi.
 *
 * BrewPi is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * BrewPi is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with BrewPi.  If not, see <http://www.gnu.org/licenses/>.
 */

var beerChart;

var colorCool = "rgba(64, 64, 255, 0.15)";
var colorHeat = "rgba(255, 64, 64, 0.15)";
var colorIdle = "white";

var TIME_COLUMN = 0;        // time is the first column of data
var STATE_COLUMN = 6;       // state is currently the 6th column of data.
var STATE_LINE_WIDTH = 5;

/**
 * The states of the temp controller algorithm, and their presentation attributes.
 * @type {Array}
 */
var STATES = [
    { name: "IDLE", color:colorIdle },
    { name: "STATE_OFF", color:colorIdle },
    { name: "DOOR_OPEN", color:"#eee", doorOpen:true },
    { name: "HEATING", color:colorHeat },
    { name: "COOLING", color:colorCool },
    { name: "WAITING_TO_COOL", color:colorCool, waiting:true  },
    { name: "WAITING_TO_HEAT", color:colorHeat, waiting:true  },
    { name: "WAITING_FOR_PEAK_DETECT", color:colorIdle, waiting:true },
    { name: "COOLING_MIN_TIME", color:colorCool, extending:true },
    { name: "HEATING_MIN_TIME", color:colorHeat, extending:true }
];


CanvasRenderingContext2D.prototype.dashedLine = function(x1, y1, x2, y2, dashLen) {
    if (dashLen == undefined) dashLen = 2;

    this.beginPath();
    this.moveTo(x1, y1);

    var dX = x2 - x1;
    var dY = y2 - y1;
    var dashes = Math.floor(Math.sqrt(dX * dX + dY * dY) / dashLen);
    var dashX = dX / dashes;
    var dashY = dY / dashes;

    var q = 0;
    while (q++ < dashes) {
        x1 += dashX;
        y1 += dashY;
        this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x1, y1);
    }
    this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x2, y2);

    this.stroke();
    this.closePath();
};


function setAlphaFactor(rgba) {
    return rgba;
}

/**
 * Fetches the state for the given data row.
 * @param row   The data row to fetch the state for.
 * @param g {Dygraph}
 * @returns The state, if defined for that time.
 */
function getState(g, row) {
    return (row>= g.numRows()) ? 0 : g.getValue(row, STATE_COLUMN);
}
function getTime(g, row) {
    if (row>= g.numRows())
        row = g.numRows()-1;
    return g.getValue(row, TIME_COLUMN);
}

/**
 * Fetches regions where the state doesn't change.
 * @param g
 * @param start     The row number for the start of the range to fetch state blocks for.
 * @param end       The row number for the end of the range, exclusive.
 * @returns {Array} Array of records, comprising the end row (exclusive) and the state. The state is valid up to but not including
 *  the value of start.
 */
function findStateBlocks(g, start, end) {
    var result = [];
    var state = getState(g, start);             // current state
    var newState;
    for (var i = start; i < end; i++) {         // find the next change
        newState = getState(g, i);
        if (newState !== state) {
            result.push({row: i, state: state});
            state = newState;
        }
    }
    result.push({row: end, state: state});
    return result;
}

/**
 * Find the row in the data table that corresponds with the given time value (or closest.)
 * @param g {Dygraph}           The dygraph containing the data
 * @param time {number}         The time target to find the corresponding row for
 * @returns {number} The row containing the time nearest to <code>time</code>}
 *
 * Since the time data is assumed sorted, the implementation uses a binary search to efficiently find
 * the corresponding index.
 */
function findDataRow(g, time) {
    var low = 0, high = g.numRows() - 1;
    var mid, comparison;

    while (low < high) {
        mid = Math.floor((low + high) / 2);
        comparison = g.getValue(mid, 0) - time;
        if (comparison < 0) {
            low = mid + 1;
            continue;
        }
        if (comparison > 0) {
            high = mid - 1;
            continue;
        }
        return mid;
    }
    return low;
}


function paintBackground(canvas, area, g) {
    canvas.save();
    try {
        paintBackgroundImpl(canvas, area, g);
    }
    finally {
        canvas.restore();
    }

}

function paintBackgroundImpl(canvas, area, g) {

    // find the time series range corresponding to what is visible
    var timeRange = [g.toDataXCoord(area.x), g.toDataXCoord(area.x + area.w)];
    var timeStart = timeRange[0];     // millis since epoch
    var timeEnd = timeRange[1];

    // the data rows for the range we are interested in. 0-based index. This is deliberately extended out one row
    // to be sure the range is included
    var rowStart = Math.max(findDataRow(g, timeStart)-1,0);
    var rowEnd = findDataRow(g, timeEnd)+1;
    if (rowStart == null || rowEnd == null)
        return;
    var blocks = findStateBlocks(g, rowStart, rowEnd);    // rowEnd is exclusive

    var startX = 0;                     // start drawing from 0 - the far left
    for (i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        var row = block.row;              // where this state run ends
        var t = getTime(g, row);          // convert to time. Using time ensures the display matches the plotted resolution
                                          // of the graph.
        var r = (t - timeStart) / (timeEnd - timeStart);   // as a fraction of the entire display
        var endX = Math.floor(area.x + (area.w * r));

        var state = STATES[parseInt(block.state)];
        if (state===undefined)
            state = STATES[0];
        //var borderColor = (state.waiting || state.extending) ? setAlphaFactor(state.color, 0.5) : undefined;
        //var bgColor = (state.waiting) ? bgColor = colorIdle : state.color;
        var bgColor = state.color;
        canvas.fillStyle = bgColor;
        canvas.fillRect(startX, area.y, endX-startX, area.y+STATE_LINE_WIDTH);
/*        if (borderColor!==undefined) {
            lineWidth = 2;
            canvas.lineWidth = lineWidth;
            canvas.strokeStyle = borderColor;
            if (endX-startX>lineWidth)
                canvas.strokeRect(startX+lineWidth/2, area.y+lineWidth/2, endX-startX-lineWidth, area.h-lineWidth);
        }
  */
        startX = endX;
    }
}


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

        var tempFormat = function(y) {
            return parseFloat(y).toFixed(2) + "\u00B0 " + window.tempFormat;
        };

        var chart = new Dygraph.GVizChart(document.getElementById(div));
        chart.draw(
                beerData, {
                colors: [ 'rgb(255, 153, 0)', 'rgb(255, 192, 102)', 'rgb(70,132,238)', 'rgb(138, 177, 244)', '#aaa', 'rgb(153,0,153)' ],
                axisLabelFontSize:12,
                animatedZooms: true,
                gridLineColor:'#ccc',
                gridLineWidth:'0.1px',
                labelsDiv: document.getElementById(div+"-label"),
                legend: 'always',
                displayAnnotations:true,
                displayAnnotationsFilter:true,
                labelsDivStyles: { 'textAlign': 'right' },
                //showRangeSelector: true,
                strokeWidth: 2,

                "Beer setting" : {
//                        strokePattern: [ 5, 5 ],
                    strokeWidth: 1
                },
                "Fridge setting" : {
//                        strokePattern: [ 5, 5 ],
                    strokeWidth: 1
                },
                "Room temp" : {
                    strokeWidth: 1
                },
                axes: {
                    y : { valueFormatter: tempFormat }
                },
/*                    highlightCircleSize: 2,
                highlightSeriesOpts: {
                    strokeWidth: 1.5,
                    strokeBorderWidth: 1,
                    highlightCircleSize: 5
                },                        */

                underlayCallback: paintBackground
            }
        );

        beerChart = chart.date_graph;
        beerChart.setVisibility(5, 0);  // turn off state

        var controls = document.getElementById('beer-chart-controls');
        if (controls) {
            controls.style.visibility="visible";
        }
    }
    )
}

function change(el) {
    beerChart.setVisibility(el.id, el.checked);
}