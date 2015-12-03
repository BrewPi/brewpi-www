/* global console, alert, Spinner */

function initDeviceConfiguration(){
    "use strict";
    $(".refresh-device-list").button({icons: {primary: "ui-icon-refresh" } }).click(refreshDeviceList);
}

var deviceListTimeout = 0;
var deviceListTimeoutCounter = 0;
var deviceListSpinner;
var deviceList = {};
var pinList = {};
var deviceListMaxRequests = 20;
var deviceListRequestTime = 1000;

function getDeviceList(){
    "use strict";
    $.ajax({
        type: 'POST',
        url: 'socketmessage.php',
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
                        console.log("Parsing installed devices: " + parseDeviceList(deviceList.installed, pinList));
                    }
                    $deviceList.append("<span class='device-list-header'>Detected devices</span>");
                    if(deviceList.available.length === 0){
                        $deviceConsole.append("No available devices found<br>");
                        $('.device-list').append("<span class='device-list-empty-text'>No additional devices found</span>");
                    }
                    else{
                        $deviceConsole.append("Parsing available devices<br>");
                        console.log("Parsing available devices: " + parseDeviceList(deviceList.available, pinList));
                    }
                    // add new device button to device list container if it does not exist already
                    if($("button.add-new-device").length < 1){
                        $('.device-list-container').append("<button class='add-new-device'>Add new device</button>");
                            $("button.add-new-device").button({	icons: {primary: "ui-icon-refresh" } })
                                .click(addNewDevice);
                    }

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
            // scroll box down
            var deviceConsole = document.getElementById('device-console');
            deviceConsole.scrollTop = deviceConsole.scrollHeight;
        },
        async:true
    });
}

function refreshDeviceList(){
    "use strict";
    if(deviceListTimeout){
        clearTimeout(deviceListTimeout); // clear old timeout
    }
    if(deviceListSpinner !== undefined){
        deviceListSpinner.stop();
    }

    var parameters = "";
    if ($('#read-values').is(":checked")){
        parameters = "readValues";
    }
    var spinnerOpts = {};
    deviceListSpinner = new Spinner(spinnerOpts).spin();
    $(".device-list-container .spinner-position").append(deviceListSpinner.el);

    $.post('socketmessage.php', {messageType: "refreshDeviceList", message: parameters});

    // try max 10 times, 5000ms apart to see if it the controller has responded with an updated list
    deviceListTimeoutCounter = deviceListMaxRequests;
    deviceListTimeout = setTimeout(getDeviceList, deviceListRequestTime);
}

function addNewDevice(){
    "use strict";
    var device = {'c': 0, 'b': 0, 'd': 0, 'f': 0, 'i': -1, 'h': 1, 'p': -1, 't': 0, 'x': 0, 'nr':$("div.device-list div.device-container").length};
    addDeviceToDeviceList(device, pinList,true);
    //refreshDeviceList();
    console.log(deviceList);
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
        addDeviceToDeviceList(device, pinList);
    }
    return output;
}

