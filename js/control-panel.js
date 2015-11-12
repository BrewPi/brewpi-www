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

 /* global Dygraph, BeerProfileTable, receiveControlSettings, window.googleDocsKey, controlSettings, controlVariables, console */

var beerTemp = defaultTemp();
var fridgeTemp = defaultTemp();

function statusMessage(messageType, messageText){
    "use strict";
    var $statusMessage = $("#status-message");
    var $statusMessageIcon = $statusMessage.find("p span#icon");
    $statusMessage.removeClass("ui-state-error ui-state-default ui-state-highlight");
    $statusMessageIcon.removeClass("ui-icon-error ui-icon-check ui-icon-info");
    switch(messageType){
        case "normal":
            $statusMessageIcon.addClass("ui-icon-check");
            $statusMessage.addClass("ui-state-default");
            break;
        case "error":
            $statusMessageIcon.addClass("ui-icon-error");
            $statusMessage.addClass("ui-state-error");
            break;
        case "highlight":
            $statusMessageIcon.addClass("ui-icon-info");
            $statusMessage.addClass("ui-state-highlight");
            break;
    }
    $statusMessage.find("p span#message").text(messageText);
}

function loadControlPanel(){
    "use strict";
    if ( window.profileName !== '' ) {
        loadProfile(window.profileName, renderProfile);
    }
    receiveControlSettings(function(){
        if(window.controlSettings === {}){
            return;
        }
        var $controlPanel = $('#control-panel');
        switch(window.controlSettings.mode){
            case 'p':
                $controlPanel.tabs( "option", "active", 0);
                statusMessage("normal","Running beer profile: " + decodeURIComponent(window.controlSettings.profile));
                break;
            case 'b':
                $controlPanel.tabs( "option", "active", 1);
                statusMessage("normal","Running in beer constant mode");
                break;
            case 'f':
                $controlPanel.tabs( "option", "active", 2);
                statusMessage("normal","Running in fridge constant mode");
                break;
            case 'o':
                $controlPanel.tabs( "option", "active", 3);
                statusMessage("normal","Temperature control disabled");
                break;
            case 't':
                $controlPanel.tabs( "option", "active", 3);
                statusMessage("normal","Testing mode");
                break;
            default:
                statusMessage("error","Invalid mode ("+window.controlSettings.mode+") received");
        }
        window.beerTemp = parseFloat(window.controlSettings.beerSet);
        window.fridgeTemp = parseFloat(window.controlSettings.fridgeSet);
		// beer and fridge temp can be null/undefined when not active (off mode), which makes parseFloat return NaN
		if(isNaN(window.beerTemp)){
			window.beerTemp = defaultTemp();
		}
		if(isNaN(window.fridgeTemp)){
			window.fridgeTemp = defaultTemp();
		}
		$("#beer-temp").find("input.temperature").val(window.beerTemp.toFixed(1));
		$("#fridge-temp").find("input.temperature").val(window.fridgeTemp.toFixed(1));
	});
}

function defaultTemp(){
    "use strict";
    if(typeof(window.tempFormat) === 'F'){
        return 68.0;
    }
    else{
        return 20.0;
    }
}

function tempUp(temp){
	"use strict";
    if(isNaN(temp)){
        return defaultTemp();
    }
	temp += 0.1;
	if(temp > window.controlConstants.tempSetMax){
		temp = window.controlConstants.tempSetMin;
	}
	return temp;
}

function tempDown(temp){
	"use strict";
    if(isNaN(temp)){
        return defaultTemp();
    }
	temp -= 0.1;
	if(temp < window.controlConstants.tempSetMin){
		temp = window.controlConstants.tempSetMax;
	}
	return temp;
}

