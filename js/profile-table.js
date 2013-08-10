/*
 * Temperature Profile Table
 * config is:
 * {
 *   tableClass: "<css classname for table>",
 *   theadClass: "<css classname for thead>",
 *   tbodyClass: "<css classname for tbody>",
 *   editable: true|false,
 *   startDateFieldSelector: "<css selector for start date field>",
 *   contextMenuCssClass: "<context menu class>",
 *   contextMenuDisplayHandler: "<context menu shown/hidden event handler>"
 * }
 */

function BeerProfileTable(id, config) {
    if (arguments.length > 0 ) {
        this.init(id, config);
    }
}
BeerProfileTable.prototype = {
    init: function(id, config) {
        this.id = id;
        this.profileName = null;
        this.config = (config || {});
        this.config.timeFormat = ' HH:mm:ss';
        this.selector = '#' + this.id;
        this.menuId = this.id + 'Menu';
        this.menuSelector = '#' + this.menuId;
        this.bodySelector = this.selector + ' tbody';
        this.headSelector = this.selector + ' thead';
        this.footSelector = this.selector + ' tfoot';
        this.rowsSelector = this.bodySelector + ' tr';
        this.newTable = '<table cellpadding="0" cellspacing="0" border="0"><thead></thead><tbody></tbody><tfoot></tfoot></table>';
        this.newRow = '<tr></tr>';
        this.newCell = '<td></td>';
        this.newHeadCell = '<th></th>';
        this.numSecondsPerDay = 24 * 60 * 60 * 1000;
        this.csvColumns = ['date', 'temperature', 'days'];
        this.prepTable();
    },
    prepTable: function() {
        var table = $(this.newTable).attr('class', this.config.tableClass);
        $(this.selector).append(table);
        $(this.headSelector).addClass(this.config.theadClass);
        $(this.bodySelector).addClass(this.config.tbodyClass);
    },
    render: function(data) {
        this.profileName = data.name;
        this.clearRows();
        this.renderHeader(data);
        this.renderRows(data);
        this.renderFooter(data);
        // start date inferred from first data row, if not present (empty profile), use current date/time
        var initialDate = this.parseStartDate(data.profile);
        this.updateDisplay( initialDate );
    },
    renderHeader: function(data) {
        var headerRow = $(this.newRow);
        $(this.headSelector).append(headerRow);
        var cell = $(this.newHeadCell).text('Days');
        headerRow.append(cell);
        cell = $(this.newHeadCell).text('Temperature');
        headerRow.append(cell);
        cell = $(this.newHeadCell).text('Date/Time');
        headerRow.append(cell);
    },
    renderRows: function(data) {
        var rows = data.profile;
        for( var i=0; i<rows.length; i++ ) {
            this.renderRow( rows[i] );
        }
        if ( this.config.editable ) {
            this.addRow();
        }
    },
    renderRow: function(rowData) {
        var newRow = this.createRow(rowData.days, rowData.temperature, rowData.date);
        $(this.bodySelector).append(newRow);
    },
    renderFooter: function(data) {
    },
    addRow: function() {
        var $newRow = this.createRow();
        $(this.bodySelector).append($newRow);
    },
    insertRow: function(index, afterOrBefore) {
        var row = this.createRow();
        if ( afterOrBefore ) {
            $(this.rowsSelector).eq(index).after(row);
        } else {
            $(this.rowsSelector).eq(index).before(row);
        }
        row.find('td.profileDays').focus();
        var me = this;
        window.setTimeout(function() { me.updateDisplay(); }, 200);
    },
    deleteRow: function(index) {
        $(this.rowsSelector).eq(index).remove();
    },
    createRow: function(days, temp, theDate) {
        var $newRow = $(this.newRow);
        var cell = $(this.newCell).addClass('profileDays').html( (days || '') );
        this.attachCellHandlers(cell);
        $newRow.append(cell);
        cell = $(this.newCell).addClass('profileTemp').html( (temp || '') );
        this.attachCellHandlers(cell);
        $newRow.append(cell);
        cell = $(this.newCell).addClass('profileDate').html( (theDate || '') );
        $newRow.append(cell);
        this.attachRowHandlers($newRow);
        return $newRow;
    },
    attachRowHandlers: function($row) {
        $row.bind( "click", function() {
            $(this).addClass("selected").siblings().removeClass("selected");
        })
        var me = this;
        if (this.config.editable) {
            $row.bind("contextmenu",function(e) {
                $(this).addClass("selected").siblings().removeClass("selected");
                var selectedIndex = $(this).data('rowIndex');
                var newMenu = me.createContextMenu(selectedIndex);
                $(me.selector).append(newMenu);
                me.positionMenu(e, newMenu);
                newMenu.show();
                if ( me.config.contextMenuDisplayHandler != null ) {
                    me.config.contextMenuDisplayHandler(true);
                }
                e.preventDefault();
            });
        }
    },
    attachCellHandlers: function($theCell) {
        var me = this;
        if ( this.config.editable ) {
            $theCell.attr('contenteditable', 'true').focus(function() {
                me.selectAll(this);
            }).blur(function() {
                me.updateDates();
            });
        }
    },
    clearRows: function() {
        $(this.headSelector).empty();
        $(this.bodySelector).empty();
    },
    createContextMenu: function(index) {
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
    positionMenu: function(e, newMenu) {

        // TODO: needs edge detection

        newMenu.css("top", $(e.target).position().top + e.offsetY);
        newMenu.css("left", $(e.target).position().left + e.offsetX);
    },
    closeContextMenu: function(index) {
        $(this.menuSelector).remove();
        if ( this.config.contextMenuDisplayHandler != null ) {
            this.config.contextMenuDisplayHandler(false);
        }
    },
    updateDisplay: function(initialDate) {
        this.updateDates(initialDate);
        this.updateBGColors();
    },
    updateDates: function(initialDate) {
        var me = this;
        var theDate;
        if ( initialDate != null ) {
            theDate = initialDate;
            this.setStartDate(initialDate);
        } else {
            theDate = this.getStartDate();
        }
        if ( theDate != null ) {
            $(this.rowsSelector).each(function() {
                var strDays = $(this).find("td.profileDays").text();
                if ( strDays != null && strDays != '' ) {
                    var dates = me.formatNextDate(theDate, strDays);
                    $(this).find("td.profileDate").text( dates.display ).data('profile-date', dates.raw);
                }
            });
        }
    },
    formatNextDate: function(theDate, strDays) {
        var days = parseFloat(strDays);
        var t1 = theDate.getTime();
        var t2 = parseInt(this.numSecondsPerDay * days);
        var newDate = new Date( t1 + t2 );
        return this.formatDate(newDate);
    },
    formatDate: function(theDate) {
        var strDate = $.datepicker.formatDate(this.config.dateFormat, theDate);
        var strDate2 = $.datepicker.formatDate(this.config.dateFormatDisplay, theDate);
        var h = theDate.getHours();
        var m = theDate.getMinutes();
        var s = theDate.getSeconds();
        var strTime = ( (h<10) ? '0' + h : h ) + ':' + ( (m<10) ? '0' + m : m ) + ':' + ( (s<10) ? '0' + s : s );
        return { raw: strDate + ' ' + strTime, display: strDate2 + ' ' + strTime };
    },
    parseStartDate: function(profile) {
        if ( profile != null && profile.length > 0 && profile[0].date != null ) {
            return this.parseDate(profile[0].date);
        }
        return new Date();
    },
    parseDate: function(strDate) {
        try {
            var startDate = $.datepicker.parseDate(this.config.dateFormat, strDate);
            var startTime = $.datepicker.parseTime(this.config.timeFormat, strDate.substring(strDate.indexOf(' ')+1));
            var totalTime = startDate.getTime() + (startTime.hour*60*60*1000) + (startTime.minute*60*1000) + (startTime.second*1000);
            return new Date( totalTime );
        } catch(e) {
            console.log('invalid start date: ' + strDate + ', using current date/time' );
        }
    },
    getStartDate: function() {
        if ( this.config.startDateFieldSelector != null && this.config.startDateFieldSelector != '' ) {
            var startDate = (this.config.editable) ? $(this.config.startDateFieldSelector).val() : $(this.config.startDateFieldSelector).text();
            if ( startDate != null && startDate != '' ) {
                try {
                    return $(this.config.startDateFieldSelector).datepicker( "getDate" );
                } catch(e) {
                    console.log("error caculating dates: " + e.message);
                }
            }
        }
        return null;
    },
    setStartDate: function(theDate) {
        if ( this.config.startDateFieldSelector != null && this.config.startDateFieldSelector != '' ) {
            var formattedDates = this.formatDate(theDate);
            if ( this.config.editable ) {
                $(this.config.startDateFieldSelector).val( formattedDates.display ).data('profile-date', formattedDates.raw );
            } else {
                $(this.config.startDateFieldSelector).text( formattedDates.display ).data('profile-date', formattedDates.raw );
            }
        }
    },
    updateBGColors: function() {
        var idx = 0;
        var me = this;
        $(this.rowsSelector).each(function() {
            var add = 'even';
            var rmv = 'odd';
            if ( idx % 2 == 1 ) {
                add = 'odd';
                rmv = 'even';
            }
            $(this).addClass(add).removeClass(rmv).data('rowIndex', idx); // piggy back on loop here to set row index, used for positioning in insert/delete rows
            idx++;
        });
    },
    selectAll: function(elem) {
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
        var points = [];
        var me = this;
        $(this.rowsSelector).each(function() {
            var cell = $(this).find('td:first-child');  // test first cell for empty
            if ( !me.isBlankCell(cell) ) {
                var dataPoint = { days : $(this).find('td.profileDays').text(), temperature: $(this).find('td.profileTemp').text(), date: $(this).find('td.profileDate').data('profileDate') };
                points[points.length] = dataPoint;
            }
        });
        return points;
    },
    toJSON: function() {
        return { name: this.profileName, profile: this.getProfileData()};
    },
    toCSV: function(includeHeader, fields) {
        var ret = '';
        var colNames = (fields || this.csvColumns);
        if ( includeHeader ) {
            for ( var i=0; i<colNames.length; i++ ) {
                ret += ((i!=0) ? ',' : '') + colNames[i];
            }
            ret += '\n';
        }
        var profileData = this.getProfileData();
        for ( var j=0; j<profileData.length; j++ ) {
            var row = profileData[j];
            for ( var i=0; i<colNames.length; i++ ) {
                ret += ((i!=0) ? ',' : '') + row[colNames[i]];
            }
            ret += '\n';
        }
        return ret;
    },
    toXML: function() {
        // TODO: perhaps inteface to other stuff ??
    },
    isBlankCell: function(cell) {
        var contents = cell.text();
        if ( contents != null && contents != '' ) {
            return false;
        } else {
            return true;
        }
    }
}
