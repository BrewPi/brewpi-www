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

 /* global google, receiveControlSettings, window.googleDocsKey, controlSettings, controlVariables */

var beerTemp = 20.0;
var fridgeTemp = 20.0;

function drawProfileChart() {
    "use strict";
    var query = new google.visualization.Query( 'https://docs.google.com/spreadsheet/tq?range=D:E&key=' + window.googleDocsKey);
    query.send(handleProfileChartQueryResponse);
}

function handleProfileChartQueryResponse(response) {
    "use strict";
    if (response.isError()) {
        window.alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return;
    }
    var profileData = response.getDataTable();
    var profileChart = new google.visualization.AnnotatedTimeLine(document.getElementById('profileChartDiv'));
    profileChart.draw(profileData, {
        'displayAnnotations': true,
        'scaleType': 'maximized',
        'displayZoomButtons': false,
        'allValuesSuffix': '\u00B0',
        'numberFormats': '##.0',
        'displayAnnotationsFilter': true});
}

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
    loadProfile(window.beerName, renderProfile);
	receiveControlSettings(function(){
        if(window.controlSettings === {}){
            return;
        }
        var $controlPanel = $('#control-panel');
        switch(window.controlSettings.mode){
            case 'p':
                $controlPanel.tabs( "option", "active", 0);
                statusMessage("normal","Running in beer profile mode");
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
            default:
                statusMessage("error","Invalid mode ("+window.controlSettings.mode+") received");
        }
        window.beerTemp = window.controlSettings.beerSet;
        window.fridgeTemp = window.controlSettings.fridgeSet;
		// beer and fridge temp can be null when not active (off mode)
		if(window.beerTemp === null){
			window.beerTemp = 20.0;
		}
		if(window.fridgeTemp === null){
			window.fridgeTemp = 20.0;
		}
		$("#beer-temp").find("input.temperature").val(window.beerTemp.toFixed(1));
		$("#fridge-temp").find("input.temperature").val(window.fridgeTemp.toFixed(1));
	});
}

function tempUp(temp){
	"use strict";
	temp += 0.1;
	if(temp > window.controlConstants.tempSetMax){
		temp = window.controlConstants.tempSetMin;
	}
	return temp;
}

function tempDown(temp){
	"use strict";
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
            // upload profile to pi
            $.post('socketmessage.php', {messageType: "uploadProfile", message: ""}, function(answer){
                if(answer !==''){
                    statusMessage("highlight", answer);
                }
            });
            // set mode to profile
            $.post('socketmessage.php', {messageType: "setProfile", message: ""}, function(){});
            break;
        case 1: // beer constant
        $.post('socketmessage.php', {messageType: "setBeer", message: String(window.beerTemp)}, function(){});
        statusMessage("highlight","Mode set to beer constant");
        break;
        case 2: // fridge constant
        $.post('socketmessage.php', {messageType: "setFridge", message: String(window.fridgeTemp)}, function(){});
        statusMessage("highlight","Mode set to fridge constant");
        break;
        case 3: // off
        $.post('socketmessage.php', {messageType: "setOff", message: ""}, function(){});
        statusMessage("highlight","Temperature control disabled");
        break;
    }
    setTimeout(loadControlPanel,5000);
}

var profileTable = null;
var profileEdit = null;

function renderProfile(beerProfile) {
    "use strict";
    profileTable.render(beerProfile);
    drawProfileChart();
}

function loadProfile(profile, onProfileLoaded) {
    "use strict";
    $.post("get_beer_profile.php", { "name": profile }, function(beerProfile) {
        try {
            if ( onProfileLoaded != null ) {
                onProfileLoaded(beerProfile);
            }
        } catch (e) {
            console.log('Error loading profile: ' + beerProfile);
            return;
        }
    }, 'json');
}

function showProfileSelectDialog() {
    var selectedProfile = null;
    $('#profileSelect').selectable({
        stop: function(e, ui) {
            $(".ui-selected:first", this).each(function() {
                $(this).siblings().removeClass("ui-selected");
                selectedProfile = $(this).text();
            });
        }
    });
    $.post("get_beer_profiles.php", {}, function(beerProfiles) {
        var beerProfile = null;
        try {
            $('#profileSelect').empty();
            for( var i=0; i<beerProfiles.profiles.length; i++) {
                var $li = $("<li></li>").addClass("ui-widget-content").text(beerProfiles.profiles[i]);
                $('#profileSelect').append($li);
            }
        } catch (e) {
            console.log('Can not load temperature profiles');
            return;
        }
    }, 'json');
    $("#profileSelectDiv").dialog( {
        modal: true,
        title: "Select Temperature Profile",
        buttons: [
            {
                text: "OK",
                click: function() {
                    if ( selectedProfile != null ) {
                        loadProfile(selectedProfile, renderProfile);
                    }
                    $( this ).dialog( "close" );
                }
            },{
                text: "Cancel",
                click: function() { $( this ).dialog( "close" ); }
            }
        ]
    });
}
function showProfileEditDialog() {
    profileEdit.render( profileTable.toJSON() );
    $("#profileTableEditDiv").dialog( {
        modal: true,
        title: "Edit Temperature Profile",
        buttons: [
            {
                text: "Save",
                click: function() {
                    var profName = $('#profileTableName').val();
                    if ( profName != null && profName != '' ) {
                        console.log("Saving profile: " + profName + ', with data: ' + profileEdit.toCSV() );
                    }
                    $( this ).dialog( "close" );
                }
            },{
                text: "Cancel",
                click: function() { $( this ).dialog( "close" ); }
            }
        ]
    });
}


$(document).ready(function(){
	"use strict";
	//Control Panel
    profileEdit = new BeerProfileTable('profileTableEditDiv', { tableClass: "profileTableEdit ui-widget", theadClass: "ui-widget-header", tbodyClass: "ui-widget-content", editable: true, startDateFieldSelector: '#profileEditStartDate' });
    profileTable = new BeerProfileTable('profileTableDiv', { tableClass: "profileTableEdit ui-widget", theadClass: "ui-widget-header", tbodyClass: "ui-widget-content", editable: false, startDateFieldSelector: '#profileTableStartDate' });

	$("button#refresh-controls").button({icons: {primary: "ui-icon-arrowrefresh-1-e"} }).click(function(){
        loadProfile(window.beerName, renderProfile);
	});

    $("button#load-controls").button({  icons: {primary: "ui-icon-open" } }).click(function() {
        showProfileSelectDialog();
    });

    $("button#edit-controls").button({  icons: {primary: "ui-icon-wrench" } }).click(function() {
        showProfileEditDialog();
    });
    $("#profileTableStartDate").datepicker({ dateFormat: $.datepicker.W3C, onSelect: function() { 
        profileTable.updateDates();
    }});

    $("#profileEditStartDate").datepicker({ dateFormat: $.datepicker.W3C, onSelect: function() { 
        profileEdit.updateDates();
    }});

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
                temp = 20.0;
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
    $("#control-panel").css("visibility", "visible");
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