function applySettings(){
	"use strict";
	//Check which tab is open
    var activeTab = $("#control-panel").tabs("option", "active");
    switch(activeTab){
        case 0: // profile
        $.post('socketmessage.php', {messageType: "setActiveProfile", message: window.profileName}, function(answer){
            if(answer !==''){
                statusMessage("highlight", answer);
            }
        });
        break;
        case 1: // beer constant
        var $beerTemp = $("#beer-temp").find("input.temperature");
        $.post('socketmessage.php', {messageType: "setBeer", message: $beerTemp.val()}, function(){});
        statusMessage("highlight","Mode set to beer constant");
        break;
        case 2: // fridge constant
        var $fridgeTemp = $("#fridge-temp").find("input.temperature");
        $.post('socketmessage.php', {messageType: "setFridge", message: $fridgeTemp.val()}, function(){});
        statusMessage("highlight","Mode set to fridge constant");
        break;
        case 3: // off
        $.post('socketmessage.php', {messageType: "setOff", message: ""}, function(){});
        statusMessage("highlight","Temperature control disabled");
        break;
    }
    setTimeout(loadControlPanel,5000);
}

var profileTable;
var profileEdit;
var profileSelect;

function renderProfile(beerProfile) {
    "use strict";
    window.profileName = beerProfile.name;
    profileTable.render(beerProfile);
    $("#profileTableName").text(decodeURIComponent(window.profileName));
    $("button#edit-controls").show();
    $("button#saveas-controls").show();
    drawProfileChart("profileChartDiv", profileTable );
}

function drawSelectPreviewChart(beerProfile) {
    "use strict";

    // display temporary loading message
    $("#profileSelectChartDiv").html("<span class='chart-loading chart-placeholder'>Loading profile...</span>");

    // render profile in the hidden div and plot
    loadProfile(beerProfile, function(profileData){
        profileSelect.render(profileData);
        drawProfileChart("profileSelectChartDiv", profileSelect );
    });

    // display error if loading failed: span will still exist
    $("#profileSelectChartDiv span.chart-loading").text("Error Loading profile!");
}

function drawEditPreviewChart() {
    "use strict";

    // display temporary loading message
    $("#profileEditChartDiv").html("<span class='chart-loading chart-placeholder'>Redrawing profile...</span>");

    drawProfileChart("profileEditChartDiv", profileEdit );

    // display error if loading failed: span will still exist
    $("#profileEditChartDiv span.chart-loading").text("Error drawing profile chart!");
}

// lets hack a little shall we ?
Dygraph.EVERY2DAYS = -1;
Dygraph.EVERY3DAYS = -2;
Dygraph.EVERY4DAYS = -3;
var _1DAY = 1000 * 86400;
Dygraph.SHORT_SPACINGS[Dygraph.EVERY2DAYS]    = 2 * _1DAY;
Dygraph.SHORT_SPACINGS[Dygraph.EVERY3DAYS]    = 3 * _1DAY;
Dygraph.SHORT_SPACINGS[Dygraph.EVERY4DAYS]    = 4 * _1DAY;

