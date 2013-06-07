
function initDeviceConfiguration(){
    "use strict";
    $(".refresh-device-list").button({icons: {primary: "ui-icon-refresh" } })
        .click(refreshDeviceList);
    $(".get-device-list").button({icons: {primary: "ui-icon-arrowthickstop-1-s" } })
        .click(getDeviceList);
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
            if(response !== "{}"){
                try
                {
                    var deviceAndPinList = JSON.parse(response);
                    deviceList = deviceAndPinList.deviceList;
                    pinList = deviceAndPinList.pinList;
                    console.log(parseDeviceList(deviceList, pinList));
                    $("#device-console span").html("Device list updated for Arduino " +
                                                    deviceAndPinList.board + " with a " +
                                                    deviceAndPinList.shield + " shield");
                    deviceListTimeoutCounter = 0; // stop requesting on success
                    if(deviceListTimeout){
                       clearTimeout(deviceListTimeout); // clear old timeout
                    }
                    if(deviceListSpinner !== undefined){
                        deviceListSpinner.stop();
                    }
                }
                catch(e)
                {
                    $("#device-console span").html("Error while receiving device configuration: " + e);
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

function refreshDeviceList(){
    "use strict";
    if(deviceListTimeout){
        clearTimeout(deviceListTimeout); // clear old timeout
    }

    var parameters = "";
    if ($('#read-values').is(":checked")){
        parameters += "v:1";
    }
    if ($('#only-unassigned').is(":checked")){
        parameters += "u:1";
    }
    var spinnerOpts = {};
    deviceListSpinner = new Spinner(spinnerOpts).spin();
    $(".device-list-container .spinner-position").append(deviceListSpinner.el);

    $.post('socketmessage.php', {messageType: "refreshDeviceList", message: parameters});

    // try max 10 times, 5000ms apart to see if it the Arduino has responded with an updated list
    deviceListTimeoutCounter = deviceListMaxRequests;
    deviceListTimeout = setTimeout(getDeviceList, deviceListRequestTime);
    $(".device-list").empty();
}

function parseDeviceList(deviceList, pinList){
    "use strict";
    $(".device-list").empty();
    // output is just for testing now
    var output = "";
    for (var i = 0; i < deviceList.length; i++) {
        var device = deviceList[i];
        device.nr = i;
        output += "Parsing device: ";
        output += JSON.stringify(device);
        output += '<br>';
        addDeviceToDeviceList(device, pinList);
    }
    return output;
}

function addDeviceToDeviceList(device, pinList){
    "use strict";
    var $newDevice = $("<div class='device-container' id='device-" + device.nr.toString() + "'></div>");

    $newDevice.append("<span class='device-name'>Device " + device.nr.toString() +"</span>");
    /*$newDevice.append("<div class='device-function'> Function "+ device.f.toString() + "</div>");*/
    if((typeof device.i !== "undefined") ){
        $newDevice.append(generateDeviceSettingContainer(
            "Device slot",
            "device-slot",
            generateSelect(getDeviceSlotList(), device.i)));
    }
    if((typeof device.c !== "undefined") ){
        $newDevice.append(generateDeviceSettingContainer(
            "Assigned to",
            "chamber",
            generateSelect(getDeviceChamberList(), device.c)));
    }
    if((typeof device.b !== "undefined") ){
        $newDevice.append(generateDeviceSettingContainer(
            "Assigned to",
            "beer",
            generateSelect(getDeviceBeerList(), device.b)));
    }
    if((typeof device.f !== "undefined") ){
        $newDevice.append(generateDeviceSettingContainer(
            "Function",
            "function",
            generateSelect(getDeviceFunctionList(), device.f)));
    }
    if((typeof device.h !== "undefined") ){
        $newDevice.append(generateDeviceSettingContainer(
            "Hardware type",
            "hardware-type",
            generateSelect(getDeviceHwTypeList(), device.h)));
    }
    if((typeof device.t !== "undefined") ){
        $newDevice.append(generateDeviceSettingContainer(
            "Device type",
            "device-type",
            spanFromList(getDeviceTypeList(), device.t)));
    }
    if((typeof device.x !== "undefined") ){
        $newDevice.append(generateDeviceSettingContainer(
            "Pin type",
            "pin-type",
            generateSelect([{ val: 0, text: 'not inverted'}, {val: 1, text: 'inverted'}], device.x,"device-setting")));
    }
    if((typeof device.a !== "undefined") ){
        $newDevice.append(generateDeviceSettingContainer(
            "OneWire Address",
            "onewire-address",
            "<span class='onewire-address device-setting'>" + device.a + "</span>"));
    }
    if((typeof device.n !== "undefined") ){
        $newDevice.append(generateDeviceSettingContainer(
            "DS2413 pin",
            "ds2413-pin",
            generateSelect([{ val: 0, text: 'pin 0'}, {val: 1, text: 'pin 1'}], device.n, "device-setting")));
    }
    if((typeof device.v !== "undefined") ){
        $newDevice.append(generateDeviceSettingContainer(
            "Value",
            "device-value",
            "<span class='device-value device-setting'>" + device.v + "</span>"));
    }
    // Do pins last, because they depend on the device function
    var pinTypes;
    if((typeof device.p !== "undefined") ){
        if((typeof device.f !== "undefined") ){
            pinTypes = functionToPinTypes(device.f);
        }
        else{
            pinTypes = functionToPinTypes(0); // use device none
        }
        $newDevice.append( generateDeviceSettingContainer(
            "Arduino Pin",
            "arduino-pin",
            generateSelect(getDevicePinList(pinList, pinTypes), device.p)));
    }

    // add apply button
    var $applyButton = $("<button class='apply'>Apply</button>");
    $applyButton.button({icons: {primary: "ui-icon-check" } });
    $applyButton.appendTo($newDevice);
    // add the device to the device list div
    $newDevice.appendTo(".device-list");
    $applyButton.click(function(){
        applyDeviceSettings(device.nr);
    });
}

function functionToPinTypes(functionType){
    "use strict";
    var pinTypes;
    switch(functionType){
        case 0: // none
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
    var list = [
        {val : 0, text: 'None'},
        {val : 1, text: 'Chamber Door'},
        {val : 2, text: 'Chamber Heater'},
        {val : 3, text: 'Chamber Cooler'},
        {val : 4, text: 'Chamber Light'},
        {val : 5, text: 'Chamber Temp'},
        {val : 6, text: 'Room Temp'},
        {val : 7, text: 'Chamber Fan'},
        /*{val : 8, text: 'Chamber Reserved 1'},*/
        {val : 9, text: 'Beer Temp'}/*,
         {val : 10, text: 'Beer Temperature 2'},
         {val : 11, text: 'Beer Heater'},
         {val : 12, text: 'Beer Cooler'},
         {val : 13, text: 'Beer S.G.'},
         {val : 14, text: 'Beer Reserved 1'},
         {val : 15, text: 'Beer Reserved 2'}  */
    ];
    return list;
}

function getDeviceHwTypeList(){
    "use strict";
    // currently unsupported/unused devices commented out
    var list = [
        {val : 0, text: 'None'},
        {val : 1, text: 'Digital Pin'},
        {val : 2, text: 'Temp Sensor'},
        {val : 3, text: 'DS2413'}
    ];
    return list;
}

function getDeviceTypeList(){
    "use strict";
    // currently unsupported/unused devices commented out
    var list = [
        {val : 0, text: 'None'},
        {val : 1, text: 'Temp Sensor'},
        {val : 2, text: 'Switch Sensor'},
        {val : 3, text: 'Switch Actuator'}
    ];
    return list;
}

function getDevicePinList(pinList, pinTypes){
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
    var maxDevices = 15;
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
    return sel;
}

function spanFromList(list, selected){
    "use strict";
    var spanText = "undefined";
    if(list[selected] !== undefined){
        spanText = list[selected].text;
    }
    var $span = $("<span>" + spanText + "</span>");
    return $span;
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

    $("#device-console span").html("Config command sent, U:" + configString);
}

function getDeviceConfigString(deviceNr){
    "use strict";
    var configString =  "{";
    var $deviceContainer = $("#device-" + deviceNr.toString());

    configString = addToConfigString(configString,"i", $deviceContainer.find(".device-slot select").val());
    configString = addToConfigString(configString,"c", $deviceContainer.find(".chamber select").val());
    configString = addToConfigString(configString,"b", $deviceContainer.find(".beer select").val());
    configString = addToConfigString(configString,"f", $deviceContainer.find(".function select").val());
    configString = addToConfigString(configString,"h", $deviceContainer.find(".hardware-type select").val());
    configString = addToConfigString(configString,"p", $deviceContainer.find(".arduino-pin select").val());
    configString = addToConfigString(configString,"x", $deviceContainer.find(".pin-type select").val());
    configString = addToConfigString(configString,"a", $deviceContainer.find("span.onewire-address").text());
    configString = addToConfigString(configString,"h", $deviceContainer.find(".ds2431-pin select").val());
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
