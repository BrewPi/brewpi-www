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

/* jshint jquery:true */
/* global alert, console, controlSettings, tempFormat, beername, Dygraph, google, CanvasRenderingContext2D */

var currBeerChart;
var prevBeerChart;

var colorIdle = "white";
var colorCool = "rgba(0, 0, 255, 0.4)";
var colorHeat = "rgba(255, 0, 0, 0.4)";
var colorWaitingHeat = "rgba(255, 0, 0, 0.2)";
var colorWaitingCool = "rgba(0, 0, 255, 0.2)";
var colorHeatingMinTime = "rgba(255, 0, 0, 0.6)";
var colorCoolingMinTime = "rgba(0, 0, 255, 0.6)";
var colorWaitingPeakDetect = "rgba(0, 0, 0, 0.2)";

var lineNames = {
    beerTemp: 'Beer temperature',
    beerSet: 'Beer setting',
    fridgeTemp: 'Fridge temperature',
    fridgeSet: 'Fridge setting',
    roomTemp: 'Room temp.'};

var TIME_COLUMN = 0;        // time is the first column of data
var STATE_COLUMN = 6;       // state is currently the 6th column of data.
var STATE_LINE_WIDTH = 15;

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
    { name: "WAITING_TO_COOL", color:colorWaitingCool, waiting:true  },
    { name: "WAITING_TO_HEAT", color:colorWaitingHeat, waiting:true  },
    { name: "WAITING_FOR_PEAK_DETECT", color:colorWaitingPeakDetect, waiting:true },
    { name: "COOLING_MIN_TIME", color:colorCoolingMinTime, extending:true },
    { name: "HEATING_MIN_TIME", color:colorHeatingMinTime, extending:true }
];


CanvasRenderingContext2D.prototype.dashedLine = function(x1, y1, x2, y2, dashLen) {
    "use strict";
    if (dashLen === undefined){
        dashLen = 2;
    }

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
        this[q % 2 === 0 ? 'moveTo' : 'lineTo'](x1, y1);
    }
    this[q % 2 === 0 ? 'moveTo' : 'lineTo'](x2, y2);

    this.stroke();
    this.closePath();
};

/**
 * Fetches the state for the given data row.
 * @param row   The data row to fetch the state for.
 * @param g {Dygraph}
 * @returns int, The state, if defined for that time.
 */
function getState(g, row) {
    "use strict";
    return (row>= g.numRows()) ? 0 : g.getValue(row, STATE_COLUMN);
}
function getTime(g, row) {
    "use strict";
    if (row>= g.numRows()){
        row = g.numRows()-1;
    }
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
    "use strict";
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
    "use strict";
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
    "use strict";
    canvas.save();
    try {
        paintBackgroundImpl(canvas, area, g);
    }
    finally {
        canvas.restore();
    }

}

