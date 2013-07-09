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
        this.updateDisplay();
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
        var newRow = this.createRow(rowData.days, rowData.temperature);
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
        var me = this;
        window.setTimeout(function() { me.updateDisplay(); }, 200);
    },
    deleteRow: function(index) {
        
    },
    createRow: function(c1, c2) {
        var $newRow = $(this.newRow);
        var cell = $(this.newCell).html( (c1 || '') ).focus();
        this.attachCellHandlers(cell);
        $newRow.append(cell);
        cell = $(this.newCell).html( (c2 || '') );
        this.attachCellHandlers(cell);
        $newRow.append(cell);
        cell = $(this.newCell).html( '' );
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
    parseRows: function(data) {
        return (data != null) ? data.split('\n') : [];
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

        // if menu doesn't fit, set right to 0 ?
        // jquery dialog messes positioning up a bit so need more testing
        //  for position limiting code
        // perhaps allowing for a "positioning container selector" in config
        // it would default to window

        newMenu.css("top", $(e.target).position().top + e.offsetY);
        newMenu.css("left", $(e.target).position().left + e.offsetX);
        // var menuWidth = newMenu.outerWidth();
        // var menuHeight = newMenu.outerHeight();
        // if ((e.pageX + newMenu.outerWidth()) > winWidth) {
        //     newMenu.css("left", winWidth - newMenu.outerWidth());
        // } else {
        //     newMenu.css("left", e.pageX);
        // }

    },
    closeContextMenu: function(index) {
        $(this.menuSelector).remove();
        if ( this.config.contextMenuDisplayHandler != null ) {
            this.config.contextMenuDisplayHandler(false);
        }
    },
    updateDisplay: function() {
        this.updateDates();
        this.updateBGColors();
    },
    updateDates: function() {
        var me = this;
        if ( this.config.startDateFieldSelector != null && this.config.startDateFieldSelector != '' ) {
            var startDate = $(this.config.startDateFieldSelector).val();
            if ( startDate != null && startDate != '' ) {
                try {
                    var theDate = $(this.config.startDateFieldSelector).datepicker( "getDate" ).getTime();
                    $(this.rowsSelector).each(function() {
                        var strDays = $(this).find("td:first-child").text();
                        if ( strDays != null && strDays != '' ) {
                            var days = parseFloat(strDays);
                            var newDate = new Date( theDate + (me.numSecondsPerDay * days) );
                            $(this).find("td:last-child").text($.datepicker.formatDate($.datepicker.W3C, newDate));
                        }
                    });
                } catch(e) {
                    console.log("error caculating dates: " + e.message);                
                }
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
    toCSV: function(includeHeader, addDays) {
        var ret = '';
        var me = this;
        if ( includeHeader ) {
            ret += 'Days,Temperature\n';
        }
        $(this.rowsSelector).each(function() {
            var days = 0.0;
            var cell = $(this).children().first();
            if ( !me.isBlankCell( cell ) ) {
                if ( addDays ) {
                    var fltDays = parseFloat(cell.text());
                    days += fltDays;
                    ret += days.toString() + '';
                } else {
                    ret += cell.text();
                }
                ret += ',' + cell.next().html();
                ret += '\n';
            }
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
