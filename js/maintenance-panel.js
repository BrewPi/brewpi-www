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

    $("button#maintenance").button({	icons: {primary: "ui-icon-newwin" } }).click(function(){
        $("#maintenance-panel").dialog("open");
    });

	$("button#apply-interval").button({	icons: {primary: "ui-icon-check" } }).click(function(){
		$.post('socketmessage.php', {messageType: "interval", message: String($("select#interval").val())});
	});

	$("button.apply-beer-name").button({	icons: {primary: "ui-icon-check" } }).click(function(){
		$.post('socketmessage.php', {messageType: "name", message: $("input#beer-name").val()});
	});

	$("button.apply-profile-key").button({	icons: {primary: "ui-icon-check" } }).click(function(){
		$.post('socketmessage.php', {messageType: "profileKey", message: $("input#profile-key").val()});
	});

	$("#advanced-settings .send-button").button({	icons: {primary: "ui-icon-check" } }).click(function(){
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
		.click(receiveControlConstants);

	$(".cc.update-from-arduino").button({	icons: {primary: "ui-icon-refresh" } })
		.click(reloadControlConstantsFromArduino);

	$(".cc.load-defaults").button({	icons: {primary: "ui-icon-trash" } })
		.click(loadDefaultControlConstants);

	$(".cs.receive-from-script").button({	icons: {primary: "ui-icon-arrowthickstop-1-s" } })
		.click(receiveControlSettings);

	$(".cs.update-from-arduino").button({	icons: {primary: "ui-icon-refresh" } })
		.click(reloadControlSettingsFromArduino);

	$(".cs.load-defaults").button({	icons: {primary: "ui-icon-trash" } })
		.click(loadDefaultControlSettings);

	$(".cv.receive-from-script").button({	icons: {primary: "ui-icon-arrowthickstop-1-s" } })
		.click(receiveControlVariables);

	$(".cv.update-from-arduino").button({	icons: {primary: "ui-icon-refresh" } })
		.click(reloadControlVariablesFromArduino);

        // create refresh button
    $("#refresh-logs").button({ icons: {primary: "ui-icon-refresh"}	}).click(function(){
        refreshLogs(1, 1);
    });
    $("#erase-logs").button({ icons: {primary: "ui-icon-trash"}	}).click(function(){
        $.get('erase_logs.php');
        $('#maintenance-panel').tabs( "load" , 1);
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
