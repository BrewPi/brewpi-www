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

function beerNameDialogInit(){
    "use strict";
    var $dialog = $("<div class='beer-name-dialog'></div>").dialog( {
        modal: true,
        title: "Switch active brew",
        width: 480
    });
    var $backButton = $("<button class='back' title='Go back'></button>").button({icons: {primary: "ui-icon-arrowthick-1-w"}, text: false });
    $dialog.append($backButton);
    var $body = $("<div class='dialog-body'></div>");
    $dialog.append($body);
    beerNameDialogStart($body, $backButton);
}

function beerNameDialogStart($body, $backButton){
    "use strict";
    $body.empty();
    $backButton.hide();
    $body.append($("<span  class='dialog-intro'>You are currently fermenting '" + $("#beer-name").text() + "'.<br>What would you like to do?</span>"));
    var $buttons = $("<div class='beer-name-buttons'></div>");
    $buttons.append($("<button>Start new brew</button>").button({icons: {primary: "ui-icon-plus"} }).click(function(){
        beerNameDialogNew($body, $backButton);
    }));
    $buttons.append($("<button>Stop this brew</button>").button({icons: {primary: "ui-icon-stop"} }).click(function(){
        beerNameDialogStop($body, $backButton);
    }));
    /*
    $buttons.append($("<button>Continue existing brew</button>").button({icons: {primary: "ui-icon-folder-open"} }).click(function(){

    }));*/
    $buttons.append($("<button>Pause logging</button>").button({icons: {primary: "ui-icon-pause"} }).click(function(){
        beerNameDialogPause($body, $backButton);
    }));
    $buttons.find("button").click(function(){
        $backButton.show().unbind().bind({click: function(){beerNameDialogStart($body, $backButton);}});
    });

    $body.append($buttons);
}

function beerNameDialogNew($body, $backButton){
    "use strict";
    $body.empty();
    $body.append($("<span  class='dialog-intro'>Please enter a name for your new brew. Your current brew will be stopped and BrewPi will start logging data for your new brew.</span>"));
    $body.append($("<input id='new-beer-name' type='text' size='30' placeholder='Enter new beer name..'> </input>"));
    var $buttons = $("<div class='beer-name-buttons'></div>");
    $buttons.append($("<button>Start new brew</button>").button({	icons: {primary: "ui-icon-check" } }).click(function(){
        $.post('socketmessage.php', {messageType: "name", message: $("input#new-beer-name").val()});
    }));
    $body.append($buttons);
}

function beerNameDialogStop($body, $backButton){
    "use strict";
    $body.empty();
    $body.append($("<span  class='dialog-intro'>Clicking stop will finish your current brew and will stop logging data. You can use this when you are between brews.</span>"));

    var $buttons = $("<div class='beer-name-buttons'></div>");
    $buttons.append($("<button>Stop this brew</button>").button({	icons: {primary: "ui-icon-stop" } }).click(function(){
        $.post('socketmessage.php', {messageType: "stoplogging", message: ""});
    }));
    $body.append($buttons);
}

function beerNameDialogPause($body, $backButton){
    "use strict";
    $body.empty();
    $body.append($("<span  class='dialog-intro'>Clicking pause will temporarily disable data logging for this brew. You can later continue logging data for the same brew.</span>"));

    var $buttons = $("<div class='beer-name-buttons'></div>");
    $buttons.append($("<button>Pause logging temporarily</button>").button({	icons: {primary: "ui-icon-pause" } }).click(function(){
        $.post('socketmessage.php', {messageType: "pauselogging", message: ""});
    }));
    $body.append($buttons);
}

google.load('visualization', '1', {packages: ['table']});

$(document).ready(function(){
	"use strict";
	$(".script-status").button({	icons: {primary: "ui-icon-alert" } });
	$(".script-status span.ui-button-text").text("Checking script..");
    $("#beer-name").click(beerNameDialogInit);

	loadControlPanel();
	drawBeerChart(window.beerName, 'curr-beer-chart');

	receiveControlConstants();
	receiveControlSettings();
	receiveControlVariables();
	checkScriptStatus(); //will call refreshLcd and alternate between the two
});

