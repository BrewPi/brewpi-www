<?php

if ($_REQUEST["job"] == "save")
{
	$beerProfile = 'data/herms.json';
	$contents = $_REQUEST["data"];
	
	if ( file_put_contents($beerProfile, $contents) ) {
	    $resp = array( "status" => "success", "message" => $beerProfile . " saved successfully");
	    echo json_encode($resp);
	} else {
	    echo json_encode( array( "status" => "error", "message" => "Error saving profile: $profile" ) );
	}
	die();
}

if ($_REQUEST["job"] == "get")
{
	$beerProfile = 'data/herms.json';
	if(!file_exists($beerProfile)){
		return;
	}
echo file_get_contents($beerProfile);
	die();
}


?>

<!DOCTYPE html >
<html>
	<head>
		<meta http-equiv="content-type" content="text/html; charset=utf-8" />
		<title>BrewPi HERMS tool page</title>
		<script type="text/javascript" src="js/jquery-1.11.0.min.js"></script>
<link type="text/css" href="css/redmond/jquery-ui-1.10.3.custom.css" rel="stylesheet" />
		<link type="text/css" href="css/style.css" rel="stylesheet"/>
		
		<!-- Load scripts after the body, so they don't block rendering of the page -->
		<!-- <script type="text/javascript" src="js/jquery-1.11.0.js"></script> -->
		<script type="text/javascript" src="js/jquery-ui-1.10.3.custom.min.js"></script>
		<script type="text/javascript" src="js/jquery-ui-timepicker-addon.js"></script>
		
		<script type="text/javascript">
		
		
		var deviceListTimeout = 0;
var deviceListTimeoutCounter = 0;
var deviceListSpinner;
var deviceList = {};
var pinList = {};
var deviceListMaxRequests = 25;
var deviceListRequestTime = 1000;

function getDeviceList(){
    "use strict";
    $.ajax({
        type: 'POST',
        url: 'http://192.168.1.37/socketmessage.php',
        data: {messageType: "getDeviceList", message: ""},
        success: function(response){
            response = response.replace(/\s/g, ''); //strip all whitespace, including newline.
            var deviceAndPinList;
            var $deviceList = $(".device-list");
            var $deviceConsole = $("#device-console").find("span");

            if(response.localeCompare("device-list-not-up-to-date") !== 0){
                $deviceConsole.find("span").append("<br>Updated device list received<br>");
                var jsonParsed = false;
                try
                {
                    deviceAndPinList = JSON.parse(response);
                    deviceAndPinList = deviceAndPinList.response;
                    deviceList = deviceAndPinList.deviceList;
                    pinList = deviceAndPinList.pinList;
                    jsonParsed = true;
                }
                catch(e)
                {
                    $("#device-console").find("span").append("Error while receiving device configuration: " + e + "<br>");
                }
                if(jsonParsed){
                    $deviceList.empty();
                    $deviceList.append("<span class='device-list-header'>Installed devices</span>");
                    if(deviceList.installed.length === 0){
                        $deviceConsole.append("No installed devices found<br>");
                        $deviceList.append("<span class='device-list-empty-text'>None</span>");
                    }
                    else{
                        $deviceConsole.append("Parsing installed devices<br>");
                        parseDeviceList(deviceList.installed, pinList);
                    }
                    $deviceList.append("<span class='device-list-header'>Detected devices</span>");
                    
                    // add new device button to device list container if it does not exist already
                    

                    $deviceConsole.append("Device list updated for " +
                        deviceAndPinList.board + " with a " +
                        deviceAndPinList.shield + " shield<br>");
                }
                deviceListTimeoutCounter = 0; // stop requesting on success
                if(deviceListTimeout){
                    clearTimeout(deviceListTimeout);
                }
                if(deviceListSpinner !== undefined){
                    deviceListSpinner.stop();
                }
            }
            else{
                if(deviceListTimeoutCounter > 0){
                    deviceListTimeoutCounter--;
                    deviceListTimeout = setTimeout(getDeviceList, deviceListRequestTime);
                }
            }
     
        },
        async:true
    });
}

function parseDeviceList(deviceList, pinList){
    "use strict";
    // output is just for testing now
    var output = "";
    var devicesInListAlready = $("div.device-list div.device-container").length;
    for (var i = 0; i < deviceList.length; i++) {
        var device = deviceList[i];
        device.nr = i+devicesInListAlready;
        output += "Parsing device: ";
        output += JSON.stringify(device);
        output += '<br>';
        //addDeviceToDeviceList(device, pinList);
		addToGrid(device);
		console.log(device);
    }
    return output;
}