function drawProfileChart(divId, profileObj) {
    "use strict";

    var temperatureFormatter = function(y) {
        return parseFloat(y).toFixed(2) + "\u00B0 " + window.tempFormat;
    };
    var dateTimeFormatter = function (x) {
        return profileTable.formatDate(x).display;
    };

    var calculateXAxisTicks = function(duration) {
        if (duration > 20) {
            return Dygraph.EVERY4DAYS;
        } else if (duration > 13) {
            return Dygraph.EVERY3DAYS;
        } else if (duration > 7) {
            return Dygraph.EVERY2DAYS;
        } else {
            return Dygraph.DAILY;
        }
    };

    var updateCurrentDateLine = function(canvas, area, g) {
        if(g.numRows() < 1){
            return; // when the chart has no data points, return.
        }

        canvas.fillStyle = "rgba(255, 100, 100, 1.0)";

        var nowTime = new Date().getTime();
        var startTime = g.getValue(0,0);
        var endTime = g.getValue(g.numRows()-1,0);

        if(nowTime < startTime){
            // all profile dates in the future, show in bottom left corner
            canvas.textAlign = "start";
            canvas.font = "14px Arial";
            canvas.fillText("<< Current time", area.x + 10, area.h - 10);
        }
        else if(nowTime > endTime){
            // all profile dates in the future, show in bottom right corner
            canvas.textAlign = "end";
            canvas.font = "14px Arial";
            canvas.fillText("Current time >>", area.x + area.w - 10, area.h - 10);
        }
        else{
            // draw line at current time
            var xCoordinate = g.toDomXCoord(nowTime);
            canvas.fillRect(xCoordinate, area.y+17, 1, area.h-17);

            // display interpolated temperature
            for( var i=0; i< g.numRows(); i++ ) {
                if (g.getValue(i,0) > nowTime) {
                    break; // found surrounding temperature points
                }
            }
            var previousTemperature = parseFloat(g.getValue(i-1,1));
            var nextTemperature = parseFloat(g.getValue(i,1));
            var previousTime = g.getValue(i-1,0);
            var nextTime = g.getValue(i,0);
            var temperature = (previousTemperature + (nextTemperature - previousTemperature)*(nowTime-previousTime)/(nextTime-previousTime)).toFixed(2);
            var yCoordinate = g.toDomYCoord(temperature);
            // Now add the interpolated temp to the cart, left or right of the line depending on which half
            canvas.font = "20px Arial";
            if(xCoordinate < 0.5 * area.w){
                canvas.textAlign = "start";
                if(nextTemperature >= parseFloat(temperature)){
                    yCoordinate += 20; // lower so it won't overlap with the chart
                }
                canvas.fillText(temperature, xCoordinate + 5, yCoordinate);
            }
            else{
                if(previousTemperature >= parseFloat(temperature)){
                    yCoordinate += 20; // lower so it won't overlap with the chart
                }
                canvas.textAlign = "end";
                canvas.fillText(temperature, xCoordinate - 5, yCoordinate);
            }
        }
    };

    var chartConfig = {
        colors: [ 'rgb(89, 184, 255)' ],
        axisLabelFontSize:12,
        gridLineColor:'#ccc',
        gridLineWidth:'0.1px',
        labelsDiv: document.getElementById(divId + "-label"),
        legend: 'always',
        labelsDivStyles: { 'textAlign': 'right' },
        strokeWidth: 1,
        xValueParser: function(x) { return profileTable.parseDate(x); },
        underlayCallback: updateCurrentDateLine,
        "Temperature" : {},
        axes: {
            y : { valueFormatter: temperatureFormatter },
            x : { valueFormatter: dateTimeFormatter }
        },
        highlightCircleSize: 2,
        highlightSeriesOpts: {
            strokeWidth: 1.5,
            strokeBorderWidth: 1,
            highlightCircleSize: 5
        },
        yAxisLabelWidth: 35
    };
    var profileDuration = profileObj.getProfileDuration();
    if ( profileDuration < 28 && profileDuration > 0) {
        chartConfig.axes.x.ticker = function(a, b, pixels, opts, dygraph, vals) {
            return Dygraph.getDateAxis(a, b, calculateXAxisTicks(profileDuration), opts, dygraph);
        };
    }

    var chart = new Dygraph(
        document.getElementById(divId),
        profileObj.toCSV(true, ['date', 'temperature']),
        chartConfig
    );
}

function loadProfile(profile, onProfileLoaded) {
    "use strict";
    $.post("get_beer_profile.php", { "name": profile }, function(beerProfile) {
        try {
            if ( typeof( onProfileLoaded ) !== "undefined" ) {
                onProfileLoaded(beerProfile);
            }
        } catch (e) {
            console.log('Error loading profile: ' + e.toString());
        }
    }, 'json');
}

