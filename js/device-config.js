
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

function addNewDevice(){
    "use strict";
    var device = {'c': 0, 'b': 0, 'd': 0, 'f': 0, 'i': -1, 'h': 1, 'p': -1, 't': 0, 'x': 0, 'nr':$("div.device-list div.device-container").length};
    addDeviceToDeviceList(device, pinList,true);
    //refreshDeviceList();
    console.log(deviceList);
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
    if($("button.add-new-device").length<1){
        //if button not added yet, add it
        $('.device-list-container').append("<button class='add-new-device'>Add new device</button>");
        $("button.add-new-device").button({	icons: {primary: "ui-icon-refresh" } })
            .click(addNewDevice);
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

    if((typeof device.h !== "undefined") ){
        $newDevice.append(generateDeviceSettingContainer(
            "Hardware type",
            "hardware-type",
            spanFromListVal(getDeviceHwTypeList(), device.h, 'hardware-type')));
    }
    if((typeof device.t !== "undefined") ){
        $newDevice.append(generateDeviceSettingContainer(
            "Device type",
            "device-type",
            spanFromListVal(getDeviceTypeList(), device.t, 'device-type')));
    }
    if((typeof device.x !== "undefined") ){
        $newDevice.append(generateDeviceSettingContainer(
            "Pin type",
            "pin-type",
            generateSelect([{ val: 0, text: 'not inverted'}, {val: 1, text: 'inverted'}], device.x)));
    }

    if((typeof device.a !== "undefined") ){
        $newDevice.append(generateDeviceSettingContainer(
            "OneWire Address",
            "onewire-address",
            "<span class='onewire-address device-setting'>" + device.a + "</span>"));
    }

    var pinType, pinSpec;
    if(addManual){
        pinSpec = {'val':-1, 'type':'free'};
        $newDevice.append( generateDeviceSettingContainer(
            "Arduino Pin",
            "arduino-pin",
            generateSelect(getLimitedPinList(pinList, ['free']))));
    }
    else{
        if((typeof device.p !== "undefined") ){
               pinSpec = findPinInList(pinList, device.p);
               $newDevice.append( generateDeviceSettingContainer(
                "Arduino Pin",
                "arduino-pin",
                spanFromListVal(pinList, device.p, 'arduino-pin')));
        }
    }

    if((typeof device.f !== "undefined") ){
        $newDevice.append(generateDeviceSettingContainer(
            "Function",
            "function",
            generateSelect(getLimitedFunctionList(pinSpec.type), device.f)));
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

function findPinInList(pinList, pinNr){
    "use strict";
    for (var i=0; i<pinList.length; i++) {
        if(pinList[i].val === pinNr){
            return pinList[i];
        }
    }
}

function pinTypeToFunctionList(pinType){
    "use strict";
    var functionList=[];
    switch(pinType){
        case 'act':
            functionList = [2, 3, 4, 7]; // all actuator functions
            break;
        case 'free':
            functionList = [1, 2, 3, 4, 7]; // all actuator functions + door
            break;
        case 'onewire':
            functionList = [5, 6, 9];
            break;
        case 'door':
            functionList = [1, 2, 3, 4, 7]; // all actuator functions + door
            break;
    }
    return functionList;
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

function getLimitedFunctionList(pinType){
    "use strict";
    var fullFunctionList = getDeviceFunctionList();
    var limitedFunctionList = pinTypeToFunctionList(pinType);
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

function spanFromListVal(list, val, className){
    "use strict";
    var spanText = "undefined";
    for(var i = 0; i < list.length; i++){
        if(list[i].val === val)         {
            spanText = list[i].text;
        }
    }
    var $span = $("<span class='" + className + " device-setting'>" + spanText + "</span>");
    return $span;
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
    configString = addToConfigString(configString,"h", valFromListText(getDeviceHwTypeList(),$deviceContainer.find("span.hardware-type").text()));

    var $pinSpan = $deviceContainer.find("span.arduino-pin"); // pre-defined devices have a span
    var $pinSelect = $deviceContainer.find(".arduino-pin select"); // new devices have a select
    if($pinSpan.length){
        configString = addToConfigString(configString,"p", valFromListText(pinList,$pinSpan.text()));
    }
    else if($pinSelect.length){
        configString = addToConfigString(configString,"p", $pinSelect.val());
    }
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
