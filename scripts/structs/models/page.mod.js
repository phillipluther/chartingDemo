/*
 * This is a simple handler for loading top-level pages via our routes.
 */

'use_strict'; 

ZE.Structs.Models.Page = Backbone.Model.extend({

    defaults : {

        // grab a reference to our body element, where all of pages appen to
        appendTo : $('body')
    },

    //
    //
    initialize : function() {

        // set some common attributes on the model
        this.set({

            // create a generic collection for grouping components; we set this as a model
            // attribute assuming we don't need to serialize this model ... instead using it as a
            // simple page manager
            components : new Backbone.Collection()
        });

        // automatically bind our model to a freshly instantiated view, then render
        this.view = new ZE.Structs.Views.Page({
            model : this
        });

        this.view.render();

        // create our component models/views
        this.initComponents();
    },

    //
    // This is our method for initializing additional components. These are defined in our simple 
    // content object.
    //
    initComponents : function() {

        // any component views to pull in?
        _.each(this.get('componentIds'), function(componentId) {

            var
                component = ZE.Utils.capitalize(componentId);

            // we could put some validation around these components to ensure they exist, but for
            // the purposes of this exercise (and time) we'll assume they do. We could also create
            // these from a base component class, much like our pages.

            this.get('components').add(

                ZE.Components[component] = new ZE.Structs.Models[component]({
                    'contentWrapper' : this.view.$el
                })
            );

        }, this);
    }
});