function showProfileSelectDialog() {
    "use strict";
    var selectedProfile;
    $('#profileSelect').selectable({
        stop: function(event, ui) {
            $(".ui-selected:first", this).each(function() {
                $(this).siblings().removeClass("ui-selected");
                selectedProfile = $(this).data('profileName');
                drawSelectPreviewChart(selectedProfile);
            });
        }
    });
    $.post("get_beer_profiles.php", {}, function(beerProfiles) {
        try {
            $('#profileSelect').empty();
            for( var i=0; i<beerProfiles.profiles.length; i++) {
                var $li = $("<li></li>")
                    .addClass("ui-widget-content")
                    .data('profileName', beerProfiles.profiles[i])
                    .text(decodeURIComponent(beerProfiles.profiles[i]));
                $('#profileSelect').append($li);
            }
        } catch (e) {
            console.log('Can not load temperature profiles');
        }
    }, 'json');
    $("#profileSelectDiv").dialog( {
        modal: true,
        title: "Select Temperature Profile",
        buttons: [
            {
                text: "OK",
                click: function() {
                    if ( typeof( selectedProfile ) !== "undefined" ) {
                        loadProfile(selectedProfile, renderProfile);
                    }
                    $( this ).dialog( "close" );
                }
            },{
                text: "Cancel",
                click: function() { $( this ).dialog( "close" ); }
            }
        ],
        width: 960
    });
}
function promptToApplyProfile(profName) {
    "use strict";
    $("<div>You are editing the current profile: " + decodeURIComponent(profName) + ".  Would you like to apply it now?</div>").dialog( {
        modal: true,
        title: "Apply Profile: " + decodeURIComponent(profName) + "?",
        buttons: [
            {
                text: "Apply",
                click: function() {
                    applySettings();
                    $( this ).dialog( "close" );
                }
            },{
                text: "Cancel",
                click: function() {
                    $( this ).dialog( "close" );
                }
            }
        ]
    });
}
function showProfileEditDialog(editableName, dialogTitle, isSaveAs) {
    "use strict";
    $('#profileSaveError').hide();
    var profileNames = [];
    $.post("get_beer_profiles.php", {}, function(resp) {
        profileNames = resp.profiles;
    }, 'json');
    function callSaveProfile(jqDialog, profName, profData) {
        $.ajax( {
            type: "post",
            url: "save_beer_profile.php",
            dataType: "json",
            data: { name: profName, profile: profData },
            success: function(response) {
                if ( response.status !== 'error' ) {
                    loadProfile(profName, renderProfile);
                    $('#profileSaveError').hide();
                    $("#profileEditName").removeAttr('disabled');
                    jqDialog.dialog( "close" );
                    if ( window.controlSettings.mode === "p" && window.controlSettings.profile === profName ) {
                        promptToApplyProfile(profName);
                    }
                } else {
                    console.log("profile save error: " + decodeURIComponent(response.message));
                    $('#profileSaveError').show();
                }
            },
            error: function(xhr, ajaxOptions, thrownError) {
                console.log("profile save HTTP error - request status: " + xhr.status + " - error: " + thrownError);
                $('#profileSaveError').show();
            }
        });
    }
    $("#profileEditDiv").dialog( {
        modal: true,
        title: dialogTitle,
        open: function(event, ui) {
            if ( !editableName ) {
                $("#profileEditName").attr('disabled',true);
            }
            if (isSaveAs) {
                $("#profileEditName").focus();
            } else {
                $('#profileEditDiv table tr').last().find('td').first().focus();
            }
        },
        buttons: [
            {
                text: "Save",
                click: function() {

                    function isNameTaken(name) {
                        for( var i=0; i<profileNames.length; i++ ) {
                            if ( name === profileNames[i] ) {
                                return true;
                            }
                        }
                        return false;
                    }

                    if ( profileEdit.hasInvalidDayCells() ) {
                        profileEdit.markInvalidCells();
                        return;
                    } else {
                        profileEdit.resetInvalidCells();
                    }

                    var profName = encodeURIComponent($('#profileEditName').val());
                    if ( typeof( profName ) !== "undefined" && profName !== '' ) {

                        $('#profileEditNameLabel').removeClass('error');
                        var jqDialog = $( this );
                        if ( editableName && isNameTaken(profName) ) {
                            $("<div>Are you sure you want to overwrite the profile: " + decodeURIComponent(profName) + "?</div>").dialog({
                                resizable: false,
                                height: 140,
                                modal: true,
                                buttons: {
                                    Ok: function () {
                                        callSaveProfile(jqDialog, profName, profileEdit.toCSV(true));
                                        $(this).dialog("close");
                                    },
                                    Cancel: function () {
                                        $('#profileEditName').focus();
                                        $(this).dialog("close");
                                    }
                                }
                            });
                        } else {
                            callSaveProfile(jqDialog, profName, profileEdit.toCSV(true));
                        }

                    } else {
                        $('#profileEditNameLabel').addClass('error');
                        $('#profileEditName').focus();
                    }
                }
            },{
                text: "Cancel",
                click: function() {
                    $("#profileEditName").removeAttr('disabled');
                    $( this ).dialog( "close" );
                }
            }
        ],
        width: 960
    });
    drawEditPreviewChart();
}

