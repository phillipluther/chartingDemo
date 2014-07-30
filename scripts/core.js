/*
 * This is our "core" script for the mini-app, providing namespacing and some miscellaneous
 * utilities.
 */

'use_strict';

var
    // create our namespacing scheme ... a simple Zephyr Exercise object and place for our
    // constructors; this will be extended as future scripts are loaded.
    ZE = {
        Structs : {
            Models  : {},
            Views   : {}
        },

        // here's where we'll stash instances
        Components : {},

        // some general helper methods
        Utils : {

            capitalize : function(str) {

                var
                    firstChar = str.substr(0, 1).toUpperCase(),
                    remainder = str.substr(1, str.length);

                return firstChar + remainder;
            },

            prettify : function(str) {

                var
                    // regex that ...
                    prettyStr = str
                        .replace('_', ' ')
                        .replace('-', ' ');

                return ZE.Utils.capitalize(prettyStr);
            },

            ellipsize : function(str, length) {

                // @future come back to this and make it break only at spaces
                if (_.isUndefined(length)) {
                    length = 25;
                }

                return str.substr(0, length) + '...';
            }
        }
    };
