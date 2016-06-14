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

$(document).ready(function(){
	"use strict";
	refreshLcd(); //will call refreshLcd and alternate between the two
});

