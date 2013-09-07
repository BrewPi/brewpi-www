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

/* global google, loadControlPanel, drawBeerChart */

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
		for (var i in window.controlConstants){
			if(window.controlConstants.hasOwnProperty(i)){
				if($('select[name="'+i+'"]').length){
					$('select[name="'+i+'"]').val(window.controlConstants[i]);
				}
				if($('input[name="'+i+'"]').length){
					$('input[name="'+i+'"]').val(window.controlConstants[i]);
				}
				$('.cc.'+i+' .val').text(window.controlConstants[i]);
			}
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
			if(controlSettings.hasOwnProperty(i)){
				if($('select[name="'+i+'"]').length){
					$('select[name="'+i+'"]').val(window.controlSettings[i]);
				}
				if($('input[name="'+i+'"]').length){
					$('input[name="'+i+'"]').val(window.controlSettings[i]);
				}
				$('.cs.'+i+' .val').text(window.controlSettings[i]);
			}
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
			if(window.controlVariables.hasOwnProperty(i)){
				$('.cv.'+i+' .val').text(window.controlVariables[i]);
			}
		}
		$('.cv.pid-result .val').text(Math.round(1000*(window.controlVariables.p+window.controlVariables.i+window.controlVariables.d))/1000);
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
		var $lcdText = $('#lcd .lcd-text');
		try
		{
			lcdText = JSON.parse(lcdText);
			for (var i = lcdText.length - 1; i >= 0; i--) {
				$lcdText.find('#lcd-line-' + i).html(lcdText[i]);
			}
		}
		catch(e)
		{
			$lcdText.find('#lcd-line-0').html("Cannot receive");
			$lcdText.find('#lcd-line-1').html("LCD text from");
			$lcdText.find('#lcd-line-2').html("Python script");
			$lcdText.find('#lcd-line-3').html(" ");
		}
		window.setTimeout(checkScriptStatus,5000);
	});
}

function checkScriptStatus(){
	"use strict";
	$.post('socketmessage.php', {messageType: "checkScript", message: ""}, function(answer){
		answer = answer.replace(/\s/g, ''); //strip all whitespace, including newline.
		if(answer !== prevScriptStatus){
			var $scriptStatus = $(".script-status");
			var $scriptStatusIcon = $scriptStatus.find("span.ui-icon");
			var $scriptStatusButtonText = $scriptStatus.find("span.ui-button-text");
			if(answer==='1'){
				$scriptStatusIcon.removeClass("ui-icon-alert").addClass("ui-icon-check");
				$scriptStatus.removeClass("ui-state-error").addClass("ui-state-default");
				$scriptStatusButtonText.text("Script running");
				$scriptStatus.unbind();
				$scriptStatus.bind({
						click: function(){
							stopScript();
						},
						mouseenter: function(){
							$scriptStatusIcon.removeClass("ui-icon-check").addClass("ui-icon-stop");
							$scriptStatus.removeClass("ui-state-default").addClass("ui-state-error");
							$scriptStatusButtonText.text("Stop script");
						},
						mouseleave: function(){
							$scriptStatusIcon.removeClass("ui-icon-stop").addClass("ui-icon-check");
							$scriptStatus.removeClass("ui-state-error").addClass("ui-state-default");
							$scriptStatusButtonText.text("Script running");
						}
				});
			}
			else{
				$scriptStatusIcon.removeClass("ui-icon-check").addClass("ui-icon-alert");
				$scriptStatus.removeClass("ui-state-default").addClass("ui-state-error");
				$scriptStatusButtonText.text("Script not running!");
				$scriptStatus.unbind();
				$scriptStatus.bind({
				click: function(){
					startScript();
				},
				mouseenter: function(){
					$scriptStatusIcon.removeClass("ui-icon-alert").addClass("ui-icon-play");
					$scriptStatus.removeClass("ui-state-error").addClass("ui-state-default");
					$scriptStatusButtonText.text("Start script");
				},
				mouseleave: function(){
					$scriptStatusIcon.removeClass("ui-icon-play").addClass("ui-icon-alert");
					$scriptStatus.removeClass("ui-state-default").addClass("ui-state-error");
					$scriptStatusButtonText.text("Script not running!");
				}
				});
			}
		}
		prevScriptStatus = answer;
		window.setTimeout(refreshLcd, 5000); //alternate refreshing script and lcd
	});
}
google.load('visualization', '1', {packages: ['table']});

$(document).ready(function(){
	"use strict";
	$(".script-status").button({	icons: {primary: "ui-icon-alert" } });
	$(".script-status span.ui-button-text").text("Checking script..");

	loadControlPanel();
	drawBeerChart(window.beerName, 'curr-beer-chart');

	receiveControlConstants();
	receiveControlSettings();
	receiveControlVariables();
	checkScriptStatus(); //will call refreshLcd and alternate between the two
});