function addDeviceToDeviceList(device, pinList, addManual){
    "use strict";
    // addManual is an optional argument that makes pin and function fully selectable (except onewire)
    if(typeof(addManual) ==='undefined'){
        addManual = false;
    }
    else{
        addManual = true;
    }

    var $newDevice = $("<div class='device-container' id='device-" + device.nr.toString() + "'></div>");
    // add the device to the device list div
    $newDevice.appendTo(".device-list");

    var $nameAndApply = $("<div class= device-name-and-apply></div>");
    $nameAndApply.appendTo($newDevice);

    // add device name
    $("<span class='device-name'>Device " + device.nr.toString() +"</span>").appendTo($nameAndApply);

    // add apply button
    var $applyButton = $("<button class='apply'>Apply</button>");
    $applyButton.appendTo($nameAndApply);
    $applyButton.button({icons: {primary: "ui-icon-check" } });
    $applyButton.click(function(){
        applyDeviceSettings(device.nr);
    });

    // add actuator control buttons buttons
    if(device.t == 5) // manual actuator
    {
        if (device.h == 4){ // DS2408, used for values
            var $valveOpenButton = $("<button class='apply'>Open</button>");
            $valveOpenButton.appendTo($nameAndApply);
            $valveOpenButton.button({icons: {primary: "ui-icon-arrowthick-2-e-w"}});
            $valveOpenButton.click(function () {
                $.post('socketmessage.php', {
                    messageType: String("writeDevice"),
                    message: String('{"i": ' + device.i.toString() + ',"w":1}')
                });
            });

            var $valveCloseButton = $("<button class='apply'>Close</button>");
            $valveCloseButton.appendTo($nameAndApply);
            $valveCloseButton.button({icons: {primary: "ui-icon-arrowthickstop-1-e"}});
            $valveCloseButton.click(function () {
                $.post('socketmessage.php', {
                    messageType: String("writeDevice"),
                    message: String('{"i": ' + device.i.toString() + ',"w":2}')
                });
            });
        }
        if (device.h == 1 || device.h == 3){ // digital pin or DS2413
            var $onButton = $("<button class='apply'>ON</button>");
            $onButton.appendTo($nameAndApply);
            $onButton.button({icons: {primary: "ui-icon-radio-on"}});
            $onButton.click(function () {
                $.post('socketmessage.php', {
                    messageType: String("writeDevice"),
                    message: String('{"i": ' + device.i.toString() + ',"w":1}')
                });
            });

            var $offButton = $("<button class='apply'>OFF</button>");
            $offButton.appendTo($nameAndApply);
            $offButton.button({icons: {primary: "ui-icon-radio-off"}});
            $offButton.click(function () {
                $.post('socketmessage.php', {
                    messageType: String("writeDevice"),
                    message: String('{"i": ' + device.i.toString() + ',"w":0}')
                });
            });
        }
    }


    var $settings = $("<div class='device-all-settings'><div>");
    $settings.appendTo($newDevice);

    if((typeof device.i !== "undefined") ){
        $settings.append(generateDeviceSettingContainer(
            "Device slot",
            "device-slot",
            generateSelect(getDeviceSlotList(), device.i)));
    }
    if((typeof device.c !== "undefined") ){
        $settings.append(generateDeviceSettingContainer(
            "Assigned to",
            "chamber",
            generateSelect(getDeviceChamberList(), device.c)));
    }
    if((typeof device.b !== "undefined") ){
        $settings.append(generateDeviceSettingContainer(
            "Assigned to",
            "beer",
            generateSelect(getDeviceBeerList(), device.b)));
    }

    if((typeof device.h !== "undefined") ){
        $settings.append(generateDeviceSettingContainer(
            "Hardware type",
            "hardware-type",
            spanFromListVal(getDeviceHwTypeList(), device.h, 'hardware-type')));
    }
    if((typeof device.t !== "undefined") ){
        $settings.append(generateDeviceSettingContainer(
            "Device type",
            "device-type",
            spanFromListVal(getDeviceTypeList(), device.t, 'device-type')));
    }
    if((typeof device.x !== "undefined") ){
        $settings.append(generateDeviceSettingContainer(
            "Pin type",
            "pin-type",
            generateSelect([{ val: 0, text: 'not inverted'}, {val: 1, text: 'inverted'}], device.x)));
    }

    if((typeof device.a !== "undefined") ){
        var address = device.a;
        if(parseInt(address,10) === 0){
            // device is configured as first device on bus. Address is 16 zeros.
            address = "First on bus";
        }
        $settings.append(generateDeviceSettingContainer(
            "OneWire Address",
            "onewire-address",
            "<span class='onewire-address device-setting'>" + address + "</span>"));
    }

    var pinSpec;
    if(addManual){
        pinSpec = {'val':-1, 'type':'free'};
        $settings.append( generateDeviceSettingContainer(
            "Controller Pin",
            "controller-pin",
            generateSelect(getLimitedPinList(pinList, ['free']))));
    }
    else{
        if((typeof device.p !== "undefined") ){
        pinSpec = findPinInList(pinList, device.p);
        if(pinSpec !== -1){ // if pin exists in pin list
            $settings.append( generateDeviceSettingContainer(
                "Controller Pin",
                "controller-pin",
                spanFromListVal(pinList, device.p, 'controller-pin')));
            }
        }
        else{
            $settings.append( generateDeviceSettingContainer(
                "Controller Pin",
                "controller-pin",
                $("<span>Unknown pin" + device.p + "</span>")));
        }
    }

    if((typeof device.f !== "undefined") ){
        $settings.append(generateDeviceSettingContainer(
            "Function",
            "function",
            generateSelect(getLimitedFunctionList(pinSpec.type, device.h), device.f)));
    }

    if((typeof device.n !== "undefined") ){
        $settings.append(generateDeviceSettingContainer(
            "Output",
            "output-nr",
            generateSelect([{ val: 0, text: 'Output A'}, {val: 1, text: 'Output B'}], device.n)));
    }
    if((typeof device.v !== "undefined") ){
        var value = device.v;
        if(parseInt(device.t, 10) === 3){
            // Device type is switch actuator
            if(value === 0){
                value = "Inactive";
            }
            else if(value ===1){
                value = "Active";
            }
        }
        if(parseInt(device.t, 10) === 5){
            // Device type is valve/switch actuator
            if(value === 0){
                value = "Inactive";
            }
            else if(value ===1){
                value = "Active";
            }
        }
        if(parseInt(value,10)===-64){
            value = "Disconnected";
        }
        $settings.append(generateDeviceSettingContainer(
            "Value",
            "device-value",
            "<span class='device-value device-setting'>" + value + "</span>"));
    }
}

