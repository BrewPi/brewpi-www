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

function BeerProfileTable(id, config) {
    "use strict";
    if (arguments.length > 0 ) {
        this.init(id, config);
    }
}

function parseDayString(input)
{
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

BeerProfileTable.prototype = {
    init: function(id, config) {
        "use strict";
        this.id = id;
        this.profileName = '';
        this.config = (config || {});
        this.config.timeFormat = 'HH:mm:ss';
        this.selector = '#' + this.id;
        this.menuId = this.id + 'Menu';
        this.menuSelector = '#' + this.menuId;
        this.bodySelector = this.selector + ' tbody';
        this.headSelector = this.selector + ' thead';
        this.footSelector = this.selector + ' tfoot';
        this.rowsSelector = this.bodySelector + ' tr';
        this.newTable = '<table border="0"><thead></thead><tbody></tbody><tfoot></tfoot></table>';
        this.newRow = '<tr></tr>';
        this.newCell = '<td></td>';
        this.newHeadCell = '<th></th>';
        this.numMilliSecondsPerDay = 24 * 60 * 60 * 1000;
        this.headerTitles = ['Day', 'Temperature', 'Date and Time'];
        this.csvColumns = ['date', 'temperature', 'days'];
        this.prepTable();
    },
    prepTable: function() {
        "use strict";
        var table = $(this.newTable).attr('class', this.config.tableClass);
        $(this.selector).append(table);
        $(this.headSelector).addClass(this.config.theadClass);
        $(this.bodySelector).addClass(this.config.tbodyClass);
    },
    render: function(data) {
        "use strict";
        this.profileName = data.name;
        this.renderHeader();
        this.renderRows(data.profile);
        this.renderFooter();
        // start date inferred from first data row, if not present (empty profile), use current date/time
        var initialDate = this.parseStartDate(data.profile);
        this.updateDisplay( initialDate );
    },
    renderHeader: function() {
        "use strict";
        if($(this.headSelector + " th").length > 0){
            return; // header already rendered
        }
        var headerRow = $(this.newRow);
        $(this.headSelector).append(headerRow);
        var cell = $(this.newHeadCell).text(this.headerTitles[0]);
        headerRow.append(cell);
        cell = $(this.newHeadCell).text(this.headerTitles[1]);
        headerRow.append(cell);
        cell = $(this.newHeadCell).text(this.headerTitles[2]);
        headerRow.append(cell);
    },
    renderRows: function(rows) {
        "use strict";
        this.clearRows();
        for( var i=0; i<rows.length; i++ ) {
            this.renderRow( rows[i] );
        }
        if ( this.config.editable ) {
            this.addRow();
        }
    },
    renderRow: function(rowData) {
        "use strict";
        var newRow = this.createRow(rowData.days, rowData.temperature, rowData.date);
        $(this.bodySelector).append(newRow);
    },
    renderFooter: function() {
    },
    addRow: function() {
        "use strict";
        var $newRow = this.createRow();
        $(this.bodySelector).append($newRow);
    },
    insertRow: function(index, afterOrBefore) {
        "use strict";
        var row = this.createRow();
        if ( afterOrBefore ) {
            $(this.rowsSelector).eq(index).after(row);
        } else {
            $(this.rowsSelector).eq(index).before(row);
        }
        this.updateDisplay();
        row.find('td.profileDays').focus();
    },
    insertRowNow: function() {
        "use strict";
        var nowTime = new Date().getTime();
        var timeDiff = nowTime - this.getStartDate().getTime();
        var days = (timeDiff / this.numMilliSecondsPerDay).toFixed(2);
        var rows = this.getProfileData();
        var rowIndex = rows.length - 1;
        var temperature = '';
        for( var i=0; i<rows.length; i++ ) {
            if ( parseFloat(rows[i].days) > parseFloat(days)) {
                rowIndex = i-1;
                break;
            }
        }
        if( rowIndex + 1  < rows.length ){
            var previousTemperature = parseFloat(rows[rowIndex].temperature);
            var nextTemperature = parseFloat(rows[rowIndex+1].temperature);
            var previousDays = parseFloat(rows[rowIndex].days);
            var nextDays = parseFloat(rows[rowIndex+1].days);
            temperature = (previousTemperature + (nextTemperature - previousTemperature)*(days-previousDays)/(nextDays-previousDays)).toFixed(2);
        }
        var row = this.createRow(days, temperature);

        $(this.rowsSelector).eq(rowIndex).after(row);
        this.updateDisplay();
        row.find('td.profileTemp').focus();
    },
    deleteRow: function(index) {
        "use strict";
        $(this.rowsSelector).eq(index).remove();
        var me = this;
        this.updateDisplay();
    },
    createRow: function(days, temp, theDate) {
        "use strict";
        var $newRow = $(this.newRow);
        var cell = $(this.newCell).addClass('profileDays').html( (days || '') );
        this.attachCellHandlers(cell, true); // attach selectAll and blur
        $newRow.append(cell);
        cell = $(this.newCell).addClass('profileTemp').html( (temp || '') );
        this.attachCellHandlers(cell, false); // attach just selectAll
        $newRow.append(cell);
        cell = $(this.newCell).addClass('profileDate').html( (theDate || '') );
        $newRow.append(cell);
        this.attachRowHandlers($newRow);
        return $newRow;
    },
    attachRowHandlers: function($row) {
        "use strict";
        $row.bind( "click", function() {
            $(this).addClass("selected").siblings().removeClass("selected");
        });
        var me = this;
        if (this.config.editable) {
            $row.bind("contextmenu",function(e) {
                $(this).addClass("selected").siblings().removeClass("selected");
                var selectedIndex = $(this).data('rowIndex');
                var newMenu = me.createContextMenu(selectedIndex);
                $(me.selector).append(newMenu);
                me.positionMenu(e, newMenu);
                newMenu.show();
                if ( me.config.contextMenuDisplayHandler !== null ) {
                    me.config.contextMenuDisplayHandler(true);
                }
                e.preventDefault();
            });
        }
    },
    attachCellHandlers: function($theCell, daysCell) {
        "use strict";
        var me = this;
        if ( this.config.editable ) {
            $theCell.wrapInner('<span contenteditable="true"></span>');
            $theCell.first().attr('contenteditable', 'true').focus(function() {
                me.selectAll(this);
            }).blur(function() {
                if ( !me.preventFocusEvents) {
                    me.maintainEmptyRow();
                    me.maintainZeroRow();
                    me.updateDisplay();
                }
            });
        }
    },
    clearRows: function() {
        "use strict";
        $(this.bodySelector).empty();
    },
    createContextMenu: function(index) {
        "use strict";
        if ( $(this.menuSelector).length ) {
            $(this.menuSelector).remove();
            console.log("closing already open menu");
        }
        var me = this;
        var $menu = $('<div></div>').attr('id', this.menuId).addClass(this.config.contextMenuCssClass);
        var $list = $('<ul></ul>');
        var $item = $('<li></li>').addClass("insertBefore").text('Insert Row Before').click( function() { me.insertRow(index, false); me.closeContextMenu(); });
        $list.append($item);
        $item = $('<li></li>').addClass("insertAfter").text('Insert Row After').click( function() { me.insertRow(index, true); me.closeContextMenu(); });
        $list.append($item);
        $item = $('<li></li>').addClass("delete").text('Delete Row').click( function() { me.deleteRow(index); me.closeContextMenu(); });
        $list.append($item);
        $menu.append($list);

        return $menu;
    },
    positionMenu: function(e, newMenu){

        // TODO: needs edge detection

        "use strict";
        newMenu.css("top", $(e.target).position().top + e.offsetY);
        newMenu.css("left", $(e.target).position().left + e.offsetX);
    },
    closeContextMenu: function() {
        "use strict";
        $(this.menuSelector).remove();
        if ( this.config.contextMenuDisplayHandler !== null ) {
            this.config.contextMenuDisplayHandler(false);
        }
    },
    updateDisplay: function(initialDate) {
        "use strict";
        var theDate;
        if ( typeof( initialDate ) !== "undefined" ) {
            theDate = initialDate;
            this.setStartDate(initialDate);
        } else {
            theDate = this.getStartDate();
        }
        if ( typeof( theDate ) !== "undefined" ) {
            // ensure up to date row index - used in sorting
            var rowIdx = 0;
            $(this.rowsSelector).each(function() {
                $(this).data('rowIndex', rowIdx);
                rowIdx++;
            });
            // get dom table rows and sort them
            var rows = $(this.rowsSelector).get();
            rows.sort(function(a,b) {
                var v1 = parseFloat(parseDayString($(a).find('td.profileDays').text()));
                var v2 = parseFloat(parseDayString($(b).find('td.profileDays').text()));
                if ( isNaN(v1) || isNaN(v2) || (v1 === v2) ) {
                    return (parseInt($(a).data('rowIndex'), 10) - parseInt($(b).data('rowIndex'), 10));
                } else {
                    return v1 - v2;
                }
            });
            // re-append table rows to get them in sorted order in the actual dom/table
            var idx = 0;
            var that = this;
            $.each(rows, function(index, row) {
                var strDays = $(row).find("td.profileDays").text();
                if ( typeof( strDays ) !== "undefined" && strDays !== '' ) {
                    var dates = that.formatNextDate(theDate, strDays);
                    $(this).find("td.profileDate").text( dates.display ).data('profile-date', dates.raw);
                }
                var add = 'even';
                var rmv = 'odd';
                if ( idx % 2 === 1 ) {
                    add = 'odd';
                    rmv = 'even';
                }
                $(row).addClass(add).removeClass(rmv).removeClass("selected").data('rowIndex', idx); // piggy back on loop here to set row index, used for positioning in insert/delete rows
                $(that.bodySelector).append(row);
                idx++;
            });
        }
        if ( !this.hasInvalidDayCells() && typeof(this.config.chartUpdateCallBack) !== "undefined") {
            this.config.chartUpdateCallBack();
        }
    },
    maintainZeroRow: function(){
        "use strict";
        var firstRowDays = parseFloat($(this.rowsSelector + ":first-child").find("td.profileDays").text());
        if(isNaN(firstRowDays)){
            return;
        }
        if(firstRowDays !== 0.0){
            var row = this.createRow('0','');
            $(this.rowsSelector).eq(0).before(row);
            this.updateDisplay();
        }
    },
    formatNextDate: function(theDate, strDays) {
        "use strict";
        var days = parseFloat(parseDayString(strDays));
        if(isNaN(days)){
            return { raw: '', display: "Invalid 'Days' value" };
        }
        var t1 = theDate.getTime();
        var t2 = parseInt(this.numMilliSecondsPerDay * days, 10);
        var newDate = new Date( t1 + t2 );
        return this.formatDate(newDate);
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
    parseStartDate: function(profile) {
        "use strict";

        if ( typeof( profile ) !== "undefined" && profile.length > 0 && typeof( profile[0].date ) !== "undefined" ) {
            var startDate = this.parseDate(profile[0].date);
            if(startDate){
                return startDate;
            }
        }
        return (new Date()); // return current date on parse error
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
    getStartDate: function() {
        "use strict";
        if ( typeof( this.config.startDateFieldSelector ) !== "undefined" && this.config.startDateFieldSelector !== '' ) {
            var startDate = (this.config.editable) ? $(this.config.startDateFieldSelector).val() : $(this.config.startDateFieldSelector).text();
            if ( typeof( startDate ) !== "undefined" && startDate !== '' ) {
                try {
                    return $(this.config.startDateFieldSelector).datepicker( "getDate" );
                } catch(e) {
                    console.log("error calculating dates: " + e.message);
                }
            }
        }
        return null;
    },
    setStartDate: function(theDate) {
        "use strict";
        if ( typeof( this.config.startDateFieldSelector ) !== "undefined" && this.config.startDateFieldSelector !== '' ) {
            var formattedDates = this.formatDate(theDate);
            if ( this.config.editable ) {
                $(this.config.startDateFieldSelector).val( formattedDates.display ).data('profile-date', formattedDates.raw );
            } else {
                $(this.config.startDateFieldSelector).text( formattedDates.display ).data('profile-date', formattedDates.raw );
            }
        }
    },
    selectAll: function(elem) {
        "use strict";
        window.setTimeout(function() {
            var sel, range;
            if (window.getSelection && document.createRange) {
                range = document.createRange();
                range.selectNodeContents(elem);
                sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            } else if (document.body.createTextRange) {
                range = document.body.createTextRange();
                range.moveToElementText(elem);
                range.select();
            }
        }, 1);
    },
    getProfileData: function() {
        "use strict";
        var points = [];
        var me = this;
        $(this.rowsSelector).each(function() {
            points[points.length] = { days : ($(this).find('td.profileDays').text()), temperature: $(this).find('td.profileTemp').text(), date: $(this).find('td.profileDate').data('profileDate') };
            if ( me.config.editable && points[points.length-1].days === '' ) {
                points.pop();  // remove last row if its blank and we are editing
            }
        });
        return points;
    },
    hasInvalidDayCells: function(){
        "use strict";
        var me = this;
        var invalidCells = 0;
        var cell = null;
        $(this.rowsSelector).each(function() {
            cell = $(this).find('td.profileDays');  // test first cell for empty
            if ( !me.isValidCell(cell)) {
                invalidCells++;
            }
        });
        if(cell !== null){
            if(cell.text().length === 0){
                invalidCells--; // don't count empty last cell, decrease count by 1
            }
        }
        return (invalidCells > 0);
    },
    toJSON: function() {
        "use strict";
        return { name: this.profileName, profile: this.getProfileData()};
    },
    toCSV: function(includeHeader, fields) {
        "use strict";
        var ret = '';
        var colNames = (fields || this.csvColumns);
        if ( includeHeader ) {
            for ( var i=0; i<colNames.length; i++ ) {
                ret += ((i!==0) ? ',' : '') + colNames[i];
            }
            ret += '\n';
        }
        var profileData = this.getProfileData();
        for ( var j=0; j<profileData.length; j++ ) {
            var row = profileData[j];
            for (var k=0; k<colNames.length; k++ ) {
                ret += ((k!==0) ? ',' : '') + row[colNames[k]];
            }
            ret += '\n';
        }
        return ret;
    },
    toXML: function() {
        // TODO: perhaps interface to other stuff ??
    },
    getProfileDuration: function() {
        "use strict";
        var profileData = this.getProfileData();
        for(var i = profileData.length - 1; i >= 0; i--){
            var maxDays = parseFloat(profileData[i].days);
            if(!isNaN(maxDays)){
                return maxDays; // return last valid number in array
            }
        }
        return 0;
    },
    isValidCell: function(cell) {
        "use strict";
        var contents = cell.text();
        return ( typeof( contents ) !== "undefined" && contents !== '' && !isNaN(parseFloat(contents)));
    },
    markInvalidCells: function() {
        "use strict";
        this.preventFocusEvents = true;
        $(this.rowsSelector).each(function() {
            var dayCell = $(this).find('td.profileDays');
            if ( isNaN(parseFloat(dayCell.text())) ) {
                $(this).addClass('error');
                dayCell.focus();
                return false;
            } else {
                $(this).removeClass('error');
            }
        });
        this.preventFocusEvents = false;
    },
    resetInvalidCells: function() {
        "use strict";
        $(this.rowsSelector+'.error').removeClass('error');
    },
    maintainEmptyRow: function(){
        "use strict";
        if ( this.config.editable ) {
            var rows = this.getProfileData();
            var profileLength = rows.length;
            var tableLength = $(this.rowsSelector).length;

            if(tableLength === profileLength){
                this.addRow();
            }
        }
    }
};