function addToGrid(device)
{
	if (device.t == 5 && device.h == 4)
	{
		// Only get Manual Mode items, device.i needed to send status
		var $tmp = '<select id="valve_' + device.i + '" class="valveOperator"><option value="1">Open</option><option value="2">Close</option></select>';
		var $newItem = $('<span class="valve"><p>Valve: ' + device.i + '</p>' + $tmp + '</span>');
			$newItem.appendTo($('#valveArea'));
		
		
		
		/*var $valveOpenButton = $("<button class='apply'>Open</button>");
            $valveOpenButton.appendTo($newItem);
            $valveOpenButton.button({icons: {primary: "ui-icon-arrowthick-2-e-w"}});
            $valveOpenButton.click(function () {
                $.post('socketmessage.php', {
                    messageType: String("writeDevice"),
                    message: String('{"i": ' + device.i.toString() + ',"w":1}')
                });
            });

            var $valveCloseButton = $("<button class='apply'>Close</button>");
            $valveCloseButton.appendTo($newItem);
            $valveCloseButton.button({icons: {primary: "ui-icon-arrowthickstop-1-e"}});
            $valveCloseButton.click(function () {
                $.post('socketmessage.php', {
                    messageType: String("writeDevice"),
                    message: String('{"i": ' + device.i.toString() + ',"w":2}')
                });
            });*/
	}
}

function parseAvailSettings()
{
	var $tmp = {
		  "All open": { "11": "1", "12":"1","13":"1", "14": "1", "15":"1","16":"1","17": "1", "18":"1","19":"1","20": "1", "21":"1","22":"1"},
		  "All closed": { "11": "2", "12":"2","13":"2", "14": "2", "15":"2","16":"2","17": "2", "18":"2","19":"2","20": "2", "21":"2","22":"2"},
		  "Cold water fill HLT": { "11": "1", "12":"2","13":"2", "14": "2", "15":"2","16":"2","17": "2", "18":"2","19":"2","20": "2", "21":"2","22":"2"},
		  "Cold water fill BK": { "11": "2", "12":"1","13":"2", "14": "1", "15":"2","16":"1","17": "1", "18":"2","19":"2","20": "2", "21":"2","22":"2"},
		  "Heat HLT and BK": { "11": "1", "12":"2","13":"2", "14": "2", "15":"2","16":"2","17": "1", "18":"1","19":"1","20": "1", "21":"2","22":"2"},
		  "Mash In": { "11": "1", "12":"2","13":"2", "14": "1", "15":"1","16":"1","17": "2", "18":"1","19":"1","20": "1", "21":"2","22":"2"},
		  "Mash": { "11": "1", "12":"2","13":"1", "14": "1", "15":"1","16":"2","17": "2", "18":"2","19":"2","20": "2", "21":"1","22":"1"},
		  
		  "Sparge and Transfer": { "11": "2", "12":"1","13":"1", "14": "2", "15":"1","16":"1","17": "1", "18":"2","19":"2","20": "2", "21":"1","22":"1"},
		  
		  "Sparge Out": { "11": "2", "12":"2","13":"1", "14": "2", "15":"2","16":"1","17": "1", "18":"2","19":"2","20": "2", "21":"1","22":"1"},
		  
		  "Cooling": { "11": "2", "12":"2","13":"2", "14": "2", "15":"2","16":"2","17": "1", "18":"1","19":"1","20": "1", "21":"2","22":"2"},
		  
		  "To fermentor": { "11": "2", "12":"2","13":"2", "14": "2", "15":"2","16":"2","17": "2", "18":"2","19":"2","20": "1", "21":"2","22":"2"},
		  
		};
		

	
	// Remove all from valveSettings
	$('#valveSettings').empty();
	
	
	for (var prop in $tmp) {
        
		$('<option/>', {
			text: prop,
			value: 22,
			data: $tmp[prop]
		}).appendTo($('#valveSettings'));
    }
	
	//$('#valveSettings option:first-child').data()
	$('#valveSettings').on('change', function (e) {
		var optionSelected = $("option:selected", this);
		var valueSelected = this.value;
		settingToOptions(optionSelected.data());
});

	
	

}

function settingToOptions(setting)
{
	for (var device in setting)
	{
		// Search corresponding 
		$('select[id="valve_' + device + '"]').val(setting[device]);
		//$('#valve\\[' + device + '\\]').val(setting[device]);
	}
}

function executeSettings()
{
	
	$( ".valveOperator" ).each(function( index ) {
	  var deviceId = this.id.substr(6);
	  var optionSelected = $("option:selected", this);
	  sendToBrewPi(deviceId, optionSelected.val());
	});
}

function sendToBrewPi(deviceId, data)
{
	$.post('http://192.168.1.37/socketmessage.php', {
                    messageType: String("writeDevice"),
                    message: String('{"i": ' + deviceId.toString() + ',"w":' + data + '}')
                });
}


		</script>
	</head>
	<body>
	<div id="valveArea"></div>
	<div id="controlArea">
	<select id="valveSettings">
  <option value="1">Herms flow</option>
  <option value="2">Sparge</option>
</select>
<button id="sendSetting">Set to</button>
<button class="save">Save Setting</button></div>

<script>
$( document ).ready(function() {
    getDeviceList();
	parseAvailSettings();
	
	$('#sendSetting').click(function () {
                executeSettings();
            });
  });
</script>
	</body>
</html>

