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

beerTemp = 20.0;
fridgeTemp = 20.0;

function drawProfileChart() {
	var query = new google.visualization.Query(
		'https://docs.google.com/spreadsheet/tq?range=D:E&key=' + googleDocsKey);
	query.send(handleProfileChartQueryResponse);
}

function handleProfileChartQueryResponse(response) {
  if (response.isError()) {
	alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
	return;
  }
	var profileData = response.getDataTable();
	profileChart = new google.visualization.AnnotatedTimeLine(document.getElementById('profileChartDiv'));
	profileChart.draw(profileData, {
		'displayAnnotations': true,
		'scaleType': 'maximized',
		'displayZoomButtons': false,
		'allValuesSuffix': '\u00B0',
		'numberFormats': '##.0',
		'displayAnnotationsFilter': true});
}

function drawProfileTable() {
	var query = new google.visualization.Query(
		'https://docs.google.com/spreadsheet/tq?range=C:E&where=D<date "2070-01-01"&key=' + googleDocsKey);
	query.send(handleProfileTableQueryResponse);
}

function handleProfileTableQueryResponse(response){
	if (response.isError()) {
		alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
		return;
	}

	var profileData = response.getDataTable();
	var profileTable = new google.visualization.Table(document.getElementById('profileTableDiv'));
	profileTable.draw(profileData,null);
}

function statusMessage(messageType, messageText){
	$("#status-message").removeClass("ui-state-error ui-state-default ui-state-highlight");
	$("#status-message p span#icon").removeClass("ui-icon-error ui-icon-check ui-icon-info");
	switch(messageType){
		case "normal":
				$("#status-message p span#icon").addClass("ui-icon-check");
				$("#status-message").addClass("ui-state-default");
			break;
		case "error":
				$("#status-message p span#icon").addClass("ui-icon-error");
				$("#status-message").addClass("ui-state-error");
			break;
		case "highlight":
				$("#status-message p span#icon").addClass("ui-icon-info");
				$("#status-message").addClass("ui-state-highlight");
				$("#status-message").addClass( "ui-state-highlight");
			break;
	}
	$("#status-message p span#message").text(messageText);
}

function loadControlPanel(){
	drawProfileChart();
	drawProfileTable();
	receiveControlSettings(function(){
		switch(controlSettings.mode){
			case 'p':
				$('#control-panel').tabs( "select" , 0);
				statusMessage("normal","Running in beer profile mode");
				break;
			case 'b':
				$('#control-panel').tabs( "select" , 1);
				statusMessage("normal","Running in beer constant mode");
				break;
			case 'f':
				$('#control-panel').tabs( "select" , 2);
				statusMessage("normal","Running in fridge constant mode");
				break;
			case 'o':
				$('#control-panel').tabs( "select" , 3);
				statusMessage("normal","Temperature control disabled");
				break;
			default:
				statusMessage("error","Invalid mode ("+mode+") received");
		}
		beerTemp = controlSettings.beerSetting;
		fridgeTemp = controlSettings.fridgeSetting;
		// beer and fridge temp can be null when not active (off mode)
		if(beerTemp === null){
			beerTemp = 20.0;
		}
		if(fridgeTemp === null){
			fridgeTemp = 20.0;
		}
		$("#beer-temp span.temperature").text(String(beerTemp.toFixed(1)));
		$("#fridge-temp span.temperature").text(String(fridgeTemp.toFixed(1)));
	});
}

function tempUp(temp){
	temp = temp+0.1;
	if(temp>30.0){
		temp = 4.0;
	}
	return temp;
}

function tempDown(temp){
	temp = temp-0.1;
	if(temp< 4.0){
		temp = 30.0;
	}
	return temp;
}

function applySettings(){
	//Check which tab is open
	if($("#profile-control").hasClass('ui-tabs-hide') === false){
		$.post('socketmessage.php', {messageType: "setProfile", message: ""}, function(){});
		statusMessage("highlight","Mode set to beer profile");
	}
	else if($("#beer-constant-control").hasClass('ui-tabs-hide') === false){
		$.post('socketmessage.php', {messageType: "setBeer", message: String(beerTemp)}, function(){});
		statusMessage("highlight","Mode set to beer constant");
	}
	else if($("#fridge-constant-control").hasClass('ui-tabs-hide') === false){
		$.post('socketmessage.php', {messageType: "setFridge", message: String(fridgeTemp)}, function(){});
		statusMessage("highlight","Mode set to fridge constant");
	}
	else if($("#temp-control-off").hasClass('ui-tabs-hide') === false){
		$.post('socketmessage.php', {messageType: "setOff", message: ""}, function(){});
		statusMessage("highlight","Temperature control disabled");
	}
	setTimeout(loadControlPanel,5000);
}

