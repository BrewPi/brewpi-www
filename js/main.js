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

prevScriptStatus=-1;

controlConstants = {};
controlSettings = {};
controlVariables = {};

function receiveControlConstants(){
	$.post('socketmessage.php', {messageType: "getControlConstants", message: ""}, function(controlConstantsJSON){
		controlConstants = jQuery.parseJSON(controlConstantsJSON);
		for (var i in controlConstants) {
			if($('select[name="'+i+'"]').length){
				$('select[name="'+i+'"]').val(controlConstants[i]);
			}
			if($('input[name="'+i+'"]').length){
				$('input[name="'+i+'"]').val(controlConstants[i]);
			}
			$('.cc.'+i+' .val').text(controlConstants[i]);
		}
	});
}

function receiveControlSettings(callback){
	$.post('socketmessage.php', {messageType: "getControlSettings", message: ""}, function(controlSettingsJSON){
		controlSettings = jQuery.parseJSON(controlSettingsJSON);
		for (var i in controlSettings) {
			if($('select[name="'+i+'"]').length){
				$('select[name="'+i+'"]').val(controlSettings[i]);
			}
			if($('input[name="'+i+'"]').length){
				$('input[name="'+i+'"]').val(controlSettings[i]);
			}
			$('.cs.'+i+' .val').text(controlSettings[i]);
		}
		// execute optional callback function
		if (callback && typeof(callback) === "function") {
			callback();
		}
	});
}

function receiveControlVariables(){
	$.post('socketmessage.php', {messageType: "getControlVariables", message: ""}, function(controlVariablesJSON){
		controlVariables = jQuery.parseJSON(controlVariablesJSON);
		for (var i in controlVariables) {
			$('.cv.'+i+' .val').text(controlVariables[i]);
		}
		$('.cv.pid-result .val').text(Math.round(1000*(controlVariables['p']+controlVariables['i']+controlVariables['d']))/1000);
	});
}

function loadDefaultControlSettings(){
	$.post('socketmessage.php', {messageType: "loadDefaultControlSettings", message: ""}, function(){
		receiveControlSettings();
	});
}

function loadDefaultControlConstants(){
	$.post('socketmessage.php', {messageType: "loadDefaultControlConstants", message: ""}, function(){
		receiveControlConstants();
	});
}
function reloadControlConstantsFromArduino(){
	$.post('socketmessage.php', {messageType: "refreshControlConstants", message: ""}, function(){
		receiveControlConstants();
	});
}

function reloadControlSettingsFromArduino(){
	$.post('socketmessage.php', {messageType: "refreshControlSettings", message: ""}, function(){
		receiveControlSettings();
	});
}

function reloadControlVariablesFromArduino(){
	$.post('socketmessage.php', {messageType: "refreshControlVariables", message: ""}, function(){
		receiveControlVariables();
	});
}

function stopScript(){
	$.post('socketmessage.php', {messageType: "stopScript", message: ""}, function(){});
}

function startScript(){
	$.get('start_script.php');
}

function refreshLcd(){
	$.post('socketmessage.php', {messageType: "lcd", message: ""}, function(lcdText){
		if(lcdText != "error"){
			lcdText = lcdText.replace(/(\r\n|\n|\r)/gm,""); // remove all newlines
			$('#lcd .lcd-text').html(lcdText);
		}
		else{
			$('#lcd .lcd-text').html("Error: script <BR>not responding");
		}
		window.setTimeout(checkScriptStatus,5000);
	});
}

function checkScriptStatus(){
	$.post('socketmessage.php', {messageType: "checkScript", message: ""}, function(answer){
		if(answer !=prevScriptStatus){
			if(answer==1){
				$(".script-status span.ui-icon").removeClass("ui-icon-alert").addClass("ui-icon-check");
				$(".script-status").removeClass("ui-state-error").addClass("ui-state-default");
				$(".script-status span.ui-button-text").text("Script running");
				$(".script-status").unbind();
				$(".script-status").bind({
						click: function(){
							stopScript();
						},
						mouseenter: function(){
							$(".script-status p span#icon").removeClass("ui-icon-check").addClass("ui-icon-stop");
							$(".script-status").removeClass("ui-state-default").addClass("ui-state-error");
							$(".script-status span.ui-button-text").text("Stop script");
						},
						mouseleave: function(){
							$(".script-status p span#icon").removeClass("ui-icon-stop").addClass("ui-icon-check");
							$(".script-status").removeClass("ui-state-error").addClass("ui-state-default");
							$(".script-status span.ui-button-text").text("Script running");
						}
				});
			}
			else{
				$(".script-status span.ui-icon").removeClass("ui-icon-check").addClass("ui-icon-alert");
				$(".script-status").removeClass("ui-state-default").addClass("ui-state-error");
				$(".script-status span.ui-button-text").text("Script not running!");
				$(".script-status").unbind();
				$(".script-status").bind({
				click: function(){
					startScript();
				},
				mouseenter: function(){
					$(".script-status span.ui-icon").removeClass("ui-icon-alert").addClass("ui-icon-play");
					$(".script-status").removeClass("ui-state-error").addClass("ui-state-default");
					$(".script-status span.ui-button-text").text("Start script");
				},
				mouseleave: function(){
					$(".script-status span.ui-icon").removeClass("ui-icon-play").addClass("ui-icon-alert");
					$(".script-status").removeClass("ui-state-default").addClass("ui-state-error");
					$(".script-status span.ui-button-text").text("Script not running!");
				}
				});
			}
		}
		prevScriptStatus = answer;
		window.setTimeout(refreshLcd, 5000); //alternate refreshing script and lcd
	});
}

google.load('visualization', '1', {packages: ['annotatedtimeline', 'table']});

$(document).ready(function(){
	$('#maintenance-panel').tabs();

	$("button#maintenance").button({	icons: {primary: "ui-icon-newwin" } }).click(function(){
		$("#maintenance-panel").dialog("open");
	});

	$(".script-status").button({	icons: {primary: "ui-icon-alert" } });
	$(".script-status span.ui-button-text").text("Checking script..");

	$("button#refresh-beer-chart").button({	icons: {primary: "ui-icon-refresh" } }).click(function(){
		drawBeerChart(beerName, 'beer-chart');
	});

	loadControlPanel();
	checkScriptStatus(); //will call refreshLcd and alternate between the two
	drawBeerChart(beerName, 'beer-chart');
	receiveControlConstants();
	receiveControlSettings();
	receiveControlVariables();
});
