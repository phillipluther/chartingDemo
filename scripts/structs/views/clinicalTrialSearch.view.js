/*
 */

'use_strict';

ZE.Structs.Views.ClinicalTrialSearch = Backbone.View.extend({
    
    tagName     : 'div',
    className   : 'chart-options-wrapper',

    events : {
        'click #searchBtn'  : 'handleFormSubmit',
        'click .search-tag' : 'handleTermRemoval'
    },

    //
    // Our mini-app is put together in such a way that component models auto-initialize their
    // corresponding views, so when the view is created we should have everything we need to
    // render.
    //
    initialize : function() {

        // observe the model for specific changes 
        this.listenTo(this.model, 'change:searchTerms', this.renderSearchTags);
        this.listenTo(this.model, 'change:isLoading', this.handleLoading);

        this.render();
    },

    //
    // Our formation method, which loops over our field config and creates and appends form 
    // elements to our view wrapper.
    //
    render : function() {

        // i'm just creating the markup in a document fragment, but we could easily enough tie
        // this in with some kind of templating language.
        _.each(this.model.get('fields'), function(fieldConfig) {

            var
                field = this.renderInput(fieldConfig);

            this.$el.append(field);
            
            // stash a reference to the terms field to avoid requery
            fieldConfig.el = field;

        }, this);

        this.$el.append(
            this.renderTagWrapper()
        );

        this.$el.appendTo(
            this.model.get('contentWrapper')
        );
    },

    //
    // This is our standard method for rendering an "input" field, be it our search term field
    // or the submit button. At present, we're assuming all form elements are of type "input." We
    // could probably extend this with a forms library if we wanted more varied fields, but I kept
    // it basic for the purposes of this exercise.
    //
    renderInput : function(fieldConfig) {

        var
            field = $('<input/>')
                .addClass('input-field ' + fieldConfig.type + '-field')
                .attr({

                    // we rely pretty heavily on jQuery's ability to ignore undefined values in
                    // building out our attributes ...
                    type        : fieldConfig.type,
                    id          : fieldConfig.id,
                    name        : fieldConfig.name,
                    value       : fieldConfig.val,
                    placeholder : fieldConfig.placeholder
                });

        return field;
    },

    //
    // This method creates a simple wrapper for holding tags for dismissing search terms.
    //
    renderTagWrapper : function() {

        var
            tagWrapper = $('<div/>').addClass('tag-wrapper');

        this.model.set('tagWrapper', tagWrapper);

        return tagWrapper;
    },

    //
    // This method renders a search term "tag" to track what we're currently querying on. It's 
    // fairly destructive, tearing down and recreating each tag each time ... could be optimized.
    //
    renderSearchTags : function() {

        var
            tagWrapper = this.model.get('tagWrapper'),

            tagTemplate = $('<a/>')
                .addClass('search-tag')
                .prop('href', '#');

        // purge old tags ...
        tagWrapper.children().remove();

        // ... and create new ones
        _.each(this.model.get('searchTerms'), function(term) {

            var
                tag = tagTemplate.clone().html(term);

            tagWrapper.append(tag);
        });
    },

    //
    // This is a simple routing method to prevent default behavior on a click and trigger a search
    // action in our model.
    //
    handleFormSubmit : function(e) {
        e.preventDefault();
        this.model.buildFormData();
    },

    //
    // This is our method of letting the model we want to remove a search term.
    //
    handleTermRemoval : function(e) {

        var
            target  = $(e.target),
            term    = target.text();

        e.preventDefault();
        this.model.removeSearchTerm(term);
    },

    //
    // This is our method for showing/hiding our loading animation.
    //
    handleLoading : function() {

        if (this.model.get('isLoading')) {
            this.$el.addClass('loading');

        } else {
            this.$el.removeClass('loading');
        }
    }
});