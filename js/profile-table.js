/*
 * Temperature Profile Table
 * config is:
 * {
 *   tableClass: "<css classname for table>",
 *   theadClass: "<css classname for thead>",
 *   tbodyClass: "<css classname for tbody>",
 *   menuCssClass: "<context menu class>",
 *   editable: true|false,
 *   startDateFieldSelector: "<css selector for start date field>"
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
        this.updateDates();
        this.updateBGColors();
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
            var newRow = $(this.newRow);
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
        var me = this;
        $row.click(function() {
            $(this).toggleClass("selected").siblings().removeClass("selected");
        })
        if (this.config.editable) {
            $row.bind("contextmenu",function(e) {
                $(this).addClass("selected").siblings().removeClass("selected");
                var selectedIndex = $(this).data('rowIndex');
                var newMenu = me.createContextMenu(selectedIndex);
                $(me.selector).append(newMenu);
                me.positionMenu(e, newMenu);
                newMenu.show();

                e.preventDefault();
            });
        }
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
    },
    deleteRow: function(index) {
        
    },
    createRow: function() {
        var $newRow = $(this.newRow);
        var cell = $(this.newCell).html( '' ).focus();
        this.attachEditHandlers(cell);
        $newRow.append(cell);
        cell = $(this.newCell).html( '' );
        this.attachEditHandlers(cell);
        $newRow.append(cell);
        cell = $(this.newCell).html( '' );
        $newRow.append(cell);
        return $newRow;
    },
    clearRows: function() {
        $(this.headSelector).empty();
        $(this.bodySelector).empty();
    },
    parseRows: function(data) {
        return (data != null) ? data.split('\n') : [];
    },
    createContextMenu: function(index) {
        this.closeContextMenu();
        var me = this;
        var $menu = $('<div></div>').attr('id', this.menuId).addClass(this.config.menuCssClass).data('rowIndex', index);
        var $list = $('<ul></ul>');
        var $item = $('<li></li>').addClass("insertBefore").text('Insert Row Before').click( function() { me.insertRow(index, false); me.closeContextMenu(); });
        $list.append($item);
        $item = $('<li></li>').addClass("insertAfter").text('Insert Row After').click( function() { me.insertRow(index, true); me.closeContextMenu(); });
        $list.append($item);
        $item = $('<li></li>').addClass("delete").text('Delete Row').click( function() { me.deleteRow(index); me.closeContextMenu(); });
        $list.append($item);
        $menu.append($list);

        // $(document).bind("mouseup", function(e) {
        //    if (e.which == 1) { me.closeContextMenu(); }
        // });

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
        if ( $(this.menuSelector).length ) {
            $(this.menuSelector).remove();
        }
    },
    updateDates: function() {
        var me = this;
        if ( this.config.startDateFieldSelector != null && this.config.startDateFieldSelector != '' ) {
            var startDate = $(this.config.startDateFieldSelector).val();
            if ( startDate != null && startDate != '' ) {
                try {
                    var theDate = $(this.config.startDateFieldSelector).datepicker( "getDate" );
                    $(this.rowsSelector).each(function() {
                        var strDays = $(this).find("td:first-child").text();
                        if ( strDays != null && strDays != '' ) {
                            var days = parseFloat(strDays);
                            var newDate = new Date( theDate + (me.numSecondsPerDay * days) );
                            $(this).find("td:last-child").text($.datepicker.formatDate($.datepicker.W3C, newDate));
                            theDate = newDate.getTime();
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
            $(this).addClass((idx % 2 == 1) ? 'odd' : 'even').data('rowIndex', idx);
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
