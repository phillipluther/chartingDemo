/*
 * I created a router using the stock Backbone routing functionality to handle both content loads
 * and hitting our service calls.
 *
 * This was primarily just for simplicity and expedience in creating the demo app, so the
 * architecture and routes are pretty simple ... all page routing goes through simple URL hashes,
 * and all services call go through our /service level.
 */

'use_strict'; 

ZE.Structs.Router = Backbone.Router.extend({

    routes : {

        // our (over-simplified) page routing
        ''        : 'loadDefaultPage',
        '*pageId' : 'loadPage'
    },

    //
    // This is our handler for loading our default (home) page. It's just an alias to .loadPage()
    // that passes 'home' as our pageId.
    //
    loadDefaultPage : function() {
        this.loadPage('home');
    },

    //
    // Our handler for loading page content based on the given pageId. We 
    //
    loadPage : function(pageId) {

        var
            // i set up our pages as static views; this controller method could easily be fleshed
            // out to account for pages with dynamic content populated by another service call or
            // some other cleverness for populating more complex views, but for now I'm just using
            // a simple JSON map.
            //
            // I tried to keep it simple and not get too bogged down in having uber-slick views.
            //
            contentAssets = (_.isUndefined(ZE.Content[pageId]))
                ? ZE.Content.error404
                : ZE.Content[pageId],

            contentData = _.extend(contentAssets, {
                pageId : pageId
            });

        if (! _.isUndefined(this.currentPage)) {
            this.currentPage.view.remove();
            this.currentPage.destroy();
        }

        this.currentPage = new ZE.Structs.Models.Page(contentData);
    }
});

// auto-init and start our history; we'll append our router instance to our global object so it's
// accessible app-wide.
ZE.Router = new ZE.Structs.Router();
Backbone.history.start({
    pushState : true
});