function paintBackgroundImpl(canvas, area, g) {
    "use strict";
    // find the time series range corresponding to what is visible
    var timeRange = [g.toDataXCoord(area.x), g.toDataXCoord(area.x + area.w)];
    var timeStart = timeRange[0];     // millis since epoch
    var timeEnd = timeRange[1];

    // the data rows for the range we are interested in. 0-based index. This is deliberately extended out one row
    // to be sure the range is included
    var rowStart = Math.max(findDataRow(g, timeStart)-1,0);
    var rowEnd = findDataRow(g, timeEnd)+1;
    if (rowStart === null || rowEnd === null){
        return;
    }
    var blocks = findStateBlocks(g, rowStart, rowEnd);    // rowEnd is exclusive

    var startX = 0;                     // start drawing from 0 - the far left
    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        var row = block.row;              // where this state run ends
        var t = getTime(g, row);          // convert to time. Using time ensures the display matches the plotted resolution
                                          // of the graph.
        var r = (t - timeStart) / (timeEnd - timeStart);   // as a fraction of the entire display
        var endX = Math.floor(area.x + (area.w * r));

        var state = STATES[parseInt(block.state, 10)];
        if (state === undefined){
            state = STATES[0];
        }
        //var borderColor = (state.waiting || state.extending) ? setAlphaFactor(state.color, 0.5) : undefined;
        //var bgColor = (state.waiting) ? bgColor = colorIdle : state.color;
        canvas.fillStyle = state.color;
        canvas.fillRect(startX, area.h-STATE_LINE_WIDTH, endX-startX, area.h);
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

function showChartLegend(x, pts) {
    "use strict";
    var html = createLegendItem("Time", profileTable.formatDate(x).display);
    for (var i = 0; i < pts.length; i++) {
        html += createLegendItem(p.name, p.yval);
    }
    $("#curr-beer-chart-legend").html(html).show();
}
function hideChartLegend() {
    "use strict";
    $("#curr-beer-chart-legend").hide();
}
function createLegendItem(name, val) {
    var html = '<div class="beer-chart-legend-row"><div class="beer-chart-legend-label">' + name + '</div>';
    html += '<div class="beer-chart-legend-value">' + val + '</div></div>';
    return html;
}
/* Give name of the beer to display and div to draw the graph in */
function drawBeerChart(beerToDraw, div){
    "use strict";
    if(beerToDraw === "None"){
        $("#"+div).html("<span class='chart-error'>BrewPi is currently not logging data. Start a new brew to resume logging.<br>" +
            "You can find your previous beers under Maintenance Panel -> Previous Beers</span>");
        return;
    }

	$.post("get_beer_files.php", {"beername": beerToDraw}, function(answer) {
		var combinedJson = {};
		var first = true;
        var files = [];
		try{
            files = $.parseJSON(answer);
        }
        catch (e){
            $("#"+div).html("<span class='chart-error'>Could not receive files for beer." +
                "If you just started this brew, refresh the page after a few minutes. " +
                "A chart will appear after the first data point is logged.</span>");
            return;
        }

        if(typeof files === 'undefined' || files === []){
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
            var parsedJsonData;
            try{
                parsedJsonData = $.parseJSON(jsonData);
            }
            catch (e){
                alert("error in JSON of file '" + fileLocation + "'. Skipping file.");
                continue;
            }
			if(first){
				combinedJson = parsedJsonData;
				first = false;
			}
			else{
				combinedJson.rows  = combinedJson.rows.concat(parsedJsonData.rows);
			}
		}
		var beerData = new google.visualization.DataTable(combinedJson);

        var tempFormat = function(y) {
            return parseFloat(y).toFixed(2) + "\u00B0 " + window.tempFormat;
        };

        var chart = new Dygraph.GVizChart(document.getElementById(div));
        chart.draw(
                beerData, {
                colors: [ 'rgb(41,170,41)', 'rgb(240, 100, 100)', 'rgb(89, 184, 255)',  'rgb(255, 161, 76)', '#AAAAAA', 'rgb(153,0,153)' ],
                axisLabelFontSize:12,
                animatedZooms: true,
                gridLineColor:'#ccc',
                gridLineWidth:'0.1px',
                labelsDiv: document.getElementById(div+"-label"),
                displayAnnotations:true,
                displayAnnotationsFilter:true,
                //showRangeSelector: true,
                strokeWidth: 1,

                "Beer setting" : {
//                        strokePattern: [ 5, 5 ],
//                  strokeWidth: 1
                },
                "Fridge setting" : {
//                        strokePattern: [ 5, 5 ],
//                  strokeWidth: 1
                },
                "Beer temperature" : {
//                        strokePattern: [ 5, 5 ],
//                  strokeWidth: 2
                },
                "Room temp" : {
//                  strokeWidth: 1
                },
                axes: {
                    y : { valueFormatter: tempFormat }
                },
                highlightCircleSize: 2,
                highlightSeriesOpts: {
                    strokeWidth: 1.5,
                    strokeBorderWidth: 1,
                    highlightCircleSize: 5
                },
                highlightCallback: function(e, x, pts, row) {
                    showChartLegend(x,pts);
                },
                unhighlightCallback: function(e) {
                    hideChartLegend();
                },
                underlayCallback: paintBackground
            }
        );

        var beerChart = chart.date_graph;
        beerChart.setVisibility(beerChart.indexFromSetName('State')-1, 0);  // turn off state line
        var $chartContainer = $('#'+ div).parent();
        $chartContainer.find('.beer-chart-controls').show();

        if(div.localeCompare('curr-beer-chart') === 0){
            currBeerChart = beerChart;
        }
        else if(div.localeCompare('prev-beer-chart') === 0){
            prevBeerChart = beerChart;
        }

        // hide buttons for lines that are not in the chart
        for (var key in lineNames){
            if(lineNames.hasOwnProperty(key)){
                var $button = $chartContainer.find('button.toggle.'+ key);
                var series = beerChart.getPropertiesForSeries(lineNames[key]);
                if(series === null){
                    $button.css('display', 'none');
                }
                else{
                    var numRows = beerChart.numRows();
                    if(isDataEmpty(beerChart, series.column, 0, numRows-1)){
                        $button.css('display', 'none');
                    }
                    updateVisibility(key, $button);
                }
                if($(div + " .toggleAnnotations ").hasClass("inactive")){
                    $(beerChart).find('.dygraphDefaultAnnotation').css('visibility', 'hidden');
                }
            }
        }
    });
}

function isDataEmpty(chart, column, rowStart, rowEnd){
    "use strict";
    // start with last element, because when a sensor is just connected it should show up
    for (var row = rowEnd; row > rowStart; row--){
        if(chart.getValue(row, column) !== null){
            return false;
        }
    }
    return true;
}

function toggleLine(el) {
    "use strict";
    var $el = $(el);
    $el.toggleClass('inactive');
    // get line name from classes
    var classString = $el.attr('class');
    var classList = classString.split(/\s+/);
    for (var i in classList){
        if (classList[i] in lineNames){
            break;
        }
    }
    updateVisibility(classList[i], $el);
}

function updateVisibility(lineName, $button){
    "use strict";
    var $chart = $button.closest('.chart-container').find('.beer-chart');
    var chartId = $chart.attr('id');
    var chart;
    if(chartId.localeCompare('curr-beer-chart')===0){
        chart = currBeerChart;
    }
    else  if(chartId.localeCompare('prev-beer-chart')===0){
        chart = prevBeerChart;
    }
    else{
        console.log("cannot find chart with id " + chartId);
        return;
    }
    if($button.hasClass("inactive")){
        chart.setVisibility(chart.getPropertiesForSeries(lineNames[lineName]).column-1, false);
    }
    else{
        chart.setVisibility(chart.getPropertiesForSeries(lineNames[lineName]).column-1, true);
    }
}

function applyStateColors(){
    "use strict";
    $(".state-color.state-cooling").css('background-color',colorCool);
    $(".state-color.state-heating").css('background-color',colorHeat);
    $(".state-color.state-waiting-to-cool").css('background-color',colorWaitingCool);
    $(".state-color.state-waiting-to-heat").css('background-color',colorWaitingHeat);
    $(".state-color.state-heating-min-time").css('background-color', colorHeatingMinTime);
    $(".state-color.state-cooling-min-time").css('background-color', colorCoolingMinTime);
    $(".state-color.state-waiting-peak").css('background-color', colorWaitingPeakDetect);
    $(".state-color.state-idle").css('background-color', colorIdle);
}

$(document).ready(function(){
    "use strict";
    $("button#refresh-curr-beer-chart").button({	icons: {primary: "ui-icon-refresh" }, text: false }).click(function(){
        drawBeerChart(window.beerName, 'curr-beer-chart');
    });

    $('#chart-help-popup')
        .dialog({
            autoOpen: false,
            height: 600,
            width: 960
        });

    $("button.chart-help").button({	icons: {primary: "ui-icon-help" }, text: false }).click(function(){
        $("#chart-help-popup").dialog("open");
    });
    applyStateColors();
});

function toggleAnnotations(el){
    "use strict";
    var $el = $(el);
    $el.toggleClass('inactive');
    var $chart = $el.closest('.chart-container').find('.beer-chart');
    var chartId = $chart.attr('id');

    if($($el).hasClass('inactive')){
        $chart.find('.dygraphDefaultAnnotation').css('visibility', 'hidden');
    }
    else{
        $chart.find('.dygraphDefaultAnnotation').css('visibility', 'visible');
    }
}
