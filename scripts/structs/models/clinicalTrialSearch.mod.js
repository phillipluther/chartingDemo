/*
 * This is kind of the "master" model of our mini-app. It handles the addition of search terms,
 * calls to our clinicalTrial/ service and the management/wrangling of data.
 */

'use_strict'; 

ZE.Structs.Models.ClinicalTrialSearch = Backbone.Model.extend({

    defaults : {

        // hook for special handling of our terms
        searchFieldName : 'term',

        // abstracted key columns for formatting data
        statusPropertyKey : 'status',
        statusObservable  : 'statusData',

        detailPropertyKey : 'condition_summary',
        detailObservable  : 'detailData',

        // a listing of raw data we don't want shown in the table
        tableExclusions : [
            'nct_id',
            'order'
        ],

        // actionable column config for sorting in the table
        tableSortableColumns :  [
            'title',
            'score',
            'last_changed'
        ]
    },

    // point our model at the clinical trial service (hard-coded for demo purposes)
    //url : '/zephyrDemo/services/clinicalTrial/',
    url : '/services/clinicalTrial/',


    //
    // Our init function auto-creates and binds to our view. It also sets some instance-specific
    // attributes for tracking compound searches.
    //
    initialize : function() {

        var
            chartCollection = Backbone.Collection.extend({
                model : ZE.Structs.Models.HighChart
            });

        this.set({
            searchTerms : [],

            // we include our field config here for rendering our inputs; this could come from an
            // external source grabbed in the init method, as well, for more dynamic forms if we
            // wanted to extend this as a constructor ... which is why it's placed in the init
            // method VS. set in defaults.
            //
            // as you can see, they're just hard-coded for now
            //
            fields : [

                {
                    id          : 'searchTerm',
                    name        : this.get('searchFieldName'),
                    type        : 'text',
                    placeholder : 'Enter your search term ... '
                },
                {
                    id          : 'searchBtn',
                    name        : 'Search',
                    val         : 'Search',
                    type        : 'submit'
                }
            ]
        });

        // listen for actionable updates
        this.on({
            'change:searchResults'  : this.parseSearchResults,
            'change:formData'       : this.fetch,

            // these listeners reset derivative data stores, as when top-level data has changed,
            // the down-stream visualizations are no longer relevant since they require user
            // interaction.
            //
            // @future revisit this and see if there's a way that makes sense to simply refresh
            // downstream data
            //
            'change:statusData' : this.resetDetailData,
            'change:detailData' : this.resetTableData
        });

        // auto-construct the view
        this.view = new ZE.Structs.Views.ClinicalTrialSearch({
            model : this
        });

        // bind "this" context to click handlers called within our charts
        _.bindAll(this,
            'formatDetailData',
            'formatTableData'
        );
    },

    //
    // This method is triggered by a click on the "submit" button in our view. It grabs the value of
    // each known field and builds a .fetch()-friendly data object.
    //
    // If the optional "ignore" flag is sent, we do not touch the search field itself. This is
    // useful in removing search terms so we don't grab the value and simulate a submission of the
    // form.
    //
    buildFormData : function(ignoreSearchField) {

        var
            formData = {};

        // loop over our fields to create our data object; we looped over our fields with an eye
        // on extensibility, as we could (theoretically) add more fields to our config and not
        // have to change the handling method.
        _.each(this.get('fields'), function(field) {

            var
                // snag the value from our field
                fieldVal = field.el.val(),

                // flags for special handling of our search field
                isSearchField = (field.name === this.get('searchFieldName'));

            // are we compounding search terms?
            if (isSearchField) {

                if (ignoreSearchField !== true) {

                    // add the given term to our query params
                    this.addSearchTerm(field.el.val());

                    // reset the field
                    field.el.val('');
                }

                fieldVal = this.get('searchTerms').join('+AND+');
            }

            // populate our data object
            formData[field.name] = fieldVal;

        }, this);

        // we don't explicitly make the call to our service; instead, it's watching to see when
        // the formData has changed
        this.set('formData', formData);
    },

    // 
    // This is a little OO method for adding search terms.
    //
    addSearchTerm : function(term) {

        this.set('searchTerms', this.get('searchTerms').concat(
            [term]
        ));
    },

    //
    // This method removes a search term from our query params.
    //
    removeSearchTerm : function(term) {

        var
            searchTerms = _.without(this.get('searchTerms'), term);

        this.set('searchTerms', searchTerms);

        // treat the removal of a tag as a new query
        this.buildFormData(true);
    },

    //
    // This is our custom .fetch() method for interacting with the back-end, which will make our
    // request to the corresponding service and handle the response.
    //
    fetch : function() {

        var
            self     = this,
            formData = this.get('formData'),

            paginationConfig = {
                stubbed : true
            };

        // smoke-screen the loading process
        this.set('isLoading', true);

        $.get(
            this.url,
            formData

        ).done(function(results) {
            self.set('searchResults', results);

        }).fail(function() {
            self.set('isLoading', false);
            console.warn('Error handling: outside scope of this project, but here if we need it');
        });
    },

    //
    // This method is fired when our search results are updated, capturing our chart data in a
    // usable format. This makes it easy for other components to subscribe to updates on our
    // chartData attribute.
    //
    parseSearchResults : function() {

        var
            statusData      = JSON.parse(this.get('searchResults')),
            hasStatusChart  = this.get('isStatusChartReady');

        // trip our loading flag and stash the chart data
        this.set({
            'isLoading'  : false,
            'statusData' : statusData
        });

        // no need to keep this around
        this.unset('searchResults', {
            silent : true
        });

        // check if we have an instance of our status chart already; if not, create one
        if (_.isUndefined(hasStatusChart)) {

            ZE.Components.StatusChart = new ZE.Structs.Models.BarChart(

                // provide some info on our data source
                {
                    context     : this,
                    watch       : this.get('statusObservable'),
                    binProperty : this.get('statusPropertyKey')
                },

                // our abstracted config info
                ZE.Content.statusChart,

                // click handler for getting info on our bars
                this.formatDetailData
            );

            this.set('isStatusChartReady', true);
        }
    },

    //
    // This method packages data for our Details Chart; it's triggered by a click on one of the
    // Status Chart's rectangle elements for further breakdown.
    //
    // There's a lot of overlap in the formation of our bar charts here and in process search
    // results; @future squash some bugs and revist this.
    //
    formatDetailData : function(e) {

        console.log('Formatting detail data');
        var
            target          = e.currentTarget,
            binProperty     = target.category,
            hasDetailChart  = this.get('isDetailChartReady'),
            propertyKey     = this.get('statusPropertyKey'),
            detailData      = [];

        //
        // @future
        //      Consider stashing the status data in a collection for easier management.
        //
        _.each(this.get('statusData').clinical_study, function(dataPoint) {

            if (dataPoint[propertyKey] === binProperty) {
                detailData.push(dataPoint);
            }
        });

        this.set({
            'detailData' : detailData
        });

        // if we need to render our detail chart for the first time, do so
        if (_.isUndefined(hasDetailChart)) {

            // there's a lot of overlap in rendering our two charts; look for ways to consolidate
            // these creation calls
            ZE.Components.DetailChart = new ZE.Structs.Models.BarChart(
                {
                    context     : this,
                    watch       : this.get('detailObservable'),
                    binProperty : this.get('detailPropertyKey')
                },

                // our base config and column-click callback
                ZE.Content.detailChart,
                this.formatTableData
            );

            this.set('isDetailChartReady', true);
        }
    },

    //
    // This method purges any information we have in our detail data store.
    //
    resetDetailData : function() {
        this.set('detailData', []);
    },

    //
    // Like our details data, table data is formatted for use based on a click in our Detail
    // chart. We grab the target and corresponding key and build our data object on-the-fly.
    //
    formatTableData : function(e) {

        console.log('Formatting table data ...');
        var
            target      = e.currentTarget,
            property    = target.category,
            propertyKey = this.get('detailPropertyKey')
            tableData   = [];

        _.each(this.get('detailData'), function(dataPoint) {

            if (dataPoint[propertyKey] === property) {
                tableData.push(dataPoint);
            }
        });

        this.set('tableData', tableData);

        if (_.isUndefined(this.get('isTableReady'))) {

            new ZE.Structs.Views.Table({
                model: this
            });
            
            this.set('isTableReady', true);
        }
    },

    //
    // This method purges any information we have in our table data store.
    //
    resetTableData : function() {
        console.log('Reset table data ... ');
        this.set('tableData', []);
    },

    //
    // This is our method for sorting table data based on the given column. I opted not to use a
    // table library because I thought stuff like this wouldn't be a hassle; I regret that call.
    //
    sortTableData : function(sortBy) {

        var
            direction = this.get('tableSortDirection') || 'descending',
            data      = this.get('tableData');

        // just handle sorting via a toggle
        direction = (direction === 'descending')
            ? 'ascending'
            : 'descending';

        data.sort(function(item1, item2) {
            return (direction === 'ascending')
                ? item1[sortBy] < item2[sortBy]
                : item1[sortBy] > item2[sortBy];
        });

        // update post-sorting
        this.set({
            'tableSortDirection'    : direction,
            'tableSortColumn'       : sortBy,
            'tableData'             : data
        });

        // odd that this is necessary ... is it? look into this
        this.trigger('change:tableData');
    }

});
