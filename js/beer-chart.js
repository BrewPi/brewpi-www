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
var legendStorageKeyPrefix = "legendLine_";

var TIME_COLUMN = 0;        // time is the first column of data
var STATE_COLUMN = 6;       // state is currently the 6th column of data.
var STATE_LINE_WIDTH = 15;

/**
 * The states of the temp controller algorithm, and their presentation attributes.
 * @type {Array}
 */
var STATES = [
    { name: "IDLE", color:colorIdle, text: "Idle" },
    { name: "STATE_OFF", color:colorIdle, text: "Off" },
    { name: "DOOR_OPEN", color:"#eee", text: "Door Open", doorOpen:true },
    { name: "HEATING", color:colorHeat, text: "Heating" },
    { name: "COOLING", color:colorCool, text: "Cooling" },
    { name: "WAITING_TO_COOL", color:colorWaitingCool, text: "Waiting to Cool", waiting:true  },
    { name: "WAITING_TO_HEAT", color:colorWaitingHeat, text: "Waiting to Heat", waiting:true  },
    { name: "WAITING_FOR_PEAK_DETECT", color:colorWaitingPeakDetect, text: "Waiting for Peak", waiting:true },
    { name: "COOLING_MIN_TIME", color:colorCoolingMinTime, text: "Cooling Min Time", extending:true },
    { name: "HEATING_MIN_TIME", color:colorHeatingMinTime, text: "Heating Min Time", extending:true }
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

/**
 * Converts string from json "Date(2013,10,2,20,36,25)" files to Date object
 * @param datestring  the data in json format
 * @returns timestamp
 */
function stringToDate(dateString){
    var arguments = dateString.substring(5,dateString.length-1).split(",");
    return new Date(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
}

/**
 * Converts json data to Dychart array format
 * @param jsonData  the data in json format
 * @returns {"values": array, "labels": array}   The same data, but in Dygraph array format
 */
function toDygraphArray(jsonData) {
    "use strict";
    var i, j, cols = jsonData.cols, rows = jsonData.rows, dataArray = [], labelsArray = [], annotationsArray = [], row,
        date, handlers = [],
        numberHandler = function (index, val) {
            if (val) { row.push(parseFloat(val.v)); } else { row.push(null); }
        },
        datetimeHandler = function (index, val) { date = stringToDate(val.v); row.push(date); },
        annotationHandler = function (index, val) {
            if (!val) {
                return;
            }
            annotationsArray.push({
                series: labelsArray[index * 2 / 3],
                x: date.getTime(),
                shortText: String.fromCharCode(65 + annotationsArray.length % 26),
                text: val.v,
                attachAtBottom: true
            });
        };

    // set up handlers for each variable based on cols, use id as Dygraph label
    for (i = 0; i < cols.length; i++){
        if (cols[i].type === "number") {
            handlers.push(numberHandler);
            // use id as label, but with lowercase first letter
            labelsArray.push(cols[i].id.substr(0, 1).toLowerCase() + cols[i].id.substr(1));
        } else if (cols[i].type === 'datetime') {
            handlers.push(datetimeHandler);
            labelsArray.push(cols[i].label);
        } else if (cols[i].type === 'string') {
            handlers.push(annotationHandler);
        }
    }

    for (i = 0; i < rows.length; i++){
        row = [];
        for (j = 0; j < rows[i].c.length; j++) {
            handlers[j](j, rows[i].c[j]);
        }
        dataArray.push(row);
    }
    return {"values": dataArray, "labels": labelsArray, "annotations": annotationsArray};
}

function getTime(g, row) {
    "use strict";
    if (row >= g.numRows()) {
        row = g.numRows() - 1;
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

var currentDataSet = null;
function paintBackground(canvas, area, g) {
    "use strict";
    currentDataSet = g;
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

var chartColors = [ 'rgb(41,170,41)', 'rgb(240, 100, 100)', 'rgb(89, 184, 255)',  'rgb(255, 161, 76)', '#AAAAAA', 'rgb(153,0,153)' ];
function formatForChartLegend(v) {
    "use strict";
    var val = parseFloat(v);
    if ( !isNaN(val) ) {
        return val.toFixed(2) + "\u00B0" + window.tempFormat;
    }
    return "--";
}
function showChartLegend(e, x, pts, row, g) {
    "use strict";
    var time = profileTable.formatDate(new Date(x)).display;
    $('#curr-beer-chart-legend .beer-chart-legend-time').text(time);
    $('#curr-beer-chart-legend .beer-chart-legend-row.beerTemp .beer-chart-legend-value').text( formatForChartLegend(currentDataSet.getValue(row, 1)) );
    $('#curr-beer-chart-legend .beer-chart-legend-row.beerSet .beer-chart-legend-value').text( formatForChartLegend(currentDataSet.getValue(row, 2)) );
    $('#curr-beer-chart-legend .beer-chart-legend-row.fridgeTemp .beer-chart-legend-value').text( formatForChartLegend(currentDataSet.getValue(row, 3)) );
    $('#curr-beer-chart-legend .beer-chart-legend-row.fridgeSet .beer-chart-legend-value').text( formatForChartLegend(currentDataSet.getValue(row, 4)) );
    $('#curr-beer-chart-legend .beer-chart-legend-row.roomTemp .beer-chart-legend-value').text( formatForChartLegend(currentDataSet.getValue(row, 5)) );
    var state = parseInt(currentDataSet.getValue(row, STATE_COLUMN));
    if ( !isNaN(state) ) {
        $('#curr-beer-chart-legend .beer-chart-legend-row.state .beer-chart-legend-label').text(STATES[state].text);
        $('#curr-beer-chart-legend .beer-chart-legend-row.state .state-indicator').css( 'background-color', STATES[state].color );
    }
}
function hideChartLegend() {
    "use strict";
    $('#curr-beer-chart-legend .beer-chart-legend-row').each(function() {
        $(this).find('.beer-chart-legend-value').text('--');
    });
    $('#curr-beer-chart-legend .beer-chart-legend-time').text('Date/Time');
    $('#curr-beer-chart-legend .beer-chart-legend-row.state .beer-chart-legend-label').text('State');
    $('#curr-beer-chart-legend .beer-chart-legend-row.state .state-indicator').css( 'background-color', '' );
}
function findLineByName(name) {
    "use strict";
    for (var key in lineNames) {
        if(lineNames.hasOwnProperty(key)){
            if ( lineNames[key] === name ){
                return key;
            }
        }
    }
    return null;
}
/* Give name of the beer to display and div to draw the graph in */
function drawBeerChart(beerToDraw, div){
    "use strict";
    var $chartDiv = $("#"+div);
    $chartDiv.empty();
    if(beerToDraw === "None"){
       var $errorMessage = $("<span class='chart-error-text'>" +
                             "BrewPi is currently not logging data. Start a new brew to resume logging.<br>" +
                             "You can find your previous beers under Maintenance Panel -> Previous Beers</span>");
       $chartDiv.addClass("chart-error");
       $chartDiv.append($errorMessage);
        return;
    }

    $.post("get_beer_data.php", {"beername": beerToDraw}, function(answer) {
        var combinedJson = {};
		try{
            combinedJson = $.parseJSON(answer);
        } catch (e) {
            var $errorMessage = $("<span class='chart-error-text'>Could not parse data for this brew.<br>" +
                "If you just started this brew, click the refresh button after a few minutes.<br> " +
                "A chart will appear after the first data point is logged.</span>");
            var $refreshButton = $("<button class='chart-error-refresh'>Refresh</button>");
            $refreshButton.button({icons: {primary: "ui-icon-refresh" }}).click(function(){
                drawBeerChart(beerToDraw, div);
            });
            $chartDiv.addClass("chart-error");
            $chartDiv.append($errorMessage);
            $chartDiv.append($refreshButton);

            return;
        }
        var beerData = toDygraphArray(combinedJson);

        var tempFormat = function(y) {
            return parseFloat(y).toFixed(2) + "\u00B0 " + window.tempFormat;
        };
        var beerChart = new Dygraph(document.getElementById(div),
                beerData.values, {
                labels: beerData.labels,
                colors: chartColors,
                axisLabelFontSize:12,
                animatedZooms: true,
                gridLineColor:'#ccc',
                gridLineWidth:'0.1px',
                labelsDiv: document.getElementById(div+"-label"),
                displayAnnotations:true,
                displayAnnotationsFilter:true,
                //showRangeSelector: true,
                strokeWidth: 1,
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
                    showChartLegend(e, x, pts, row, beerChart);
                },
                unhighlightCallback: function(e) {
                    hideChartLegend();
                },
                underlayCallback: paintBackground,
                drawCallback: function(beerChart, is_initial) {
                    if (is_initial) {
                        if (beerData.annotations.length > 0) {
                            beerChart.setAnnotations(beerData.annotations);
                        }
                    }
                }
            }
        );
        beerChart.setVisibility(beerChart.indexFromSetName('state')-1, 0);  // turn off state line
        var $chartContainer = $chartDiv.parent();
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
                var $row = $chartContainer.find('.beer-chart-legend-row.' + key);
                var series = beerChart.getPropertiesForSeries(key);
                if(series === null){
                    $row.hide();
                } else {
                    var numRows = beerChart.numRows();
                    if(isDataEmpty(beerChart, series.column, 0, numRows-1)){
                        $row.hide();
                    }
                    else{
                        $row.show();
                    }
                    if ( localStorage.getItem( legendStorageKeyPrefix + key ) === "false" ) {
                        $row.find('.toggle').addClass("inactive");
                    }
                    updateVisibility(key, $row.find('.toggle'));
                }
                if($(div + " .toggleAnnotations ").hasClass("inactive")){
                    $(beerChart).find('.dygraphDefaultAnnotation').css('visibility', 'hidden');
                }
            }
        }
        var idx = 0;
        $('#curr-beer-chart-legend .beer-chart-legend-row').each(function() {
            if ( ! $(this).hasClass("time") && ! $(this).is(":hidden") ) {
                $(this).addClass( (idx % 2 === 1) ? 'alt' : '' );
                idx++;
            }
        });
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
    if ( $el.hasClass('beer-chart-legend-label') ) {
        $el = $el.prev();
    }
    $el.toggleClass('inactive');
    // get line name from classes
    var classString = $el.attr('class');
    var classList = classString.split(/\s+/);
    for (var i in classList){
        if(classList.hasOwnProperty(i)){
            if (classList[i] in lineNames){
                break;
            }
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
        chart.setVisibility(chart.getPropertiesForSeries(lineName).column-1, false);
        localStorage.setItem( legendStorageKeyPrefix + lineName, "false" );
    } else {
        chart.setVisibility(chart.getPropertiesForSeries(lineName).column-1, true);
        localStorage.setItem( legendStorageKeyPrefix + lineName, "true" );
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
    $("button.refresh-curr-beer-chart").button({	icons: {primary: "ui-icon-refresh" }, text: false }).click(function(){
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
    if ( $el.hasClass('beer-chart-legend-label') ) {
        $el = $el.prev();
    }
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
