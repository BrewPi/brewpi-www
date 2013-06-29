/* global console, alert, Spinner */

function BeerProfileTable(id, config) {
    if (arguments.length > 0 ) {
        this.init(id, config);
    }
}
BeerProfileTable.prototype = {
    init: function(id, config) {
        this.id = id;
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
        this.prepTable();
    },
    prepTable: function() {
        var table = $(this.newTable).attr('class', this.config.tableClass);
        $(this.selector).append(table);
        $(this.headSelector).addClass(this.config.theadClass);
        $(this.bodySelector).addClass(this.config.tbodyClass);
    },
    render: function(data) {
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
        this.addRow();
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
        this.attachEditHandlers(0, cell);
        $newRow.append(cell);
        cell = $(this.newCell).html( '' );
        this.attachEditHandlers(1, cell);
        $newRow.append(cell);
        cell = $(this.newCell).html( '' );
        this.attachEditHandlers(2, cell);
        $newRow.append(cell);
    },
    clearRows: function() {
        $(this.headSelector).empty();
        $(this.bodySelector).empty();
    },
    parseRows: function(data) {
        return (data != null) ? data.split('\n') : [];
    },
    updateDates: function() {
        if ( this.config.startDateFieldSelector != null ) {
            var startDate = $(this.config.startDateFieldSelector).val();
            if ( startDate != null && startDate != '' ) {
                $(this.rowsSelector).each(function() {
                    // add days in row to startdate
                    // set start date to new value
                });
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
    toCSV: function() {
        var ret = '';
        $(this.rowsSelector).each(function() {
            var notfirst = 0;
            $(this).find('td').each(function() {
                ret += ((notfirst) ? ',' : '') + $(this).html();
                notfirst++;
            });
            ret += '\n';
        });
        return ret;
    }
}
