// Type definitions for amCharts
// Project: http://www.amcharts.com/
// Definitions by: aleksey-bykov <https://github.com/aleksey-bykov>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// AmCharts object (it's not a class) is create automatically when amcharts.js or amstock.js file is included in a web page.
declare module AmCharts {

    /** Set it to true if you have base href set for your page. This will fix rendering problems in Firefox caused by base href. */
    var baseHref: boolean;

    /** Array of day names, used when formatting dates (if categoryAxis.parseDates is set to true) ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] */
    var dayNames: string[];

    /** Array of month names, used when formatting dates (if categoryAxis.parseDates is set to true) ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] */
    var monthNames: string[];

    /** Array of short versions of day names, used when formatting dates (if categoryAxis.parseDates is set to true) ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] */
    var shortDayNames: string[];

    /** Array of short versions of month names, used when formatting dates (if categoryAxis.parseDates is set to true) ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] */
    var shortMonthNames: string[];

    /** Set it to true if you want UTC time to be used instead of local time. */
    var useUTC: boolean;

    /** Clears all the charts on page, removes listeners and intervals. */
    function clear();

}
