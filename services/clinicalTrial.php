<?php

/*
 * Here's our simple back-end call to the clinicalTrial.gov site; I tried to keep this pretty
 * light and handle most of the processing on the front-end.
 *
 * Ideally, this would contain some kind of data-caching system that would only make calls to 
 * the clinicaltrials.gov site if it needed to.
 *
 * @future
 *      given time, come back and do that.
 */

    $url    = 'http://clinicaltrial.gov/ct2/results?';
    $params = 'displayxml=true';

    $getKeys = array_keys($_GET);
    for ($i = 0, $n = count($getKeys); $i < $n; $i++) {

        $key = $getKeys[$i];

        $params .= '&' . $key . '=' . $_GET[$key];
    }

    $xmlResponse = file_get_contents($url . $params);
    $xml = simplexml_load_string($xmlResponse);

    //$xml = simplexml_load_file($url . $params);
    //print_r($xml);

    echo json_encode($xml, JSON_PRETTY_PRINT);
