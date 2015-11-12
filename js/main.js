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
	$.ajax({
        type: "POST",
        dataType:"json",
        cache: false,
        contentType:"application/x-www-form-urlencoded; charset=utf-8",
        data: {messageType: "getControlConstants", message: ""},
        url: 'socketmessage.php',
        success: function(controlConstantsJSON){
            window.controlConstants = controlConstantsJSON;
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
        }
    });
}

function receiveControlSettings(callback){
	"use strict";
    $.ajax({
        type: "POST",
        dataType:"json",
        cache: false,
        contentType:"application/x-www-form-urlencoded; charset=utf-8",
        url: 'socketmessage.php',
        data: {messageType: "getControlSettings", message: ""},
        success: function(controlSettingsJSON){
            window.controlSettings = controlSettingsJSON;
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
            if(typeof(controlSettings.dataLogging) !== 'undefined'){
                var $loggingState = $("span.data-logging-state");
                if(controlSettings.dataLogging === 'paused'){
                    $loggingState.text("(logging paused)");
                    $loggingState.show();
                }
                else if (controlSettings.dataLogging === 'stopped'){
                    $loggingState.text("(logging stopped)");
                    $loggingState.show();
                }
                else{
                    $loggingState.hide();
                }
            }
            // execute optional callback function
            if (callback && typeof(callback) === "function") {
                callback();
            }
	    }
    });
}

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function receiveControlVariables(){
	"use strict";
    $.ajax({
        type: "POST",
        dataType:"text",
        cache: false,
        contentType:"application/x-www-form-urlencoded; charset=utf-8",
        url: 'socketmessage.php',
        data: {messageType: "getControlVariables", message: ""},
        success: function(controlVariablesJSON){
            var jsonPretty = JSON.stringify(JSON.parse(controlVariablesJSON),null,2);
      	    $('#algorithm-json').html(syntaxHighlight(jsonPretty));
        }
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
    $.ajax({
        type: "POST",
        dataType:"json",
        cache: false,
        contentType:"application/x-www-form-urlencoded; charset=utf-8",
        url: 'socketmessage.php',
        data: {messageType: "lcd", message: ""}
        })
        .done( function(lcdText){
            var $lcdText = $('#lcd .lcd-text');
            for (var i = lcdText.length - 1; i >= 0; i--) {
                $lcdText.find('#lcd-line-' + i).html(lcdText[i]);
            }
            updateScriptStatus(true);
        })
        .fail(function() {
            var $lcdText = $('#lcd .lcd-text');
            $lcdText.find('#lcd-line-0').html("Cannot receive");
            $lcdText.find('#lcd-line-1').html("LCD text from");
            $lcdText.find('#lcd-line-2').html("Python script");
            $lcdText.find('#lcd-line-3').html(" ");
            updateScriptStatus(false);
        })
        .always(function() {
            window.setTimeout(refreshLcd,5000);
        }
    );
}

function updateScriptStatus(running){
	"use strict";
    if(window.scriptStatus == running){
        return;
    }
    window.scriptStatus = running;
    var $scriptStatus = $(".script-status");
    var $scriptStatusIcon = $scriptStatus.find("span.ui-icon");
    var $scriptStatusButtonText = $scriptStatus.find("span.ui-button-text");
    if(running){
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
    } else {
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
    var beerName = $("#beer-name").text();
    var introText = "";

    var stopButton = true;
    var pauseButton = true;
    var continueButton = true;

    var dataLogging = 'undefined';
    if(typeof(window.controlSettings.dataLogging) !== 'undefined'){
        dataLogging = window.controlSettings.dataLogging;
    }
    if(dataLogging === 'stopped'){
        introText += "You are currently not logging data.";
        stopButton = false;
        pauseButton = false;
        continueButton = false;
    }
    else if(dataLogging === 'paused'){
        introText += "You have temporarily disabled data logging for the brew '" + beerName + "'.";
        pauseButton = false;
    }
    else if(dataLogging === 'active'){
        introText += "You are currently logging data for the brew '" + beerName + "'.";
        continueButton = false;
    }
    else{
        introText += "You are logging data for brew '" + beerName + "'.";
    }

    $body.append($("<span  class='dialog-intro'>" + introText + "<br>What would you like to do?</span>"));
    var $buttons = $("<div class='beer-name-buttons'></div>");
    $buttons.append($("<button>Start new brew</button>").button({icons: {primary: "ui-icon-plus"} }).click(function(){
        beerNameDialogNew($body, $backButton);
    }));
    if(stopButton){
        $buttons.append($("<button>Stop this brew</button>").button({icons: {primary: "ui-icon-stop"} }).click(function(){
            beerNameDialogStop($body, $backButton);
        }));
    }
    if(pauseButton){
        $buttons.append($("<button>Pause logging</button>").button({icons: {primary: "ui-icon-pause"} }).click(function(){
            beerNameDialogPause($body, $backButton);
        }));
    }
    if(continueButton){
        $buttons.append($("<button>Continue logging</button>").button({icons: {primary: "ui-icon-play"} }).click(function(){
            beerNameDialogResume($body, $backButton);
        }));
    }
    $body.append($buttons);
}

function beerNameDialogNew($body, $backButton){
    "use strict";
    $body.empty();
    $body.append($("<span  class='dialog-intro'>Please enter a name for your new brew. Your current brew will be stopped and BrewPi will start logging data for your new brew.</span>"));
    $body.append($("<input id='new-beer-name' type='text' size='30' placeholder='Enter new beer name..'> </input>"));
    var $buttons = $("<div class='beer-name-buttons'></div>");
    $buttons.append($("<button>Start new brew</button>").button({	icons: {primary: "ui-icon-check" } }).click(function(){
        $.post('socketmessage.php', {messageType: "startNewBrew", message: encodeURIComponent($("input#new-beer-name").val())}, function(reply){
            $backButton.show().unbind().bind({click: function(){beerNameDialogNew($body, $backButton);}});
            beerNameDialogResult($body, $backButton, reply);
        });
    }));
    $body.append($buttons);
    $backButton.show().unbind().bind({click: function(){beerNameDialogStart($body, $backButton);}});
}

function beerNameDialogStop($body, $backButton){
    "use strict";
    $body.empty();
    $body.append($("<span  class='dialog-intro'>Clicking stop will finish your current brew and will stop logging data. You can use this when you are between brews.</span>"));

    var $buttons = $("<div class='beer-name-buttons'></div>");
    $buttons.append($("<button>Stop this brew</button>").button({	icons: {primary: "ui-icon-stop" } }).click(function(){
        $.post('socketmessage.php', {messageType: "stopLogging", message: ""}, function(reply){
            $backButton.show().unbind().bind({click: function(){beerNameDialogStop($body, $backButton);}});
            receiveControlSettings();
            beerNameDialogResult($body, $backButton, reply);
        });
    }));
    $backButton.show().unbind().bind({click: function(){beerNameDialogStart($body, $backButton);}});
    $body.append($buttons);
}

function beerNameDialogPause($body, $backButton){
    "use strict";
    $body.empty();
    $body.append($("<span  class='dialog-intro'>Clicking the button below will temporarily disable data logging for this brew. You can later continue logging data for the same brew.</span>"));

    var $buttons = $("<div class='beer-name-buttons'></div>");
    $buttons.append($("<button>Pause logging temporarily</button>").button({	icons: {primary: "ui-icon-pause" } }).click(function(){
        $.post('socketmessage.php', {messageType: "pauseLogging", message: ""}, function(reply){
            $backButton.show().unbind().bind({click: function(){beerNameDialogPause($body, $backButton);}});
            receiveControlSettings();
            beerNameDialogResult($body, $backButton, reply);
        });
    }));
    $backButton.show().unbind().bind({click: function(){beerNameDialogStart($body, $backButton);}});
    $body.append($buttons);
}

function beerNameDialogResume($body, $backButton){
    "use strict";
    $body.empty();
    $body.append($("<span  class='dialog-intro'>Clicking the button below will resume logging for your currently active brew.</span>"));

    var $buttons = $("<div class='beer-name-buttons'></div>");
    $buttons.append($("<button>Resume logging for current brew</button>").button({	icons: {primary: "ui-icon-pause" } }).click(function(){
        $.post('socketmessage.php', {messageType: "resumeLogging", message: ""}, function(reply){
            $backButton.show().unbind().bind({click: function(){beerNameDialogResume($body, $backButton);}});
            receiveControlSettings();
            beerNameDialogResult($body, $backButton, reply);
        });
    }));
    $backButton.show().unbind().bind({click: function(){beerNameDialogStart($body, $backButton);}});
    $body.append($buttons);
}

function beerNameDialogResult($body, $backButton, result){
    "use strict";
    $body.empty();
    if(result === ""){
        result = { status: 2, statusMessage: "Could not receive reply from script" };
    }
    else{
        result = $.parseJSON(result);
    }
    if(result.status === 0){
        $body.append($("<span  class='dialog-result-success'>Success!</span>"));
    }
    else{
        $body.append($("<span  class='dialog-result-error'>Error:</span>"));
    }
    $body.append($("<span  class='dialog-result-message'>" + result.statusMessage + "</span>"));
}

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
	refreshLcd(); //will call refreshLcd and alternate between the two
});