function showProfileHelpDialog() {
    "use strict";
    $("#profileHelpDiv").dialog( {
        modal: true,
        title: "Beer Temperature Profile Help",
        width: 960
    });
}

// profile table context menu global click handlers
function profTableContextMenuHandler(shown) {
    "use strict";
    if (shown) {
        $('html').bind('click', profTableGlobalClickHandler );
    } else {
        $('html').unbind('click', profTableGlobalClickHandler );
    }
}
function profTableGlobalClickHandler() {
    "use strict";
    profileEdit.closeContextMenu();
}

$(document).ready(function(){
	"use strict";
	//Control Panel
    profileEdit = new BeerProfileTable('profileEditControls', {
        tableClass: "profileTableEdit ui-widget", theadClass: "ui-widget-header", tbodyClass: "ui-widget-content",
        editable: true, startDateFieldSelector: '#profileEditStartDate',
        dateFormat: window.dateTimeFormat, dateFormatDisplay: window.dateTimeFormatDisplay,
        contextMenuCssClass: 'profileTableMenu', contextMenuDisplayHandler: profTableContextMenuHandler,
        chartUpdateCallBack: drawEditPreviewChart
    });
    profileTable = new BeerProfileTable('profileTableDiv', {
        tableClass: "profileTableEdit ui-widget", theadClass: "ui-widget-header", tbodyClass: "ui-widget-content",
        editable: false, startDateFieldSelector: '#profileTableStartDate',
        dateFormat: window.dateTimeFormat, dateFormatDisplay: window.dateTimeFormatDisplay
    });
    profileSelect = new BeerProfileTable('profileSelectTableDiv', {
        editable: false,
        dateFormat: window.dateTimeFormat, dateFormatDisplay: window.dateTimeFormatDisplay
    });

	$("button#refresh-controls").button({icons: {primary: "ui-icon-arrowrefresh-1-e"} }).click(function(){
        if ( window.profileName !== '' ) {
            loadProfile(window.profileName, renderProfile);
        }
	});

    $("button#load-controls").button({  icons: {primary: "ui-icon-folder-open" } }).click(function() {
        showProfileSelectDialog();
    });

    $("button#new-controls").button({  icons: {primary: "ui-icon-plus" } }).click(function() {
        $("#profileEditName").val('');
        $("#profileEditStartDate").val('');
        profileEdit.render( { name: '', profile: [] } );
        showProfileEditDialog(true, "New Temperature Profile");
    });

    $("button#edit-controls").button({  icons: {primary: "ui-icon-wrench" } }).click(function() {
        $("#profileEditName").val(decodeURIComponent(profileTable.profileName));
        profileEdit.render( profileTable.toJSON() );
        showProfileEditDialog(false, "Edit Temperature Profile");
    }).hide();

    $("button#saveas-controls").button({  icons: {primary: "ui-icon-copy" } }).click(function() {
        $("#profileEditName").val("copy of " + decodeURIComponent(profileTable.profileName));
        profileEdit.render( profileTable.toJSON() );
        showProfileEditDialog(true, "Save Temperature Profile As", true);
    }).hide();

    $("button#help-profile").button({  icons: {primary: "ui-icon-help" } }).click(function() {
        showProfileHelpDialog();
    });

    $("#profileEditStartDate").datetimepicker({ dateFormat: window.dateTimeFormatDisplay, timeFormat: "HH:mm:ss", onSelect: function() {
        profileEdit.updateDisplay();
    }});

    $("button#profileEditAddCurrentButton").button().click(function() {
        profileEdit.insertRowNow();
    });

    $("button#profileEditNowButton").button().click(function() {
        $("#profileEditStartDate").datetimepicker('setDate', (new Date()) );
        profileEdit.updateDisplay();
    });

    $("button#apply-settings").button({ icons: {primary: "ui-icon-check"} }).click(function() {
        applySettings();
    });

	// set functions to validate and mask temperature input
	$("input.temperature").each( function(){
        $(this).blur(function(){
            // validate input when leaving field
            var temp = parseFloat($(this).val());
            if(temp < window.controlConstants.tempSetMin){
                temp = window.controlConstants.tempSetMin;
                $(this).val(temp);
            }
            if(temp > window.controlConstants.tempSetMax){
                temp = window.controlConstants.tempSetMax;
                $(this).val(temp);
            }
            if(isNaN(temp)){
                temp = defaultTemp();
            }
            $(this).val(temp.toFixed(1));
            if($(this).parent().attr('id').localeCompare("beer-temp") === 0){
                window.beerTemp=parseFloat(temp);
            }
            if($(this).parent().attr('id').localeCompare("fridge-temp") === 0){
                window.fridgeTemp=parseFloat(temp);
            }
        });
        $(this).keyup(function(event) {
            if($(this).parent().attr('id').localeCompare("beer-temp") === 0){
                if (event.which === 38){ // arrow up
                    clearBeerTempUpInterval();
                }
                else if (event.which === 40){
                    clearBeerTempDownInterval();
                }
            }
            if($(this).parent().attr('id').localeCompare("fridge-temp") === 0){
                if (event.which === 38){ // arrow up
                    clearFridgeTempUpInterval();
                }
                else if (event.which === 40){
                    clearFridgeTempDownInterval();
                }
            }
        });
        $(this).keydown(function(event) {
            if($(this).parent().attr('id').localeCompare("beer-temp") === 0){
                if (event.which === 38){ // arrow up
                    startBeerTempUpInterval();
                }
                else if (event.which === 40){
                    startBeerTempDownInterval();
                }
            }
            if($(this).parent().attr('id').localeCompare("fridge-temp") === 0){
                if (event.which === 38){ // arrow up
                    startFridgeTempUpInterval();
                }
                else if (event.which === 40){
                    startFridgeTempDownInterval();
                }
            }
        });
    });

	//Constant temperature control buttons
	$("button#beer-temp-up").button({icons: {primary: "ui-icon-triangle-1-n"} }).bind({
		mousedown: startBeerTempUpInterval,
		mouseup: clearBeerTempUpInterval,
		mouseleave: clearBeerTempUpInterval
	});

	$("button#beer-temp-down").button({icons: {primary: "ui-icon-triangle-1-s"} }).bind({
		mousedown: startBeerTempDownInterval,
		mouseup: clearBeerTempDownInterval,
		mouseleave: clearBeerTempDownInterval
	});

	//Constant fridge temperature control buttons
	$("button#fridge-temp-up").button({icons: {primary: "ui-icon-triangle-1-n"}	}).bind({
		mousedown: startFridgeTempUpInterval,
		mouseup: clearFridgeTempUpInterval,
		mouseleave: clearFridgeTempUpInterval
	});

	$("button#fridge-temp-down").button({icons: {primary: "ui-icon-triangle-1-s"}	}).bind({
		mousedown: startFridgeTempDownInterval,
		mouseup: clearFridgeTempDownInterval,
		mouseleave: clearFridgeTempDownInterval
	});
    $('#control-panel').tabs();
    // unhide after loading
    $("#control-panel").show();
});

