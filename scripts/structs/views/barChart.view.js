/*
 * This is a light view that renders a High Charts bar chart based on our model.
 */

'use_strict';

ZE.Structs.Views.BarChart = Backbone.View.extend({
    
    tagName     : 'div',
    className   : 'chart-wrapper',


    //
    // On init we simply watch our "fresh data" flag and do an opening render.
    //
    initialize : function() {

        // add a unique CSS hook to the chart wrapper; this actually offsets what appears to be a
        // bug in high charts ... @future investigate that further
        this.$el.prop('id', this.model.get('watch'));

        this.listenTo(this.model, 'change:isChartDataFresh', this.refreshChart);
        this.render();
    },

    //
    // Render.
    //
    render : function() {

        this.$el.appendTo(
            this.model.get('appendTo')
        );
    },

    //
    // This method updates (draws, actually) our chart. Our model has gone through the process
    // of putting properties into a High Charts-friendly format, so we (almost) simply map them
    // 1-to-1.
    //
    refreshChart : function() {
        
        var
            model         = this.model,
            chartInstance = model.get('chartInstance');

        // if the data isn't fresh (or is being reset) do nothing
        if (model.get('isChartDataFresh') !== true) {
            return;
        }

        // we destory and rebuild our chart each time as our binning may have changed
        if (! _.isUndefined(chartInstance)) {
            chartInstance.destroy();
        }

        model.set('chartInstance', new Highcharts.Chart({

            chart       : model.get('chart'),
            xAxis       : model.get('xAxis'),
            yAxis       : model.get('yAxis'),
            tooltip     : model.get('tooltip'),
            plotOptions : model.get('plotOptions'),
            series      : model.get('series'),

            // odd formatting ... could clean this up in the model
            title : {
                'text' : model.get('title')
            },

            subtitle : {
                'text' : model.get('subTitle')
            }
        }));

        // flag that we've used our current data
        model.set('isChartDataFresh', false);
    }
});
