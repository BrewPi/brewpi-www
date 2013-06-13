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

$(document).ready(function(){
    "use strict";

    //Maintenance Panel
	$('#maintenance-panel')
	.dialog({
		autoOpen: false,
		title: 'Maintenance Panel',
		height: 850,
		width: 1000
	});

    $('#maintenance-panel').tabs();

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

	$("#advanced-settings .send-button").button({	icons: {primary: "ui-icon-check" } }).unbind('click').click(function(){
		var jsonString;
        if($(this).parent().children("select").length){ // check for existance
			jsonString = "{\"" + $(this).parent().children("select").attr("name") + "\":\"" + $(this).parent().children("select").val() + "\"}";
		}
		else if($(this).parent().children("input").length){ // check for existance
			jsonString = "{\"" + $(this).parent().children("input").attr("name") + "\":" + $(this).parent().children("input").val() + "}";
		}
		else{
			return;
		}
		$.post('socketmessage.php', {messageType: "setParameters", message: jsonString});
		if($(this).parent().children("select").attr("name") === "tempFormat"){
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
            return;
        }
        else{
            $(this).removeClass("ui-state-error").addClass("ui-state-default");
            $(this).find('.ui-button-text').text('Enable auto-refresh');
            return;
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
    $.get('getLogs.php?stdout=' + refreshStdOut.toString() + '&stderr=' + refreshStdErr.toString(),
        function(response){
            if(refreshStdErr){
                var $stderr = $('div.stderr').each(function(){
                    if(response.stderr){
                        $(this).html(response.stderr);
                    }
                    else{
                        $(this).html("");
                    }

                    // get DOM element
                    var div = $(this)[0];
                    // scroll divs down to the last line
                    div.scrollTop = div.scrollHeight;
                });
            }
            if(refreshStdOut){
                var $stdout = $('div.stdout').each(function(){
                    if(response.stdout){
                        $(this).html(response.stdout);
                    }
                    else{
                        $(this).html("");
                    }
                    // get DOM element
                    var div = $(this)[0];
                    // scroll divs down to the last line
                    div.scrollTop = div.scrollHeight;
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
        $('button#auto-refresh-logs').removeClass("ui-state-error").addClass("ui-state-default");
        $('button#auto-refresh-logs').find('.ui-button-text').text('Enable auto-refresh');
    }
    else{
        refreshLogs(refreshStdOut, refreshStdErr); // refresh log
    }
}

// Functions that are called in the programArduino.php file:

function programmingError(string){
    "use strict";
    alert(string);
}

function programmingDone(string){
    "use strict";
    $("#program-stderr-header").text("Programming done!");
}