function findPinInList(pinList, pinNr){
    "use strict";
    for (var i=0; i<pinList.length; i++) {
        if(pinList[i].val === pinNr){
            return pinList[i];
        }
    }
    return -1;
}

function pinTypeToFunctionList(pinType, hwType){
    "use strict";
    var functionList=[];
    var actFunctions = [2, 3, 4, 7, 8];

    switch(pinType){
        case 'act':
            functionList = actFunctions; // all actuator functions
            break;
        case 'free':
            functionList = [1, 2, 3, 4, 7, 8]; // all actuator functions + door
            break;
        case 'onewire':
            if (hwType==2)
                functionList = [5, 6, 9];
            else if (hwType == 3)
                functionList = actFunctions;    // ds2413 actuator
            else if (hwType==4)
                functionList = [8]; // ds2408 actuator
            break;
        case 'door':
            functionList = [1, 2, 3, 4, 7, 8]; // all actuator functions + door
            break;
    }
    return functionList;
}


function functionToPinTypes(functionType){
    "use strict";
    var pinTypes;
    switch(functionType){
        case 0: // none
        case 8: // Manual actuator
            pinTypes = ['free', 'act', 'onewire', 'door'];
            break;
        case 1: // door
            pinTypes = ['free', 'door'];
            break;
        case 2: // heat
        case 3: // cool
        case 4: // light
        case 7: // fan
            pinTypes = ['free', 'door', 'act'];
            break;
        case 5: // chamber temp
        case 6: // room temp
        case 9: // beer temp
            pinTypes = ['onewire'];
            break;

        default: // unknown function
            pinTypes = [];
            break;
    }
    return pinTypes;
}

function getDeviceFunctionList(){
    "use strict";
    // currently unsupported/unused devices commented out
    return [
        {val : 0, text: 'None'},
        {val : 1, text: 'Chamber Door'},
        {val : 2, text: 'Chamber Heater'},
        {val : 3, text: 'Chamber Cooler'},
        {val : 4, text: 'Chamber Light'},
        {val : 5, text: 'Chamber Temp'},
        {val : 6, text: 'Room Temp'},
        {val : 7, text: 'Chamber Fan'},
        {val : 8, text: 'Manual Actuator'},
        {val : 9, text: 'Beer Temp'}/*,
         {val : 10, text: 'Beer Temperature 2'},
         {val : 11, text: 'Beer Heater'},
         {val : 12, text: 'Beer Cooler'},
         {val : 13, text: 'Beer S.G.'},
         {val : 14, text: 'Beer Reserved 1'},
         {val : 15, text: 'Beer Reserved 2'}  */
    ];
}

function getLimitedFunctionList(pinType, hwType){
    "use strict";
    var fullFunctionList = getDeviceFunctionList();
    var limitedFunctionList = pinTypeToFunctionList(pinType, hwType);
    var list = [fullFunctionList[0]]; // always add 'None'
    for (var i=0; i<fullFunctionList.length; i++) {
        if(-1 !== $.inArray(fullFunctionList[i].val, limitedFunctionList)){
            list.push(fullFunctionList[i]);
        }
    }
    return list;
}

function getDeviceHwTypeList(){
    "use strict";
    // currently unsupported/unused devices commented out
    return [
        {val : 0, text: 'None'},
        {val : 1, text: 'Digital Pin'},
        {val : 2, text: 'Temp Sensor'},
        {val : 3, text: 'DS2413'},
        {val : 4, text: 'DS2408/Valve'},
    ];
}

function getDeviceTypeList() {
    "use strict";
    // currently unsupported/unused devices commented out
    return [
        {val: 0, text: 'None'},
        {val: 1, text: 'Temp Sensor'},
        {val: 2, text: 'Switch Sensor'},
        {val: 3, text: 'Switch Actuator'},
        {val: 4, text: 'PWM Actuator'},
        {val: 5, text: 'Manual Actuator'}
    ];
}

function getLimitedPinList(pinList, pinTypes){
    "use strict";
    var list = [ {val: 0, text: 'Unassigned'}];
    for (var i=0; i<pinList.length; i++) {
        if(-1 !== $.inArray(pinList[i].type, pinTypes)){
            list.push({val: pinList[i].val, text: pinList[i].text.toString()});
        }
    }
    return list;
}