function startFridgeTempUpInterval(){
    "use strict";
    clearFridgeTempUpInterval();
    var $fridgeTemp = $("#fridge-temp").find("input.temperature");
    if($fridgeTemp.find(":focus")){
        window.fridgeTemp = tempUp(parseFloat($fridgeTemp.val()));
    }
    else{
        window.fridgeTemp = tempUp(window.fridgeTemp);
    }
    $fridgeTemp.val(window.fridgeTemp.toFixed(1));
    window.fridgeTempUpTimeOut = window.setInterval(function(){
        window.fridgeTemp=tempUp(window.fridgeTemp);
        $("#fridge-temp").find("input.temperature").val(window.fridgeTemp.toFixed(1));
    }, 100);
}

function clearFridgeTempUpInterval(){
    "use strict";
    if(typeof(window.fridgeTempUpTimeOut)!=='undefined'){
        clearInterval(window.fridgeTempUpTimeOut);
    }
}

function startFridgeTempDownInterval(){
    "use strict";
    clearFridgeTempDownInterval();
    var $fridgeTemp = $("#fridge-temp").find("input.temperature");
    if($fridgeTemp.find(":focus")){
        window.fridgeTemp = tempDown(parseFloat($fridgeTemp.val()));
    }
    else{
        window.fridgeTemp = tempDown(window.fridgeTemp);
    }
    $fridgeTemp.val(window.fridgeTemp.toFixed(1));
    window.fridgeTempDownTimeOut = window.setInterval(function(){
        window.fridgeTemp=tempDown(window.fridgeTemp);
        $("#fridge-temp").find("input.temperature").val(window.fridgeTemp.toFixed(1));
    }, 100);
}

