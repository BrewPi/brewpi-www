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


var prevScriptStatus=-1;

var controlConstants = {};
var controlSettings = {};
var controlVariables = {};

function receiveControlConstants(){
    "use strict";
	$.post('socketmessage.php', {messageType: "getControlConstants", message: ""}, function(controlConstantsJSON){
        if(controlConstantsJSON === ''){
            return;
        }
		window.controlConstants = jQuery.parseJSON(controlConstantsJSON);
		for (var i in window.controlConstants) {
			if($('select[name="'+i+'"]').length){
				$('select[name="'+i+'"]').val(window.controlConstants[i]);
			}
			if($('input[name="'+i+'"]').length){
				$('input[name="'+i+'"]').val(window.controlConstants[i]);
			}
			$('.cc.'+i+' .val').text(window.controlConstants[i]);
		}
	});
}

function receiveControlSettings(callback){
    "use strict";
	$.post('socketmessage.php', {messageType: "getControlSettings", message: ""}, function(controlSettingsJSON){
        if(controlSettingsJSON === ''){
            return;
        }
        window.controlSettings = jQuery.parseJSON(controlSettingsJSON);
		for (var i in controlSettings) {
			if($('select[name="'+i+'"]').length){
				$('select[name="'+i+'"]').val(window.controlSettings[i]);
			}
			if($('input[name="'+i+'"]').length){
				$('input[name="'+i+'"]').val(window.controlSettings[i]);
			}
			$('.cs.'+i+' .val').text(window.controlSettings[i]);
		}
		// execute optional callback function
		if (callback && typeof(callback) === "function") {
			callback();
		}
	});
}

function receiveControlVariables(){
    "use strict";
	$.post('socketmessage.php', {messageType: "getControlVariables", message: ""}, function(controlVariablesJSON){
        if(controlVariablesJSON === ''){
            return;
        }
        window.controlVariables = jQuery.parseJSON(controlVariablesJSON);
		for (var i in window.controlVariables) {
			$('.cv.'+i+' .val').text(window.controlVariables[i]);
		}
		$('.cv.pid-result .val').text(Math.round(1000*(window.controlVariables['p']+window.controlVariables['i']+window.controlVariables['d']))/1000);
	});
}

function loadDefaultControlSettings(){
    "use strict";
	$.post('socketmessage.php', {messageType: "loadDefaultControlSettings", message: ""}, function(){
		receiveControlSettings();
	});
}

function loadDefaultControlConstants(){
    "use strict";
	$.post('socketmessage.php', {messageType: "loadDefaultControlConstants", message: ""}, function(){
		receiveControlConstants();
	});
}
function reloadControlConstantsFromArduino(){
    "use strict";
	$.post('socketmessage.php', {messageType: "refreshControlConstants", message: ""}, function(){
		receiveControlConstants();
	});
}

function reloadControlSettingsFromArduino(){
    "use strict";
	$.post('socketmessage.php', {messageType: "refreshControlSettings", message: ""}, function(){
		receiveControlSettings();
	});
}

function reloadControlVariablesFromArduino(){
    "use strict";
	$.post('socketmessage.php', {messageType: "refreshControlVariables", message: ""}, function(){
		receiveControlVariables();
	});
}

function stopScript(){
    "use strict";
	$.post('socketmessage.php', {messageType: "stopScript", message: ""}, function(){});
}

function startScript(){
    "use strict";
	$.get('start_script.php');
}

function refreshLcd(){
    "use strict";
	$.post('socketmessage.php', {messageType: "lcd", message: ""}, function(lcdText){
		try
		{
			lcdText = JSON.parse(lcdText);
			for (var i = lcdText.length - 1; i >= 0; i--) {
				$('#lcd .lcd-text #lcd-line-' + i).html(lcdText[i]);
			}
		}
		catch(e)
		{
			$('#lcd .lcd-text #lcd-line-0').html("Cannot receive");
			$('#lcd .lcd-text #lcd-line-1').html("LCD text from");
			$('#lcd .lcd-text #lcd-line-2').html("Python script");
			$('#lcd .lcd-text #lcd-line-3').html(" ");
		}
		window.setTimeout(checkScriptStatus,5000);
	});
}

function checkScriptStatus(){
    "use strict";
	$.post('socketmessage.php', {messageType: "checkScript", message: ""}, function(answer){
        answer = answer.replace(/\s/g, ''); //strip all whitespace, including newline.
        if(answer !== prevScriptStatus){
			if(answer==='1'){
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
    "use strict";

	$('#maintenance-panel').tabs();

	$("button#maintenance").button({	icons: {primary: "ui-icon-newwin" } }).click(function(){
		$("#maintenance-panel").dialog("open");
	});

	$(".script-status").button({	icons: {primary: "ui-icon-alert" } });
	$(".script-status span.ui-button-text").text("Checking script..");

	$("button#refresh-beer-chart").button({	icons: {primary: "ui-icon-refresh" } }).click(function(){
		drawBeerChart(window.beerName, 'beer-chart');
	});

	loadControlPanel();
	drawBeerChart(window.beerName, 'beer-chart');

    receiveControlConstants();
	receiveControlSettings();
	receiveControlVariables();
    checkScriptStatus(); //will call refreshLcd and alternate between the two
});

