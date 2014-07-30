/*
 */

'use_strict'; 

ZE.Structs.Models.BarChart = Backbone.Model.extend({

    // the defaults contain common High Chart config options for all bar charts in play
    defaults : {

        // our default placement of the chart for appending
        appendTo : $('.page-body')
    },

    //
    // This is a general-purpose Bar Chart component, used to create both our Status Chart and
    // our Details Chart. It's built to accept a dataSource object containing the context and
    // attribute we'll monitor for changes (on the Clinical Trial Search component) and the info
    // for rendering our x-axis.
    //
    // It can also take an optional handler for callbacks when a bar is clicked.
    //
    initialize : function(dataSource, chartContent, clickHandler) {

        var
            // build an attribute object to flesh out our model
            modelAttributes = _.extend({}, {

                    // we could have stashed these in default ... though I'm wary of defaults in
                    // backbone when shared across instances from the same model
                    chart: {
                        type : 'column'
                    },

                    tooltip : {
                        headerFormat : '<span style="font-size:10px">{point.key}</span><table>',

                        pointFormat : '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                            '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',

                        footerFormat : '</table>',
                        shared       : true,
                        useHTML      : true
                    },

                    labels : {
                        items : {
                            style : {}
                        }
                    },

                    plotOptions : {
                        column : {
                            pointPadding: 0.2,
                            borderWidth: 0
                        }
                    }
                },

                dataSource, 
                chartContent
            );

        // keep a reference to our data source
        this.set(modelAttributes);

        // if we got a custom click handler for events in our chart, tack it on to the chart obj
        if (! _.isUndefined(clickHandler)) {

            // bad form to extend this outside of the "set" ... revisit this
            this.get('plotOptions').series = {
                cursor : 'pointer',

                point : {
                    events : {
                        click : clickHandler
                    }
                }
            };
        }

        // we observe our Search component's "watch" item to respond to changes
        this.listenTo(dataSource.context, 'change:' + dataSource.watch, this.formatChartData);

        // auto-construct the view
        this.view = new ZE.Structs.Views.BarChart({
            model : this
        });

        // our charts are init'd the first time they're needed; as such, move straight to data
        // formatting
        this.formatChartData();
    },

    //
    // This is a data translation method for formatting into a High Charts-friendly object.
    //
    formatChartData : function() {
        
        var
            chartData = this.get('context').get(
                this.get('watch')
            ),

            binnedData          = this.binData(chartData),
            prettyBinProperty   = ZE.Utils.prettify(this.get('binProperty'));

        this.set({

            // flesh our our axis data
            'xAxis' : {
                categories : _.keys(binnedData),

                labels : {
                    formatter : function() {
                        return ZE.Utils.ellipsize(this.value);
                    }
                }
            },

            'yAxis' : {
                min : 0,

                title : {
                    text : prettyBinProperty
                }
            },

            // create our series data
            'series' : [{
                name : prettyBinProperty,
                data : _.values(binnedData)
            }],

            // reinforce placement of where our chart renders to; the global options in Highcharts
            // kept applying and our dual graphs would often collide. check into this further as
            // you get more familiar with highcharts
            'chart' : _.extend(this.get('chart'), {
                renderTo : this.get('watch')
            }),

            // and trip our subscribable flag
            'isChartDataFresh' : true
        });
    },

    //
    // This method throws our clinical study data into bins based on the provided binProperty.
    //
    binData : function(data) {

        var
            binProp     = this.get('binProperty'),
            binnedData  = {};

        // normalize our data, as it will either come in raw (on the clinical_study property) or
        // as a straight array
        data = (_.isUndefined(data.clinical_study))
            ? data
            : data.clinical_study;

        _.each(data, function(item) {

            var
                binValue = item[binProp];

            // add our binnable item to the categories listing and start the counter
            if (_.isUndefined(binnedData[binValue])) {
                binnedData[binValue] = 0;
            }

            binnedData[binValue]++;
        });

        return binnedData;
    }
});