function getDeviceSlotList(){
    "use strict";
    var maxDevices = 25;
    var list = [ {val: -1, text: 'Unassigned'}];
    for(var i = 0; i <= maxDevices; i++){
        list.push({val: i, text: i.toString()});
    }
    return list;
}

function getDeviceChamberList(){
    "use strict";
    var maxChambers = 1;
    var list = [ {val: 0, text: 'Unassigned'}];
    for(var i = 1; i <= maxChambers; i++){
        list.push({val: i, text: "Chamber " + i.toString()});
    }
    return list;
}

function getDeviceBeerList(){
    "use strict";
    var maxBeers = 1;
    var list = [ {val: 0, text: 'Chamber device'}];
    for(var i = 1; i <= maxBeers; i++){
        list.push({val: i, text: "Beer " + i.toString()});
    }
    return list;
}
/*
function getDeviceCalibrateList(){
    "use strict";
    var minCalibrate = 1;
    var list = [ {val: 0, text: 'Chamber device'}];
    for(var i = 1; i <= maxBeers; i++){
        list.push({val: i, text: i.toString()});
    }
    return list;
} */

function generateSelect(list, selected){
    "use strict";
    var sel = $('<select>');
    $(list).each(function() {
        sel.append($("<option>").attr('value',this.val).text(this.text));
    });
    sel.val(selected);
    sel.addClass("device-setting");
    return sel;
}

function spanFromListVal(list, val, className){
    "use strict";
    var spanText = "undefined";
    for(var i = 0; i < list.length; i++){
        if(list[i].val === val)         {
            spanText = list[i].text;
        }
    }
    return $("<span class='" + className + " device-setting'>" + spanText + "</span>");
}

function valFromListText(list, text){
    "use strict";
    var val=-1;
    for(var i = 0; i < list.length; i++){
        if(list[i].text === text)         {
            val = list[i].val;
        }
    }
    return val;
}

function generateDeviceSettingContainer(name, className, content){
    "use strict";
    var $settingContainer = $("<div class='device-setting-container'/>");
    $settingContainer.append("<span class='setting-name'>" + name + "</span>");
    $settingContainer.append(content);
    $settingContainer.addClass(className);
    return $settingContainer;
}

function applyDeviceSettings(deviceNr){
    "use strict";
    var configString = getDeviceConfigString(deviceNr);

    $.post('socketmessage.php', {messageType: "applyDevice", message: configString});

    $("#device-console").find("span").append("Device config command sent, U:" + configString + "<br>");
}

function getDeviceConfigString(deviceNr){
    "use strict";
    var configString =  "{";
    var $deviceContainer = $("#device-" + deviceNr.toString());

    configString = addToConfigString(configString,"i", $deviceContainer.find(".device-slot select").val());
    configString = addToConfigString(configString,"c", $deviceContainer.find(".chamber select").val());
    configString = addToConfigString(configString,"b", $deviceContainer.find(".beer select").val());
    configString = addToConfigString(configString,"f", $deviceContainer.find(".function select").val());
    configString = addToConfigString(configString,"h", valFromListText(getDeviceHwTypeList(),$deviceContainer.find("span.hardware-type").text()));

    var $pinSpan = $deviceContainer.find("span.controller-pin"); // pre-defined devices have a span
    var $pinSelect = $deviceContainer.find(".controller-pin select"); // new devices have a select
    if($pinSpan.length){
        configString = addToConfigString(configString,"p", valFromListText(pinList,$pinSpan.text()));
    }
    else if($pinSelect.length){
        configString = addToConfigString(configString,"p", $pinSelect.val());
    }
    configString = addToConfigString(configString,"x", $deviceContainer.find(".pin-type select").val());
    configString = addToConfigString(configString,"a", $deviceContainer.find("span.onewire-address").text());
    configString = addToConfigString(configString,"n", $deviceContainer.find(".output-nr select").val());

    //configString = addToConfigString(configString,"d", 0); // hardwire deactivate for now
    //configString = addToConfigString(configString,"j", 0); // hardwire calibration for now

    configString += "}";
    return configString;
}

function addToConfigString(configString, key, value){
    "use strict";
    if(value !== undefined && value !== ""){
        if(configString !== "{"){
            configString += ",";
        }

        configString += "\"" + key + "\"" + ":" + "\"" + value + "\"";
    }
    return configString;
}

$(document).ready(function(){
    "use strict";

    initDeviceConfiguration();
});
