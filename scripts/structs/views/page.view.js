/*
 * This constructor provides commonality to our views (pages). Everything appears in a 
 * div.page-content wrapper and assumes there's a simple title, text and pageId coming up from
 * the model, then checks for component-views to continue the render process.
 *
 * This is highly over-simplified for this exercise.
 */

'use_strict'; 

ZE.Structs.Views.Page = Backbone.View.extend({

    tagName     : 'div',
    className   : 'page-content',

    //
    // This is our common .render() method for all pages, which provides a title and blurb, then
    // loads any component views based on pageId and our content map.
    //
    render : function() {

        var
            // shortcut
            model   = this.model,

            // standardized title/text for the page; this stuff could be templated, too
            title   = $('<h1/>').html(model.get('title')),
            text    = $('<p/>').html(model.get('text'));
     
        // provide an ID hook to our content wrapper
        this.$el.prop('id', model.get('pageId') + 'Content');

        // form up like Voltron
        this.$el.append(
            title,
            text
        );

        this.$el.appendTo(
            this.model.get('appendTo')
        );
    }
});