/* global console, alert, Spinner */

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
        this.selector = '#' + this.id;
        this.bodySelector = this.selector + ' tbody';
        this.headSelector = this.selector + ' thead';
        this.footSelector = this.selector + ' tfoot';
        this.rowsSelector = this.bodySelector + ' tr';
        this.newTable = '<table cellpadding="0" cellspacing="0" border="0"><thead></thead><tbody></tbody><tfoot></tfoot></table>';
        this.newRow = '<tr></tr>';
        this.newCell = '<td></td>';
        this.newHeadCell = '<th></th>';
        this.numSecondsPerDay = 24 * 60 * 60 * 1000;
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
        this.updateDates();
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
            var newRow = $(this.newRow).attr('class', (i % 2 == 1) ? 'odd' : 'even');
            $(this.bodySelector).append(newRow);
            this.renderRow( rows[i], newRow );
        }
        if ( this.config.editable ) {
            this.addRow();
        }
    },
    renderRow: function(rowData, $row) {
        var theCell = $(this.newCell).html( rowData.days );
        this.attachEditHandlers(theCell);
        $row.append(theCell);
        theCell = $(this.newCell).html( rowData.temperature );
        this.attachEditHandlers(theCell);
        $row.append(theCell);
        var dateCell = $(this.newCell).html( '' );
        $row.append(dateCell);
    },
    renderFooter: function(data) {
    },
    attachEditHandlers: function($theCell) {
        var me = this;
        if ( this.config.editable ) {
            $theCell.attr('contenteditable', 'true').focus(function() {
                me.selectAll(this);
            }).blur(function() {
                me.updateDates();
            });
        }
    },
    addRow: function() {
        var $newRow = $(this.newRow).attr('class', ($(this.rowsSelector).size() % 2 == 1) ? 'odd' : 'even');
        $(this.bodySelector).append($newRow);
        var cell = $(this.newCell).html( '' ).focus();
        this.attachEditHandlers(cell);
        $newRow.append(cell);
        cell = $(this.newCell).html( '' );
        this.attachEditHandlers(cell);
        $newRow.append(cell);
        cell = $(this.newCell).html( '' );
        $newRow.append(cell);
    },
    clearRows: function() {
        $(this.headSelector).empty();
        $(this.bodySelector).empty();
    },
    parseRows: function(data) {
        return (data != null) ? data.split('\n') : [];
    },
    updateDates: function(startDate) {
        var me = this;
        if ( this.config.startDateFieldSelector != null && this.config.startDateFieldSelector != '' ) {
            var startDate = $(this.config.startDateFieldSelector).val();
            if ( startDate != null && startDate != '' ) {
                var theDate = null;
                try {
                    theDate = $(this.config.startDateFieldSelector).datepicker( "getDate" );
                    var idx = 0;
                    $(this.rowsSelector).each(function() {
                        var strDays = $(this).find("td:first-child").text();
                        if ( strDays != null && strDays != '' ) {
                            var days = parseFloat(strDays);
                            var newDate = new Date( theDate + (me.numSecondsPerDay * days) );
                            $(this).find("td:last-child").text($.datepicker.formatDate($.datepicker.W3C, newDate));
                            theDate = newDate.getTime();
                        }
                        idx++;
                    });
                } catch(e) {
                    console.log("error caculating dates: " + e.message);                
                }
            }
        }
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
    toJSON: function() {
        var points = [];
        var me = this;
        $(this.rowsSelector).each(function() {
            var cell = $(this).find('td:first-child');
            if ( !me.isBlankCell(cell) ) {
                var dataPoint = { days : cell.text(), temperature: cell.next().text() };
                points[points.length] = dataPoint;
            }
        });
        return { name: this.profileName, profile: points};
    },
    toCSV: function() {
        var ret = '';
        var me = this;
        $(this.rowsSelector).each(function() {
            var idx = 0;
            $(this).find('td').each(function() {
                if ( !me.isBlankCell( $(this) ) ) {
                    if ( idx < 2 ) {
                        ret += ((idx>0) ? ',' : '') + $(this).html();
                    }
                }
                idx++;
            });
            ret += '\n';
        });
        return ret;
    },
    toXML: function() {
            var days = cell.text();
            if ( days != null && days != '' ) {
            }
        
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
