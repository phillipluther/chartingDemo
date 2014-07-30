/*
 * This is our anything-but-simple table view constructor. I initially went down the path of 
 * rolling my own, thinking, "Meh ... it's just a simple little table," and passed on using
 * a library and adding unneeded page weight.
 *
 * Simple tables are not simple when you start adding actions to them ...
 */

'use_strict';

ZE.Structs.Views.Table = Backbone.View.extend({
    
    tagName     : 'table',
    className   : 'data-table',

    events : {
        'click .sortable' : 'handleSort'
    },

    //
    // On init, we subscribe to changes on the Clinical Trial Search model's tableData attribute
    // and auto-render.
    //
    initialize : function() {
        this.render();
    },

    //
    //
    //
    render : function() {

        var
            data = this.model.get('tableData'),

            tableBody = $('<tbody/>').addClass('table-body'),
            tableHead = $('<thead/>').addClass('table-head'),

            hasHeader = false;

        // self destruct, cleaning up any click-listeners and markup ... then reattach
        this.tearDownAndListen();

        _.each(data, function(rowData) {

            // render a header for our table on the pass-through
            if (hasHeader === false) {
                tableHead.append(
                    this.renderTableRow(rowData, true)
                );

                hasHeader = true;
            }

            tableBody.append(
                this.renderTableRow(rowData)
            );

        }, this);

        this.$el.append(
            tableHead,
            tableBody
        );

        this.$el.appendTo('.page-body');
    },

    //
    // Our simple render method for forming our table rows and populating cells. If the optional
    // second param is passed as true, we'll render the row as a header.
    //
    renderTableRow : function(rowData, isHeader) {

        var
            row = $('<tr/>').addClass('table-row'),

            tag = (isHeader === true) 
                ? $('<th/>').addClass('table-header')
                : $('<td/>'),

            cellTemplate = tag.addClass('table-cell'),

            // columns specified for exclusion from the table
            exclusions = this.model.get('tableExclusions'),

            // and sortables
            sortableColumns = this.model.get('tableSortableColumns'),

            // sorting helpers ... why didn't I use a table library, again?
            tableSortedBy = this.model.get('tableSortColumn'),
            tableSortDir  = this.model.get('tableSortDirection');

        // populate our cells
        _.each(rowData, function(val, key) {

            var
                cell;

            // check for columns we're explicitly ignoring
            if (_.indexOf(exclusions, key) !== -1) {
                return;
            }

            if (isHeader === true) {

                // place a data-attribute on our headers for sorting hooks
                cell = cellTemplate.clone().html(ZE.Utils.prettify(key));

                // check for sorting flags
                if (_.indexOf(sortableColumns, key) !== -1) {
                    cell.attr({
                        'data-sort-by' : key
                    }).addClass('sortable');

                    // how hypothetical can we be!? if ... if ... if ... @future clean this up
                    if (key === tableSortedBy) {
                        cell.addClass('sorted ' + tableSortDir);
                    }
                }

            } else {
                cell = cellTemplate.clone().html(
                    ZE.Utils.prettify(val)
                );
            }

            row.append(cell);
        });

        return row;
    },

    //
    //
    //
    tearDownAndListen : function() {

        this.remove();
        this.$el.children().remove();

        this.listenTo(this.model, 'change:tableData', this.render);
        this.delegateEvents();
    },

    //
    // This method is a pass-through back to the model for sorting our table data.
    //
    handleSort : function(e) {

        var
            target = $(e.target),
            sortBy = target.attr('data-sort-by');

        this.model.sortTableData(sortBy);
    }
});
