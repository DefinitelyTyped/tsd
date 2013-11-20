// Type definitions for date-utils v1.2.14
// Project: https://github.com/JerrySievert/node-date-utils/
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

//should be like
// declare var Date: {
//interface DateStatic {
declare var Date: {
	today():Date; // today, 00:00:00
	yesterday():Date; // yesterday, 00:00:00
	tomorrow():Date; // tomorrow, 00:00:00

	validateDay(day:number, year:number, month:number):boolean; // true/false whether a date is valid
	validateYear(year:number):boolean; // true/false whether a year is valid
	validateMonth(month:number):boolean; // true/false whether a month is valid
	validateHour(hour:number):boolean; // true/false whether an hour is valid
	validateMinute(minute:number):boolean; // true/false whether a minute is valid
	validateSecond(second:number):boolean; // true/false whether a second is valid
	validateMillisecond(millisecond:number):boolean; // true/false whether a millisecond is valid

	compare(date1:Date, date2:Date):number; // -1 if date1 is smaller than date2, 0 if equal, 1 if date2 is smaller than date1
	equals(date1:Date, date2:Date):boolean; // true/false if date1 is equal to date2

	getDayNumberFromName(name:string):number; // su/sun/sunday - 0, mo/mon/monday - 1, etc
	getMonthNumberFromName(name:string):number; // jan/january - 0, feb/february - 1, etc
	isLeapYear(year:number):boolean; // true/false whether the year is a leap year
	getDaysInMonth(yearr:number, monthNumberr:number):number; // number of days in the month 0-11
}

interface Date {
	clone():Date; // returns a new copy of date object set to the same time
	getMonthAbbr():string; // abreviated month name, Jan, Feb, etc
	getMonthName():string; // fill month name, January, February, etc
	getUTCOffset():number; // returns the UTC offset
	getOrdinalNumber():number; // day number of the year, 1-366 (leap year)
	clearTime():number; // sets time to 00:00:00
	setTimeToNow():void; // sets time to current time
	toFormat(format:string):string; // returns date formatted with:
	// YYYY - Four digit year
	// MMMM - Full month name. ie January
	// MMM  - Short month name. ie Jan
	// MM   - Zero padded month ie 01
	// M    - Month ie 1
	// DDDD - Full day or week name ie Tuesday 
	// DDD  - Abbreviated day of the week ie Tue
	// DD   - Zero padded day ie 08
	// D    - Day ie 8
	// HH24 - Hours in 24 notation ie 18
	// HH   - Padded Hours ie 06
	// H    - Hours ie 6
	// MI   - Padded Minutes
	// SS   - Padded Seconds
	// PP   - AM or PM
	// P    - am or pm
	toYMD(separator:string):string; // returns YYYY-MM-DD by default, separator changes delimiter

	between(date1:Date, date2:Date):boolean; // true/false if the date/time is between date1 and date2
	compareTo(date:Date):number; // -1 if date is smaller than this, 0 if equal, 1 if date is larger than this
	equals(date:Date):boolean; // true/false, true if dates are equal
	isBefore(date:Date):boolean; // true/false, true if this is before date passed
	isAfter(date:Date):boolean; // true/false, true if this is after date passed
	getDaysBetween(date:Date):number; // returns number of full days between this and passed
	getHoursBetween(date:Date):number; // returns number of hours days between this and passed
	getMinutesBetween(date:Date):number; // returns number of full minutes between this and passed
	getSecondsBetween(date:Date):number; // returns number of full seconds between this and passed
	add(map:any):void; // adds time to existing time
	/* {
	 milliseconds: 30,
	 minutes: 1,
	 hours: 4,
	 seconds: 30,
	 days: 2,
	 weeks: 1,
	 months: 3,
	 years: 2
	 } */
	addMilliseconds(amount:number):void; // add milliseconds to existing time
	addSeconds(amount:number):void; // add seconds to existing time
	addMinutes(amount:number):void; // add minutes to existing time
	addHours(amount:number):void; // add hours to existing time
	addDays(amount:number):void; // add days to existing time
	addWeeks(amount:number):void; // add weeks to existing time
	addMonths(amount:number):void; // add months to existing time
	addYears(amount:number):void; // add years to existing time
}