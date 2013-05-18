
function initDeviceConfiguration(){
    "use strict";
    $(".refresh-device-list").button({icons: {primary: "ui-icon-refresh" } })
        .click(refreshDeviceList);
    $(".get-device-list").button({icons: {primary: "ui-icon-arrowthickstop-1-s" } })
        .click(getDeviceList);
}

function getDeviceList(){
    "use strict";
    $.post('socketmessage.php', {messageType: "getDeviceList", message: ""}, function(response){
        try
        {
            response = response.replace(/\s/g, ''); //strip all whitespace, including newline.
            var deviceList = JSON.parse(response);
            $("#device-console span").html(parseDeviceList(deviceList));
        }
        catch(e)
        {
            $("#device-console span").html("Cannot parse JSON:" + e);
        }
    });
}

function refreshDeviceList(){
    "use strict";
    var parameters = "";
    if ($('#read-values').is(":checked")){
        parameters += "v:1";
    }
    if ($('#only-unassigned').is(":checked")){
        parameters += "u:1";
    }

    $.post('socketmessage.php', {messageType: "refreshDeviceList", message: parameters});
}


function parseDeviceList(deviceList){
    "use strict";
    // output is just for testing now
    var output = "";

    for (var i = 0; i < deviceList.length; i++) {
        var device = deviceList[i];
        device.nr = i;
        output += "Parsing device: ";
        output += JSON.stringify(device);
        output += '<br>';
        addDeviceToDeviceList(device);
    }
    return output;
}

function addDeviceToDeviceList(device){
    "use strict";
    var $newDevice = $("<div class='device-container' id='device-" + device.nr.toString() + "'></div>");
    $newDevice.append("<span class='device-name'>Device " + device.nr.toString() +"</span>");
    /*$newDevice.append("<div class='device-function'> Function "+ device.f.toString() + "</div>");*/
    $newDevice.append(generateSelect(getDeviceChamberList(), device.c));
    $newDevice.append(generateSelect(getDeviceBeerList(), device.b));
    $newDevice.append(generateSelect(getDeviceSlotList(), device.i));
    $newDevice.append(generateSelect(getDeviceFunctionList(), device.f));
    $newDevice.append(generateSelect(getDeviceHwTypeList(), device.h));
    $newDevice.append(generateSelect(getDeviceTypeList(), device.t));
    $newDevice.append(generateSelect(getDevicePinList(), device.p));
    $newDevice.append(generateSelect([{ val: 0, text: 'not inverted'}, {val: 1, text: 'inverted'}], device.x));
    if((typeof device.a !== "undefined") ){
        $newDevice.append("<span class='onewire-address'>" + device.a + "</span>");
    }
    if((typeof device.n !== "undefined") ){
        $newDevice.append(generateSelect([{ val: 0, text: 'pin 0'}, {val: 1, text: 'pin 1'}], device.x));
    }
    if((typeof device.v !== "undefined") ){
        $newDevice.append("<span class='device-value'>" + device.v + "</span>");
    }
    // add the device to the device list div
    $newDevice.appendTo(".device-list");
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
        {val : 6, text: 'Ambient Temp'},
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

function getDevicePinList(){
    "use strict";
    // currently unsupported/unused devices commented out
    var list = [
        {val : 0, text: '0'},
        {val : 1, text: '1'},
        {val : 2, text: '2'},
        {val : 3, text: '3'},
        {val : 4, text: '4'},
        {val : 5, text: '5'},
        {val : 6, text: '6'},
        {val : 7, text: '7'},
        {val : 8, text: '8'},
        {val : 9, text: '9'},
        {val : 10, text: '10'},
        {val : 11, text: '11'},
        {val : 12, text: '12'},
        {val : 13, text: '13'},
        // Analog pins for leonardo
        {val: 18, text: 'A0'},
        {val: 19, text: 'A1'},
        {val: 20, text: 'A2'},
        {val: 21, text: 'A3'},
        {val: 22, text: 'A4'},
        {val: 23, text: 'A5'}

        /* Standard TODO: automatically switch
        {val: 14 text: 'A0'},
        {val: 15 text: 'A1'},
        {val: 16 text: 'A2'},
        {val: 17 text: 'A3'},
        {val: 18 text: 'A4'},
        {val: 19 text: 'A5'},
        {val: 20 text: 'A6'},
        {val: 21 text: 'A7'}                  */

    ];
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
        list.push({val: i, text: i.toString()});
    }
    return list;
}

function getDeviceBeerList(){
    "use strict";
    var maxBeers = 1;
    var list = [ {val: 0, text: 'Chamber device'}];
    for(var i = 1; i <= maxBeers; i++){
        list.push({val: i, text: i.toString()});
    }
    return list;
}

function getDeviceCalibrateList(){
    "use strict";
    var minCalibrate = 1;
    var list = [ {val: 0, text: 'Chamber device'}];
    for(var i = 1; i <= maxBeers; i++){
        list.push({val: i, text: i.toString()});
    }
    return list;
}

function generateSelect(list, selected){
    "use strict";
    var sel = $('<select>');
    $(list).each(function() {
        sel.append($("<option>").attr('value',this.val).text(this.text));
    });
    sel.val(selected);
    return sel;
}


