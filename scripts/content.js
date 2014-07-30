/*
 */

'use_strict'; 

ZE.Content = {

    home : {
        title   : 'Home',
        text    : 'This is our home page. It\'s included here just to make sure our routing is working. <a href="chart">Click here<a> for our visualization demo.'
    },

    error404 : {
        title   : 'Uh oh ... ',
        text    : 'The page you requested could not be found.'
    },

    chart : {
        title   : 'Let us chart.',
        text    : 'Enter a search term to query the clinicaltrial.gov site and visualize the results.',

        // optional component views to auto-loaded into our page shell
        componentIds : [
            'clinicalTrialSearch'
        ]
    },

    // our chart options
    statusChart : {
        title       : 'Status Chart',
        subTitle    : 'Source: clinicaltrial.gov'
    },

    detailChart : {
        title       : 'Details by Status',
        subTitle    : 'Source: clinicaltrial.gov'
    }
};