function clearFridgeTempDownInterval(){
    "use strict";
    if(typeof(window.fridgeTempDownTimeOut)!=='undefined'){
        clearInterval(window.fridgeTempDownTimeOut);
    }
}

function startBeerTempUpInterval(){
    "use strict";
    clearBeerTempUpInterval();
    var $beerTemp = $("#beer-temp").find("input.temperature");
    if($beerTemp.find(":focus")){
        window.beerTemp = tempUp(parseFloat($beerTemp.val()));
    }
    else{
        window.beerTemp = tempUp(window.beerTemp);
    }
    $beerTemp.val(window.beerTemp.toFixed(1));
    window.beerTempUpTimeOut = window.setInterval(function(){
        window.beerTemp=tempUp(window.beerTemp);
        $("#beer-temp").find("input.temperature").val(window.beerTemp.toFixed(1));
    }, 100);
}

function clearBeerTempUpInterval(){
    "use strict";
    if(typeof(window.beerTempUpTimeOut)!=='undefined'){
        clearInterval(window.beerTempUpTimeOut);
    }
}

function startBeerTempDownInterval(){
    "use strict";
    clearBeerTempDownInterval();
    var $beerTemp = $("#beer-temp").find("input.temperature");
    if($beerTemp.find(":focus")){
        window.beerTemp = tempDown(parseFloat($beerTemp.val()));
    }
    else{
        window.beerTemp = tempDown(window.beerTemp);
    }
    $beerTemp.val(window.beerTemp.toFixed(1));
    window.beerTempDownTimeOut = window.setInterval(function(){
        window.beerTemp=tempDown(window.beerTemp);
        $("#beer-temp").find("input.temperature").val(window.beerTemp.toFixed(1));
    }, 100);
}

function clearBeerTempDownInterval(){
    "use strict";
    if(typeof(window.beerTempDownTimeOut)!=='undefined'){
        clearInterval(window.beerTempDownTimeOut);
    }
}