$(document).ready(function(){
	//Control Panel
	$('#control-panel').tabs();

	$("#controls button#refresh").button({icons: {primary: "ui-icon-arrowrefresh-1-e"} }).click(function(){
		drawProfileChart();
		drawProfileTable();
	});

	$("#controls button#edit").button({	icons: {primary: "ui-icon-wrench" } }).click(function(){
		window.open("https://docs.google.com/spreadsheet/ccc?key=" + googleDocsKey);
	});

	$("#controls button#upload").button({ icons: {primary: "ui-icon-arrowthickstop-1-n"}}).click(function(){
		$.post('socketmessage.php', {messageType: "uploadProfile", message: ""}, function(answer){
			statusMessage("highlight", answer);
		});
	});

	$("button#apply-settings").button({ icons: {primary: "ui-icon-check"} })	.click(function(){
		applySettings();
	});

	//Constant temperature control buttons
	$("button#beer-temp-up").button({icons: {primary: "ui-icon-triangle-1-n"} }).bind({
		mousedown: function(){
			beerTemp=tempUp(beerTemp);
			$("#beer-temp span.temperature").text(String(beerTemp.toFixed(1)));
			beerTempUpTimeOut = window.setInterval(function(){
				beerTemp=tempUp(beerTemp);
				$("#beer-temp span.temperature").text(String(beerTemp.toFixed(1)));
			}, 100);
		},
		mouseup: function(){
			if(typeof(beerTempUpTimeOut)!='undefined')
				clearInterval(beerTempUpTimeOut);
		},
		mouseleave: function(){
			if(typeof(beerTempUpTimeOut)!='undefined')
				clearInterval(beerTempUpTimeOut);
		}
	});

	$("button#beer-temp-down").button({icons: {primary: "ui-icon-triangle-1-s"} }).bind({
		mousedown: function() {
			beerTemp=tempDown(beerTemp);
			$("#beer-temp span.temperature").text(String(beerTemp.toFixed(1)));
			beerTempDownTimeOut = window.setInterval(function(){
				beerTemp=tempDown(beerTemp);
				$("#beer-temp span.temperature").text(String(beerTemp.toFixed(1)));
			}, 100);
		},
		mouseup: function(){
			if(typeof(beerTempDownTimeOut)!='undefined')
				clearInterval(beerTempDownTimeOut);
		},
		mouseleave: function(){
			if(typeof(beerTempDownTimeOut)!='undefined')
				clearInterval(beerTempDownTimeOut);
		}
	});

	//Constant fridge temperature control buttons
	$("button#fridge-temp-up").button({icons: {primary: "ui-icon-triangle-1-n"}	}).bind({
		mousedown: function() {
			fridgeTemp=tempUp(fridgeTemp);
			$("#fridge-temp span.temperature").text(String(fridgeTemp.toFixed(1)));
			fridgeTempUpTimeOut = window.setInterval(function(){
				fridgeTemp=tempUp(fridgeTemp);
				$("#fridge-temp span.temperature").text(String(fridgeTemp.toFixed(1)));
			}, 100);
		},
		mouseup: function(){
			if(typeof(fridgeTempUpTimeOut)!='undefined')
				clearInterval(fridgeTempUpTimeOut);
		},
		mouseleave: function(){
			if(typeof(fridgeTempUpTimeOut)!='undefined')
				clearInterval(fridgeTempUpTimeOut);
		}
	});

	$("button#fridge-temp-down").button({icons: {primary: "ui-icon-triangle-1-s"} }).bind({
		mousedown: function() {
			beerTemp=tempDown(beerTemp);
			$("#fridge-temp span.temperature").text(String(beerTemp.toFixed(1)));
			fridgeTempDownTimeOut = window.setInterval(function(){
				fridgeTemp=tempDown(beerTemp);
				$("#fridge-temp span.temperature").text(String(beerTemp.toFixed(1)));
			}, 100);
		},
		mouseup: function(){
			if(typeof(fridgeTempDownTimeOut)!='undefined')
				clearInterval(fridgeTempDownTimeOut);
		},
		mouseleave: function(){
			if(typeof(fridgeTempDownTimeOut)!='undefined')
				clearInterval(fridgeTempDownTimeOut);
		}
	});

});