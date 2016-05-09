/*
 * Temperature Profile Table
 * config is:
 * {
 *   tableClass: "<css class name for table>",
 *   theadClass: "<css class name for thead>",
 *   tbodyClass: "<css class name for tbody>",
 *   editable: true|false,
 *   startDateFieldSelector: "<css selector for start date field>",
 *   contextMenuCssClass: "<context menu class>",
 *   contextMenuDisplayHandler: "<context menu shown/hidden event handler>"
 * }
 */

/* global console */

function DateFormatter(config) {
    "use strict";
    if (arguments.length > 0 ) {
        this.init(config);
    }
}

DateFormatter.prototype = {
    init: function(config) {
        "use strict";
        this.config = (config || {});
        this.config.timeFormat = 'HH:mm:ss';
    },
    formatDate: function(theDate) {
        "use strict";
        var strDate = $.datepicker.formatDate(this.config.dateFormat, theDate);
        var strDate2 = $.datepicker.formatDate(this.config.dateFormatDisplay, theDate);
        var h = theDate.getHours();
        var m = theDate.getMinutes();
        var s = theDate.getSeconds();
        var strTime = ( (h<10) ? '0' + h : h ) + ':' + ( (m<10) ? '0' + m : m ) + ':' + ( (s<10) ? '0' + s : s );
        return { raw: strDate + 'T' + strTime, display: strDate2 + ' ' + strTime };
    },
    parseDate: function(strDate, forDisplay) {
        "use strict";
        var dateFormat = (forDisplay === true) ? this.config.dateFormatDisplay : this.config.dateFormat;
        try {
            return $.datepicker.parseDateTime(dateFormat, this.config.timeFormat, strDate, null, {separator: "T"});
        } catch(e) {
            console.log('Cannot parse date: ' + strDate );
            return null;
        }
    },
    parseDayString: function(input) {
        /* Parse a string like "1d2h3m" to a day representation */
        var day = 0;
        var hours = 0;
        var minutes = 0;
        var tmp;
        var foundit = false;
        /* Step 1: Split the string */
        if(input.search("d"))
        {
            // Day found, parse it
            tmp = parseInt (input.substr(0,input.search("d")));
            if (!isNaN(tmp))
            {
                day = tmp;
                foundit = true;
                input = input.substr(input.search("d")+1,input.length);
            }
        }
        if(input.search("h"))
        {
            // Day found, parse it
            tmp = parseInt (input.substr(0,input.search("h")));
            if (!isNaN(tmp))
            {
                hours = tmp;
                foundit = true;
                input = input.substr(input.search("h")+1,input.length);
            }
        }
        if(input.search("m"))
        {
            // Day found, parse it
            tmp = parseInt (input.substr(0,input.search("m")));
            if (!isNaN(tmp))
            {
                foundit = true;
                minutes = tmp;
            }
        }
        /* Step 2: Calculate a day worth value */
        if (!foundit)
        {
            return input;
        }
        var returnme = day + hours/24 + minutes/24/60;
        return returnme;
    } 
};

var dateFormatter = new DateFormatter({
    dateFormat: window.dateTimeFormat,
    dateFormatDisplay: window.dateTimeFormatDisplay
});