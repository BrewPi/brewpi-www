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

/* jshint jquery:true */
/* global reloadControlConstantsFromArduino, reloadControlSettingsFromArduino, reloadControlVariablesFromArduino,
          reloadControlSettings, reloadControlConstants, reloadControlVariables,
          receiveControlConstants, receiveControlSettings, receiveControlVariables,
          loadDefaultControlConstants, loadDefaultControlSettings */

$(document).ready(function(){
    "use strict";

    //Maintenance Panel
	$('#maintenance-panel').tabs()
	.dialog({
		autoOpen: false,
		title: 'Maintenance Panel',
		height: 850,
		width: 1000
	});

    // unhide after loading
    $("#maintenance-panel").css("visibility", "visible");

    $("button#maintenance").button({	icons: {primary: "ui-icon-newwin" } }).unbind('click').click(function(){
        $("#maintenance-panel").dialog("open");
    });

	$("button#apply-interval").button({	icons: {primary: "ui-icon-check" } }).unbind('click').click(function(){
		$.post('socketmessage.php', {messageType: "interval", message: String($("select#interval").val())});
	});

	$("button.apply-beer-name").button({	icons: {primary: "ui-icon-check" } }).unbind('click').click(function(){
		$.post('socketmessage.php', {messageType: "name", message: $("input#beer-name").val()});
	});

	$("button.apply-profile-key").button({	icons: {primary: "ui-icon-check" } }).unbind('click').click(function(){
		$.post('socketmessage.php', {messageType: "profileKey", message: $("input#profile-key").val()});
	});

	$("#advanced-settings").find(".send-button").button({	icons: {primary: "ui-icon-check" } }).unbind('click').click(function(){
		var jsonString;
        if($(this).parent().find("select").length){ // check for existance
			jsonString = "{\"" + $(this).parent().find("select").attr("name") +
                            "\":\"" + $(this).parent().find("select").val() + "\"}";
		}
		else if($(this).parent().find("input").length){ // check for existance
			jsonString = "{\"" + $(this).parent().find("input").attr("name") + "\":" + $(this).parent().find("input").val() + "}";
		}
		else{
			return;
		}
		$.post('socketmessage.php', {messageType: "setParameters", message: jsonString});
		if($(this).parent().find("select").attr("name") === "tempFormat"){
			// if temperature format is updated, reload all settings in new format and update fields
			reloadControlConstantsFromArduino();
			reloadControlSettingsFromArduino();
		}
	});

	$(".cc.receive-from-script").button({	icons: {primary: "ui-icon-arrowthickstop-1-s" } })
		.unbind('click').click(receiveControlConstants);

	$(".cc.update-from-arduino").button({	icons: {primary: "ui-icon-refresh" } })
		.unbind('click').click(reloadControlConstantsFromArduino);

	$(".cc.load-defaults").button({	icons: {primary: "ui-icon-trash" } })
		.unbind('click').click(loadDefaultControlConstants);

	$(".cs.receive-from-script").button({	icons: {primary: "ui-icon-arrowthickstop-1-s" } })
		.unbind('click').click(receiveControlSettings);

	$(".cs.update-from-arduino").button({	icons: {primary: "ui-icon-refresh" } })
		.unbind('click').click(reloadControlSettingsFromArduino);

	$(".cs.load-defaults").button({	icons: {primary: "ui-icon-trash" } })
		.unbind('click').click(loadDefaultControlSettings);

	$(".cv.receive-from-script").button({	icons: {primary: "ui-icon-arrowthickstop-1-s" } })
		.unbind('click').click(receiveControlVariables);

	$(".cv.update-from-arduino").button({	icons: {primary: "ui-icon-refresh" } })
		.unbind('click').click(reloadControlVariablesFromArduino);

    // create refresh button
    $("#refresh-logs").button({ icons: {primary: "ui-icon-refresh"}	}).unbind('click').click(function(){
        refreshLogs(1, 1);
    });

    $("button#auto-refresh-logs").button({ icons: {primary: "ui-icon-refresh"}	}).unbind('click').click(function(){
        startAutoRefreshLogs(5000, 1, 1, '#view-logs');
        if($(this).hasClass('ui-state-default')){
            $(this).removeClass("ui-state-default").addClass("ui-state-error");
            $(this).find('.ui-button-text').text('Disable auto-refresh');
        }
        else{
            $(this).removeClass("ui-state-error").addClass("ui-state-default");
            $(this).find('.ui-button-text').text('Enable auto-refresh');
        }
    });

    $("#erase-logs").button({ icons: {primary: "ui-icon-trash"}	}).unbind('click').click(function(){
        $.get('erase_logs.php');
        $('#maintenance-panel').tabs( "load" , 1);
    });

    $("input#program-submit-button").button({ icons: {primary: "ui-icon-arrowthickstop-1-n"}}).unbind('click').click(function(){
        startAutoRefreshLogs(2000, 1, 0, '#reprogram-arduino'); // autorefresh stderr as long as the tab remains open
        $("#program-stderr-header").text("Programming... keep an eye on the output below to see the progress.");
    });
});

function refreshLogs(refreshStdOut, refreshStdErr){
    "use strict";
    /* global stderr */
    $.get('getLogs.php?stdout=' + refreshStdOut.toString() + '&stderr=' + refreshStdErr.toString(),
        function(response){
            if(refreshStdErr){
                $('div.stderr').each(function(){
                    // get DOM element
                    var div = $(this)[0];
                    var scrolledDown = false;
                    // check if div is scrolled down
                    if(div.scrollTop === div.scrollHeight){
                        scrolledDown = true; // if already at bottom
                    }
                    var wasEmpty = false;
                    if($(this).text().length<40){
                        // div doesnt overflow
                        wasEmpty = true;
                    }

                    if(response.stderr){
                        $(this).html(response.stderr);
                    }
                    else{
                        $(this).html("");
                    }
                    if(scrolledDown || wasEmpty){
                        // scroll divs down to the last line after refresh
                        div.scrollTop = div.scrollHeight;
                    }
                });
            }
            if(refreshStdOut){
                $('div.stdout').each(function(){
                    // get DOM element
                    var div = $(this)[0];
                    var scrolledDown = false;
                    // check if div is scrolled down
                    if(div.scrollTop === div.scrollHeight){
                        scrolledDown = true; // if already at bottom
                    }
                    var wasEmpty = false;
                    if($(this).text().length<40){
                        // div doesnt overflow
                        wasEmpty = true;
                    }

                    if(response.stderr){
                        $(this).html(response.stderr);
                    }
                    else{
                        $(this).html("");
                    }
                    if(scrolledDown || wasEmpty){
                        // scroll divs down to the last line after refresh
                        div.scrollTop = div.scrollHeight;
                    }
                });
            }
        }
    );
}

var autoRefreshLogsInterval;
function startAutoRefreshLogs(refreshTime, refreshStdErr, refreshStdOut, tab){
    "use strict";
    if(typeof(window.autoRefreshLogsInterval)!=='undefined'){
        // Clear existing timers
        window.clearInterval(window.autoRefreshLogsInterval);
    }
    // refresh logs immediately
    refreshLogs(refreshStdErr,refreshStdOut);
    // set interval to start auto refreshing
    autoRefreshLogsInterval = window.setInterval(function(){ autoRefreshLogs(refreshStdErr, refreshStdOut, tab);}, refreshTime);
}

function autoRefreshLogs(refreshStdErr, refreshStdOut, tab){
    "use strict";
    if($(tab).hasClass('ui-tabs-hide')){
        // clear interval when switched to a different tab
        window.clearInterval(autoRefreshLogsInterval);
        // reset button on view logs tab
        $('button#auto-refresh-logs').removeClass("ui-state-error").addClass("ui-state-default")
                                     .find('.ui-button-text').text('Enable auto-refresh');
    }
    else{
        refreshLogs(refreshStdOut, refreshStdErr); // refresh log
    }
}

// Functions that are called in the programArduino.php file:

function programmingError(string){
    "use strict";
    window.alert(string);
}

function programmingDone(){
    "use strict";
    $("#program-stderr-header").text("Programming done!");
}

function programmingFailed(){
    "use strict";
    $("#program-stderr-header").text("Something went wrong! Please check the log for details!");
}

