/*! jQuery UI - v1.12.1 - 2017-08-24
* http://jqueryui.com
* Includes: keycode.js, widgets/datepicker.js
* Copyright jQuery Foundation and other contributors; Licensed MIT */

(function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define([ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {

$.ui = $.ui || {};

var version = $.ui.version = "1.12.1";


/*!
 * jQuery UI Keycode 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Keycode
//>>group: Core
//>>description: Provide keycodes as keynames
//>>docs: http://api.jqueryui.com/jQuery.ui.keyCode/


var keycode = $.ui.keyCode = {
	BACKSPACE: 8,
	COMMA: 188,
	DELETE: 46,
	DOWN: 40,
	END: 35,
	ENTER: 13,
	ESCAPE: 27,
	HOME: 36,
	LEFT: 37,
	PAGE_DOWN: 34,
	PAGE_UP: 33,
	PERIOD: 190,
	RIGHT: 39,
	SPACE: 32,
	TAB: 9,
	UP: 38
};


// jscs:disable maximumLineLength
/* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
/*!
 * jQuery UI Datepicker 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Datepicker
//>>group: Widgets
//>>description: Displays a calendar from an input or inline for selecting dates.
//>>docs: http://api.jqueryui.com/datepicker/
//>>demos: http://jqueryui.com/datepicker/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/datepicker.css
//>>css.theme: ../../themes/base/theme.css



$.extend( $.ui, { datepicker: { version: "1.12.1" } } );

var datepicker_instActive;

function datepicker_getZindex( elem ) {
	var position, value;
	while ( elem.length && elem[ 0 ] !== document ) {

		// Ignore z-index if position is set to a value where z-index is ignored by the browser
		// This makes behavior of this function consistent across browsers
		// WebKit always returns auto if the element is positioned
		position = elem.css( "position" );
		if ( position === "absolute" || position === "relative" || position === "fixed" ) {

			// IE returns 0 when zIndex is not specified
			// other browsers return a string
			// we ignore the case of nested elements with an explicit value of 0
			// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
			value = parseInt( elem.css( "zIndex" ), 10 );
			if ( !isNaN( value ) && value !== 0 ) {
				return value;
			}
		}
		elem = elem.parent();
	}

	return 0;
}
/* Date picker manager.
   Use the singleton instance of this class, $.datepicker, to interact with the date picker.
   Settings for (groups of) date pickers are maintained in an instance object,
   allowing multiple different settings on the same page. */

function Datepicker() {
	this._curInst = null; // The current instance in use
	this._keyEvent = false; // If the last event was a key event
	this._disabledInputs = []; // List of date picker inputs that have been disabled
	this._datepickerShowing = false; // True if the popup picker is showing , false if not
	this._inDialog = false; // True if showing within a "dialog", false if not
	this._mainDivId = "ui-datepicker-div"; // The ID of the main datepicker division
	this._inlineClass = "ui-datepicker-inline"; // The name of the inline marker class
	this._appendClass = "ui-datepicker-append"; // The name of the append marker class
	this._triggerClass = "ui-datepicker-trigger"; // The name of the trigger marker class
	this._dialogClass = "ui-datepicker-dialog"; // The name of the dialog marker class
	this._disableClass = "ui-datepicker-disabled"; // The name of the disabled covering marker class
	this._unselectableClass = "ui-datepicker-unselectable"; // The name of the unselectable cell marker class
	this._currentClass = "ui-datepicker-current-day"; // The name of the current day marker class
	this._dayOverClass = "ui-datepicker-days-cell-over"; // The name of the day hover marker class
	this.regional = []; // Available regional settings, indexed by language code
	this.regional[ "" ] = { // Default regional settings
		closeText: "Done", // Display text for close link
		prevText: "Prev", // Display text for previous month link
		nextText: "Next", // Display text for next month link
		currentText: "Today", // Display text for current month link
		monthNames: [ "January","February","March","April","May","June",
			"July","August","September","October","November","December" ], // Names of months for drop-down and formatting
		monthNamesShort: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ], // For formatting
		dayNames: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ], // For formatting
		dayNamesShort: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ], // For formatting
		dayNamesMin: [ "Su","Mo","Tu","We","Th","Fr","Sa" ], // Column headings for days starting at Sunday
		weekHeader: "Wk", // Column header for week of the year
		dateFormat: "mm/dd/yy", // See format options on parseDate
		firstDay: 0, // The first day of the week, Sun = 0, Mon = 1, ...
		isRTL: false, // True if right-to-left language, false if left-to-right
		showMonthAfterYear: false, // True if the year select precedes month, false for month then year
		yearSuffix: "" // Additional text to append to the year in the month headers
	};
	this._defaults = { // Global defaults for all the date picker instances
		showOn: "focus", // "focus" for popup on focus,
			// "button" for trigger button, or "both" for either
		showAnim: "fadeIn", // Name of jQuery animation for popup
		showOptions: {}, // Options for enhanced animations
		defaultDate: null, // Used when field is blank: actual date,
			// +/-number for offset from today, null for today
		appendText: "", // Display text following the input box, e.g. showing the format
		buttonText: "...", // Text for trigger button
		buttonImage: "", // URL for trigger button image
		buttonImageOnly: false, // True if the image appears alone, false if it appears on a button
		hideIfNoPrevNext: false, // True to hide next/previous month links
			// if not applicable, false to just disable them
		navigationAsDateFormat: false, // True if date formatting applied to prev/today/next links
		gotoCurrent: false, // True if today link goes back to current selection instead
		changeMonth: false, // True if month can be selected directly, false if only prev/next
		changeYear: false, // True if year can be selected directly, false if only prev/next
		yearRange: "c-10:c+10", // Range of years to display in drop-down,
			// either relative to today's year (-nn:+nn), relative to currently displayed year
			// (c-nn:c+nn), absolute (nnnn:nnnn), or a combination of the above (nnnn:-n)
		showOtherMonths: false, // True to show dates in other months, false to leave blank
		selectOtherMonths: false, // True to allow selection of dates in other months, false for unselectable
		showWeek: false, // True to show week of the year, false to not show it
		calculateWeek: this.iso8601Week, // How to calculate the week of the year,
			// takes a Date and returns the number of the week for it
		shortYearCutoff: "+10", // Short year values < this are in the current century,
			// > this are in the previous century,
			// string value starting with "+" for current year + value
		minDate: null, // The earliest selectable date, or null for no limit
		maxDate: null, // The latest selectable date, or null for no limit
		duration: "fast", // Duration of display/closure
		beforeShowDay: null, // Function that takes a date and returns an array with
			// [0] = true if selectable, false if not, [1] = custom CSS class name(s) or "",
			// [2] = cell title (optional), e.g. $.datepicker.noWeekends
		beforeShow: null, // Function that takes an input field and
			// returns a set of custom settings for the date picker
		onSelect: null, // Define a callback function when a date is selected
		onChangeMonthYear: null, // Define a callback function when the month or year is changed
		onClose: null, // Define a callback function when the datepicker is closed
		numberOfMonths: 1, // Number of months to show at a time
		showCurrentAtPos: 0, // The position in multipe months at which to show the current month (starting at 0)
		stepMonths: 1, // Number of months to step back/forward
		stepBigMonths: 12, // Number of months to step back/forward for the big links
		altField: "", // Selector for an alternate field to store selected dates into
		altFormat: "", // The date format to use for the alternate field
		constrainInput: true, // The input is constrained by the current date format
		showButtonPanel: false, // True to show button panel, false to not show it
		autoSize: false, // True to size the input for the date format, false to leave as is
		disabled: false // The initial disabled state
	};
	$.extend( this._defaults, this.regional[ "" ] );
	this.regional.en = $.extend( true, {}, this.regional[ "" ] );
	this.regional[ "en-US" ] = $.extend( true, {}, this.regional.en );
	this.dpDiv = datepicker_bindHover( $( "<div id='" + this._mainDivId + "' class='ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>" ) );
}

$.extend( Datepicker.prototype, {
	/* Class name added to elements to indicate already configured with a date picker. */
	markerClassName: "hasDatepicker",

	//Keep track of the maximum number of rows displayed (see #7043)
	maxRows: 4,

	// TODO rename to "widget" when switching to widget factory
	_widgetDatepicker: function() {
		return this.dpDiv;
	},

	/* Override the default settings for all instances of the date picker.
	 * @param  settings  object - the new settings to use as defaults (anonymous object)
	 * @return the manager object
	 */
	setDefaults: function( settings ) {
		datepicker_extendRemove( this._defaults, settings || {} );
		return this;
	},

	/* Attach the date picker to a jQuery selection.
	 * @param  target	element - the target input field or division or span
	 * @param  settings  object - the new settings to use for this date picker instance (anonymous)
	 */
	_attachDatepicker: function( target, settings ) {
		var nodeName, inline, inst;
		nodeName = target.nodeName.toLowerCase();
		inline = ( nodeName === "div" || nodeName === "span" );
		if ( !target.id ) {
			this.uuid += 1;
			target.id = "dp" + this.uuid;
		}
		inst = this._newInst( $( target ), inline );
		inst.settings = $.extend( {}, settings || {} );
		if ( nodeName === "input" ) {
			this._connectDatepicker( target, inst );
		} else if ( inline ) {
			this._inlineDatepicker( target, inst );
		}
	},

	/* Create a new instance object. */
	_newInst: function( target, inline ) {
		var id = target[ 0 ].id.replace( /([^A-Za-z0-9_\-])/g, "\\\\$1" ); // escape jQuery meta chars
		return { id: id, input: target, // associated target
			selectedDay: 0, selectedMonth: 0, selectedYear: 0, // current selection
			drawMonth: 0, drawYear: 0, // month being drawn
			inline: inline, // is datepicker inline or not
			dpDiv: ( !inline ? this.dpDiv : // presentation div
			datepicker_bindHover( $( "<div class='" + this._inlineClass + " ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>" ) ) ) };
	},

	/* Attach the date picker to an input field. */
	_connectDatepicker: function( target, inst ) {
		var input = $( target );
		inst.append = $( [] );
		inst.trigger = $( [] );
		if ( input.hasClass( this.markerClassName ) ) {
			return;
		}
		this._attachments( input, inst );
		input.addClass( this.markerClassName ).on( "keydown", this._doKeyDown ).
			on( "keypress", this._doKeyPress ).on( "keyup", this._doKeyUp );
		this._autoSize( inst );
		$.data( target, "datepicker", inst );

		//If disabled option is true, disable the datepicker once it has been attached to the input (see ticket #5665)
		if ( inst.settings.disabled ) {
			this._disableDatepicker( target );
		}
	},

	/* Make attachments based on settings. */
	_attachments: function( input, inst ) {
		var showOn, buttonText, buttonImage,
			appendText = this._get( inst, "appendText" ),
			isRTL = this._get( inst, "isRTL" );

		if ( inst.append ) {
			inst.append.remove();
		}
		if ( appendText ) {
			inst.append = $( "<span class='" + this._appendClass + "'>" + appendText + "</span>" );
			input[ isRTL ? "before" : "after" ]( inst.append );
		}

		input.off( "focus", this._showDatepicker );

		if ( inst.trigger ) {
			inst.trigger.remove();
		}

		showOn = this._get( inst, "showOn" );
		if ( showOn === "focus" || showOn === "both" ) { // pop-up date picker when in the marked field
			input.on( "focus", this._showDatepicker );
		}
		if ( showOn === "button" || showOn === "both" ) { // pop-up date picker when button clicked
			buttonText = this._get( inst, "buttonText" );
			buttonImage = this._get( inst, "buttonImage" );
			inst.trigger = $( this._get( inst, "buttonImageOnly" ) ?
				$( "<img/>" ).addClass( this._triggerClass ).
					attr( { src: buttonImage, alt: buttonText, title: buttonText } ) :
				$( "<button type='button'></button>" ).addClass( this._triggerClass ).
					html( !buttonImage ? buttonText : $( "<img/>" ).attr(
					{ src:buttonImage, alt:buttonText, title:buttonText } ) ) );
			input[ isRTL ? "before" : "after" ]( inst.trigger );
			inst.trigger.on( "click", function() {
				if ( $.datepicker._datepickerShowing && $.datepicker._lastInput === input[ 0 ] ) {
					$.datepicker._hideDatepicker();
				} else if ( $.datepicker._datepickerShowing && $.datepicker._lastInput !== input[ 0 ] ) {
					$.datepicker._hideDatepicker();
					$.datepicker._showDatepicker( input[ 0 ] );
				} else {
					$.datepicker._showDatepicker( input[ 0 ] );
				}
				return false;
			} );
		}
	},

	/* Apply the maximum length for the date format. */
	_autoSize: function( inst ) {
		if ( this._get( inst, "autoSize" ) && !inst.inline ) {
			var findMax, max, maxI, i,
				date = new Date( 2009, 12 - 1, 20 ), // Ensure double digits
				dateFormat = this._get( inst, "dateFormat" );

			if ( dateFormat.match( /[DM]/ ) ) {
				findMax = function( names ) {
					max = 0;
					maxI = 0;
					for ( i = 0; i < names.length; i++ ) {
						if ( names[ i ].length > max ) {
							max = names[ i ].length;
							maxI = i;
						}
					}
					return maxI;
				};
				date.setMonth( findMax( this._get( inst, ( dateFormat.match( /MM/ ) ?
					"monthNames" : "monthNamesShort" ) ) ) );
				date.setDate( findMax( this._get( inst, ( dateFormat.match( /DD/ ) ?
					"dayNames" : "dayNamesShort" ) ) ) + 20 - date.getDay() );
			}
			inst.input.attr( "size", this._formatDate( inst, date ).length );
		}
	},

	/* Attach an inline date picker to a div. */
	_inlineDatepicker: function( target, inst ) {
		var divSpan = $( target );
		if ( divSpan.hasClass( this.markerClassName ) ) {
			return;
		}
		divSpan.addClass( this.markerClassName ).append( inst.dpDiv );
		$.data( target, "datepicker", inst );
		this._setDate( inst, this._getDefaultDate( inst ), true );
		this._updateDatepicker( inst );
		this._updateAlternate( inst );

		//If disabled option is true, disable the datepicker before showing it (see ticket #5665)
		if ( inst.settings.disabled ) {
			this._disableDatepicker( target );
		}

		// Set display:block in place of inst.dpDiv.show() which won't work on disconnected elements
		// http://bugs.jqueryui.com/ticket/7552 - A Datepicker created on a detached div has zero height
		inst.dpDiv.css( "display", "block" );
	},

	/* Pop-up the date picker in a "dialog" box.
	 * @param  input element - ignored
	 * @param  date	string or Date - the initial date to display
	 * @param  onSelect  function - the function to call when a date is selected
	 * @param  settings  object - update the dialog date picker instance's settings (anonymous object)
	 * @param  pos int[2] - coordinates for the dialog's position within the screen or
	 *					event - with x/y coordinates or
	 *					leave empty for default (screen centre)
	 * @return the manager object
	 */
	_dialogDatepicker: function( input, date, onSelect, settings, pos ) {
		var id, browserWidth, browserHeight, scrollX, scrollY,
			inst = this._dialogInst; // internal instance

		if ( !inst ) {
			this.uuid += 1;
			id = "dp" + this.uuid;
			this._dialogInput = $( "<input type='text' id='" + id +
				"' style='position: absolute; top: -100px; width: 0px;'/>" );
			this._dialogInput.on( "keydown", this._doKeyDown );
			$( "body" ).append( this._dialogInput );
			inst = this._dialogInst = this._newInst( this._dialogInput, false );
			inst.settings = {};
			$.data( this._dialogInput[ 0 ], "datepicker", inst );
		}
		datepicker_extendRemove( inst.settings, settings || {} );
		date = ( date && date.constructor === Date ? this._formatDate( inst, date ) : date );
		this._dialogInput.val( date );

		this._pos = ( pos ? ( pos.length ? pos : [ pos.pageX, pos.pageY ] ) : null );
		if ( !this._pos ) {
			browserWidth = document.documentElement.clientWidth;
			browserHeight = document.documentElement.clientHeight;
			scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
			scrollY = document.documentElement.scrollTop || document.body.scrollTop;
			this._pos = // should use actual width/height below
				[ ( browserWidth / 2 ) - 100 + scrollX, ( browserHeight / 2 ) - 150 + scrollY ];
		}

		// Move input on screen for focus, but hidden behind dialog
		this._dialogInput.css( "left", ( this._pos[ 0 ] + 20 ) + "px" ).css( "top", this._pos[ 1 ] + "px" );
		inst.settings.onSelect = onSelect;
		this._inDialog = true;
		this.dpDiv.addClass( this._dialogClass );
		this._showDatepicker( this._dialogInput[ 0 ] );
		if ( $.blockUI ) {
			$.blockUI( this.dpDiv );
		}
		$.data( this._dialogInput[ 0 ], "datepicker", inst );
		return this;
	},

	/* Detach a datepicker from its control.
	 * @param  target	element - the target input field or division or span
	 */
	_destroyDatepicker: function( target ) {
		var nodeName,
			$target = $( target ),
			inst = $.data( target, "datepicker" );

		if ( !$target.hasClass( this.markerClassName ) ) {
			return;
		}

		nodeName = target.nodeName.toLowerCase();
		$.removeData( target, "datepicker" );
		if ( nodeName === "input" ) {
			inst.append.remove();
			inst.trigger.remove();
			$target.removeClass( this.markerClassName ).
				off( "focus", this._showDatepicker ).
				off( "keydown", this._doKeyDown ).
				off( "keypress", this._doKeyPress ).
				off( "keyup", this._doKeyUp );
		} else if ( nodeName === "div" || nodeName === "span" ) {
			$target.removeClass( this.markerClassName ).empty();
		}

		if ( datepicker_instActive === inst ) {
			datepicker_instActive = null;
		}
	},

	/* Enable the date picker to a jQuery selection.
	 * @param  target	element - the target input field or division or span
	 */
	_enableDatepicker: function( target ) {
		var nodeName, inline,
			$target = $( target ),
			inst = $.data( target, "datepicker" );

		if ( !$target.hasClass( this.markerClassName ) ) {
			return;
		}

		nodeName = target.nodeName.toLowerCase();
		if ( nodeName === "input" ) {
			target.disabled = false;
			inst.trigger.filter( "button" ).
				each( function() { this.disabled = false; } ).end().
				filter( "img" ).css( { opacity: "1.0", cursor: "" } );
		} else if ( nodeName === "div" || nodeName === "span" ) {
			inline = $target.children( "." + this._inlineClass );
			inline.children().removeClass( "ui-state-disabled" );
			inline.find( "select.ui-datepicker-month, select.ui-datepicker-year" ).
				prop( "disabled", false );
		}
		this._disabledInputs = $.map( this._disabledInputs,
			function( value ) { return ( value === target ? null : value ); } ); // delete entry
	},

	/* Disable the date picker to a jQuery selection.
	 * @param  target	element - the target input field or division or span
	 */
	_disableDatepicker: function( target ) {
		var nodeName, inline,
			$target = $( target ),
			inst = $.data( target, "datepicker" );

		if ( !$target.hasClass( this.markerClassName ) ) {
			return;
		}

		nodeName = target.nodeName.toLowerCase();
		if ( nodeName === "input" ) {
			target.disabled = true;
			inst.trigger.filter( "button" ).
				each( function() { this.disabled = true; } ).end().
				filter( "img" ).css( { opacity: "0.5", cursor: "default" } );
		} else if ( nodeName === "div" || nodeName === "span" ) {
			inline = $target.children( "." + this._inlineClass );
			inline.children().addClass( "ui-state-disabled" );
			inline.find( "select.ui-datepicker-month, select.ui-datepicker-year" ).
				prop( "disabled", true );
		}
		this._disabledInputs = $.map( this._disabledInputs,
			function( value ) { return ( value === target ? null : value ); } ); // delete entry
		this._disabledInputs[ this._disabledInputs.length ] = target;
	},

	/* Is the first field in a jQuery collection disabled as a datepicker?
	 * @param  target	element - the target input field or division or span
	 * @return boolean - true if disabled, false if enabled
	 */
	_isDisabledDatepicker: function( target ) {
		if ( !target ) {
			return false;
		}
		for ( var i = 0; i < this._disabledInputs.length; i++ ) {
			if ( this._disabledInputs[ i ] === target ) {
				return true;
			}
		}
		return false;
	},

	/* Retrieve the instance data for the target control.
	 * @param  target  element - the target input field or division or span
	 * @return  object - the associated instance data
	 * @throws  error if a jQuery problem getting data
	 */
	_getInst: function( target ) {
		try {
			return $.data( target, "datepicker" );
		}
		catch ( err ) {
			throw "Missing instance data for this datepicker";
		}
	},

	/* Update or retrieve the settings for a date picker attached to an input field or division.
	 * @param  target  element - the target input field or division or span
	 * @param  name	object - the new settings to update or
	 *				string - the name of the setting to change or retrieve,
	 *				when retrieving also "all" for all instance settings or
	 *				"defaults" for all global defaults
	 * @param  value   any - the new value for the setting
	 *				(omit if above is an object or to retrieve a value)
	 */
	_optionDatepicker: function( target, name, value ) {
		var settings, date, minDate, maxDate,
			inst = this._getInst( target );

		if ( arguments.length === 2 && typeof name === "string" ) {
			return ( name === "defaults" ? $.extend( {}, $.datepicker._defaults ) :
				( inst ? ( name === "all" ? $.extend( {}, inst.settings ) :
				this._get( inst, name ) ) : null ) );
		}

		settings = name || {};
		if ( typeof name === "string" ) {
			settings = {};
			settings[ name ] = value;
		}

		if ( inst ) {
			if ( this._curInst === inst ) {
				this._hideDatepicker();
			}

			date = this._getDateDatepicker( target, true );
			minDate = this._getMinMaxDate( inst, "min" );
			maxDate = this._getMinMaxDate( inst, "max" );
			datepicker_extendRemove( inst.settings, settings );

			// reformat the old minDate/maxDate values if dateFormat changes and a new minDate/maxDate isn't provided
			if ( minDate !== null && settings.dateFormat !== undefined && settings.minDate === undefined ) {
				inst.settings.minDate = this._formatDate( inst, minDate );
			}
			if ( maxDate !== null && settings.dateFormat !== undefined && settings.maxDate === undefined ) {
				inst.settings.maxDate = this._formatDate( inst, maxDate );
			}
			if ( "disabled" in settings ) {
				if ( settings.disabled ) {
					this._disableDatepicker( target );
				} else {
					this._enableDatepicker( target );
				}
			}
			this._attachments( $( target ), inst );
			this._autoSize( inst );
			this._setDate( inst, date );
			this._updateAlternate( inst );
			this._updateDatepicker( inst );
		}
	},

	// Change method deprecated
	_changeDatepicker: function( target, name, value ) {
		this._optionDatepicker( target, name, value );
	},

	/* Redraw the date picker attached to an input field or division.
	 * @param  target  element - the target input field or division or span
	 */
	_refreshDatepicker: function( target ) {
		var inst = this._getInst( target );
		if ( inst ) {
			this._updateDatepicker( inst );
		}
	},

	/* Set the dates for a jQuery selection.
	 * @param  target element - the target input field or division or span
	 * @param  date	Date - the new date
	 */
	_setDateDatepicker: function( target, date ) {
		var inst = this._getInst( target );
		if ( inst ) {
			this._setDate( inst, date );
			this._updateDatepicker( inst );
			this._updateAlternate( inst );
		}
	},

	/* Get the date(s) for the first entry in a jQuery selection.
	 * @param  target element - the target input field or division or span
	 * @param  noDefault boolean - true if no default date is to be used
	 * @return Date - the current date
	 */
	_getDateDatepicker: function( target, noDefault ) {
		var inst = this._getInst( target );
		if ( inst && !inst.inline ) {
			this._setDateFromField( inst, noDefault );
		}
		return ( inst ? this._getDate( inst ) : null );
	},

	/* Handle keystrokes. */
	_doKeyDown: function( event ) {
		var onSelect, dateStr, sel,
			inst = $.datepicker._getInst( event.target ),
			handled = true,
			isRTL = inst.dpDiv.is( ".ui-datepicker-rtl" );

		inst._keyEvent = true;
		if ( $.datepicker._datepickerShowing ) {
			switch ( event.keyCode ) {
				case 9: $.datepicker._hideDatepicker();
						handled = false;
						break; // hide on tab out
				case 13: sel = $( "td." + $.datepicker._dayOverClass + ":not(." +
									$.datepicker._currentClass + ")", inst.dpDiv );
						if ( sel[ 0 ] ) {
							$.datepicker._selectDay( event.target, inst.selectedMonth, inst.selectedYear, sel[ 0 ] );
						}

						onSelect = $.datepicker._get( inst, "onSelect" );
						if ( onSelect ) {
							dateStr = $.datepicker._formatDate( inst );

							// Trigger custom callback
							onSelect.apply( ( inst.input ? inst.input[ 0 ] : null ), [ dateStr, inst ] );
						} else {
							$.datepicker._hideDatepicker();
						}

						return false; // don't submit the form
				case 27: $.datepicker._hideDatepicker();
						break; // hide on escape
				case 33: $.datepicker._adjustDate( event.target, ( event.ctrlKey ?
							-$.datepicker._get( inst, "stepBigMonths" ) :
							-$.datepicker._get( inst, "stepMonths" ) ), "M" );
						break; // previous month/year on page up/+ ctrl
				case 34: $.datepicker._adjustDate( event.target, ( event.ctrlKey ?
							+$.datepicker._get( inst, "stepBigMonths" ) :
							+$.datepicker._get( inst, "stepMonths" ) ), "M" );
						break; // next month/year on page down/+ ctrl
				case 35: if ( event.ctrlKey || event.metaKey ) {
							$.datepicker._clearDate( event.target );
						}
						handled = event.ctrlKey || event.metaKey;
						break; // clear on ctrl or command +end
				case 36: if ( event.ctrlKey || event.metaKey ) {
							$.datepicker._gotoToday( event.target );
						}
						handled = event.ctrlKey || event.metaKey;
						break; // current on ctrl or command +home
				case 37: if ( event.ctrlKey || event.metaKey ) {
							$.datepicker._adjustDate( event.target, ( isRTL ? +1 : -1 ), "D" );
						}
						handled = event.ctrlKey || event.metaKey;

						// -1 day on ctrl or command +left
						if ( event.originalEvent.altKey ) {
							$.datepicker._adjustDate( event.target, ( event.ctrlKey ?
								-$.datepicker._get( inst, "stepBigMonths" ) :
								-$.datepicker._get( inst, "stepMonths" ) ), "M" );
						}

						// next month/year on alt +left on Mac
						break;
				case 38: if ( event.ctrlKey || event.metaKey ) {
							$.datepicker._adjustDate( event.target, -7, "D" );
						}
						handled = event.ctrlKey || event.metaKey;
						break; // -1 week on ctrl or command +up
				case 39: if ( event.ctrlKey || event.metaKey ) {
							$.datepicker._adjustDate( event.target, ( isRTL ? -1 : +1 ), "D" );
						}
						handled = event.ctrlKey || event.metaKey;

						// +1 day on ctrl or command +right
						if ( event.originalEvent.altKey ) {
							$.datepicker._adjustDate( event.target, ( event.ctrlKey ?
								+$.datepicker._get( inst, "stepBigMonths" ) :
								+$.datepicker._get( inst, "stepMonths" ) ), "M" );
						}

						// next month/year on alt +right
						break;
				case 40: if ( event.ctrlKey || event.metaKey ) {
							$.datepicker._adjustDate( event.target, +7, "D" );
						}
						handled = event.ctrlKey || event.metaKey;
						break; // +1 week on ctrl or command +down
				default: handled = false;
			}
		} else if ( event.keyCode === 36 && event.ctrlKey ) { // display the date picker on ctrl+home
			$.datepicker._showDatepicker( this );
		} else {
			handled = false;
		}

		if ( handled ) {
			event.preventDefault();
			event.stopPropagation();
		}
	},

	/* Filter entered characters - based on date format. */
	_doKeyPress: function( event ) {
		var chars, chr,
			inst = $.datepicker._getInst( event.target );

		if ( $.datepicker._get( inst, "constrainInput" ) ) {
			chars = $.datepicker._possibleChars( $.datepicker._get( inst, "dateFormat" ) );
			chr = String.fromCharCode( event.charCode == null ? event.keyCode : event.charCode );
			return event.ctrlKey || event.metaKey || ( chr < " " || !chars || chars.indexOf( chr ) > -1 );
		}
	},

	/* Synchronise manual entry and field/alternate field. */
	_doKeyUp: function( event ) {
		var date,
			inst = $.datepicker._getInst( event.target );

		if ( inst.input.val() !== inst.lastVal ) {
			try {
				date = $.datepicker.parseDate( $.datepicker._get( inst, "dateFormat" ),
					( inst.input ? inst.input.val() : null ),
					$.datepicker._getFormatConfig( inst ) );

				if ( date ) { // only if valid
					$.datepicker._setDateFromField( inst );
					$.datepicker._updateAlternate( inst );
					$.datepicker._updateDatepicker( inst );
				}
			}
			catch ( err ) {
			}
		}
		return true;
	},

	/* Pop-up the date picker for a given input field.
	 * If false returned from beforeShow event handler do not show.
	 * @param  input  element - the input field attached to the date picker or
	 *					event - if triggered by focus
	 */
	_showDatepicker: function( input ) {
		input = input.target || input;
		if ( input.nodeName.toLowerCase() !== "input" ) { // find from button/image trigger
			input = $( "input", input.parentNode )[ 0 ];
		}

		if ( $.datepicker._isDisabledDatepicker( input ) || $.datepicker._lastInput === input ) { // already here
			return;
		}

		var inst, beforeShow, beforeShowSettings, isFixed,
			offset, showAnim, duration;

		inst = $.datepicker._getInst( input );
		if ( $.datepicker._curInst && $.datepicker._curInst !== inst ) {
			$.datepicker._curInst.dpDiv.stop( true, true );
			if ( inst && $.datepicker._datepickerShowing ) {
				$.datepicker._hideDatepicker( $.datepicker._curInst.input[ 0 ] );
			}
		}

		beforeShow = $.datepicker._get( inst, "beforeShow" );
		beforeShowSettings = beforeShow ? beforeShow.apply( input, [ input, inst ] ) : {};
		if ( beforeShowSettings === false ) {
			return;
		}
		datepicker_extendRemove( inst.settings, beforeShowSettings );

		inst.lastVal = null;
		$.datepicker._lastInput = input;
		$.datepicker._setDateFromField( inst );

		if ( $.datepicker._inDialog ) { // hide cursor
			input.value = "";
		}
		if ( !$.datepicker._pos ) { // position below input
			$.datepicker._pos = $.datepicker._findPos( input );
			$.datepicker._pos[ 1 ] += input.offsetHeight; // add the height
		}

		isFixed = false;
		$( input ).parents().each( function() {
			isFixed |= $( this ).css( "position" ) === "fixed";
			return !isFixed;
		} );

		offset = { left: $.datepicker._pos[ 0 ], top: $.datepicker._pos[ 1 ] };
		$.datepicker._pos = null;

		//to avoid flashes on Firefox
		inst.dpDiv.empty();

		// determine sizing offscreen
		inst.dpDiv.css( { position: "absolute", display: "block", top: "-1000px" } );
		$.datepicker._updateDatepicker( inst );

		// fix width for dynamic number of date pickers
		// and adjust position before showing
		offset = $.datepicker._checkOffset( inst, offset, isFixed );
		inst.dpDiv.css( { position: ( $.datepicker._inDialog && $.blockUI ?
			"static" : ( isFixed ? "fixed" : "absolute" ) ), display: "none",
			left: offset.left + "px", top: offset.top + "px" } );

		if ( !inst.inline ) {
			showAnim = $.datepicker._get( inst, "showAnim" );
			duration = $.datepicker._get( inst, "duration" );
			inst.dpDiv.css( "z-index", datepicker_getZindex( $( input ) ) + 1 );
			$.datepicker._datepickerShowing = true;

			if ( $.effects && $.effects.effect[ showAnim ] ) {
				inst.dpDiv.show( showAnim, $.datepicker._get( inst, "showOptions" ), duration );
			} else {
				inst.dpDiv[ showAnim || "show" ]( showAnim ? duration : null );
			}

			if ( $.datepicker._shouldFocusInput( inst ) ) {
				inst.input.trigger( "focus" );
			}

			$.datepicker._curInst = inst;
		}
	},

	/* Generate the date picker content. */
	_updateDatepicker: function( inst ) {
		this.maxRows = 4; //Reset the max number of rows being displayed (see #7043)
		datepicker_instActive = inst; // for delegate hover events
		inst.dpDiv.empty().append( this._generateHTML( inst ) );
		this._attachHandlers( inst );

		var origyearshtml,
			numMonths = this._getNumberOfMonths( inst ),
			cols = numMonths[ 1 ],
			width = 17,
			activeCell = inst.dpDiv.find( "." + this._dayOverClass + " a" );

		if ( activeCell.length > 0 ) {
			datepicker_handleMouseover.apply( activeCell.get( 0 ) );
		}

		inst.dpDiv.removeClass( "ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4" ).width( "" );
		if ( cols > 1 ) {
			inst.dpDiv.addClass( "ui-datepicker-multi-" + cols ).css( "width", ( width * cols ) + "em" );
		}
		inst.dpDiv[ ( numMonths[ 0 ] !== 1 || numMonths[ 1 ] !== 1 ? "add" : "remove" ) +
			"Class" ]( "ui-datepicker-multi" );
		inst.dpDiv[ ( this._get( inst, "isRTL" ) ? "add" : "remove" ) +
			"Class" ]( "ui-datepicker-rtl" );

		if ( inst === $.datepicker._curInst && $.datepicker._datepickerShowing && $.datepicker._shouldFocusInput( inst ) ) {
			inst.input.trigger( "focus" );
		}

		// Deffered render of the years select (to avoid flashes on Firefox)
		if ( inst.yearshtml ) {
			origyearshtml = inst.yearshtml;
			setTimeout( function() {

				//assure that inst.yearshtml didn't change.
				if ( origyearshtml === inst.yearshtml && inst.yearshtml ) {
					inst.dpDiv.find( "select.ui-datepicker-year:first" ).replaceWith( inst.yearshtml );
				}
				origyearshtml = inst.yearshtml = null;
			}, 0 );
		}
	},

	// #6694 - don't focus the input if it's already focused
	// this breaks the change event in IE
	// Support: IE and jQuery <1.9
	_shouldFocusInput: function( inst ) {
		return inst.input && inst.input.is( ":visible" ) && !inst.input.is( ":disabled" ) && !inst.input.is( ":focus" );
	},

	/* Check positioning to remain on screen. */
	_checkOffset: function( inst, offset, isFixed ) {
		var dpWidth = inst.dpDiv.outerWidth(),
			dpHeight = inst.dpDiv.outerHeight(),
			inputWidth = inst.input ? inst.input.outerWidth() : 0,
			inputHeight = inst.input ? inst.input.outerHeight() : 0,
			viewWidth = document.documentElement.clientWidth + ( isFixed ? 0 : $( document ).scrollLeft() ),
			viewHeight = document.documentElement.clientHeight + ( isFixed ? 0 : $( document ).scrollTop() );

		offset.left -= ( this._get( inst, "isRTL" ) ? ( dpWidth - inputWidth ) : 0 );
		offset.left -= ( isFixed && offset.left === inst.input.offset().left ) ? $( document ).scrollLeft() : 0;
		offset.top -= ( isFixed && offset.top === ( inst.input.offset().top + inputHeight ) ) ? $( document ).scrollTop() : 0;

		// Now check if datepicker is showing outside window viewport - move to a better place if so.
		offset.left -= Math.min( offset.left, ( offset.left + dpWidth > viewWidth && viewWidth > dpWidth ) ?
			Math.abs( offset.left + dpWidth - viewWidth ) : 0 );
		offset.top -= Math.min( offset.top, ( offset.top + dpHeight > viewHeight && viewHeight > dpHeight ) ?
			Math.abs( dpHeight + inputHeight ) : 0 );

		return offset;
	},

	/* Find an object's position on the screen. */
	_findPos: function( obj ) {
		var position,
			inst = this._getInst( obj ),
			isRTL = this._get( inst, "isRTL" );

		while ( obj && ( obj.type === "hidden" || obj.nodeType !== 1 || $.expr.filters.hidden( obj ) ) ) {
			obj = obj[ isRTL ? "previousSibling" : "nextSibling" ];
		}

		position = $( obj ).offset();
		return [ position.left, position.top ];
	},

	/* Hide the date picker from view.
	 * @param  input  element - the input field attached to the date picker
	 */
	_hideDatepicker: function( input ) {
		var showAnim, duration, postProcess, onClose,
			inst = this._curInst;

		if ( !inst || ( input && inst !== $.data( input, "datepicker" ) ) ) {
			return;
		}

		if ( this._datepickerShowing ) {
			showAnim = this._get( inst, "showAnim" );
			duration = this._get( inst, "duration" );
			postProcess = function() {
				$.datepicker._tidyDialog( inst );
			};

			// DEPRECATED: after BC for 1.8.x $.effects[ showAnim ] is not needed
			if ( $.effects && ( $.effects.effect[ showAnim ] || $.effects[ showAnim ] ) ) {
				inst.dpDiv.hide( showAnim, $.datepicker._get( inst, "showOptions" ), duration, postProcess );
			} else {
				inst.dpDiv[ ( showAnim === "slideDown" ? "slideUp" :
					( showAnim === "fadeIn" ? "fadeOut" : "hide" ) ) ]( ( showAnim ? duration : null ), postProcess );
			}

			if ( !showAnim ) {
				postProcess();
			}
			this._datepickerShowing = false;

			onClose = this._get( inst, "onClose" );
			if ( onClose ) {
				onClose.apply( ( inst.input ? inst.input[ 0 ] : null ), [ ( inst.input ? inst.input.val() : "" ), inst ] );
			}

			this._lastInput = null;
			if ( this._inDialog ) {
				this._dialogInput.css( { position: "absolute", left: "0", top: "-100px" } );
				if ( $.blockUI ) {
					$.unblockUI();
					$( "body" ).append( this.dpDiv );
				}
			}
			this._inDialog = false;
		}
	},

	/* Tidy up after a dialog display. */
	_tidyDialog: function( inst ) {
		inst.dpDiv.removeClass( this._dialogClass ).off( ".ui-datepicker-calendar" );
	},

	/* Close date picker if clicked elsewhere. */
	_checkExternalClick: function( event ) {
		if ( !$.datepicker._curInst ) {
			return;
		}

		var $target = $( event.target ),
			inst = $.datepicker._getInst( $target[ 0 ] );

		if ( ( ( $target[ 0 ].id !== $.datepicker._mainDivId &&
				$target.parents( "#" + $.datepicker._mainDivId ).length === 0 &&
				!$target.hasClass( $.datepicker.markerClassName ) &&
				!$target.closest( "." + $.datepicker._triggerClass ).length &&
				$.datepicker._datepickerShowing && !( $.datepicker._inDialog && $.blockUI ) ) ) ||
			( $target.hasClass( $.datepicker.markerClassName ) && $.datepicker._curInst !== inst ) ) {
				$.datepicker._hideDatepicker();
		}
	},

	/* Adjust one of the date sub-fields. */
	_adjustDate: function( id, offset, period ) {
		var target = $( id ),
			inst = this._getInst( target[ 0 ] );

		if ( this._isDisabledDatepicker( target[ 0 ] ) ) {
			return;
		}
		this._adjustInstDate( inst, offset +
			( period === "M" ? this._get( inst, "showCurrentAtPos" ) : 0 ), // undo positioning
			period );
		this._updateDatepicker( inst );
	},

	/* Action for current link. */
	_gotoToday: function( id ) {
		var date,
			target = $( id ),
			inst = this._getInst( target[ 0 ] );

		if ( this._get( inst, "gotoCurrent" ) && inst.currentDay ) {
			inst.selectedDay = inst.currentDay;
			inst.drawMonth = inst.selectedMonth = inst.currentMonth;
			inst.drawYear = inst.selectedYear = inst.currentYear;
		} else {
			date = new Date();
			inst.selectedDay = date.getDate();
			inst.drawMonth = inst.selectedMonth = date.getMonth();
			inst.drawYear = inst.selectedYear = date.getFullYear();
		}
		this._notifyChange( inst );
		this._adjustDate( target );
	},

	/* Action for selecting a new month/year. */
	_selectMonthYear: function( id, select, period ) {
		var target = $( id ),
			inst = this._getInst( target[ 0 ] );

		inst[ "selected" + ( period === "M" ? "Month" : "Year" ) ] =
		inst[ "draw" + ( period === "M" ? "Month" : "Year" ) ] =
			parseInt( select.options[ select.selectedIndex ].value, 10 );

		this._notifyChange( inst );
		this._adjustDate( target );
	},

	/* Action for selecting a day. */
	_selectDay: function( id, month, year, td ) {
		var inst,
			target = $( id );

		if ( $( td ).hasClass( this._unselectableClass ) || this._isDisabledDatepicker( target[ 0 ] ) ) {
			return;
		}

		inst = this._getInst( target[ 0 ] );
		inst.selectedDay = inst.currentDay = $( "a", td ).html();
		inst.selectedMonth = inst.currentMonth = month;
		inst.selectedYear = inst.currentYear = year;
		this._selectDate( id, this._formatDate( inst,
			inst.currentDay, inst.currentMonth, inst.currentYear ) );
	},

	/* Erase the input field and hide the date picker. */
	_clearDate: function( id ) {
		var target = $( id );
		this._selectDate( target, "" );
	},

	/* Update the input field with the selected date. */
	_selectDate: function( id, dateStr ) {
		var onSelect,
			target = $( id ),
			inst = this._getInst( target[ 0 ] );

		dateStr = ( dateStr != null ? dateStr : this._formatDate( inst ) );
		if ( inst.input ) {
			inst.input.val( dateStr );
		}
		this._updateAlternate( inst );

		onSelect = this._get( inst, "onSelect" );
		if ( onSelect ) {
			onSelect.apply( ( inst.input ? inst.input[ 0 ] : null ), [ dateStr, inst ] );  // trigger custom callback
		} else if ( inst.input ) {
			inst.input.trigger( "change" ); // fire the change event
		}

		if ( inst.inline ) {
			this._updateDatepicker( inst );
		} else {
			this._hideDatepicker();
			this._lastInput = inst.input[ 0 ];
			if ( typeof( inst.input[ 0 ] ) !== "object" ) {
				inst.input.trigger( "focus" ); // restore focus
			}
			this._lastInput = null;
		}
	},

	/* Update any alternate field to synchronise with the main field. */
	_updateAlternate: function( inst ) {
		var altFormat, date, dateStr,
			altField = this._get( inst, "altField" );

		if ( altField ) { // update alternate field too
			altFormat = this._get( inst, "altFormat" ) || this._get( inst, "dateFormat" );
			date = this._getDate( inst );
			dateStr = this.formatDate( altFormat, date, this._getFormatConfig( inst ) );
			$( altField ).val( dateStr );
		}
	},

	/* Set as beforeShowDay function to prevent selection of weekends.
	 * @param  date  Date - the date to customise
	 * @return [boolean, string] - is this date selectable?, what is its CSS class?
	 */
	noWeekends: function( date ) {
		var day = date.getDay();
		return [ ( day > 0 && day < 6 ), "" ];
	},

	/* Set as calculateWeek to determine the week of the year based on the ISO 8601 definition.
	 * @param  date  Date - the date to get the week for
	 * @return  number - the number of the week within the year that contains this date
	 */
	iso8601Week: function( date ) {
		var time,
			checkDate = new Date( date.getTime() );

		// Find Thursday of this week starting on Monday
		checkDate.setDate( checkDate.getDate() + 4 - ( checkDate.getDay() || 7 ) );

		time = checkDate.getTime();
		checkDate.setMonth( 0 ); // Compare with Jan 1
		checkDate.setDate( 1 );
		return Math.floor( Math.round( ( time - checkDate ) / 86400000 ) / 7 ) + 1;
	},

	/* Parse a string value into a date object.
	 * See formatDate below for the possible formats.
	 *
	 * @param  format string - the expected format of the date
	 * @param  value string - the date in the above format
	 * @param  settings Object - attributes include:
	 *					shortYearCutoff  number - the cutoff year for determining the century (optional)
	 *					dayNamesShort	string[7] - abbreviated names of the days from Sunday (optional)
	 *					dayNames		string[7] - names of the days from Sunday (optional)
	 *					monthNamesShort string[12] - abbreviated names of the months (optional)
	 *					monthNames		string[12] - names of the months (optional)
	 * @return  Date - the extracted date value or null if value is blank
	 */
	parseDate: function( format, value, settings ) {
		if ( format == null || value == null ) {
			throw "Invalid arguments";
		}

		value = ( typeof value === "object" ? value.toString() : value + "" );
		if ( value === "" ) {
			return null;
		}

		var iFormat, dim, extra,
			iValue = 0,
			shortYearCutoffTemp = ( settings ? settings.shortYearCutoff : null ) || this._defaults.shortYearCutoff,
			shortYearCutoff = ( typeof shortYearCutoffTemp !== "string" ? shortYearCutoffTemp :
				new Date().getFullYear() % 100 + parseInt( shortYearCutoffTemp, 10 ) ),
			dayNamesShort = ( settings ? settings.dayNamesShort : null ) || this._defaults.dayNamesShort,
			dayNames = ( settings ? settings.dayNames : null ) || this._defaults.dayNames,
			monthNamesShort = ( settings ? settings.monthNamesShort : null ) || this._defaults.monthNamesShort,
			monthNames = ( settings ? settings.monthNames : null ) || this._defaults.monthNames,
			year = -1,
			month = -1,
			day = -1,
			doy = -1,
			literal = false,
			date,

			// Check whether a format character is doubled
			lookAhead = function( match ) {
				var matches = ( iFormat + 1 < format.length && format.charAt( iFormat + 1 ) === match );
				if ( matches ) {
					iFormat++;
				}
				return matches;
			},

			// Extract a number from the string value
			getNumber = function( match ) {
				var isDoubled = lookAhead( match ),
					size = ( match === "@" ? 14 : ( match === "!" ? 20 :
					( match === "y" && isDoubled ? 4 : ( match === "o" ? 3 : 2 ) ) ) ),
					minSize = ( match === "y" ? size : 1 ),
					digits = new RegExp( "^\\d{" + minSize + "," + size + "}" ),
					num = value.substring( iValue ).match( digits );
				if ( !num ) {
					throw "Missing number at position " + iValue;
				}
				iValue += num[ 0 ].length;
				return parseInt( num[ 0 ], 10 );
			},

			// Extract a name from the string value and convert to an index
			getName = function( match, shortNames, longNames ) {
				var index = -1,
					names = $.map( lookAhead( match ) ? longNames : shortNames, function( v, k ) {
						return [ [ k, v ] ];
					} ).sort( function( a, b ) {
						return -( a[ 1 ].length - b[ 1 ].length );
					} );

				$.each( names, function( i, pair ) {
					var name = pair[ 1 ];
					if ( value.substr( iValue, name.length ).toLowerCase() === name.toLowerCase() ) {
						index = pair[ 0 ];
						iValue += name.length;
						return false;
					}
				} );
				if ( index !== -1 ) {
					return index + 1;
				} else {
					throw "Unknown name at position " + iValue;
				}
			},

			// Confirm that a literal character matches the string value
			checkLiteral = function() {
				if ( value.charAt( iValue ) !== format.charAt( iFormat ) ) {
					throw "Unexpected literal at position " + iValue;
				}
				iValue++;
			};

		for ( iFormat = 0; iFormat < format.length; iFormat++ ) {
			if ( literal ) {
				if ( format.charAt( iFormat ) === "'" && !lookAhead( "'" ) ) {
					literal = false;
				} else {
					checkLiteral();
				}
			} else {
				switch ( format.charAt( iFormat ) ) {
					case "d":
						day = getNumber( "d" );
						break;
					case "D":
						getName( "D", dayNamesShort, dayNames );
						break;
					case "o":
						doy = getNumber( "o" );
						break;
					case "m":
						month = getNumber( "m" );
						break;
					case "M":
						month = getName( "M", monthNamesShort, monthNames );
						break;
					case "y":
						year = getNumber( "y" );
						break;
					case "@":
						date = new Date( getNumber( "@" ) );
						year = date.getFullYear();
						month = date.getMonth() + 1;
						day = date.getDate();
						break;
					case "!":
						date = new Date( ( getNumber( "!" ) - this._ticksTo1970 ) / 10000 );
						year = date.getFullYear();
						month = date.getMonth() + 1;
						day = date.getDate();
						break;
					case "'":
						if ( lookAhead( "'" ) ) {
							checkLiteral();
						} else {
							literal = true;
						}
						break;
					default:
						checkLiteral();
				}
			}
		}

		if ( iValue < value.length ) {
			extra = value.substr( iValue );
			if ( !/^\s+/.test( extra ) ) {
				throw "Extra/unparsed characters found in date: " + extra;
			}
		}

		if ( year === -1 ) {
			year = new Date().getFullYear();
		} else if ( year < 100 ) {
			year += new Date().getFullYear() - new Date().getFullYear() % 100 +
				( year <= shortYearCutoff ? 0 : -100 );
		}

		if ( doy > -1 ) {
			month = 1;
			day = doy;
			do {
				dim = this._getDaysInMonth( year, month - 1 );
				if ( day <= dim ) {
					break;
				}
				month++;
				day -= dim;
			} while ( true );
		}

		date = this._daylightSavingAdjust( new Date( year, month - 1, day ) );
		if ( date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day ) {
			throw "Invalid date"; // E.g. 31/02/00
		}
		return date;
	},

	/* Standard date formats. */
	ATOM: "yy-mm-dd", // RFC 3339 (ISO 8601)
	COOKIE: "D, dd M yy",
	ISO_8601: "yy-mm-dd",
	RFC_822: "D, d M y",
	RFC_850: "DD, dd-M-y",
	RFC_1036: "D, d M y",
	RFC_1123: "D, d M yy",
	RFC_2822: "D, d M yy",
	RSS: "D, d M y", // RFC 822
	TICKS: "!",
	TIMESTAMP: "@",
	W3C: "yy-mm-dd", // ISO 8601

	_ticksTo1970: ( ( ( 1970 - 1 ) * 365 + Math.floor( 1970 / 4 ) - Math.floor( 1970 / 100 ) +
		Math.floor( 1970 / 400 ) ) * 24 * 60 * 60 * 10000000 ),

	/* Format a date object into a string value.
	 * The format can be combinations of the following:
	 * d  - day of month (no leading zero)
	 * dd - day of month (two digit)
	 * o  - day of year (no leading zeros)
	 * oo - day of year (three digit)
	 * D  - day name short
	 * DD - day name long
	 * m  - month of year (no leading zero)
	 * mm - month of year (two digit)
	 * M  - month name short
	 * MM - month name long
	 * y  - year (two digit)
	 * yy - year (four digit)
	 * @ - Unix timestamp (ms since 01/01/1970)
	 * ! - Windows ticks (100ns since 01/01/0001)
	 * "..." - literal text
	 * '' - single quote
	 *
	 * @param  format string - the desired format of the date
	 * @param  date Date - the date value to format
	 * @param  settings Object - attributes include:
	 *					dayNamesShort	string[7] - abbreviated names of the days from Sunday (optional)
	 *					dayNames		string[7] - names of the days from Sunday (optional)
	 *					monthNamesShort string[12] - abbreviated names of the months (optional)
	 *					monthNames		string[12] - names of the months (optional)
	 * @return  string - the date in the above format
	 */
	formatDate: function( format, date, settings ) {
		if ( !date ) {
			return "";
		}

		var iFormat,
			dayNamesShort = ( settings ? settings.dayNamesShort : null ) || this._defaults.dayNamesShort,
			dayNames = ( settings ? settings.dayNames : null ) || this._defaults.dayNames,
			monthNamesShort = ( settings ? settings.monthNamesShort : null ) || this._defaults.monthNamesShort,
			monthNames = ( settings ? settings.monthNames : null ) || this._defaults.monthNames,

			// Check whether a format character is doubled
			lookAhead = function( match ) {
				var matches = ( iFormat + 1 < format.length && format.charAt( iFormat + 1 ) === match );
				if ( matches ) {
					iFormat++;
				}
				return matches;
			},

			// Format a number, with leading zero if necessary
			formatNumber = function( match, value, len ) {
				var num = "" + value;
				if ( lookAhead( match ) ) {
					while ( num.length < len ) {
						num = "0" + num;
					}
				}
				return num;
			},

			// Format a name, short or long as requested
			formatName = function( match, value, shortNames, longNames ) {
				return ( lookAhead( match ) ? longNames[ value ] : shortNames[ value ] );
			},
			output = "",
			literal = false;

		if ( date ) {
			for ( iFormat = 0; iFormat < format.length; iFormat++ ) {
				if ( literal ) {
					if ( format.charAt( iFormat ) === "'" && !lookAhead( "'" ) ) {
						literal = false;
					} else {
						output += format.charAt( iFormat );
					}
				} else {
					switch ( format.charAt( iFormat ) ) {
						case "d":
							output += formatNumber( "d", date.getDate(), 2 );
							break;
						case "D":
							output += formatName( "D", date.getDay(), dayNamesShort, dayNames );
							break;
						case "o":
							output += formatNumber( "o",
								Math.round( ( new Date( date.getFullYear(), date.getMonth(), date.getDate() ).getTime() - new Date( date.getFullYear(), 0, 0 ).getTime() ) / 86400000 ), 3 );
							break;
						case "m":
							output += formatNumber( "m", date.getMonth() + 1, 2 );
							break;
						case "M":
							output += formatName( "M", date.getMonth(), monthNamesShort, monthNames );
							break;
						case "y":
							output += ( lookAhead( "y" ) ? date.getFullYear() :
								( date.getFullYear() % 100 < 10 ? "0" : "" ) + date.getFullYear() % 100 );
							break;
						case "@":
							output += date.getTime();
							break;
						case "!":
							output += date.getTime() * 10000 + this._ticksTo1970;
							break;
						case "'":
							if ( lookAhead( "'" ) ) {
								output += "'";
							} else {
								literal = true;
							}
							break;
						default:
							output += format.charAt( iFormat );
					}
				}
			}
		}
		return output;
	},

	/* Extract all possible characters from the date format. */
	_possibleChars: function( format ) {
		var iFormat,
			chars = "",
			literal = false,

			// Check whether a format character is doubled
			lookAhead = function( match ) {
				var matches = ( iFormat + 1 < format.length && format.charAt( iFormat + 1 ) === match );
				if ( matches ) {
					iFormat++;
				}
				return matches;
			};

		for ( iFormat = 0; iFormat < format.length; iFormat++ ) {
			if ( literal ) {
				if ( format.charAt( iFormat ) === "'" && !lookAhead( "'" ) ) {
					literal = false;
				} else {
					chars += format.charAt( iFormat );
				}
			} else {
				switch ( format.charAt( iFormat ) ) {
					case "d": case "m": case "y": case "@":
						chars += "0123456789";
						break;
					case "D": case "M":
						return null; // Accept anything
					case "'":
						if ( lookAhead( "'" ) ) {
							chars += "'";
						} else {
							literal = true;
						}
						break;
					default:
						chars += format.charAt( iFormat );
				}
			}
		}
		return chars;
	},

	/* Get a setting value, defaulting if necessary. */
	_get: function( inst, name ) {
		return inst.settings[ name ] !== undefined ?
			inst.settings[ name ] : this._defaults[ name ];
	},

	/* Parse existing date and initialise date picker. */
	_setDateFromField: function( inst, noDefault ) {
		if ( inst.input.val() === inst.lastVal ) {
			return;
		}

		var dateFormat = this._get( inst, "dateFormat" ),
			dates = inst.lastVal = inst.input ? inst.input.val() : null,
			defaultDate = this._getDefaultDate( inst ),
			date = defaultDate,
			settings = this._getFormatConfig( inst );

		try {
			date = this.parseDate( dateFormat, dates, settings ) || defaultDate;
		} catch ( event ) {
			dates = ( noDefault ? "" : dates );
		}
		inst.selectedDay = date.getDate();
		inst.drawMonth = inst.selectedMonth = date.getMonth();
		inst.drawYear = inst.selectedYear = date.getFullYear();
		inst.currentDay = ( dates ? date.getDate() : 0 );
		inst.currentMonth = ( dates ? date.getMonth() : 0 );
		inst.currentYear = ( dates ? date.getFullYear() : 0 );
		this._adjustInstDate( inst );
	},

	/* Retrieve the default date shown on opening. */
	_getDefaultDate: function( inst ) {
		return this._restrictMinMax( inst,
			this._determineDate( inst, this._get( inst, "defaultDate" ), new Date() ) );
	},

	/* A date may be specified as an exact value or a relative one. */
	_determineDate: function( inst, date, defaultDate ) {
		var offsetNumeric = function( offset ) {
				var date = new Date();
				date.setDate( date.getDate() + offset );
				return date;
			},
			offsetString = function( offset ) {
				try {
					return $.datepicker.parseDate( $.datepicker._get( inst, "dateFormat" ),
						offset, $.datepicker._getFormatConfig( inst ) );
				}
				catch ( e ) {

					// Ignore
				}

				var date = ( offset.toLowerCase().match( /^c/ ) ?
					$.datepicker._getDate( inst ) : null ) || new Date(),
					year = date.getFullYear(),
					month = date.getMonth(),
					day = date.getDate(),
					pattern = /([+\-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,
					matches = pattern.exec( offset );

				while ( matches ) {
					switch ( matches[ 2 ] || "d" ) {
						case "d" : case "D" :
							day += parseInt( matches[ 1 ], 10 ); break;
						case "w" : case "W" :
							day += parseInt( matches[ 1 ], 10 ) * 7; break;
						case "m" : case "M" :
							month += parseInt( matches[ 1 ], 10 );
							day = Math.min( day, $.datepicker._getDaysInMonth( year, month ) );
							break;
						case "y": case "Y" :
							year += parseInt( matches[ 1 ], 10 );
							day = Math.min( day, $.datepicker._getDaysInMonth( year, month ) );
							break;
					}
					matches = pattern.exec( offset );
				}
				return new Date( year, month, day );
			},
			newDate = ( date == null || date === "" ? defaultDate : ( typeof date === "string" ? offsetString( date ) :
				( typeof date === "number" ? ( isNaN( date ) ? defaultDate : offsetNumeric( date ) ) : new Date( date.getTime() ) ) ) );

		newDate = ( newDate && newDate.toString() === "Invalid Date" ? defaultDate : newDate );
		if ( newDate ) {
			newDate.setHours( 0 );
			newDate.setMinutes( 0 );
			newDate.setSeconds( 0 );
			newDate.setMilliseconds( 0 );
		}
		return this._daylightSavingAdjust( newDate );
	},

	/* Handle switch to/from daylight saving.
	 * Hours may be non-zero on daylight saving cut-over:
	 * > 12 when midnight changeover, but then cannot generate
	 * midnight datetime, so jump to 1AM, otherwise reset.
	 * @param  date  (Date) the date to check
	 * @return  (Date) the corrected date
	 */
	_daylightSavingAdjust: function( date ) {
		if ( !date ) {
			return null;
		}
		date.setHours( date.getHours() > 12 ? date.getHours() + 2 : 0 );
		return date;
	},

	/* Set the date(s) directly. */
	_setDate: function( inst, date, noChange ) {
		var clear = !date,
			origMonth = inst.selectedMonth,
			origYear = inst.selectedYear,
			newDate = this._restrictMinMax( inst, this._determineDate( inst, date, new Date() ) );

		inst.selectedDay = inst.currentDay = newDate.getDate();
		inst.drawMonth = inst.selectedMonth = inst.currentMonth = newDate.getMonth();
		inst.drawYear = inst.selectedYear = inst.currentYear = newDate.getFullYear();
		if ( ( origMonth !== inst.selectedMonth || origYear !== inst.selectedYear ) && !noChange ) {
			this._notifyChange( inst );
		}
		this._adjustInstDate( inst );
		if ( inst.input ) {
			inst.input.val( clear ? "" : this._formatDate( inst ) );
		}
	},

	/* Retrieve the date(s) directly. */
	_getDate: function( inst ) {
		var startDate = ( !inst.currentYear || ( inst.input && inst.input.val() === "" ) ? null :
			this._daylightSavingAdjust( new Date(
			inst.currentYear, inst.currentMonth, inst.currentDay ) ) );
			return startDate;
	},

	/* Attach the onxxx handlers.  These are declared statically so
	 * they work with static code transformers like Caja.
	 */
	_attachHandlers: function( inst ) {
		var stepMonths = this._get( inst, "stepMonths" ),
			id = "#" + inst.id.replace( /\\\\/g, "\\" );
		inst.dpDiv.find( "[data-handler]" ).map( function() {
			var handler = {
				prev: function() {
					$.datepicker._adjustDate( id, -stepMonths, "M" );
				},
				next: function() {
					$.datepicker._adjustDate( id, +stepMonths, "M" );
				},
				hide: function() {
					$.datepicker._hideDatepicker();
				},
				today: function() {
					$.datepicker._gotoToday( id );
				},
				selectDay: function() {
					$.datepicker._selectDay( id, +this.getAttribute( "data-month" ), +this.getAttribute( "data-year" ), this );
					return false;
				},
				selectMonth: function() {
					$.datepicker._selectMonthYear( id, this, "M" );
					return false;
				},
				selectYear: function() {
					$.datepicker._selectMonthYear( id, this, "Y" );
					return false;
				}
			};
			$( this ).on( this.getAttribute( "data-event" ), handler[ this.getAttribute( "data-handler" ) ] );
		} );
	},

	/* Generate the HTML for the current state of the date picker. */
	_generateHTML: function( inst ) {
		var maxDraw, prevText, prev, nextText, next, currentText, gotoDate,
			controls, buttonPanel, firstDay, showWeek, dayNames, dayNamesMin,
			monthNames, monthNamesShort, beforeShowDay, showOtherMonths,
			selectOtherMonths, defaultDate, html, dow, row, group, col, selectedDate,
			cornerClass, calender, thead, day, daysInMonth, leadDays, curRows, numRows,
			printDate, dRow, tbody, daySettings, otherMonth, unselectable,
			tempDate = new Date(),
			today = this._daylightSavingAdjust(
				new Date( tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate() ) ), // clear time
			isRTL = this._get( inst, "isRTL" ),
			showButtonPanel = this._get( inst, "showButtonPanel" ),
			hideIfNoPrevNext = this._get( inst, "hideIfNoPrevNext" ),
			navigationAsDateFormat = this._get( inst, "navigationAsDateFormat" ),
			numMonths = this._getNumberOfMonths( inst ),
			showCurrentAtPos = this._get( inst, "showCurrentAtPos" ),
			stepMonths = this._get( inst, "stepMonths" ),
			isMultiMonth = ( numMonths[ 0 ] !== 1 || numMonths[ 1 ] !== 1 ),
			currentDate = this._daylightSavingAdjust( ( !inst.currentDay ? new Date( 9999, 9, 9 ) :
				new Date( inst.currentYear, inst.currentMonth, inst.currentDay ) ) ),
			minDate = this._getMinMaxDate( inst, "min" ),
			maxDate = this._getMinMaxDate( inst, "max" ),
			drawMonth = inst.drawMonth - showCurrentAtPos,
			drawYear = inst.drawYear;

		if ( drawMonth < 0 ) {
			drawMonth += 12;
			drawYear--;
		}
		if ( maxDate ) {
			maxDraw = this._daylightSavingAdjust( new Date( maxDate.getFullYear(),
				maxDate.getMonth() - ( numMonths[ 0 ] * numMonths[ 1 ] ) + 1, maxDate.getDate() ) );
			maxDraw = ( minDate && maxDraw < minDate ? minDate : maxDraw );
			while ( this._daylightSavingAdjust( new Date( drawYear, drawMonth, 1 ) ) > maxDraw ) {
				drawMonth--;
				if ( drawMonth < 0 ) {
					drawMonth = 11;
					drawYear--;
				}
			}
		}
		inst.drawMonth = drawMonth;
		inst.drawYear = drawYear;

		prevText = this._get( inst, "prevText" );
		prevText = ( !navigationAsDateFormat ? prevText : this.formatDate( prevText,
			this._daylightSavingAdjust( new Date( drawYear, drawMonth - stepMonths, 1 ) ),
			this._getFormatConfig( inst ) ) );

		prev = ( this._canAdjustMonth( inst, -1, drawYear, drawMonth ) ?
			"<a class='ui-datepicker-prev ui-corner-all' data-handler='prev' data-event='click'" +
			" title='" + prevText + "'><span class='ui-icon ui-icon-circle-triangle-" + ( isRTL ? "e" : "w" ) + "'>" + prevText + "</span></a>" :
			( hideIfNoPrevNext ? "" : "<a class='ui-datepicker-prev ui-corner-all ui-state-disabled' title='" + prevText + "'><span class='ui-icon ui-icon-circle-triangle-" + ( isRTL ? "e" : "w" ) + "'>" + prevText + "</span></a>" ) );

		nextText = this._get( inst, "nextText" );
		nextText = ( !navigationAsDateFormat ? nextText : this.formatDate( nextText,
			this._daylightSavingAdjust( new Date( drawYear, drawMonth + stepMonths, 1 ) ),
			this._getFormatConfig( inst ) ) );

		next = ( this._canAdjustMonth( inst, +1, drawYear, drawMonth ) ?
			"<a class='ui-datepicker-next ui-corner-all' data-handler='next' data-event='click'" +
			" title='" + nextText + "'><span class='ui-icon ui-icon-circle-triangle-" + ( isRTL ? "w" : "e" ) + "'>" + nextText + "</span></a>" :
			( hideIfNoPrevNext ? "" : "<a class='ui-datepicker-next ui-corner-all ui-state-disabled' title='" + nextText + "'><span class='ui-icon ui-icon-circle-triangle-" + ( isRTL ? "w" : "e" ) + "'>" + nextText + "</span></a>" ) );

		currentText = this._get( inst, "currentText" );
		gotoDate = ( this._get( inst, "gotoCurrent" ) && inst.currentDay ? currentDate : today );
		currentText = ( !navigationAsDateFormat ? currentText :
			this.formatDate( currentText, gotoDate, this._getFormatConfig( inst ) ) );

		controls = ( !inst.inline ? "<button type='button' class='ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all' data-handler='hide' data-event='click'>" +
			this._get( inst, "closeText" ) + "</button>" : "" );

		buttonPanel = ( showButtonPanel ) ? "<div class='ui-datepicker-buttonpane ui-widget-content'>" + ( isRTL ? controls : "" ) +
			( this._isInRange( inst, gotoDate ) ? "<button type='button' class='ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all' data-handler='today' data-event='click'" +
			">" + currentText + "</button>" : "" ) + ( isRTL ? "" : controls ) + "</div>" : "";

		firstDay = parseInt( this._get( inst, "firstDay" ), 10 );
		firstDay = ( isNaN( firstDay ) ? 0 : firstDay );

		showWeek = this._get( inst, "showWeek" );
		dayNames = this._get( inst, "dayNames" );
		dayNamesMin = this._get( inst, "dayNamesMin" );
		monthNames = this._get( inst, "monthNames" );
		monthNamesShort = this._get( inst, "monthNamesShort" );
		beforeShowDay = this._get( inst, "beforeShowDay" );
		showOtherMonths = this._get( inst, "showOtherMonths" );
		selectOtherMonths = this._get( inst, "selectOtherMonths" );
		defaultDate = this._getDefaultDate( inst );
		html = "";

		for ( row = 0; row < numMonths[ 0 ]; row++ ) {
			group = "";
			this.maxRows = 4;
			for ( col = 0; col < numMonths[ 1 ]; col++ ) {
				selectedDate = this._daylightSavingAdjust( new Date( drawYear, drawMonth, inst.selectedDay ) );
				cornerClass = " ui-corner-all";
				calender = "";
				if ( isMultiMonth ) {
					calender += "<div class='ui-datepicker-group";
					if ( numMonths[ 1 ] > 1 ) {
						switch ( col ) {
							case 0: calender += " ui-datepicker-group-first";
								cornerClass = " ui-corner-" + ( isRTL ? "right" : "left" ); break;
							case numMonths[ 1 ] - 1: calender += " ui-datepicker-group-last";
								cornerClass = " ui-corner-" + ( isRTL ? "left" : "right" ); break;
							default: calender += " ui-datepicker-group-middle"; cornerClass = ""; break;
						}
					}
					calender += "'>";
				}
				calender += "<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix" + cornerClass + "'>" +
					( /all|left/.test( cornerClass ) && row === 0 ? ( isRTL ? next : prev ) : "" ) +
					( /all|right/.test( cornerClass ) && row === 0 ? ( isRTL ? prev : next ) : "" ) +
					this._generateMonthYearHeader( inst, drawMonth, drawYear, minDate, maxDate,
					row > 0 || col > 0, monthNames, monthNamesShort ) + // draw month headers
					"</div><table class='ui-datepicker-calendar'><thead>" +
					"<tr>";
				thead = ( showWeek ? "<th class='ui-datepicker-week-col'>" + this._get( inst, "weekHeader" ) + "</th>" : "" );
				for ( dow = 0; dow < 7; dow++ ) { // days of the week
					day = ( dow + firstDay ) % 7;
					thead += "<th scope='col'" + ( ( dow + firstDay + 6 ) % 7 >= 5 ? " class='ui-datepicker-week-end'" : "" ) + ">" +
						"<span title='" + dayNames[ day ] + "'>" + dayNamesMin[ day ] + "</span></th>";
				}
				calender += thead + "</tr></thead><tbody>";
				daysInMonth = this._getDaysInMonth( drawYear, drawMonth );
				if ( drawYear === inst.selectedYear && drawMonth === inst.selectedMonth ) {
					inst.selectedDay = Math.min( inst.selectedDay, daysInMonth );
				}
				leadDays = ( this._getFirstDayOfMonth( drawYear, drawMonth ) - firstDay + 7 ) % 7;
				curRows = Math.ceil( ( leadDays + daysInMonth ) / 7 ); // calculate the number of rows to generate
				numRows = ( isMultiMonth ? this.maxRows > curRows ? this.maxRows : curRows : curRows ); //If multiple months, use the higher number of rows (see #7043)
				this.maxRows = numRows;
				printDate = this._daylightSavingAdjust( new Date( drawYear, drawMonth, 1 - leadDays ) );
				for ( dRow = 0; dRow < numRows; dRow++ ) { // create date picker rows
					calender += "<tr>";
					tbody = ( !showWeek ? "" : "<td class='ui-datepicker-week-col'>" +
						this._get( inst, "calculateWeek" )( printDate ) + "</td>" );
					for ( dow = 0; dow < 7; dow++ ) { // create date picker days
						daySettings = ( beforeShowDay ?
							beforeShowDay.apply( ( inst.input ? inst.input[ 0 ] : null ), [ printDate ] ) : [ true, "" ] );
						otherMonth = ( printDate.getMonth() !== drawMonth );
						unselectable = ( otherMonth && !selectOtherMonths ) || !daySettings[ 0 ] ||
							( minDate && printDate < minDate ) || ( maxDate && printDate > maxDate );
						tbody += "<td class='" +
							( ( dow + firstDay + 6 ) % 7 >= 5 ? " ui-datepicker-week-end" : "" ) + // highlight weekends
							( otherMonth ? " ui-datepicker-other-month" : "" ) + // highlight days from other months
							( ( printDate.getTime() === selectedDate.getTime() && drawMonth === inst.selectedMonth && inst._keyEvent ) || // user pressed key
							( defaultDate.getTime() === printDate.getTime() && defaultDate.getTime() === selectedDate.getTime() ) ?

							// or defaultDate is current printedDate and defaultDate is selectedDate
							" " + this._dayOverClass : "" ) + // highlight selected day
							( unselectable ? " " + this._unselectableClass + " ui-state-disabled" : "" ) +  // highlight unselectable days
							( otherMonth && !showOtherMonths ? "" : " " + daySettings[ 1 ] + // highlight custom dates
							( printDate.getTime() === currentDate.getTime() ? " " + this._currentClass : "" ) + // highlight selected day
							( printDate.getTime() === today.getTime() ? " ui-datepicker-today" : "" ) ) + "'" + // highlight today (if different)
							( ( !otherMonth || showOtherMonths ) && daySettings[ 2 ] ? " title='" + daySettings[ 2 ].replace( /'/g, "&#39;" ) + "'" : "" ) + // cell title
							( unselectable ? "" : " data-handler='selectDay' data-event='click' data-month='" + printDate.getMonth() + "' data-year='" + printDate.getFullYear() + "'" ) + ">" + // actions
							( otherMonth && !showOtherMonths ? "&#xa0;" : // display for other months
							( unselectable ? "<span class='ui-state-default'>" + printDate.getDate() + "</span>" : "<a class='ui-state-default" +
							( printDate.getTime() === today.getTime() ? " ui-state-highlight" : "" ) +
							( printDate.getTime() === currentDate.getTime() ? " ui-state-active" : "" ) + // highlight selected day
							( otherMonth ? " ui-priority-secondary" : "" ) + // distinguish dates from other months
							"' href='#'>" + printDate.getDate() + "</a>" ) ) + "</td>"; // display selectable date
						printDate.setDate( printDate.getDate() + 1 );
						printDate = this._daylightSavingAdjust( printDate );
					}
					calender += tbody + "</tr>";
				}
				drawMonth++;
				if ( drawMonth > 11 ) {
					drawMonth = 0;
					drawYear++;
				}
				calender += "</tbody></table>" + ( isMultiMonth ? "</div>" +
							( ( numMonths[ 0 ] > 0 && col === numMonths[ 1 ] - 1 ) ? "<div class='ui-datepicker-row-break'></div>" : "" ) : "" );
				group += calender;
			}
			html += group;
		}
		html += buttonPanel;
		inst._keyEvent = false;
		return html;
	},

	/* Generate the month and year header. */
	_generateMonthYearHeader: function( inst, drawMonth, drawYear, minDate, maxDate,
			secondary, monthNames, monthNamesShort ) {

		var inMinYear, inMaxYear, month, years, thisYear, determineYear, year, endYear,
			changeMonth = this._get( inst, "changeMonth" ),
			changeYear = this._get( inst, "changeYear" ),
			showMonthAfterYear = this._get( inst, "showMonthAfterYear" ),
			html = "<div class='ui-datepicker-title'>",
			monthHtml = "";

		// Month selection
		if ( secondary || !changeMonth ) {
			monthHtml += "<span class='ui-datepicker-month'>" + monthNames[ drawMonth ] + "</span>";
		} else {
			inMinYear = ( minDate && minDate.getFullYear() === drawYear );
			inMaxYear = ( maxDate && maxDate.getFullYear() === drawYear );
			monthHtml += "<select class='ui-datepicker-month' data-handler='selectMonth' data-event='change'>";
			for ( month = 0; month < 12; month++ ) {
				if ( ( !inMinYear || month >= minDate.getMonth() ) && ( !inMaxYear || month <= maxDate.getMonth() ) ) {
					monthHtml += "<option value='" + month + "'" +
						( month === drawMonth ? " selected='selected'" : "" ) +
						">" + monthNamesShort[ month ] + "</option>";
				}
			}
			monthHtml += "</select>";
		}

		if ( !showMonthAfterYear ) {
			html += monthHtml + ( secondary || !( changeMonth && changeYear ) ? "&#xa0;" : "" );
		}

		// Year selection
		if ( !inst.yearshtml ) {
			inst.yearshtml = "";
			if ( secondary || !changeYear ) {
				html += "<span class='ui-datepicker-year'>" + drawYear + "</span>";
			} else {

				// determine range of years to display
				years = this._get( inst, "yearRange" ).split( ":" );
				thisYear = new Date().getFullYear();
				determineYear = function( value ) {
					var year = ( value.match( /c[+\-].*/ ) ? drawYear + parseInt( value.substring( 1 ), 10 ) :
						( value.match( /[+\-].*/ ) ? thisYear + parseInt( value, 10 ) :
						parseInt( value, 10 ) ) );
					return ( isNaN( year ) ? thisYear : year );
				};
				year = determineYear( years[ 0 ] );
				endYear = Math.max( year, determineYear( years[ 1 ] || "" ) );
				year = ( minDate ? Math.max( year, minDate.getFullYear() ) : year );
				endYear = ( maxDate ? Math.min( endYear, maxDate.getFullYear() ) : endYear );
				inst.yearshtml += "<select class='ui-datepicker-year' data-handler='selectYear' data-event='change'>";
				for ( ; year <= endYear; year++ ) {
					inst.yearshtml += "<option value='" + year + "'" +
						( year === drawYear ? " selected='selected'" : "" ) +
						">" + year + "</option>";
				}
				inst.yearshtml += "</select>";

				html += inst.yearshtml;
				inst.yearshtml = null;
			}
		}

		html += this._get( inst, "yearSuffix" );
		if ( showMonthAfterYear ) {
			html += ( secondary || !( changeMonth && changeYear ) ? "&#xa0;" : "" ) + monthHtml;
		}
		html += "</div>"; // Close datepicker_header
		return html;
	},

	/* Adjust one of the date sub-fields. */
	_adjustInstDate: function( inst, offset, period ) {
		var year = inst.selectedYear + ( period === "Y" ? offset : 0 ),
			month = inst.selectedMonth + ( period === "M" ? offset : 0 ),
			day = Math.min( inst.selectedDay, this._getDaysInMonth( year, month ) ) + ( period === "D" ? offset : 0 ),
			date = this._restrictMinMax( inst, this._daylightSavingAdjust( new Date( year, month, day ) ) );

		inst.selectedDay = date.getDate();
		inst.drawMonth = inst.selectedMonth = date.getMonth();
		inst.drawYear = inst.selectedYear = date.getFullYear();
		if ( period === "M" || period === "Y" ) {
			this._notifyChange( inst );
		}
	},

	/* Ensure a date is within any min/max bounds. */
	_restrictMinMax: function( inst, date ) {
		var minDate = this._getMinMaxDate( inst, "min" ),
			maxDate = this._getMinMaxDate( inst, "max" ),
			newDate = ( minDate && date < minDate ? minDate : date );
		return ( maxDate && newDate > maxDate ? maxDate : newDate );
	},

	/* Notify change of month/year. */
	_notifyChange: function( inst ) {
		var onChange = this._get( inst, "onChangeMonthYear" );
		if ( onChange ) {
			onChange.apply( ( inst.input ? inst.input[ 0 ] : null ),
				[ inst.selectedYear, inst.selectedMonth + 1, inst ] );
		}
	},

	/* Determine the number of months to show. */
	_getNumberOfMonths: function( inst ) {
		var numMonths = this._get( inst, "numberOfMonths" );
		return ( numMonths == null ? [ 1, 1 ] : ( typeof numMonths === "number" ? [ 1, numMonths ] : numMonths ) );
	},

	/* Determine the current maximum date - ensure no time components are set. */
	_getMinMaxDate: function( inst, minMax ) {
		return this._determineDate( inst, this._get( inst, minMax + "Date" ), null );
	},

	/* Find the number of days in a given month. */
	_getDaysInMonth: function( year, month ) {
		return 32 - this._daylightSavingAdjust( new Date( year, month, 32 ) ).getDate();
	},

	/* Find the day of the week of the first of a month. */
	_getFirstDayOfMonth: function( year, month ) {
		return new Date( year, month, 1 ).getDay();
	},

	/* Determines if we should allow a "next/prev" month display change. */
	_canAdjustMonth: function( inst, offset, curYear, curMonth ) {
		var numMonths = this._getNumberOfMonths( inst ),
			date = this._daylightSavingAdjust( new Date( curYear,
			curMonth + ( offset < 0 ? offset : numMonths[ 0 ] * numMonths[ 1 ] ), 1 ) );

		if ( offset < 0 ) {
			date.setDate( this._getDaysInMonth( date.getFullYear(), date.getMonth() ) );
		}
		return this._isInRange( inst, date );
	},

	/* Is the given date in the accepted range? */
	_isInRange: function( inst, date ) {
		var yearSplit, currentYear,
			minDate = this._getMinMaxDate( inst, "min" ),
			maxDate = this._getMinMaxDate( inst, "max" ),
			minYear = null,
			maxYear = null,
			years = this._get( inst, "yearRange" );
			if ( years ) {
				yearSplit = years.split( ":" );
				currentYear = new Date().getFullYear();
				minYear = parseInt( yearSplit[ 0 ], 10 );
				maxYear = parseInt( yearSplit[ 1 ], 10 );
				if ( yearSplit[ 0 ].match( /[+\-].*/ ) ) {
					minYear += currentYear;
				}
				if ( yearSplit[ 1 ].match( /[+\-].*/ ) ) {
					maxYear += currentYear;
				}
			}

		return ( ( !minDate || date.getTime() >= minDate.getTime() ) &&
			( !maxDate || date.getTime() <= maxDate.getTime() ) &&
			( !minYear || date.getFullYear() >= minYear ) &&
			( !maxYear || date.getFullYear() <= maxYear ) );
	},

	/* Provide the configuration settings for formatting/parsing. */
	_getFormatConfig: function( inst ) {
		var shortYearCutoff = this._get( inst, "shortYearCutoff" );
		shortYearCutoff = ( typeof shortYearCutoff !== "string" ? shortYearCutoff :
			new Date().getFullYear() % 100 + parseInt( shortYearCutoff, 10 ) );
		return { shortYearCutoff: shortYearCutoff,
			dayNamesShort: this._get( inst, "dayNamesShort" ), dayNames: this._get( inst, "dayNames" ),
			monthNamesShort: this._get( inst, "monthNamesShort" ), monthNames: this._get( inst, "monthNames" ) };
	},

	/* Format the given date for display. */
	_formatDate: function( inst, day, month, year ) {
		if ( !day ) {
			inst.currentDay = inst.selectedDay;
			inst.currentMonth = inst.selectedMonth;
			inst.currentYear = inst.selectedYear;
		}
		var date = ( day ? ( typeof day === "object" ? day :
			this._daylightSavingAdjust( new Date( year, month, day ) ) ) :
			this._daylightSavingAdjust( new Date( inst.currentYear, inst.currentMonth, inst.currentDay ) ) );
		return this.formatDate( this._get( inst, "dateFormat" ), date, this._getFormatConfig( inst ) );
	}
} );

/*
 * Bind hover events for datepicker elements.
 * Done via delegate so the binding only occurs once in the lifetime of the parent div.
 * Global datepicker_instActive, set by _updateDatepicker allows the handlers to find their way back to the active picker.
 */
function datepicker_bindHover( dpDiv ) {
	var selector = "button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a";
	return dpDiv.on( "mouseout", selector, function() {
			$( this ).removeClass( "ui-state-hover" );
			if ( this.className.indexOf( "ui-datepicker-prev" ) !== -1 ) {
				$( this ).removeClass( "ui-datepicker-prev-hover" );
			}
			if ( this.className.indexOf( "ui-datepicker-next" ) !== -1 ) {
				$( this ).removeClass( "ui-datepicker-next-hover" );
			}
		} )
		.on( "mouseover", selector, datepicker_handleMouseover );
}

function datepicker_handleMouseover() {
	if ( !$.datepicker._isDisabledDatepicker( datepicker_instActive.inline ? datepicker_instActive.dpDiv.parent()[ 0 ] : datepicker_instActive.input[ 0 ] ) ) {
		$( this ).parents( ".ui-datepicker-calendar" ).find( "a" ).removeClass( "ui-state-hover" );
		$( this ).addClass( "ui-state-hover" );
		if ( this.className.indexOf( "ui-datepicker-prev" ) !== -1 ) {
			$( this ).addClass( "ui-datepicker-prev-hover" );
		}
		if ( this.className.indexOf( "ui-datepicker-next" ) !== -1 ) {
			$( this ).addClass( "ui-datepicker-next-hover" );
		}
	}
}

/* jQuery extend now ignores nulls! */
function datepicker_extendRemove( target, props ) {
	$.extend( target, props );
	for ( var name in props ) {
		if ( props[ name ] == null ) {
			target[ name ] = props[ name ];
		}
	}
	return target;
}

/* Invoke the datepicker functionality.
   @param  options  string - a command, optionally followed by additional parameters or
					Object - settings for attaching new datepicker functionality
   @return  jQuery object */
$.fn.datepicker = function( options ) {

	/* Verify an empty collection wasn't passed - Fixes #6976 */
	if ( !this.length ) {
		return this;
	}

	/* Initialise the date picker. */
	if ( !$.datepicker.initialized ) {
		$( document ).on( "mousedown", $.datepicker._checkExternalClick );
		$.datepicker.initialized = true;
	}

	/* Append datepicker main container to body if not exist. */
	if ( $( "#" + $.datepicker._mainDivId ).length === 0 ) {
		$( "body" ).append( $.datepicker.dpDiv );
	}

	var otherArgs = Array.prototype.slice.call( arguments, 1 );
	if ( typeof options === "string" && ( options === "isDisabled" || options === "getDate" || options === "widget" ) ) {
		return $.datepicker[ "_" + options + "Datepicker" ].
			apply( $.datepicker, [ this[ 0 ] ].concat( otherArgs ) );
	}
	if ( options === "option" && arguments.length === 2 && typeof arguments[ 1 ] === "string" ) {
		return $.datepicker[ "_" + options + "Datepicker" ].
			apply( $.datepicker, [ this[ 0 ] ].concat( otherArgs ) );
	}
	return this.each( function() {
		typeof options === "string" ?
			$.datepicker[ "_" + options + "Datepicker" ].
				apply( $.datepicker, [ this ].concat( otherArgs ) ) :
			$.datepicker._attachDatepicker( this, options );
	} );
};

$.datepicker = new Datepicker(); // singleton instance
$.datepicker.initialized = false;
$.datepicker.uuid = new Date().getTime();
$.datepicker.version = "1.12.1";

var widgetsDatepicker = $.datepicker;

}));

$(function($){
    $.datepicker.regional['en-GB'] = {
        closeText: 'Done',
        prevText: 'Prev',
        nextText: 'Next',
        currentText: 'Today',
        monthNames: ['January','February','March','April','May','June', 'July','August','September','October','November','December'],
        monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        dayNamesMin: ['Su','Mo','Tu','We','Th','Fr','Sa'],
        weekHeader: 'Wk',
        dateFormat: 'dd.mm.yy',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
});

$(function($){
    $.datepicker.regional['ru-RU'] = {
        closeText: 'Закрыть',
        prevText: '&#x3c;Пред',
        nextText: 'След&#x3e;',
        currentText: 'Сегодня',
        monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь', 'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
        monthNamesShort: ['Янв','Фев','Мар','Апр','Май','Июн', 'Июл','Авг','Сен','Окт','Ноя','Дек'],
        dayNames: ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'],
        dayNamesShort: ['вск','пнд','втр','срд','чтв','птн','сбт'],
        dayNamesMin: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
        weekHeader: 'Нед',
        dateFormat: 'dd.mm.yy',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
});

/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Open source under the BSD License. 
 * 
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
	def: 'easeOutQuad',
	swing: function (x, t, b, c, d) {
		//alert(jQuery.easing.default);
		return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
	},
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
});
/**
 * Owl Carousel v2.0.0-beta.3
 * Copyright 2013-2015 Smashing Boxes
 * Licensed under MIT (https://github.com/smashingboxes/OwlCarousel2/blob/master/LICENSE)
 */
/**
 * Owl carousel
 * @version 2.0.0-beta.3
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 * @todo Lazy Load Icon
 * @todo prevent animationend bubling
 * @todo itemsScaleUp
 * @todo Test Zepto
 * @todo stagePadding calculate wrong active classes
 */
;(function($, window, document, undefined) {

    /**
     * Creates a carousel.
     * @class The Owl Carousel.
     * @public
     * @param {HTMLElement|jQuery} element - The element to create the carousel for.
     * @param {Object} [options] - The options
     */
    function Owl(element, options) {

        /**
         * Current settings for the carousel.
         * @public
         */
        this.settings = null;

        /**
         * Current options set by the caller including defaults.
         * @public
         */
        this.options = $.extend({}, Owl.Defaults, options);

        /**
         * Plugin element.
         * @public
         */
        this.$element = $(element);

        /**
         * Proxied event handlers.
         * @protected
         */
        this._handlers = {};

        /**
         * References to the running plugins of this carousel.
         * @protected
         */
        this._plugins = {};

        /**
         * Currently suppressed events to prevent them from beeing retriggered.
         * @protected
         */
        this._supress = {};

        /**
         * Absolute current position.
         * @protected
         */
        this._current = null;

        /**
         * Animation speed in milliseconds.
         * @protected
         */
        this._speed = null;

        /**
         * Coordinates of all items in pixel.
         * @todo The name of this member is missleading.
         * @protected
         */
        this._coordinates = [];

        /**
         * Current breakpoint.
         * @todo Real media queries would be nice.
         * @protected
         */
        this._breakpoint = null;

        /**
         * Current width of the plugin element.
         */
        this._width = null;

        /**
         * All real items.
         * @protected
         */
        this._items = [];

        /**
         * All cloned items.
         * @protected
         */
        this._clones = [];

        /**
         * Merge values of all items.
         * @todo Maybe this could be part of a plugin.
         * @protected
         */
        this._mergers = [];

        /**
         * Widths of all items.
         */
        this._widths = [];

        /**
         * Invalidated parts within the update process.
         * @protected
         */
        this._invalidated = {};

        /**
         * Ordered list of workers for the update process.
         * @protected
         */
        this._pipe = [];

        /**
         * Current state information for the drag operation.
         * @todo #261
         * @protected
         */
        this._drag = {
            time: null,
            target: null,
            pointer: null,
            stage: {
                start: null,
                current: null
            },
            direction: null
        };

        /**
         * Current state information and their tags.
         * @type {Object}
         * @protected
         */
        this._states = {
            current: {},
            tags: {
                'initializing': [ 'busy' ],
                'animating': [ 'busy' ],
                'dragging': [ 'interacting' ]
            }
        };

        $.each([ 'onResize', 'onThrottledResize' ], $.proxy(function(i, handler) {
            this._handlers[handler] = $.proxy(this[handler], this);
        }, this));

        $.each(Owl.Plugins, $.proxy(function(key, plugin) {
            this._plugins[key.charAt(0).toLowerCase() + key.slice(1)]
                = new plugin(this);
        }, this));

        $.each(Owl.Workers, $.proxy(function(priority, worker) {
            this._pipe.push({
                'filter': worker.filter,
                'run': $.proxy(worker.run, this)
            });
        }, this));

        this.setup();
        this.initialize();
    }

    /**
     * Default options for the carousel.
     * @public
     */
    Owl.Defaults = {
        items: 3,
        loop: false,
        center: false,
        rewind: false,

        mouseDrag: true,
        touchDrag: true,
        pullDrag: true,
        freeDrag: false,

        margin: 0,
        stagePadding: 0,

        merge: false,
        mergeFit: true,
        autoWidth: false,

        startPosition: 0,
        rtl: false,

        smartSpeed: 250,
        fluidSpeed: false,
        dragEndSpeed: false,

        responsive: {},
        responsiveRefreshRate: 200,
        responsiveBaseElement: window,

        fallbackEasing: 'swing',

        info: false,

        nestedItemSelector: false,
        itemElement: 'div',
        stageElement: 'div',

        refreshClass: 'owl-refresh',
        loadedClass: 'owl-loaded',
        loadingClass: 'owl-loading',
        rtlClass: 'owl-rtl',
        responsiveClass: 'owl-responsive',
        dragClass: 'owl-drag',
        itemClass: 'owl-item',
        stageClass: 'owl-stage',
        stageOuterClass: 'owl-stage-outer',
        grabClass: 'owl-grab',

        useCSS: false
    };

    /**
     * Enumeration for width.
     * @public
     * @readonly
     * @enum {String}
     */
    Owl.Width = {
        Default: 'default',
        Inner: 'inner',
        Outer: 'outer'
    };

    /**
     * Enumeration for types.
     * @public
     * @readonly
     * @enum {String}
     */
    Owl.Type = {
        Event: 'event',
        State: 'state'
    };

    /**
     * Contains all registered plugins.
     * @public
     */
    Owl.Plugins = {};

    /**
     * List of workers involved in the update process.
     */
    Owl.Workers = [ {
        filter: [ 'width', 'settings' ],
        run: function() {
            this._width = this.$element.width();
        }
    }, {
        filter: [ 'width', 'items', 'settings' ],
        run: function(cache) {
            cache.current = this._items && this._items[this.relative(this._current)];
        }
    }, {
        filter: [ 'items', 'settings' ],
        run: function() {
            this.$stage.children('.cloned').remove();
        }
    }, {
        filter: [ 'width', 'items', 'settings' ],
        run: function(cache) {
            var margin = this.settings.margin || '',
                grid = !this.settings.autoWidth,
                rtl = this.settings.rtl,
                css = {
                    'width': 'auto',
                    'margin-left': rtl ? margin : '',
                    'margin-right': rtl ? '' : margin
                };

            !grid && this.$stage.children().css(css);

            cache.css = css;
        }
    }, {
        filter: [ 'width', 'items', 'settings' ],
        run: function(cache) {
            var width = (this.width() / this.settings.items).toFixed(3) - this.settings.margin,
                merge = null,
                iterator = this._items.length,
                grid = !this.settings.autoWidth,
                widths = [];

            cache.items = {
                merge: false,
                width: width
            };

            while (iterator--) {
                merge = this._mergers[iterator];
                merge = this.settings.mergeFit && Math.min(merge, this.settings.items) || merge;

                cache.items.merge = merge > 1 || cache.items.merge;

                widths[iterator] = !grid ? this._items[iterator].width() : width * merge;
            }

            this._widths = widths;
        }
    }, {
        filter: [ 'items', 'settings' ],
        run: function() {
            var clones = [],
                items = this._items,
                settings = this.settings,
                view = Math.max(settings.items * 2, 4),
                size = Math.ceil(items.length / 2) * 2,
                repeat = settings.loop && items.length ? settings.rewind ? view : Math.max(view, size) : 0,
                append = '',
                prepend = '';

            repeat /= 2;

            while (repeat--) {
                clones.push(this.normalize(clones.length / 2, true));
                append = append + items[clones[clones.length - 1]][0].outerHTML;
                clones.push(this.normalize(items.length - 1 - (clones.length - 1) / 2, true));
                prepend = items[clones[clones.length - 1]][0].outerHTML + prepend;
            }

            this._clones = clones;

            $(append).addClass('cloned').appendTo(this.$stage);
            $(prepend).addClass('cloned').prependTo(this.$stage);
        }
    }, {
        filter: [ 'width', 'items', 'settings' ],
        run: function() {
            var rtl = this.settings.rtl ? 1 : -1,
                size = this._clones.length + this._items.length,
                iterator = -1,
                previous = 0,
                current = 0,
                coordinates = [];

            while (++iterator < size) {
                previous = coordinates[iterator - 1] || 0;
                current = this._widths[this.relative(iterator)] + this.settings.margin;
                coordinates.push(previous + current * rtl);
            }

            this._coordinates = coordinates;
        }
    }, {
        filter: [ 'width', 'items', 'settings' ],
        run: function() {
            var padding = this.settings.stagePadding,
                coordinates = this._coordinates,
                css = {
                    'width': Math.ceil(Math.abs(coordinates[coordinates.length - 1])) + padding * 2,
                    'padding-left': padding || '',
                    'padding-right': padding || ''
                };

            this.$stage.css(css);
        }
    }, {
        filter: [ 'width', 'items', 'settings' ],
        run: function(cache) {
            var iterator = this._coordinates.length,
                grid = !this.settings.autoWidth,
                items = this.$stage.children();

            if (grid && cache.items.merge) {
                while (iterator--) {
                    cache.css.width = this._widths[this.relative(iterator)];
                    items.eq(iterator).css(cache.css);
                }
            } else if (grid) {
                cache.css.width = cache.items.width;
                items.css(cache.css);
            }
        }
    }, {
        filter: [ 'items' ],
        run: function() {
            this._coordinates.length < 1 && this.$stage.removeAttr('style');
        }
    }, {
        filter: [ 'width', 'items', 'settings' ],
        run: function(cache) {
            cache.current = cache.current ? this.$stage.children().index(cache.current) : 0;
            cache.current = Math.max(this.minimum(), Math.min(this.maximum(), cache.current));
            this.reset(cache.current);
        }
    }, {
        filter: [ 'position' ],
        run: function() {
            this.animate(this.coordinates(this._current));
        }
    }, {
        filter: [ 'width', 'position', 'items', 'settings' ],
        run: function() {
            var rtl = this.settings.rtl ? 1 : -1,
                padding = this.settings.stagePadding * 2,
                begin = this.coordinates(this.current()) + padding,
                end = begin + this.width() * rtl,
                inner, outer, matches = [], i, n;

            for (i = 0, n = this._coordinates.length; i < n; i++) {
                inner = this._coordinates[i - 1] || 0;
                outer = Math.abs(this._coordinates[i]) + padding * rtl;

                if ((this.op(inner, '<=', begin) && (this.op(inner, '>', end)))
                    || (this.op(outer, '<', begin) && this.op(outer, '>', end))) {
                    matches.push(i);
                }
            }

            this.$stage.children('.active').removeClass('active');
            this.$stage.children(':eq(' + matches.join('), :eq(') + ')').addClass('active');

            if (this.settings.center) {
                this.$stage.children('.center').removeClass('center');
                this.$stage.children().eq(this.current()).addClass('center');
            }
        }
    } ];

    /**
     * Initializes the carousel.
     * @protected
     */
    Owl.prototype.initialize = function() {
        this.enter('initializing');
        this.trigger('initialize');

        this.$element.toggleClass(this.settings.rtlClass, this.settings.rtl);

        if (this.settings.autoWidth && !this.is('pre-loading')) {
            var imgs, nestedSelector, width;
            imgs = this.$element.find('img');
            nestedSelector = this.settings.nestedItemSelector ? '.' + this.settings.nestedItemSelector : undefined;
            width = this.$element.children(nestedSelector).width();

            if (imgs.length && width <= 0) {
                this.preloadAutoWidthImages(imgs);
            }
        }

        this.$element.addClass(this.options.loadingClass);

        // create stage
        this.$stage = $('<' + this.settings.stageElement + ' class="' + this.settings.stageClass + '"/>')
            .wrap('<div class="' + this.settings.stageOuterClass + '"/>');

        // append stage
        this.$element.append(this.$stage.parent());

        // append content
        this.replace(this.$element.children().not(this.$stage.parent()));

        // check visibility
        if (this.$element.is(':visible')) {
            // update view
            this.refresh();
        } else {
            // invalidate width
            this.invalidate('width');
        }

        this.$element
            .removeClass(this.options.loadingClass)
            .addClass(this.options.loadedClass);

        // register event handlers
        this.registerEventHandlers();

        this.leave('initializing');
        this.trigger('initialized');
    };

    /**
     * Setups the current settings.
     * @todo Remove responsive classes. Why should adaptive designs be brought into IE8?
     * @todo Support for media queries by using `matchMedia` would be nice.
     * @public
     */
    Owl.prototype.setup = function() {
        var viewport = this.viewport(),
            overwrites = this.options.responsive,
            match = -1,
            settings = null;

        if (!overwrites) {
            settings = $.extend({}, this.options);
        } else {
            $.each(overwrites, function(breakpoint) {
                if (breakpoint <= viewport && breakpoint > match) {
                    match = Number(breakpoint);
                }
            });

            settings = $.extend({}, this.options, overwrites[match]);
            delete settings.responsive;

            // responsive class
            if (settings.responsiveClass) {
                this.$element.attr('class',
                    this.$element.attr('class').replace(new RegExp('(' + this.options.responsiveClass + '-)\\S+\\s', 'g'), '$1' + match)
                );
            }
        }

        if (this.settings === null || this._breakpoint !== match) {
            this.trigger('change', { property: { name: 'settings', value: settings } });
            this._breakpoint = match;
            this.settings = settings;
            this.invalidate('settings');
            this.trigger('changed', { property: { name: 'settings', value: this.settings } });
        }
    };

    /**
     * Updates option logic if necessery.
     * @protected
     */
    Owl.prototype.optionsLogic = function() {
        if (this.settings.autoWidth) {
            this.settings.stagePadding = false;
            this.settings.merge = false;
        }
    };

    /**
     * Prepares an item before add.
     * @todo Rename event parameter `content` to `item`.
     * @protected
     * @returns {jQuery|HTMLElement} - The item container.
     */
    Owl.prototype.prepare = function(item) {
        var event = this.trigger('prepare', { content: item });

        if (!event.data) {
            event.data = $('<' + this.settings.itemElement + '/>')
                .addClass(this.options.itemClass).append(item)
        }

        this.trigger('prepared', { content: event.data });

        return event.data;
    };

    /**
     * Updates the view.
     * @public
     */
    Owl.prototype.update = function() {
        var i = 0,
            n = this._pipe.length,
            filter = $.proxy(function(p) { return this[p] }, this._invalidated),
            cache = {};

        while (i < n) {
            if (this._invalidated.all || $.grep(this._pipe[i].filter, filter).length > 0) {
                this._pipe[i].run(cache);
            }
            i++;
        }

        this._invalidated = {};

        !this.is('valid') && this.enter('valid');
    };

    /**
     * Gets the width of the view.
     * @public
     * @param {Owl.Width} [dimension=Owl.Width.Default] - The dimension to return.
     * @returns {Number} - The width of the view in pixel.
     */
    Owl.prototype.width = function(dimension) {
        dimension = dimension || Owl.Width.Default;
        switch (dimension) {
            case Owl.Width.Inner:
            case Owl.Width.Outer:
                return this._width;
            default:
                return this._width - this.settings.stagePadding * 2 + this.settings.margin;
        }
    };

    /**
     * Refreshes the carousel primarily for adaptive purposes.
     * @public
     */
    Owl.prototype.refresh = function() {
        this.enter('refreshing');
        this.trigger('refresh');

        this.setup();

        this.optionsLogic();

        this.$element.addClass(this.options.refreshClass);

        this.update();

        this.$element.removeClass(this.options.refreshClass);

        this.leave('refreshing');
        this.trigger('refreshed');
    };

    /**
     * Checks window `resize` event.
     * @protected
     */
    Owl.prototype.onThrottledResize = function() {
        window.clearTimeout(this.resizeTimer);
        this.resizeTimer = window.setTimeout(this._handlers.onResize, this.settings.responsiveRefreshRate);
    };

    /**
     * Checks window `resize` event.
     * @protected
     */
    Owl.prototype.onResize = function() {
        if (!this._items.length) {
            return false;
        }

        if (this._width === this.$element.width()) {
            return false;
        }

        if (!this.$element.is(':visible')) {
            return false;
        }

        this.enter('resizing');

        if (this.trigger('resize').isDefaultPrevented()) {
            this.leave('resizing');
            return false;
        }

        this.invalidate('width');

        this.refresh();

        this.leave('resizing');
        this.trigger('resized');
    };

    /**
     * Registers event handlers.
     * @todo Check `msPointerEnabled`
     * @todo #261
     * @protected
     */
    Owl.prototype.registerEventHandlers = function() {
        if ($.support.transition) {
            this.$stage.on($.support.transition.end + '.owl.core', $.proxy(this.onTransitionEnd, this));
        }

        if (this.settings.responsive !== false) {
            this.on(window, 'resize', this._handlers.onThrottledResize);
        }

        if (this.settings.mouseDrag) {
            this.$element.addClass(this.options.dragClass);
            this.$stage.on('mousedown.owl.core', $.proxy(this.onDragStart, this));
            this.$stage.on('dragstart.owl.core selectstart.owl.core', function() { return false });
        }

        if (this.settings.touchDrag){
            this.$stage.on('touchstart.owl.core', $.proxy(this.onDragStart, this));
            this.$stage.on('touchcancel.owl.core', $.proxy(this.onDragEnd, this));
        }
    };

    /**
     * Handles `touchstart` and `mousedown` events.
     * @todo Horizontal swipe threshold as option
     * @todo #261
     * @protected
     * @param {Event} event - The event arguments.
     */
    Owl.prototype.onDragStart = function(event) {
        var stage = null;

        if (event.which === 3) {
            return;
        }

        if ($.support.transform) {
            stage = this.$stage.css('transform').replace(/.*\(|\)| /g, '').split(',');
            stage = {
                x: stage[stage.length === 16 ? 12 : 4],
                y: stage[stage.length === 16 ? 13 : 5]
            };
        } else {
            stage = this.$stage.position();
            stage = {
                x: this.settings.rtl ?
                stage.left + this.$stage.width() - this.width() + this.settings.margin :
                    stage.left,
                y: stage.top
            };
        }

        if (this.is('animating')) {
            $.support.transform ? this.animate(stage.x) : this.$stage.stop();
            this.invalidate('position');
        }

        this.$element.toggleClass(this.options.grabClass, event.type === 'mousedown');

        this.speed(0);

        this._drag.time = new Date().getTime();
        this._drag.target = $(event.target);
        this._drag.stage.start = stage;
        this._drag.stage.current = stage;
        this._drag.pointer = this.pointer(event);

        $(document).on('mouseup.owl.core touchend.owl.core', $.proxy(this.onDragEnd, this));

        $(document).one('mousemove.owl.core touchmove.owl.core', $.proxy(function(event) {
            var delta = this.difference(this._drag.pointer, this.pointer(event));

            $(document).on('mousemove.owl.core touchmove.owl.core', $.proxy(this.onDragMove, this));

            if (Math.abs(delta.x) < Math.abs(delta.y) && this.is('valid')) {
                return;
            }

            event.preventDefault();

            this.enter('dragging');
            this.trigger('drag');
        }, this));
    };

    /**
     * Handles the `touchmove` and `mousemove` events.
     * @todo #261
     * @protected
     * @param {Event} event - The event arguments.
     */
    Owl.prototype.onDragMove = function(event) {
        var minimum = null,
            maximum = null,
            pull = null,
            delta = this.difference(this._drag.pointer, this.pointer(event)),
            stage = this.difference(this._drag.stage.start, delta);

        if (!this.is('dragging')) {
            return;
        }

        event.preventDefault();

        if (this.settings.loop) {
            minimum = this.coordinates(this.minimum());
            maximum = this.coordinates(this.maximum() + 1) - minimum;
            stage.x = (((stage.x - minimum) % maximum + maximum) % maximum) + minimum;
        } else {
            minimum = this.settings.rtl ? this.coordinates(this.maximum()) : this.coordinates(this.minimum());
            maximum = this.settings.rtl ? this.coordinates(this.minimum()) : this.coordinates(this.maximum());
            pull = this.settings.pullDrag ? -1 * delta.x / 5 : 0;
            stage.x = Math.max(Math.min(stage.x, minimum + pull), maximum + pull);
        }

        this._drag.stage.current = stage;

        this.animate(stage.x);
    };

    /**
     * Handles the `touchend` and `mouseup` events.
     * @todo #261
     * @todo Threshold for click event
     * @protected
     * @param {Event} event - The event arguments.
     */
    Owl.prototype.onDragEnd = function(event) {

        var delta = this.difference(this._drag.pointer, this.pointer(event)),
            stage = this._drag.stage.current,
            direction = delta.x > 0 ^ this.settings.rtl ? 'left' : 'right';

        $(document).off('.owl.core');

        this.$element.removeClass(this.options.grabClass);

        if (delta.x !== 0 && this.is('dragging') || !this.is('valid')) {
            this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed);
            this.current(this.closest(stage.x, delta.x !== 0 ? direction : this._drag.direction));
            this.invalidate('position');
            this.update();

            this._drag.direction = direction;

            if (Math.abs(delta.x) > 3 || new Date().getTime() - this._drag.time > 300) {
                this._drag.target.one('click.owl.core', function() { return false; });
            }
        }

        if (!this.is('dragging')) {
            return;
        }

        this.leave('dragging');
        this.trigger('dragged');
    };

    /**
     * Gets absolute position of the closest item for a coordinate.
     * @todo Setting `freeDrag` makes `closest` not reusable. See #165.
     * @protected
     * @param {Number} coordinate - The coordinate in pixel.
     * @param {String} direction - The direction to check for the closest item. Ether `left` or `right`.
     * @return {Number} - The absolute position of the closest item.
     */
    Owl.prototype.closest = function(coordinate, direction) {
        var position = -1,
            pull = 30,
            width = this.width(),
            coordinates = this.coordinates();

        if (!this.settings.freeDrag) {
            // check closest item
            $.each(coordinates, $.proxy(function(index, value) {
                if (coordinate > value - pull && coordinate < value + pull) {
                    position = index;
                } else if (this.op(coordinate, '<', value)
                    && this.op(coordinate, '>', coordinates[index + 1] || value - width)) {
                    position = direction === 'left' ? index + 1 : index;
                }
                return position === -1;
            }, this));
        }

        if (!this.settings.loop) {
            // non loop boundries
            if (this.op(coordinate, '>', coordinates[this.minimum()])) {
                position = coordinate = this.minimum();
            } else if (this.op(coordinate, '<', coordinates[this.maximum()])) {
                position = coordinate = this.maximum();
            }
        }

        return position;
    };

    /**
     * Animates the stage.
     * @todo #270
     * @public
     * @param {Number} coordinate - The coordinate in pixels.
     */
    Owl.prototype.animate = function(coordinate) {
        var animate = this.speed() > 0;

        this.is('animating') && this.onTransitionEnd();

        if (animate) {
            this.enter('animating');
            this.trigger('translate');
        }

        if ($.support.transform3d && $.support.transition && !this.settings.useCSS) {
            this.$stage.css({
                transform: 'translate3d(' + coordinate + 'px,0px,0px)',
                transition: (this.speed() / 1000) + 's'
            });
        } else if (animate) {
            this.$stage.animate({
                left: coordinate + 'px'
            }, this.speed(), this.settings.fallbackEasing, $.proxy(this.onTransitionEnd, this));
        } else {
            this.$stage.css({
                left: coordinate + 'px'
            });
        }
    };

    /**
     * Checks whether the carousel is in a specific state or not.
     * @param {String} state - The state to check.
     * @returns {Boolean} - The flag which indicates if the carousel is busy.
     */
    Owl.prototype.is = function(state) {
        return this._states.current[state] && this._states.current[state] > 0;
    };

    /**
     * Sets the absolute position of the current item.
     * @public
     * @param {Number} [position] - The new absolute position or nothing to leave it unchanged.
     * @returns {Number} - The absolute position of the current item.
     */
    Owl.prototype.current = function(position) {
        if (position === undefined) {
            return this._current;
        }

        if (this._items.length === 0) {
            return undefined;
        }

        position = this.normalize(position);

        if (this._current !== position) {
            var event = this.trigger('change', { property: { name: 'position', value: position } });

            if (event.data !== undefined) {
                position = this.normalize(event.data);
            }

            this._current = position;

            this.invalidate('position');

            this.trigger('changed', { property: { name: 'position', value: this._current } });
        }

        return this._current;
    };

    /**
     * Invalidates the given part of the update routine.
     * @param {String} [part] - The part to invalidate.
     * @returns {Array.<String>} - The invalidated parts.
     */
    Owl.prototype.invalidate = function(part) {
        if ($.type(part) === 'string') {
            this._invalidated[part] = true;
            this.is('valid') && this.leave('valid');
        }
        return $.map(this._invalidated, function(v, i) { return i });
    };

    /**
     * Resets the absolute position of the current item.
     * @public
     * @param {Number} position - The absolute position of the new item.
     */
    Owl.prototype.reset = function(position) {
        position = this.normalize(position);

        if (position === undefined) {
            return;
        }

        this._speed = 0;
        this._current = position;

        this.suppress([ 'translate', 'translated' ]);

        this.animate(this.coordinates(position));

        this.release([ 'translate', 'translated' ]);
    };

    /**
     * Normalizes an absolute or a relative position of an item.
     * @public
     * @param {Number} position - The absolute or relative position to normalize.
     * @param {Boolean} [relative=false] - Whether the given position is relative or not.
     * @returns {Number} - The normalized position.
     */
    Owl.prototype.normalize = function(position, relative) {
        var n = this._items.length,
            m = relative ? 0 : this._clones.length;

        if (!this.isNumeric(position) || n < 1) {
            position = undefined;
        } else if (position < 0 || position >= n + m) {
            position = ((position - m / 2) % n + n) % n + m / 2;
        }

        return position;
    };

    /**
     * Converts an absolute position of an item into a relative one.
     * @public
     * @param {Number} position - The absolute position to convert.
     * @returns {Number} - The converted position.
     */
    Owl.prototype.relative = function(position) {
        position -= this._clones.length / 2;
        return this.normalize(position, true);
    };

    /**
     * Gets the maximum position for the current item.
     * @public
     * @param {Boolean} [relative=false] - Whether to return an absolute position or a relative position.
     * @returns {Number}
     */
    Owl.prototype.maximum = function(relative) {
        var settings = this.settings,
            maximum = this._coordinates.length,
            boundary = Math.abs(this._coordinates[maximum - 1]) - this._width,
            i = -1, j;

        if (settings.loop) {
            maximum = this._clones.length / 2 + this._items.length - 1;
        } else if (settings.autoWidth || settings.merge) {
            // binary search
            while (maximum - i > 1) {
                Math.abs(this._coordinates[j = maximum + i >> 1]) < boundary
                    ? i = j : maximum = j;
            }
        } else if (settings.center) {
            maximum = this._items.length - 1;
        } else {
            maximum = this._items.length - settings.items;
        }

        if (relative) {
            maximum -= this._clones.length / 2;
        }

        return Math.max(maximum, 0);
    };

    /**
     * Gets the minimum position for the current item.
     * @public
     * @param {Boolean} [relative=false] - Whether to return an absolute position or a relative position.
     * @returns {Number}
     */
    Owl.prototype.minimum = function(relative) {
        return relative ? 0 : this._clones.length / 2;
    };

    /**
     * Gets an item at the specified relative position.
     * @public
     * @param {Number} [position] - The relative position of the item.
     * @return {jQuery|Array.<jQuery>} - The item at the given position or all items if no position was given.
     */
    Owl.prototype.items = function(position) {
        if (position === undefined) {
            return this._items.slice();
        }

        position = this.normalize(position, true);
        return this._items[position];
    };

    /**
     * Gets an item at the specified relative position.
     * @public
     * @param {Number} [position] - The relative position of the item.
     * @return {jQuery|Array.<jQuery>} - The item at the given position or all items if no position was given.
     */
    Owl.prototype.mergers = function(position) {
        if (position === undefined) {
            return this._mergers.slice();
        }

        position = this.normalize(position, true);
        return this._mergers[position];
    };

    /**
     * Gets the absolute positions of clones for an item.
     * @public
     * @param {Number} [position] - The relative position of the item.
     * @returns {Array.<Number>} - The absolute positions of clones for the item or all if no position was given.
     */
    Owl.prototype.clones = function(position) {
        var odd = this._clones.length / 2,
            even = odd + this._items.length,
            map = function(index) { return index % 2 === 0 ? even + index / 2 : odd - (index + 1) / 2 };

        if (position === undefined) {
            return $.map(this._clones, function(v, i) { return map(i) });
        }

        return $.map(this._clones, function(v, i) { return v === position ? map(i) : null });
    };

    /**
     * Sets the current animation speed.
     * @public
     * @param {Number} [speed] - The animation speed in milliseconds or nothing to leave it unchanged.
     * @returns {Number} - The current animation speed in milliseconds.
     */
    Owl.prototype.speed = function(speed) {
        if (speed !== undefined) {
            this._speed = speed;
        }

        return this._speed;
    };

    /**
     * Gets the coordinate of an item.
     * @todo The name of this method is missleanding.
     * @public
     * @param {Number} position - The absolute position of the item within `minimum()` and `maximum()`.
     * @returns {Number|Array.<Number>} - The coordinate of the item in pixel or all coordinates.
     */
    Owl.prototype.coordinates = function(position) {
        var multiplier = 1,
            newPosition = position - 1,
            coordinate;

        if (position === undefined) {
            return $.map(this._coordinates, $.proxy(function(coordinate, index) {
                return this.coordinates(index);
            }, this));
        }

        if (this.settings.center) {
            if (this.settings.rtl) {
                multiplier = -1;
                newPosition = position + 1;
            }

            coordinate = this._coordinates[position];
            coordinate += (this.width() - coordinate + (this._coordinates[newPosition] || 0)) / 2 * multiplier;
        } else {
            coordinate = this._coordinates[newPosition] || 0;
        }

        return coordinate;
    };

    /**
     * Calculates the speed for a translation.
     * @protected
     * @param {Number} from - The absolute position of the start item.
     * @param {Number} to - The absolute position of the target item.
     * @param {Number} [factor=undefined] - The time factor in milliseconds.
     * @returns {Number} - The time in milliseconds for the translation.
     */
    Owl.prototype.duration = function(from, to, factor) {
        return Math.min(Math.max(Math.abs(to - from), 1), 6) * Math.abs((factor || this.settings.smartSpeed));
    };

    /**
     * Slides to the specified item.
     * @public
     * @param {Number} position - The position of the item.
     * @param {Number} [speed] - The time in milliseconds for the transition.
     */
    Owl.prototype.to = function(position, speed) {
        var current = this.current(),
            revert = null,
            distance = position - this.relative(current),
            direction = (distance > 0) - (distance < 0),
            items = this._items.length,
            minimum = this.minimum(),
            maximum = this.maximum();

        if (this.settings.loop) {
            if (!this.settings.rewind && Math.abs(distance) > items / 2) {
                distance += direction * -1 * items;
            }

            position = current + distance;
            revert = ((position - minimum) % items + items) % items + minimum;

            if (revert !== position && revert - distance <= maximum && revert - distance > 0) {
                current = revert - distance;
                position = revert;
                this.reset(current);
            }
        } else if (this.settings.rewind) {
            maximum += 1;
            position = (position % maximum + maximum) % maximum;
        } else {
            position = Math.max(minimum, Math.min(maximum, position));
        }

        this.speed(this.duration(current, position, speed));
        this.current(position);

        if (this.$element.is(':visible')) {
            this.update();
        }
    };

    /**
     * Slides to the next item.
     * @public
     * @param {Number} [speed] - The time in milliseconds for the transition.
     */
    Owl.prototype.next = function(speed) {
        speed = speed || false;
        this.to(this.relative(this.current()) + 1, speed);
    };

    /**
     * Slides to the previous item.
     * @public
     * @param {Number} [speed] - The time in milliseconds for the transition.
     */
    Owl.prototype.prev = function(speed) {
        speed = speed || false;
        this.to(this.relative(this.current()) - 1, speed);
    };

    /**
     * Handles the end of an animation.
     * @protected
     * @param {Event} event - The event arguments.
     */
    Owl.prototype.onTransitionEnd = function(event) {

        // if css2 animation then event object is undefined
        if (event !== undefined) {
            event.stopPropagation();

            // Catch only owl-stage transitionEnd event
            if ((event.target || event.srcElement || event.originalTarget) !== this.$stage.get(0)) {
                return false;
            }
        }

        this.leave('animating');
        this.trigger('translated');
    };

    /**
     * Gets viewport width.
     * @protected
     * @return {Number} - The width in pixel.
     */
    Owl.prototype.viewport = function() {
        var width;
        if (this.options.responsiveBaseElement !== window) {
            width = $(this.options.responsiveBaseElement).width();
        } else if (window.innerWidth) {
            width = window.innerWidth;
        } else if (document.documentElement && document.documentElement.clientWidth) {
            width = document.documentElement.clientWidth;
        } else {
            throw 'Can not detect viewport width.';
        }
        return width;
    };

    /**
     * Replaces the current content.
     * @public
     * @param {HTMLElement|jQuery|String} content - The new content.
     */
    Owl.prototype.replace = function(content) {
        this.$stage.empty();
        this._items = [];

        if (content) {
            content = (content instanceof jQuery) ? content : $(content);
        }

        if (this.settings.nestedItemSelector) {
            content = content.find('.' + this.settings.nestedItemSelector);
        }

        content.filter(function() {
            return this.nodeType === 1;
        }).each($.proxy(function(index, item) {
            item = this.prepare(item);
            this.$stage.append(item);
            this._items.push(item);
            this._mergers.push(item.find('[data-merge]').andSelf('[data-merge]').attr('data-merge') * 1 || 1);
        }, this));

        this.reset(this.isNumeric(this.settings.startPosition) ? this.settings.startPosition : 0);

        this.invalidate('items');
    };

    /**
     * Adds an item.
     * @todo Use `item` instead of `content` for the event arguments.
     * @public
     * @param {HTMLElement|jQuery|String} content - The item content to add.
     * @param {Number} [position] - The relative position at which to insert the item otherwise the item will be added to the end.
     */
    Owl.prototype.add = function(content, position) {
        var current = this.relative(this._current);

        position = position === undefined ? this._items.length : this.normalize(position, true);
        content = content instanceof jQuery ? content : $(content);

        this.trigger('add', { content: content, position: position });

        content = this.prepare(content);

        if (this._items.length === 0 || position === this._items.length) {
            this._items.length === 0 && this.$stage.append(content);
            this._items.length !== 0 && this._items[position - 1].after(content);
            this._items.push(content);
            this._mergers.push(content.find('[data-merge]').andSelf('[data-merge]').attr('data-merge') * 1 || 1);
        } else {
            this._items[position].before(content);
            this._items.splice(position, 0, content);
            this._mergers.splice(position, 0, content.find('[data-merge]').andSelf('[data-merge]').attr('data-merge') * 1 || 1);
        }

        this._items[current] && this.reset(this._items[current].index());

        this.invalidate('items');

        this.trigger('added', { content: content, position: position });
    };

    /**
     * Removes an item by its position.
     * @todo Use `item` instead of `content` for the event arguments.
     * @public
     * @param {Number} position - The relative position of the item to remove.
     */
    Owl.prototype.remove = function(position) {
        position = this.normalize(position, true);

        if (position === undefined) {
            return;
        }

        this.trigger('remove', { content: this._items[position], position: position });

        this._items[position].remove();
        this._items.splice(position, 1);
        this._mergers.splice(position, 1);

        this.invalidate('items');

        this.trigger('removed', { content: null, position: position });
    };

    /**
     * Preloads images with auto width.
     * @todo Replace by a more generic approach
     * @protected
     */
    Owl.prototype.preloadAutoWidthImages = function(images) {
        images.each($.proxy(function(i, element) {
            this.enter('pre-loading');
            element = $(element);
            $(new Image()).one('load', $.proxy(function(e) {
                element.attr('src', e.target.src);
                element.css('opacity', 1);
                this.leave('pre-loading');
                !this.is('pre-loading') && !this.is('initializing') && this.refresh();
            }, this)).attr('src', element.attr('src') || element.attr('data-src') || element.attr('data-src-retina'));
        }, this));
    };

    /**
     * Destroys the carousel.
     * @public
     */
    Owl.prototype.destroy = function() {

        this.$element.off('.owl.core');
        this.$stage.off('.owl.core');
        $(document).off('.owl.core');

        if (this.settings.responsive !== false) {
            window.clearTimeout(this.resizeTimer);
            this.off(window, 'resize', this._handlers.onThrottledResize);
        }

        for (var i in this._plugins) {
            this._plugins[i].destroy();
        }

        this.$stage.children('.cloned').remove();

        this.$stage.unwrap();
        this.$stage.children().contents().unwrap();
        this.$stage.children().unwrap();

        this.$element
            .removeClass(this.options.refreshClass)
            .removeClass(this.options.loadingClass)
            .removeClass(this.options.loadedClass)
            .removeClass(this.options.rtlClass)
            .removeClass(this.options.dragClass)
            .removeClass(this.options.grabClass)
            .attr('class', this.$element.attr('class').replace(new RegExp(this.options.responsiveClass + '-\\S+\\s', 'g'), ''))
            .removeData('owl.carousel');
    };

    /**
     * Operators to calculate right-to-left and left-to-right.
     * @protected
     * @param {Number} [a] - The left side operand.
     * @param {String} [o] - The operator.
     * @param {Number} [b] - The right side operand.
     */
    Owl.prototype.op = function(a, o, b) {
        var rtl = this.settings.rtl;
        switch (o) {
            case '<':
                return rtl ? a > b : a < b;
            case '>':
                return rtl ? a < b : a > b;
            case '>=':
                return rtl ? a <= b : a >= b;
            case '<=':
                return rtl ? a >= b : a <= b;
            default:
                break;
        }
    };

    /**
     * Attaches to an internal event.
     * @protected
     * @param {HTMLElement} element - The event source.
     * @param {String} event - The event name.
     * @param {Function} listener - The event handler to attach.
     * @param {Boolean} capture - Wether the event should be handled at the capturing phase or not.
     */
    Owl.prototype.on = function(element, event, listener, capture) {
        if (element.addEventListener) {
            element.addEventListener(event, listener, capture);
        } else if (element.attachEvent) {
            element.attachEvent('on' + event, listener);
        }
    };

    /**
     * Detaches from an internal event.
     * @protected
     * @param {HTMLElement} element - The event source.
     * @param {String} event - The event name.
     * @param {Function} listener - The attached event handler to detach.
     * @param {Boolean} capture - Wether the attached event handler was registered as a capturing listener or not.
     */
    Owl.prototype.off = function(element, event, listener, capture) {
        if (element.removeEventListener) {
            element.removeEventListener(event, listener, capture);
        } else if (element.detachEvent) {
            element.detachEvent('on' + event, listener);
        }
    };

    /**
     * Triggers a public event.
     * @todo Remove `status`, `relatedTarget` should be used instead.
     * @protected
     * @param {String} name - The event name.
     * @param {*} [data=null] - The event data.
     * @param {String} [namespace=carousel] - The event namespace.
     * @param {String} [state] - The state which is associated with the event.
     * @param {Boolean} [enter=false] - Indicates if the call enters the specified state or not.
     * @returns {Event} - The event arguments.
     */
    Owl.prototype.trigger = function(name, data, namespace, state, enter) {
        var status = {
            item: { count: this._items.length, index: this.current() }
        }, handler = $.camelCase(
            $.grep([ 'on', name, namespace ], function(v) { return v })
                .join('-').toLowerCase()
        ), event = $.Event(
            [ name, 'owl', namespace || 'carousel' ].join('.').toLowerCase(),
            $.extend({ relatedTarget: this }, status, data)
        );

        if (!this._supress[name]) {
            $.each(this._plugins, function(name, plugin) {
                if (plugin.onTrigger) {
                    plugin.onTrigger(event);
                }
            });

            this.register({ type: Owl.Type.Event, name: name });
            this.$element.trigger(event);

            if (this.settings && typeof this.settings[handler] === 'function') {
                this.settings[handler].call(this, event);
            }
        }

        return event;
    };

    /**
     * Enters a state.
     * @param name - The state name.
     */
    Owl.prototype.enter = function(name) {
        $.each([ name ].concat(this._states.tags[name] || []), $.proxy(function(i, name) {
            if (this._states.current[name] === undefined) {
                this._states.current[name] = 0;
            }

            this._states.current[name]++;
        }, this));
    };

    /**
     * Leaves a state.
     * @param name - The state name.
     */
    Owl.prototype.leave = function(name) {
        $.each([ name ].concat(this._states.tags[name] || []), $.proxy(function(i, name) {
            this._states.current[name]--;
        }, this));
    };

    /**
     * Registers an event or state.
     * @public
     * @param {Object} object - The event or state to register.
     */
    Owl.prototype.register = function(object) {
        if (object.type === Owl.Type.Event) {
            if (!$.event.special[object.name]) {
                $.event.special[object.name] = {};
            }

            if (!$.event.special[object.name].owl) {
                var _default = $.event.special[object.name]._default;
                $.event.special[object.name]._default = function(e) {
                    if (_default && _default.apply && (!e.namespace || e.namespace.indexOf('owl') === -1)) {
                        return _default.apply(this, arguments);
                    }
                    return e.namespace && e.namespace.indexOf('owl') > -1;
                };
                $.event.special[object.name].owl = true;
            }
        } else if (object.type === Owl.Type.State) {
            if (!this._states.tags[object.name]) {
                this._states.tags[object.name] = object.tags;
            } else {
                this._states.tags[object.name] = this._states.tags[object.name].concat(object.tags);
            }

            this._states.tags[object.name] = $.grep(this._states.tags[object.name], $.proxy(function(tag, i) {
                return $.inArray(tag, this._states.tags[object.name]) === i;
            }, this));
        }
    };

    /**
     * Suppresses events.
     * @protected
     * @param {Array.<String>} events - The events to suppress.
     */
    Owl.prototype.suppress = function(events) {
        $.each(events, $.proxy(function(index, event) {
            this._supress[event] = true;
        }, this));
    };

    /**
     * Releases suppressed events.
     * @protected
     * @param {Array.<String>} events - The events to release.
     */
    Owl.prototype.release = function(events) {
        $.each(events, $.proxy(function(index, event) {
            delete this._supress[event];
        }, this));
    };

    /**
     * Gets unified pointer coordinates from event.
     * @todo #261
     * @protected
     * @param {Event} - The `mousedown` or `touchstart` event.
     * @returns {Object} - Contains `x` and `y` coordinates of current pointer position.
     */
    Owl.prototype.pointer = function(event) {
        var result = { x: null, y: null };

        event = event.originalEvent || event || window.event;

        event = event.touches && event.touches.length ?
            event.touches[0] : event.changedTouches && event.changedTouches.length ?
            event.changedTouches[0] : event;

        if (event.pageX) {
            result.x = event.pageX;
            result.y = event.pageY;
        } else {
            result.x = event.clientX;
            result.y = event.clientY;
        }

        return result;
    };

    /**
     * Determines if the input is a Number or something that can be coerced to a Number
     * @protected
     * @param {Number|String|Object|Array|Boolean|RegExp|Function|Symbol} - The input to be tested
     * @returns {Boolean} - An indication if the input is a Number or can be coerced to a Number
     */
    Owl.prototype.isNumeric = function(number) {
        return !isNaN(parseFloat(number));
    };

    /**
     * Gets the difference of two vectors.
     * @todo #261
     * @protected
     * @param {Object} - The first vector.
     * @param {Object} - The second vector.
     * @returns {Object} - The difference.
     */
    Owl.prototype.difference = function(first, second) {
        return {
            x: first.x - second.x,
            y: first.y - second.y
        };
    };

    /**
     * The jQuery Plugin for the Owl Carousel
     * @todo Navigation plugin `next` and `prev`
     * @public
     */
    $.fn.owlCarousel = function(option) {
        var args = Array.prototype.slice.call(arguments, 1);

        return this.each(function() {
            var $this = $(this),
                data = $this.data('owl.carousel');

            if (!data) {
                data = new Owl(this, typeof option == 'object' && option);
                $this.data('owl.carousel', data);

                $.each([
                    'next', 'prev', 'to', 'destroy', 'refresh', 'replace', 'add', 'remove'
                ], function(i, event) {
                    data.register({ type: Owl.Type.Event, name: event });
                    data.$element.on(event + '.owl.carousel.core', $.proxy(function(e) {
                        if (e.namespace && e.relatedTarget !== this) {
                            this.suppress([ event ]);
                            data[event].apply(this, [].slice.call(arguments, 1));
                            this.release([ event ]);
                        }
                    }, data));
                });
            }

            if (typeof option == 'string' && option.charAt(0) !== '_') {
                data[option].apply(data, args);
            }
        });
    };

    /**
     * The constructor for the jQuery Plugin
     * @public
     */
    $.fn.owlCarousel.Constructor = Owl;

})(window.Zepto || window.jQuery, window, document);

/**
 * AutoRefresh Plugin
 * @version 2.0.0-beta.3
 * @author Artus Kolanowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

    /**
     * Creates the auto refresh plugin.
     * @class The Auto Refresh Plugin
     * @param {Owl} carousel - The Owl Carousel
     */
    var AutoRefresh = function(carousel) {
        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        this._core = carousel;

        /**
         * Refresh interval.
         * @protected
         * @type {number}
         */
        this._interval = null;

        /**
         * Whether the element is currently visible or not.
         * @protected
         * @type {Boolean}
         */
        this._visible = null;

        /**
         * All event handlers.
         * @protected
         * @type {Object}
         */
        this._handlers = {
            'initialized.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._core.settings.autoRefresh) {
                    this.watch();
                }
            }, this)
        };

        // set default options
        this._core.options = $.extend({}, AutoRefresh.Defaults, this._core.options);

        // register event handlers
        this._core.$element.on(this._handlers);
    };

    /**
     * Default options.
     * @public
     */
    AutoRefresh.Defaults = {
        autoRefresh: true,
        autoRefreshInterval: 500
    };

    /**
     * Watches the element.
     */
    AutoRefresh.prototype.watch = function() {
        if (this._interval) {
            return;
        }

        this._visible = this._core.$element.is(':visible');
        this._interval = window.setInterval($.proxy(this.refresh, this), this._core.settings.autoRefreshInterval);
    };

    /**
     * Refreshes the element.
     */
    AutoRefresh.prototype.refresh = function() {
        if (this._core.$element.is(':visible') === this._visible) {
            return;
        }

        this._visible = !this._visible;

        this._core.$element.toggleClass('owl-hidden', !this._visible);

        this._visible && (this._core.invalidate('width') && this._core.refresh());
    };

    /**
     * Destroys the plugin.
     */
    AutoRefresh.prototype.destroy = function() {
        var handler, property;

        window.clearInterval(this._interval);

        for (handler in this._handlers) {
            this._core.$element.off(handler, this._handlers[handler]);
        }
        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] != 'function' && (this[property] = null);
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.AutoRefresh = AutoRefresh;

})(window.Zepto || window.jQuery, window, document);

/**
 * Lazy Plugin
 * @version 2.0.0-beta.3
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

    /**
     * Creates the lazy plugin.
     * @class The Lazy Plugin
     * @param {Owl} carousel - The Owl Carousel
     */
    var Lazy = function(carousel) {

        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        this._core = carousel;

        /**
         * Already loaded items.
         * @protected
         * @type {Array.<jQuery>}
         */
        this._loaded = [];

        /**
         * Event handlers.
         * @protected
         * @type {Object}
         */
        this._handlers = {
            'initialized.owl.carousel change.owl.carousel': $.proxy(function(e) {
                if (!e.namespace) {
                    return;
                }

                if (!this._core.settings || !this._core.settings.lazyLoad) {
                    return;
                }

                if ((e.property && e.property.name == 'position') || e.type == 'initialized') {
                    var settings = this._core.settings,
                        n = (settings.center && Math.ceil(settings.items / 2) || settings.items),
                        i = ((settings.center && n * -1) || 0),
                        position = ((e.property && e.property.value) || this._core.current()) + i,
                        clones = this._core.clones().length,
                        load = $.proxy(function(i, v) { this.load(v) }, this);

                    while (i++ < n) {
                        this.load(clones / 2 + this._core.relative(position));
                        clones && $.each(this._core.clones(this._core.relative(position)), load);
                        position++;
                    }
                }
            }, this)
        };

        // set the default options
        this._core.options = $.extend({}, Lazy.Defaults, this._core.options);

        // register event handler
        this._core.$element.on(this._handlers);
    }

    /**
     * Default options.
     * @public
     */
    Lazy.Defaults = {
        lazyLoad: false
    }

    /**
     * Loads all resources of an item at the specified position.
     * @param {Number} position - The absolute position of the item.
     * @protected
     */
    Lazy.prototype.load = function(position) {
        var $item = this._core.$stage.children().eq(position),
            $elements = $item && $item.find('.owl-lazy');

        if (!$elements || $.inArray($item.get(0), this._loaded) > -1) {
            return;
        }

        $elements.each($.proxy(function(index, element) {
            var $element = $(element), image,
                url = (window.devicePixelRatio > 1 && $element.attr('data-src-retina')) || $element.attr('data-src');

            this._core.trigger('load', { element: $element, url: url }, 'lazy');

            if ($element.is('img')) {
                $element.one('load.owl.lazy', $.proxy(function() {
                    $element.css('opacity', 1);
                    this._core.trigger('loaded', { element: $element, url: url }, 'lazy');
                }, this)).attr('src', url);
            } else {
                image = new Image();
                image.onload = $.proxy(function() {
                    $element.css({
                        'background-image': 'url(' + url + ')',
                        'opacity': '1'
                    });
                    this._core.trigger('loaded', { element: $element, url: url }, 'lazy');
                }, this);
                image.src = url;
            }
        }, this));

        this._loaded.push($item.get(0));
    }

    /**
     * Destroys the plugin.
     * @public
     */
    Lazy.prototype.destroy = function() {
        var handler, property;

        for (handler in this.handlers) {
            this._core.$element.off(handler, this.handlers[handler]);
        }
        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] != 'function' && (this[property] = null);
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.Lazy = Lazy;

})(window.Zepto || window.jQuery, window, document);

/**
 * AutoHeight Plugin
 * @version 2.0.0-beta.3
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

    /**
     * Creates the auto height plugin.
     * @class The Auto Height Plugin
     * @param {Owl} carousel - The Owl Carousel
     */
    var AutoHeight = function(carousel) {
        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        this._core = carousel;

        /**
         * All event handlers.
         * @protected
         * @type {Object}
         */
        this._handlers = {
            'initialized.owl.carousel refreshed.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._core.settings.autoHeight) {
                    setTimeout($.proxy(function() { this.update(); }, this), 10);
                }
            }, this),
            'changed.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._core.settings.autoHeight && e.property.name == 'position'){
                    this.update();
                }
            }, this),
            'loaded.owl.lazy': $.proxy(function(e) {
                if (e.namespace && this._core.settings.autoHeight
                    && e.element.closest('.' + this._core.settings.itemClass).index() === this._core.current()) {
                    this.update();
                }
            }, this)
        };

        // set default options
        this._core.options = $.extend({}, AutoHeight.Defaults, this._core.options);

        // register event handlers
        this._core.$element.on(this._handlers);
    };

    /**
     * Default options.
     * @public
     */
    AutoHeight.Defaults = {
        autoHeight: false,
        autoHeightClass: 'owl-height'
    };

    /**
     * Updates the view.
     */
    AutoHeight.prototype.update = function() {
        var start = this._core._current,
            end = start + this._core.settings.items,
            visible = this._core.$stage.children().toArray().slice(start, end),
            heights = [],
            maxheight = 0;

        $.each(visible, function(index, item) {
            heights.push($(item).height());
        });

        maxheight = Math.max.apply(null, heights);

        this._core.$stage.parent()
            .height(maxheight)
            .addClass(this._core.settings.autoHeightClass);
    };

    AutoHeight.prototype.destroy = function() {
        var handler, property;

        for (handler in this._handlers) {
            this._core.$element.off(handler, this._handlers[handler]);
        }
        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] != 'function' && (this[property] = null);
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.AutoHeight = AutoHeight;

})(window.Zepto || window.jQuery, window, document);

/**
 * Video Plugin
 * @version 2.0.0-beta.3
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

    /**
     * Creates the video plugin.
     * @class The Video Plugin
     * @param {Owl} carousel - The Owl Carousel
     */
    var Video = function(carousel) {
        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        this._core = carousel;

        /**
         * Cache all video URLs.
         * @protected
         * @type {Object}
         */
        this._videos = {};

        /**
         * Current playing item.
         * @protected
         * @type {jQuery}
         */
        this._playing = null;

        /**
         * All event handlers.
         * @todo The cloned content removale is too late
         * @protected
         * @type {Object}
         */
        this._handlers = {
            'initialized.owl.carousel': $.proxy(function(e) {
                if (e.namespace) {
                    this._core.register({ type: 'state', name: 'playing', tags: [ 'interacting' ] });
                }
            }, this),
            'resize.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._core.settings.video && this.isInFullScreen()) {
                    e.preventDefault();
                }
            }, this),
            'refreshed.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._core.is('resizing')) {
                    this._core.$stage.find('.cloned .owl-video-frame').remove();
                }
            }, this),
            'changed.owl.carousel': $.proxy(function(e) {
                if (e.namespace && e.property.name === 'position' && this._playing) {
                    this.stop();
                }
            }, this),
            'prepared.owl.carousel': $.proxy(function(e) {
                if (!e.namespace) {
                    return;
                }

                var $element = $(e.content).find('.owl-video');

                if ($element.length) {
                    $element.css('display', 'none');
                    this.fetch($element, $(e.content));
                }
            }, this)
        };

        // set default options
        this._core.options = $.extend({}, Video.Defaults, this._core.options);

        // register event handlers
        this._core.$element.on(this._handlers);

        this._core.$element.on('click.owl.video', '.owl-video-play-icon', $.proxy(function(e) {
            this.play(e);
        }, this));
    };

    /**
     * Default options.
     * @public
     */
    Video.Defaults = {
        video: false,
        videoHeight: false,
        videoWidth: false
    };

    /**
     * Gets the video ID and the type (YouTube/Vimeo/vzaar only).
     * @protected
     * @param {jQuery} target - The target containing the video data.
     * @param {jQuery} item - The item containing the video.
     */
    Video.prototype.fetch = function(target, item) {
        var type = (function() {
                if (target.attr('data-vimeo-id')) {
                    return 'vimeo';
                } else if (target.attr('data-vzaar-id')) {
                    return 'vzaar'
                } else {
                    return 'youtube';
                }
            })(),
            id = target.attr('data-vimeo-id') || target.attr('data-youtube-id') || target.attr('data-vzaar-id'),
            width = target.attr('data-width') || this._core.settings.videoWidth,
            height = target.attr('data-height') || this._core.settings.videoHeight,
            url = target.attr('href');

        if (url) {

            /*
             Parses the id's out of the following urls (and probably more):
             https://www.youtube.com/watch?v=:id
             https://youtu.be/:id
             https://vimeo.com/:id
             https://vimeo.com/channels/:channel/:id
             https://vimeo.com/groups/:group/videos/:id
             https://app.vzaar.com/videos/:id

             Visual example: http://regexper.com/#(http%3A%7Chttps%3A%7C)%5C%2F%5C%2F(player.%7Cwww.%7Capp.)%3F(vimeo%5C.com%7Cyoutu(be%5C.com%7C%5C.be%7Cbe%5C.googleapis%5C.com)%7Cvzaar%5C.com)%5C%2F(video%5C%2F%7Cvideos%5C%2F%7Cembed%5C%2F%7Cchannels%5C%2F.%2B%5C%2F%7Cgroups%5C%2F.%2B%5C%2F%7Cwatch%5C%3Fv%3D%7Cv%5C%2F)%3F(%5BA-Za-z0-9._%25-%5D*)(%5C%26%5CS%2B)%3F
             */

            id = url.match(/(http:|https:|)\/\/(player.|www.|app.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com)|vzaar\.com)\/(video\/|videos\/|embed\/|channels\/.+\/|groups\/.+\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/);

            if (id[3].indexOf('youtu') > -1) {
                type = 'youtube';
            } else if (id[3].indexOf('vimeo') > -1) {
                type = 'vimeo';
            } else if (id[3].indexOf('vzaar') > -1) {
                type = 'vzaar';
            } else {
                throw new Error('Video URL not supported.');
            }
            id = id[6];
        } else {
            throw new Error('Missing video URL.');
        }

        this._videos[url] = {
            type: type,
            id: id,
            width: width,
            height: height
        };

        item.attr('data-video', url);

        this.thumbnail(target, this._videos[url]);
    };

    /**
     * Creates video thumbnail.
     * @protected
     * @param {jQuery} target - The target containing the video data.
     * @param {Object} info - The video info object.
     * @see `fetch`
     */
    Video.prototype.thumbnail = function(target, video) {
        var tnLink,
            icon,
            path,
            dimensions = video.width && video.height ? 'style="width:' + video.width + 'px;height:' + video.height + 'px;"' : '',
            customTn = target.find('img'),
            srcType = 'src',
            lazyClass = '',
            settings = this._core.settings,
            create = function(path) {
                icon = '<div class="owl-video-play-icon"></div>';

                if (settings.lazyLoad) {
                    tnLink = '<div class="owl-video-tn ' + lazyClass + '" ' + srcType + '="' + path + '"></div>';
                } else {
                    tnLink = '<div class="owl-video-tn" style="opacity:1;background-image:url(' + path + ')"></div>';
                }
                target.after(tnLink);
                target.after(icon);
            };

        // wrap video content into owl-video-wrapper div
        target.wrap('<div class="owl-video-wrapper"' + dimensions + '></div>');

        if (this._core.settings.lazyLoad) {
            srcType = 'data-src';
            lazyClass = 'owl-lazy';
        }

        // custom thumbnail
        if (customTn.length) {
            create(customTn.attr(srcType));
            customTn.remove();
            return false;
        }

        if (video.type === 'youtube') {
            path = "//img.youtube.com/vi/" + video.id + "/hqdefault.jpg";
            create(path);
        } else if (video.type === 'vimeo') {
            $.ajax({
                type: 'GET',
                url: '//vimeo.com/api/v2/video/' + video.id + '.json',
                jsonp: 'callback',
                dataType: 'jsonp',
                success: function(data) {
                    path = data[0].thumbnail_large;
                    create(path);
                }
            });
        } else if (video.type === 'vzaar') {
            $.ajax({
                type: 'GET',
                url: '//vzaar.com/api/videos/' + video.id + '.json',
                jsonp: 'callback',
                dataType: 'jsonp',
                success: function(data) {
                    path = data.framegrab_url;
                    create(path);
                }
            });
        }
    };

    /**
     * Stops the current video.
     * @public
     */
    Video.prototype.stop = function() {
        this._core.trigger('stop', null, 'video');
        this._playing.find('.owl-video-frame').remove();
        this._playing.removeClass('owl-video-playing');
        this._playing = null;
        this._core.leave('playing');
        this._core.trigger('stopped', null, 'video');
    };

    /**
     * Starts the current video.
     * @public
     * @param {Event} event - The event arguments.
     */
    Video.prototype.play = function(event) {
        var target = $(event.target),
            item = target.closest('.' + this._core.settings.itemClass),
            video = this._videos[item.attr('data-video')],
            width = video.width || '100%',
            height = video.height || this._core.$stage.height(),
            html;

        if (this._playing) {
            return;
        }

        this._core.enter('playing');
        this._core.trigger('play', null, 'video');

        item = this._core.items(this._core.relative(item.index()));

        this._core.reset(item.index());

        if (video.type === 'youtube') {
            html = '<iframe width="' + width + '" height="' + height + '" src="//www.youtube.com/embed/' +
            video.id + '?autoplay=1&v=' + video.id + '" frameborder="0" allowfullscreen></iframe>';
        } else if (video.type === 'vimeo') {
            html = '<iframe src="//player.vimeo.com/video/' + video.id +
            '?autoplay=1" width="' + width + '" height="' + height +
            '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
        } else if (video.type === 'vzaar') {
            html = '<iframe frameborder="0"' + 'height="' + height + '"' + 'width="' + width +
            '" allowfullscreen mozallowfullscreen webkitAllowFullScreen ' +
            'src="//view.vzaar.com/' + video.id + '/player?autoplay=true"></iframe>';
        }

        $('<div class="owl-video-frame">' + html + '</div>').insertAfter(item.find('.owl-video'));

        this._playing = item.addClass('owl-video-playing');
    };

    /**
     * Checks whether an video is currently in full screen mode or not.
     * @todo Bad style because looks like a readonly method but changes members.
     * @protected
     * @returns {Boolean}
     */
    Video.prototype.isInFullScreen = function() {
        var element = document.fullscreenElement || document.mozFullScreenElement ||
            document.webkitFullscreenElement;

        return element && $(element).parent().hasClass('owl-video-frame');
    };

    /**
     * Destroys the plugin.
     */
    Video.prototype.destroy = function() {
        var handler, property;

        this._core.$element.off('click.owl.video');

        for (handler in this._handlers) {
            this._core.$element.off(handler, this._handlers[handler]);
        }
        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] != 'function' && (this[property] = null);
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.Video = Video;

})(window.Zepto || window.jQuery, window, document);

/**
 * Animate Plugin
 * @version 2.0.0-beta.3
 * @author Bartosz Wojciechowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

    /**
     * Creates the animate plugin.
     * @class The Navigation Plugin
     * @param {Owl} scope - The Owl Carousel
     */
    var Animate = function(scope) {
        this.core = scope;
        this.core.options = $.extend({}, Animate.Defaults, this.core.options);
        this.swapping = true;
        this.previous = undefined;
        this.next = undefined;

        this.handlers = {
            'change.owl.carousel': $.proxy(function(e) {
                if (e.namespace && e.property.name == 'position') {
                    this.previous = this.core.current();
                    this.next = e.property.value;
                }
            }, this),
            'drag.owl.carousel dragged.owl.carousel translated.owl.carousel': $.proxy(function(e) {
                if (e.namespace) {
                    this.swapping = e.type == 'translated';
                }
            }, this),
            'translate.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this.swapping && (this.core.options.animateOut || this.core.options.animateIn)) {
                    this.swap();
                }
            }, this)
        };

        this.core.$element.on(this.handlers);
    };

    /**
     * Default options.
     * @public
     */
    Animate.Defaults = {
        animateOut: false,
        animateIn: false
    };

    /**
     * Toggles the animation classes whenever an translations starts.
     * @protected
     * @returns {Boolean|undefined}
     */
    Animate.prototype.swap = function() {

        if (this.core.settings.items !== 1) {
            return;
        }

        if (!$.support.animation || !$.support.transition) {
            return;
        }

        this.core.speed(0);

        var left,
            clear = $.proxy(this.clear, this),
            previous = this.core.$stage.children().eq(this.previous),
            next = this.core.$stage.children().eq(this.next),
            incoming = this.core.settings.animateIn,
            outgoing = this.core.settings.animateOut;

        if (this.core.current() === this.previous) {
            return;
        }

        if (outgoing) {
            left = this.core.coordinates(this.previous) - this.core.coordinates(this.next);
            previous.one($.support.animation.end, clear)
                .css( { 'left': left + 'px' } )
                .addClass('animated owl-animated-out')
                .addClass(outgoing);
        }

        if (incoming) {
            next.one($.support.animation.end, clear)
                .addClass('animated owl-animated-in')
                .addClass(incoming);
        }
    };

    Animate.prototype.clear = function(e) {
        $(e.target).css( { 'left': '' } )
            .removeClass('animated owl-animated-out owl-animated-in')
            .removeClass(this.core.settings.animateIn)
            .removeClass(this.core.settings.animateOut);
        this.core.onTransitionEnd();
    };

    /**
     * Destroys the plugin.
     * @public
     */
    Animate.prototype.destroy = function() {
        var handler, property;

        for (handler in this.handlers) {
            this.core.$element.off(handler, this.handlers[handler]);
        }
        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] != 'function' && (this[property] = null);
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.Animate = Animate;

})(window.Zepto || window.jQuery, window, document);

/**
 * Autoplay Plugin
 * @version 2.0.0-beta.3
 * @author Bartosz Wojciechowski
 * @author Artus Kolanowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

    /**
     * Creates the autoplay plugin.
     * @class The Autoplay Plugin
     * @param {Owl} scope - The Owl Carousel
     */
    var Autoplay = function(carousel) {
        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        this._core = carousel;

        /**
         * The autoplay timeout.
         * @type {Timeout}
         */
        this._timeout = null;

        /**
         * Indicates whenever the autoplay is paused.
         * @type {Boolean}
         */
        this._paused = false;

        /**
         * All event handlers.
         * @protected
         * @type {Object}
         */
        this._handlers = {
            'changed.owl.carousel': $.proxy(function(e) {
                if (e.namespace && e.property.name === 'settings') {
                    if (this._core.settings.autoplay) {
                        this.play();
                    } else {
                        this.stop();
                    }
                } else if (e.namespace && e.property.name === 'position') {
                    //console.log('play?', e);
                    if (this._core.settings.autoplay) {
                        this._setAutoPlayInterval();
                    }
                }
            }, this),
            'initialized.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._core.settings.autoplay) {
                    this.play();
                }
            }, this),
            'play.owl.autoplay': $.proxy(function(e, t, s) {
                if (e.namespace) {
                    this.play(t, s);
                }
            }, this),
            'stop.owl.autoplay': $.proxy(function(e) {
                if (e.namespace) {
                    this.stop();
                }
            }, this),
            'mouseover.owl.autoplay': $.proxy(function() {
                if (this._core.settings.autoplayHoverPause && this._core.is('rotating')) {
                    this.pause();
                }
            }, this),
            'mouseleave.owl.autoplay': $.proxy(function() {
                if (this._core.settings.autoplayHoverPause && this._core.is('rotating')) {
                    this.play();
                }
            }, this)
        };

        // register event handlers
        this._core.$element.on(this._handlers);

        // set default options
        this._core.options = $.extend({}, Autoplay.Defaults, this._core.options);
    };

    /**
     * Default options.
     * @public
     */
    Autoplay.Defaults = {
        autoplay: false,
        autoplayTimeout: 5000,
        autoplayHoverPause: false,
        autoplaySpeed: false
    };

    /**
     * Starts the autoplay.
     * @public
     * @param {Number} [timeout] - The interval before the next animation starts.
     * @param {Number} [speed] - The animation speed for the animations.
     */
    Autoplay.prototype.play = function(timeout, speed) {
        this._paused = false;

        if (this._core.is('rotating')) {
            return;
        }

        this._core.enter('rotating');

        this._setAutoPlayInterval();
    };

    /**
     * Gets a new timeout
     * @private
     * @param {Number} [timeout] - The interval before the next animation starts.
     * @param {Number} [speed] - The animation speed for the animations.
     * @return {Timeout}
     */
    Autoplay.prototype._getNextTimeout = function(timeout, speed) {
        if ( this._timeout ) {
            window.clearTimeout(this._timeout);
        }
        return window.setTimeout($.proxy(function() {
            if (this._paused || this._core.is('busy') || this._core.is('interacting') || document.hidden) {
                return;
            }
            this._core.next(speed || this._core.settings.autoplaySpeed);
        }, this), timeout || this._core.settings.autoplayTimeout);
    };

    /**
     * Sets autoplay in motion.
     * @private
     */
    Autoplay.prototype._setAutoPlayInterval = function() {
        this._timeout = this._getNextTimeout();
    };

    /**
     * Stops the autoplay.
     * @public
     */
    Autoplay.prototype.stop = function() {
        if (!this._core.is('rotating')) {
            return;
        }

        window.clearTimeout(this._timeout);
        this._core.leave('rotating');
    };

    /**
     * Stops the autoplay.
     * @public
     */
    Autoplay.prototype.pause = function() {
        if (!this._core.is('rotating')) {
            return;
        }

        this._paused = true;
    };

    /**
     * Destroys the plugin.
     */
    Autoplay.prototype.destroy = function() {
        var handler, property;

        this.stop();

        for (handler in this._handlers) {
            this._core.$element.off(handler, this._handlers[handler]);
        }
        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] != 'function' && (this[property] = null);
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.autoplay = Autoplay;

})(window.Zepto || window.jQuery, window, document);

/**
 * Navigation Plugin
 * @version 2.0.0-beta.3
 * @author Artus Kolanowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {
    'use strict';

    /**
     * Creates the navigation plugin.
     * @class The Navigation Plugin
     * @param {Owl} carousel - The Owl Carousel.
     */
    var Navigation = function(carousel) {
        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        this._core = carousel;

        /**
         * Indicates whether the plugin is initialized or not.
         * @protected
         * @type {Boolean}
         */
        this._initialized = false;

        /**
         * The current paging indexes.
         * @protected
         * @type {Array}
         */
        this._pages = [];

        /**
         * All DOM elements of the user interface.
         * @protected
         * @type {Object}
         */
        this._controls = {};

        /**
         * Markup for an indicator.
         * @protected
         * @type {Array.<String>}
         */
        this._templates = [];

        /**
         * The carousel element.
         * @type {jQuery}
         */
        this.$element = this._core.$element;

        /**
         * Overridden methods of the carousel.
         * @protected
         * @type {Object}
         */
        this._overrides = {
            next: this._core.next,
            prev: this._core.prev,
            to: this._core.to
        };

        /**
         * All event handlers.
         * @protected
         * @type {Object}
         */
        this._handlers = {
            'prepared.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._core.settings.dotsData) {
                    this._templates.push('<div class="' + this._core.settings.dotClass + '">' +
                    $(e.content).find('[data-dot]').addBack('[data-dot]').attr('data-dot') + '</div>');
                }
            }, this),
            'added.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._core.settings.dotsData) {
                    this._templates.splice(e.position, 0, this._templates.pop());
                }
            }, this),
            'remove.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._core.settings.dotsData) {
                    this._templates.splice(e.position, 1);
                }
            }, this),
            'changed.owl.carousel': $.proxy(function(e) {
                if (e.namespace && e.property.name == 'position') {
                    this.draw();
                }
            }, this),
            'initialized.owl.carousel': $.proxy(function(e) {
                if (e.namespace && !this._initialized) {
                    this._core.trigger('initialize', null, 'navigation');
                    this.initialize();
                    this.update();
                    this.draw();
                    this._initialized = true;
                    this._core.trigger('initialized', null, 'navigation');
                }
            }, this),
            'refreshed.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._initialized) {
                    this._core.trigger('refresh', null, 'navigation');
                    this.update();
                    this.draw();
                    this._core.trigger('refreshed', null, 'navigation');
                }
            }, this)
        };

        // set default options
        this._core.options = $.extend({}, Navigation.Defaults, this._core.options);

        // register event handlers
        this.$element.on(this._handlers);
    };

    /**
     * Default options.
     * @public
     * @todo Rename `slideBy` to `navBy`
     */
    Navigation.Defaults = {
        nav: false,
        navText: [ 'prev', 'next' ],
        navSpeed: false,
        navElement: 'div',
        navContainer: false,
        navContainerClass: 'owl-nav',
        navClass: [ 'owl-prev', 'owl-next' ],
        slideBy: 1,
        dotClass: 'owl-dot',
        dotsClass: 'owl-dots',
        dots: true,
        dotsEach: false,
        dotsData: false,
        dotsSpeed: false,
        dotsContainer: false
    };

    /**
     * Initializes the layout of the plugin and extends the carousel.
     * @protected
     */
    Navigation.prototype.initialize = function() {
        var override,
            settings = this._core.settings;

        // create DOM structure for relative navigation
        this._controls.$relative = (settings.navContainer ? $(settings.navContainer).addClass(settings.navContainerClass)
            : $('<div>').addClass(settings.navContainerClass).appendTo(this.$element)).addClass('disabled');

        this._controls.$previous = $('<' + settings.navElement + '>')
            .addClass(settings.navClass[0])
            .html(settings.navText[0])
            .prependTo(this._controls.$relative)
            .on('click', $.proxy(function(e) {
                this.prev(settings.navSpeed);
            }, this));
        this._controls.$next = $('<' + settings.navElement + '>')
            .addClass(settings.navClass[1])
            .html(settings.navText[1])
            .appendTo(this._controls.$relative)
            .on('click', $.proxy(function(e) {
                this.next(settings.navSpeed);
            }, this));

        // create DOM structure for absolute navigation
        if (!settings.dotsData) {
            this._templates = [ $('<div>')
                .addClass(settings.dotClass)
                .append($('<span>'))
                .prop('outerHTML') ];
        }

        this._controls.$absolute = (settings.dotsContainer ? $('<div>').addClass(settings.dotsClass).appendTo(settings.dotsContainer)
            : $('<div>').addClass(settings.dotsClass).appendTo(this.$element)).addClass('disabled');

        this._controls.$absolute.on('click', 'div', $.proxy(function(e) {
            var index = $(e.target).parent().is(this._controls.$absolute)
                ? $(e.target).index() : $(e.target).parent().index();

            e.preventDefault();

            this.to(index, settings.dotsSpeed);
        }, this));

        // override public methods of the carousel
        for (override in this._overrides) {
            this._core[override] = $.proxy(this[override], this);
        }
    };

    /**
     * Destroys the plugin.
     * @protected
     */
    Navigation.prototype.destroy = function() {
        var handler, control, property, override;

        for (handler in this._handlers) {
            this.$element.off(handler, this._handlers[handler]);
        }
        for (control in this._controls) {
            this._controls[control].remove();
        }
        for (override in this.overides) {
            this._core[override] = this._overrides[override];
        }
        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] != 'function' && (this[property] = null);
        }
    };

    /**
     * Updates the internal state.
     * @protected
     */
    Navigation.prototype.update = function() {
        var i, j, k,
            lower = this._core.clones().length / 2,
            upper = lower + this._core.items().length,
            maximum = this._core.maximum(true),
            settings = this._core.settings,
            size = settings.center || settings.autoWidth || settings.dotsData
                ? 1 : settings.dotsEach || settings.items;

        if (settings.slideBy !== 'page') {
            settings.slideBy = Math.min(settings.slideBy, settings.items);
        }

        if (settings.dots || settings.slideBy == 'page') {
            this._pages = [];

            for (i = lower, j = 0, k = 0; i < upper; i++) {
                if (j >= size || j === 0) {
                    this._pages.push({
                        start: Math.min(maximum, i - lower),
                        end: i - lower + size - 1
                    });
                    if (Math.min(maximum, i - lower) === maximum) {
                        break;
                    }
                    j = 0, ++k;
                }
                j += this._core.mergers(this._core.relative(i));
            }
        }
    };

    /**
     * Draws the user interface.
     * @todo The option `dotsData` wont work.
     * @protected
     */
    Navigation.prototype.draw = function() {
        var difference,
            settings = this._core.settings,
            index = this._core.relative(this._core.current()),
            loop = settings.loop || settings.rewind,
            disabled = loop ? this._core.items().length < settings.items : this._core.items().length <= settings.items;

        this._controls.$relative.toggleClass('disabled', !settings.nav || disabled);

        if (settings.nav) {
            this._controls.$previous.toggleClass('disabled', !loop && index <= this._core.minimum(true));
            this._controls.$next.toggleClass('disabled', !loop && index >= this._core.maximum(true));
        }

        this._controls.$absolute.toggleClass('disabled', !settings.dots || disabled);

        if (settings.dots) {
            difference = this._pages.length - this._controls.$absolute.children().length;

            if (settings.dotsData && difference !== 0) {
                this._controls.$absolute.html(this._templates.join(''));
            } else if (difference > 0) {
                this._controls.$absolute.append(new Array(difference + 1).join(this._templates[0]));
            } else if (difference < 0) {
                this._controls.$absolute.children().slice(difference).remove();
            }

            this._controls.$absolute.find('.active').removeClass('active');
            this._controls.$absolute.children().eq($.inArray(this.current(), this._pages)).addClass('active');
        }
    };

    /**
     * Extends event data.
     * @protected
     * @param {Event} event - The event object which gets thrown.
     */
    Navigation.prototype.onTrigger = function(event) {
        var settings = this._core.settings;

        event.page = {
            index: $.inArray(this.current(), this._pages),
            count: this._pages.length,
            size: settings && (settings.center || settings.autoWidth || settings.dotsData
                ? 1 : settings.dotsEach || settings.items)
        };
    };

    /**
     * Gets the current page position of the carousel.
     * @protected
     * @returns {Number}
     */
    Navigation.prototype.current = function() {
        var current = this._core.relative(this._core.current());
        return $.grep(this._pages, $.proxy(function(page, index) {
            return page.start <= current && page.end >= current;
        }, this)).pop();
    };

    /**
     * Gets the current succesor/predecessor position.
     * @protected
     * @returns {Number}
     */
    Navigation.prototype.getPosition = function(successor) {
        var position, length,
            settings = this._core.settings;

        if (settings.slideBy == 'page') {
            position = $.inArray(this.current(), this._pages);
            length = this._pages.length;
            successor ? ++position : --position;
            position = this._pages[((position % length) + length) % length].start;
        } else {
            position = this._core.relative(this._core.current());
            length = this._core.items().length;
            successor ? position += settings.slideBy : position -= settings.slideBy;
        }

        return position;
    };

    /**
     * Slides to the next item or page.
     * @public
     * @param {Number} [speed=false] - The time in milliseconds for the transition.
     */
    Navigation.prototype.next = function(speed) {
        $.proxy(this._overrides.to, this._core)(this.getPosition(true), speed);
    };

    /**
     * Slides to the previous item or page.
     * @public
     * @param {Number} [speed=false] - The time in milliseconds for the transition.
     */
    Navigation.prototype.prev = function(speed) {
        $.proxy(this._overrides.to, this._core)(this.getPosition(false), speed);
    };

    /**
     * Slides to the specified item or page.
     * @public
     * @param {Number} position - The position of the item or page.
     * @param {Number} [speed] - The time in milliseconds for the transition.
     * @param {Boolean} [standard=false] - Whether to use the standard behaviour or not.
     */
    Navigation.prototype.to = function(position, speed, standard) {
        var length;

        if (!standard && this._pages.length) {
            length = this._pages.length;
            $.proxy(this._overrides.to, this._core)(this._pages[((position % length) + length) % length].start, speed);
        } else {
            $.proxy(this._overrides.to, this._core)(position, speed);
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.Navigation = Navigation;

})(window.Zepto || window.jQuery, window, document);

/**
 * Hash Plugin
 * @version 2.0.0-beta.3
 * @author Artus Kolanowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {
    'use strict';

    /**
     * Creates the hash plugin.
     * @class The Hash Plugin
     * @param {Owl} carousel - The Owl Carousel
     */
    var Hash = function(carousel) {
        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        this._core = carousel;

        /**
         * Hash index for the items.
         * @protected
         * @type {Object}
         */
        this._hashes = {};

        /**
         * The carousel element.
         * @type {jQuery}
         */
        this.$element = this._core.$element;

        /**
         * All event handlers.
         * @protected
         * @type {Object}
         */
        this._handlers = {
            'initialized.owl.carousel': $.proxy(function(e) {
                if (e.namespace && this._core.settings.startPosition === 'URLHash') {
                    $(window).trigger('hashchange.owl.navigation');
                }
            }, this),
            'prepared.owl.carousel': $.proxy(function(e) {
                if (e.namespace) {
                    var hash = $(e.content).find('[data-hash]').addBack('[data-hash]').attr('data-hash');

                    if (!hash) {
                        return;
                    }

                    this._hashes[hash] = e.content;
                }
            }, this),
            'changed.owl.carousel': $.proxy(function(e) {
                if (e.namespace && e.property.name === 'position') {
                    var current = this._core.items(this._core.relative(this._core.current())),
                        hash = $.map(this._hashes, function(item, hash) {
                            return item === current ? hash : null;
                        }).join();

                    if (!hash || window.location.hash.slice(1) === hash) {
                        return;
                    }

                    window.location.hash = hash;
                }
            }, this)
        };

        // set default options
        this._core.options = $.extend({}, Hash.Defaults, this._core.options);

        // register the event handlers
        this.$element.on(this._handlers);

        // register event listener for hash navigation
        $(window).on('hashchange.owl.navigation', $.proxy(function(e) {
            var hash = window.location.hash.substring(1),
                items = this._core.$stage.children(),
                position = this._hashes[hash] && items.index(this._hashes[hash]);

            if (position === undefined || position === this._core.current()) {
                return;
            }

            this._core.to(this._core.relative(position), false, true);
        }, this));
    };

    /**
     * Default options.
     * @public
     */
    Hash.Defaults = {
        URLhashListener: false
    };

    /**
     * Destroys the plugin.
     * @public
     */
    Hash.prototype.destroy = function() {
        var handler, property;

        $(window).off('hashchange.owl.navigation');

        for (handler in this._handlers) {
            this._core.$element.off(handler, this._handlers[handler]);
        }
        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] != 'function' && (this[property] = null);
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.Hash = Hash;

})(window.Zepto || window.jQuery, window, document);

/**
 * Support Plugin
 *
 * @version 2.0.0-beta.3
 * @author Vivid Planet Software GmbH
 * @author Artus Kolanowski
 * @license The MIT License (MIT)
 */
;(function($, window, document, undefined) {

    var style = $('<support>').get(0).style,
        prefixes = 'Webkit Moz O ms'.split(' '),
        events = {
            transition: {
                end: {
                    WebkitTransition: 'webkitTransitionEnd',
                    MozTransition: 'transitionend',
                    OTransition: 'oTransitionEnd',
                    transition: 'transitionend'
                }
            },
            animation: {
                end: {
                    WebkitAnimation: 'webkitAnimationEnd',
                    MozAnimation: 'animationend',
                    OAnimation: 'oAnimationEnd',
                    animation: 'animationend'
                }
            }
        },
        tests = {
            csstransforms: function() {
                return !!test('transform');
            },
            csstransforms3d: function() {
                return !!test('perspective');
            },
            csstransitions: function() {
                return !!test('transition');
            },
            cssanimations: function() {
                return !!test('animation');
            }
        };

    function test(property, prefixed) {
        var result = false,
            upper = property.charAt(0).toUpperCase() + property.slice(1);

        $.each((property + ' ' + prefixes.join(upper + ' ') + upper).split(' '), function(i, property) {
            if (style[property] !== undefined) {
                result = prefixed ? property : true;
                return false;
            }
        });

        return result;
    }

    function prefixed(property) {
        return test(property, true);
    }

    if (tests.csstransitions()) {
        /* jshint -W053 */
        $.support.transition = new String(prefixed('transition'))
        $.support.transition.end = events.transition.end[ $.support.transition ];
    }

    if (tests.cssanimations()) {
        /* jshint -W053 */
        $.support.animation = new String(prefixed('animation'))
        $.support.animation.end = events.animation.end[ $.support.animation ];
    }

    if (tests.csstransforms()) {
        /* jshint -W053 */
        $.support.transform = new String(prefixed('transform'));
        $.support.transform3d = tests.csstransforms3d();
    }

})(window.Zepto || window.jQuery, window, document);

/**
 * SrcollBar
 * @version 2.0.0-beta.3
 * @author Loginov Artem
 * @license The MIT License (MIT)
 */
;(function ( $, window, document, undefined ) {

    'use strict';

    var ScrollBar = function(scope) {

        /**
         * Reference to the core.
         * @protected
         * @type {Owl}
         */
        this.owl = scope;

        /**
         * The carousel element.
         * @type {jQuery}
         */
        this.$element = this.owl.$element;

        /**
         * Indicates whether the plugin is initialized or not.
         * @protected
         * @type {Boolean}
         */
        this._initialized = false;

        /**
         * All DOM elements of the user interface.
         * @protected
         * @type {Object}
         */
        this._controls = {};

        /**
         * All event handlers.
         * @protected
         * @type {Object}
         */
        this._handlers = {
            'change.owl.carousel': $.proxy(function(e) {

                if (e.namespace && e.property.name == 'position') {

                    this.changeScrollBarPosition(e.property.value);

                }

            }, this),
            'changed.owl.carousel': $.proxy(function(e) {

                //

            }, this),
            'initialized.owl.carousel': $.proxy(function(e) {

                if (e.namespace && !this._initialized) {

                    this.owl.trigger('initialize', null, 'scrollBar');
                    this.initialize();
                    this._initialized = true;
                    this.owl.trigger('initialized', null, 'scrollBar');

                }

            }, this),
            'refreshed.owl.carousel': $.proxy(function(e) {

                if (e.namespace && this._initialized) {

                    this.owl.trigger('refresh', null, 'navigation');
                    this.calculateScrollBar();
                    this.owl.trigger('refreshed', null, 'navigation');

                }

            }, this)
        };

        // set default options
        this.owl.options = $.extend({}, ScrollBar.Defaults, this.owl.options);

        // register event handlers
        this.$element.on(this._handlers);

    };

    ScrollBar.Defaults = {
        scrollBar: false,
        scrollBarContainer: false,
        scrollBarContainerClass: 'owl-scroll-bar',
        scrollBarClass: 'owl-scroll-bar-rail',
        scrollBarHandleClass: 'owl-scroll-bar-handle'
    };

    ScrollBar.prototype.initialize = function() {

        var settings = this.owl.settings;

        if (this.owl.settings.scrollBar) {

            this._initialized = true;

            // Create DOM structure for scroll bar navigation
            this._controls.$container = (!!settings.scrollBarContainer ? $(settings.scrollBarContainer) : $('<div>').addClass(settings.scrollBarContainerClass).appendTo(this.$element));

            this._controls.$container.toggleClass('disabled', !settings.scrollBar);

            this._controls.$rail = $('<div class="' + settings.scrollBarClass + '">').prependTo(this._controls.$container);
            this._controls.$handle = $('<div class="' + settings.scrollBarHandleClass + '">').prependTo(this._controls.$rail);

            this.initUIPlugin();

        }

    };

    ScrollBar.prototype.initUIPlugin = function() {

        this.calculateScrollBar();

        if ($.isFunction($.fn.draggable)) {

            this._controls.$handle.draggable({
                axis: 'x',
                containment: this._controls.$rail,
                scroll: false,

                // Drag start
                start: $.proxy(function(e, ui) {

                    this.owl.$element.toggleClass(this.owl.settings.grabClass, true);

                    var stage = {
                        x: -ui.originalPosition.left,
                        y: 0
                    };

                    this.owl._drag.time = new Date().getTime();
                    this.owl._drag.target = $(e.target);
                    this.owl._drag.stage.start = stage;
                    this.owl._drag.stage.current = stage;
                    this.owl._drag.pointer = this.owl.pointer(e);

                    this.owl.enter('dragging');
                    this.owl.trigger('drag');

                }, this),

                // Drag move
                drag: $.proxy(function(e, ui) {

                    var coordinates = ui.position.left * (this.owl.$stage.width() / this._controls.$rail.width());

                    this.owl._drag.stage.current = {
                        x: -ui.position.left * (this.owl.$stage.width() / this._controls.$rail.width()),
                        y: 0
                    };

                    this.owl.animate(-coordinates);

                }, this),

                // Drag end
                stop: $.proxy(function(e, ui) {

                    this.owl.$element.toggleClass(this.owl.settings.grabClass, false);

                    var delta = this.owl.difference(
                            {
                                x: -ui.originalPosition.left * (this.owl.$stage.width() / this._controls.$rail.width()),
                                y: 0
                            },
                            {
                                x: -ui.position.left * (this.owl.$stage.width() / this._controls.$rail.width()),
                                y: 0
                            }
                        ),
                        stage = this.owl._drag.stage.current,
                        direction = delta.x > 0 ^ this.owl.settings.rtl ? 'left' : 'right',

                        closestItem = this.owl.closest(stage.x, direction);

                    this.owl.speed(this.owl.settings.dragEndSpeed || this.owl.settings.smartSpeed);
                    this.owl.current(closestItem);
                    this.owl.invalidate('position');
                    this.owl.update();

                    if (this.owl._current == closestItem) {

                        this.changeScrollBarPosition(closestItem);

                    }

                    this.owl._drag.direction = direction;

                    this.owl.leave('dragging');
                    this.owl.trigger('dragged');

                }, this)
            });

        }

    };

    ScrollBar.prototype.calculateScrollBar = function() {

        if (this.owl.settings.scrollBar) {

            setTimeout($.proxy(function () {

                var step = this._controls.$rail.width() / this.owl._items.length,
                    handle = step * this.owl.options.responsive[this.owl._breakpoint].items;

                this._controls.$handle.css({
                    width: handle
                });

            }, this), 50);

        }

    };

    ScrollBar.prototype.changeScrollBarPosition = function(target) {

        if (this.owl.settings.scrollBar) {

            var step = this._controls.$rail.width() / this.owl._items.length,

                xPosition = step * target,
                duration = this.owl.speed(this.owl.settings.dragEndSpeed || this.owl.settings.smartSpeed);

            this._controls.$handle.animate({ left: xPosition }, duration);

        }

    };

    ScrollBar.prototype.destroy = function() {

        if (this.owl.settings.scrollBar) {

            var handler;

            this._controls.$container.remove();

            for (handler in this._handlers) {

                this.$element.off(handler, this._handlers[handler]);

            }

        }

    };

    $.fn.owlCarousel.Constructor.Plugins['scrollBar'] = ScrollBar;

})( window.Zepto || window.jQuery, window,  document );

/*

 JQuery Leaflet Pop Up v1.0.0
 Copyright © 2014 Artem Loginov
 http://loginoff.pro/

 License:
 GNU General Public License 2 - http://opensource.org/licenses/GPL-2.0

 */

(function($) {

    'use strict';

    var LeafletPopup = (function(window, undefined) {

        var leaflet = {

                settings: {},
                defaultSettings: {

                    url: false,
                    content: false,                         // text/html string or function, who will return text/html string, or false (boolean)
                    contentType: false,                     // string: "html", "function", "image", "iframe", "url", "hash"

                    animationStyleOfBox: 'fade',            // animation style of popup box: "fade", "scale", "drop", "drop3d"
                    animationStyleOfOverlay: 'fade',        // animation style of overlay: "fade", "scale"
                    animationStyleOfChange: 'fade',         // animation style of change content: "fade", "slide", "pushDown"
                    animateSpeed: 400,

                    boxVerticalGutters: 50,                 // number of pixels
                    boxHorizontalGutters: 50,               // number of pixels
                    boxWidth: 800,                          // number of pixels or string 'auto',

                    closeBtnClass: 'i-leaflet i-leaflet-close',
                    closeBtnLocation: 'overlay',            // 'overlay', 'box',

                    directionBtnClass: ['i-leaflet i-leaflet-prev', 'i-leaflet i-leaflet-next'],
                    directionBtnLocation: 'overlay',        // 'overlay', 'box',

                    checkCookies: false,
                    cookies: {
                        key: 'jquery.leaflet',
                        value: 'locked',
                        expires: 1,
                        path: '/'
                    },

                    maxHeight: false,

                    namespace: 'b-leaflet',                  // css-prefix for popup layout

                    overlay: true,
                    overlayBlur: false,
                    overlayCloseEvent: true,
                    overlayOpacity: 0.65,
                    overlayShowSpeed: 400,
                    overlayLoader: {
                        cx: 26,
                        cy: 26,
                        r: 25
                    },

                    scrollMode: 'outer',                    // 'outer' - common scroll mode, 'inner' - popup is fixed behind content
                    scrollLocker: null,

                    // Callbacks
                    beforeLoad: function() {  },            // this - popup box jquery object
                    afterLoad: function() {  },             // this - popup box jquery object

                    beforeClose: function() {  },           // this - popup container jquery object
                    afterClose: function() {  }             // global context

                },

                states: {
                    isBuilt: false,
                    keycode: 0,
                    scroll: 0,
                    scrollBarWidth: 18,
                    direction: 1
                },
                elements: {},
                group: {},
                groupArray: []

            },

            KEYCODE_LEFT_ARROW = 37,
            KEYCODE_RIGHT_ARROW = 39,

            KEYCODE_ESC = 27;

        function App($element, options, method) {

            // Cashing
            leaflet.elements.body = $('body');
            leaflet.elements.document = $('html');

            leaflet.elements.link = $element;

            // Get settings
            this.settings = $.extend(leaflet.settings, leaflet.defaultSettings, options);

            this.settings.url = this.settings.url || $element.attr('href') || $element.data('href') || '/';

            if (!this.settings.contentType) {

                this.setContentType();

            }

            this.settings.boxWidth = typeof this.settings.boxWidth === 'function' ? this.settings.boxWidth.call(leaflet.elements.link) : this.settings.boxWidth;
            this.settings.closeBtnLocation = this.settings.overlay ? this.settings.closeBtnLocation : 'box';
            this.settings.scrollMode = typeof this.settings.scrollMode === 'function' ? this.settings.scrollMode() : this.settings.scrollMode;

            // Set states
            this.states = {};
            this.states.pfx = helpers.getPfx();
            this.states.loadingTimeout = null;
            this.states.scroll = document.documentElement.scrollTop || document.body.scrollTop;
            this.states.scrollBarWidth = helpers.getScrollBarWidth();

            // Set document classes prefix
            this.docClassPfx = 'm-leaflet-';

            switch (method) {

                default:

                    return $.error('Method "' +  param + '" is not defined in LeafletPopup');

                case 'init':

                    // Init popup
                    this.init();

                    break;

                case 'show':

                    if (!(this.settings.checkCookies && helpers.cookies.get(this.settings.cookies.key) == this.settings.cookies.value)) {

                        // Init popup
                        this.init();
                        helpers.cookies.set(this.settings.cookies);

                    }

                    break;

                case 'hide':

                    // Hide popup
                    this.hideLayout();

                    break;

                case 'destroy':

                    leaflet.elements.body.off('click.leafletOpen', $element.selector);

                    break;

            }

        }

        App.prototype.init = function() {

            if (!leaflet.states.isBuilt) {

                // Build layout
                this.buildLayout();

                // Popup box show
                this.boxShow();

            } else {

                // Popup box change
                this.boxChange();

            }

        };

        App.prototype.configureDocClasses = function() {

            var docClasses = this.docClassPfx + 'on ' + this.docClassPfx + 'loading ';

            // Box transition style
            docClasses += this.docClassPfx + this.settings.animationStyleOfBox + '-transition ';

            // Leaflet mode
            docClasses += this.docClassPfx + this.settings.scrollMode + '-mode ';

            // Overlay switch
            docClasses += this.settings.overlay ? this.docClassPfx + 'overlay ' : '';

            return docClasses;

        };

        App.prototype.removeDocClasses = function() {

            var mask = this.docClassPfx + '*';

            leaflet.elements.document.removeClass(function(index, classStr) {

                var replace = mask.replace(/\*/g, '\\S+');
                return (classStr.match(new RegExp('\\b' + replace + '', 'g')) || []).join(' ');

            });

        };

        App.prototype.setContentType = function() {

            if (!!this.settings.content) {

                switch (typeof leaflet.settings.content) {

                    default:
                    case 'string':

                        this.settings.contentType = 'html';

                        break;

                    case 'function':

                        this.settings.contentType = 'function';

                        break;

                    case 'boolean':

                        this.settings.contentType = 'iframe';

                        break;

                }

            } else {

                var isImage = /\.(gif|png|jp(e|g|eg)|bmp|ico|webp|jxr|svg)((#|\?).*)?$/i.test(this.settings.url),
                    hasHash = !!this.settings.url.match(/#/gi),
                    remoteHash = this.settings.url.indexOf('#') !== 0;

                if (isImage) {

                    this.settings.contentType = 'image';

                }

                if (hasHash && !remoteHash) {

                    this.settings.contentType = 'hash';

                }

                if (hasHash && remoteHash) {

                    this.settings.contentType = 'hashUrl';

                }

                if (!isImage && !hasHash) {

                    this.settings.contentType = 'url';

                }

            }

        };

        App.prototype.buildLayout = function() {

            // Create popUp markup
            var $leaflet = $('<div class="' + leaflet.settings.namespace + '"></div>'),

                $leafletCapsule = $('<div class="' + leaflet.settings.namespace + '_capsule"></div>').appendTo($leaflet),
                $leafletWrapper = $('<div class="' + leaflet.settings.namespace + '_capsule_inner"></div>').css({ padding: leaflet.settings.boxVerticalGutters + 'px ' + leaflet.settings.boxHorizontalGutters + 'px' }).appendTo($leafletCapsule),

                $leafletSources = $('<div class="' + leaflet.settings.namespace + '_inner_sources"></div>').appendTo($leafletWrapper),
                $leafletPerspective = $('<div class="' + leaflet.settings.namespace + '_perspective"></div>').css({ maxWidth: leaflet.settings.boxWidth }).appendTo($leafletWrapper),

                $leafletBox = $('<div class="' + leaflet.settings.namespace + '_box"></div>').css({ width: 'auto', maxWidth: leaflet.settings.boxWidth }).appendTo($leafletPerspective),
                $leafletBoxContent = $('<div class="' + leaflet.settings.namespace + '_box_content"></div>').appendTo($leafletBox),

                $leafletCloseBtn = $('<div class="' + leaflet.settings.namespace + '_close ' + leaflet.settings.closeBtnClass + '"></div>'),

                $leafletOverlay = $('<div class="' + leaflet.settings.namespace + '_overlay"></div>'),
                $leafletOverlayLoader = $('<div class="' + leaflet.settings.namespace + '_overlay_loader"></div>'),
                $leafletOverlayLoaderCircle = $('<svg><circle cx="' + leaflet.settings.overlayLoader.cx + '" cy="' + leaflet.settings.overlayLoader.cy + '" r="' + leaflet.settings.overlayLoader.r + '"></circle></svg>').appendTo($leafletOverlayLoader),

                $leafletNav = $('<div class="' + leaflet.settings.namespace + '_nav"></div>').appendTo(this.settings.directionBtnLocation === 'box' ? $leafletBox : $leafletWrapper),

                $leafletPrevBtn = $('<div class="' + leaflet.settings.namespace + '_direction ' + leaflet.settings.namespace + '_prev ' + leaflet.settings.directionBtnClass[0] + '"></div>').appendTo($leafletNav),
                $leafletNextBtn = $('<div class="' + leaflet.settings.namespace + '_direction ' + leaflet.settings.namespace + '_next ' + leaflet.settings.directionBtnClass[1] + '"></div>').appendTo($leafletNav),

                $leafletLocker = $('<div class="' + leaflet.settings.namespace + '_locker"></div>');

            // Overlay
            if (!!leaflet.settings.overlay) {

                $leafletOverlay.appendTo($leafletWrapper);

            }

            if (!!leaflet.settings.overlayLoader) {

                $leafletOverlayLoader.appendTo($leafletOverlay);

            }

            leaflet.elements.sources = $leafletSources;

            // Group
            this.groupSources();
            $leafletNav.toggle(leaflet.groupArray.length > 1);

            // Close
            $leafletCloseBtn.appendTo(this.settings.closeBtnLocation === 'box' ? $leafletBox : $leafletWrapper);

            // Transition settings
            $leaflet
                .css(leaflet.pfx + 'transition-duration', leaflet.settings.animateSpeed + 'ms')
                .css('transition-duration', leaflet.settings.animateSpeed + 'ms');

            $leafletBox
                .css(leaflet.pfx + 'transition-duration', leaflet.settings.animateSpeed + 'ms')
                .css('transition-duration', leaflet.settings.animateSpeed + 'ms');

            $leafletBoxContent
                .css(leaflet.pfx + 'transition-duration', leaflet.settings.animateSpeed + 'ms')
                .css('transition-duration', leaflet.settings.animateSpeed + 'ms');

            $leafletOverlay
                .css(leaflet.pfx + 'transition-duration', leaflet.settings.overlayShowSpeed + 'ms')
                .css('transition-duration', leaflet.settings.overlayShowSpeed + 'ms');

            // Add document classes
            leaflet.elements.document.addClass(this.configureDocClasses());

            // Set leaflet data
            $leaflet.data('leafletSettings', {
                animationStyleOfBox: this.settings.animationStyleOfBox,
                animationStyleOfOverlay: this.settings.animationStyleOfOverlay,
                animationStyleOfChange: this.settings.animationStyleOfChange,
                scrollLocker: this.settings.scrollLocker,
                scrollMode: this.settings.scrollMode
            });

            // Caching jquery objects
            leaflet.elements.main = $leaflet;
            leaflet.elements.perspective = $leafletPerspective;
            leaflet.elements.wrapper = $leafletWrapper;
            leaflet.elements.box =  $leafletBox;
            leaflet.elements.close = $leafletCloseBtn;
            leaflet.elements.nav = $leafletNav;
            leaflet.elements.prev = $leafletPrevBtn;
            leaflet.elements.next = $leafletNextBtn;
            leaflet.elements.content = $leafletBoxContent;
            leaflet.elements.overlay = $leafletOverlay;
            leaflet.elements.loader = $leafletOverlayLoader;
            leaflet.elements.locker = !!this.settings.scrollLocker ? this.settings.scrollLocker : $leafletLocker;

            // Caching scroll state
            leaflet.states.scroll = this.states.scroll;

            // Set layout mode
            this.setLayoutMode();

            // Bind events
            this.bindCloseEvents();
            this.bindChangeEvents();
            this.bindResizeEvents();

            // Append markup
            leaflet.elements.body.prepend($leaflet);

            // Show overlay with micro delay
            setTimeout($.proxy(function() {

                this.overlayShow();

            }, this), 0);

            // Switch state
            leaflet.states.isBuilt = true;

        };

        App.prototype.hideLayout = function() {

            // Action before closing popup
            if(!!this.settings.beforeClose) {

                this.settings.beforeClose.call(leaflet.elements.main, leaflet);

            }

            this.overlayHide();

            // Hide popup box and destroy layout
            this.boxHide(function() {

                // Unset locker
                this.unsetLayoutMode();

                // Destroy layout
                leaflet.elements.main.remove();

                // Clear document classes
                this.removeDocClasses();

                // Switch state
                leaflet.states.isBuilt = false;

                leaflet.group = {};
                leaflet.groupArray = [];
                leaflet.groupCurrent = false;

                // Action after closing popup
                if(!!this.settings.afterClose) {

                    this.settings.afterClose();

                }

            });

        };

        App.prototype.setLayoutMode = function() {

            if (this.settings.scrollMode === 'outer') {

                $('body')
                    .css({
                        //position: 'fixed',
                        overflow: 'hidden',
                        paddingRight: helpers.getScrollBarWidth()
                        //marginTop: -leaflet.states.scroll,
                        //height: '100%'
                    });

            }

        };

        App.prototype.unsetLayoutMode = function() {

            if (leaflet.elements.main.data('leafletSettings').scrollMode === 'outer') {

                $('body')
                    .css({
                        position: '',
                        overflow: '',
                        paddingRight: '',
                        marginTop: '',
                        height: ''
                    });

                //window.scrollBy(0, leaflet.states.scroll);

            }

        };

        App.prototype.groupSources = function() {

            var $group = $('[data-group="' + leaflet.elements.link.attr('data-group') + '"]');

            leaflet.group = $group.filter(function() {

                return leaflet.states.isBuilt || !!$(this).data('leaflet');

            });

            leaflet.groupCurrent = leaflet.group.length && typeof leaflet.groupCurrent === 'undefined' ? leaflet.group.index(leaflet.elements.link) : leaflet.groupCurrent;

            /*
             leaflet.elements.sources.empty().append(leaflet.group.clone());
             leaflet.group = leaflet.elements.sources.find('[data-group]');
             */

            $group.each(function() {

                if (leaflet.states.isBuilt || !!$(this).data('leaflet')) {

                    leaflet.groupArray.push($(this));

                }

            });

        };

        App.prototype.bindCloseEvents = function() {

            leaflet.elements.close
                .add(this.settings.overlayCloseEvent ? leaflet.elements.overlay : {})
                .bind('click.leafletClose', $.proxy(function() {

                    this.hideLayout();

                }, this));

            // Keyboard
            $(document).bind('keyup.leafletClose', $.proxy(function(e) {

                leaflet.states.keycode = e.keyCode;

                if (leaflet.states.keycode === KEYCODE_ESC) {

                    this.hideLayout();

                }

            }, this));

        };

        App.prototype.bindResizeEvents = function() {

            $(window).bind('resize.leafletResize', $.proxy(function() {

                if (leaflet.states.isBuilt) {

                    leaflet.elements.box
                        .css(this.states.pfx + 'transition-property', 'top, margin, height, transform, opacity, visibility')
                        .css('transition-property', 'top, margin, height, transform, opacity, visibility');

                    this.boxPosition();

                }

            }, this));

        };

        App.prototype.bindChangeEvents = function() {

            $(leaflet.elements.prev)
                .bind('click.leafletChange', $.proxy(function() {

                    leaflet.states.direction = -1;
                    this.changeEventHandler();

                }, this));

            $(leaflet.elements.next)
                .bind('click.leafletChange', $.proxy(function() {

                    leaflet.states.direction = 1;
                    this.changeEventHandler();

                }, this));

            // Keyboard
            $(document).bind('keyup.leafletChange', $.proxy(function(e) {

                leaflet.states.keycode = e.keyCode;

                if (!leaflet.elements.document.hasClass(this.docClassPfx + 'loading') && (leaflet.states.keycode === KEYCODE_RIGHT_ARROW || leaflet.states.keycode === KEYCODE_LEFT_ARROW)) {

                    leaflet.states.direction = leaflet.states.keycode === KEYCODE_RIGHT_ARROW ? 1 : -1;
                    this.changeEventHandler();

                }

            }, this));

            // Swipe
            leaflet.elements.perspective.bind('touchstart.leafletSwipeControl', function(e) {

                var touch = e.originalEvent.touches[0];

                helpers.touches[e.type].x = touch.pageX;
                helpers.touches[e.type].y = touch.pageY;

            });

            leaflet.elements.perspective.bind('touchmove.leafletSwipeControl', function(e) {

                var touch = e.originalEvent.touches[0];

                helpers.touches[e.type].x = touch.pageX;
                helpers.touches[e.type].y = touch.pageY;

                if (leaflet.group.length > 0 && leaflet.settings.animationStyleOfChange === 'swipe') {

                    leaflet.elements.box
                        .css(leaflet.states.pfx + 'transition', 'none')
                        .css('transition', 'none')
                        .css(leaflet.states.pfx + 'transform', 'translate(' + (helpers.touches.touchmove.x - helpers.touches.touchstart.x) + 'px, 0)')
                        .css('transform', 'translate(' + (helpers.touches.touchmove.x - helpers.touches.touchstart.x) + 'px, 0)');

                }

            });

            leaflet.elements.perspective.bind('touchend.leafletSwipeChange', $.proxy(function(e) {

                if (leaflet.group.length > 0 && leaflet.settings.animationStyleOfChange === 'swipe') {

                    leaflet.elements.box
                        .css(leaflet.states.pfx + 'transition', '')
                        .css('transition', '');

                    var swipeThreshold = 10,
                        isSwipeAction = helpers.touches.touchmove.x > -1 && /*helpers.touches.touchstart.x > helpers.touches.touchmove.x && */(Math.abs(helpers.touches.touchstart.x - helpers.touches.touchmove.x) > swipeThreshold);

                    if (isSwipeAction) {

                        leaflet.states.direction = helpers.touches.touchstart.x - helpers.touches.touchmove.x > 0 ? 1 : -1;
                        this.changeEventHandler();

                    }

                }

                helpers.touches = {
                    touchstart: {x: -1, y: -1 },
                    touchmove: { x: -1, y: -1 }
                };

            }, this));

        };

        App.prototype.changeEventHandler = function() {

            var currentIndex = !leaflet.groupCurrent ? leaflet.group.index(leaflet.elements.link) : leaflet.groupCurrent,
                targetIndex = currentIndex + leaflet.states.direction;

            targetIndex = (targetIndex + 1) > leaflet.group.length ? 0 : targetIndex < 0 ? (leaflet.group.length - 1) : targetIndex;

            leaflet.groupCurrent = targetIndex;

            /*leaflet.elements.main.leafLetPopUp('show', {
             url: leaflet.groupArray[targetIndex].attr('href'),
             title: leaflet.groupArray[targetIndex].attr('title'),
             boxWidth: leaflet.settings.boxWidth,
             animationStyleOfChange: leaflet.settings.animationStyleOfChange
             });*/

            leaflet.group.eq(targetIndex).trigger('click.leafletOpen');

        };

        App.prototype.overlayShow = function() {

            leaflet.elements.overlay
                .css(this.states.pfx + 'opacity', this.settings.overlayOpacity)
                .css('opacity', this.settings.overlayOpacity)
                .css('visibility', 'visible');

            if (this.settings.overlayBlur) {

                leaflet.elements.locker

                    .css(this.states.pfx + 'transition', this.states.pfx + 'filter ' + this.settings.overlayShowSpeed + 'ms ease')
                    .css('transition', this.states.pfx + 'filter ' + this.settings.overlayShowSpeed + 'ms ease')

                    .css(this.states.pfx + 'filter', 'blur(3px)')
                    .css('filter', 'blur(3px)');

            }

        };

        App.prototype.overlayHide = function() {

            leaflet.elements.overlay
                .add(leaflet.elements.close)
                .add(leaflet.elements.prev)
                .add(leaflet.elements.next)

                .css(leaflet.pfx + 'transition-duration', leaflet.settings.animateSpeed + 'ms')
                .css('transition-duration', leaflet.settings.animateSpeed + 'ms')

                .css(this.states.pfx + 'opacity', 0)
                .css('opacity', 0)
                .css('visibility', 'hidden');

            if (this.settings.overlayBlur) {

                leaflet.elements.locker
                    .css(this.states.pfx + 'filter', '')
                    .css('filter', '');

            }

        };

        App.prototype.getContent = function(callback) {

            var app = this;

            // Action before loading of content
            if(!!this.settings.beforeLoad) {

                this.settings.beforeLoad.call(leaflet.elements.main, this.states.scroll, leaflet);

            }

            // Classes
            leaflet.elements.main
                .removeClass($.proxy(function(index, classStr) {

                    var replace = this.docClassPfx + 'type-*'.replace(/\*/g, '\\S+');
                    return (classStr.match(new RegExp('\\b' + replace + '', 'g')) || []).join(' ');

                }, this))
                .addClass(this.docClassPfx + 'type-' + this.settings.contentType);

            switch (this.settings.contentType) {

                default:
                case 'html':
                case 'hash':
                case 'function':

                    var content = this.settings.contentType === 'html' ? this.settings.content : this.settings.contentType === 'function' ? this.settings.content() : $(this.settings.url).clone(true, true);

                    leaflet.elements.content
                        .empty()
                        .html(content)
                        .css({ maxHeight: !!this.settings.maxHeight ? this.settings.maxHeight() : 'none' });

                    setTimeout(function() {

                        callback();

                    }, 0);

                    break;

                case 'image':

                    var $img = $('<img src="' + this.settings.url + '" alt="" />');

                    $img.css({ maxHeight: !!this.settings.maxHeight ? this.settings.maxHeight() : 'none' });

                    $img.on('load', function() {

                        app.addTitle($img);
                        callback();

                    });

                    leaflet.elements.content
                        .empty()
                        .append($img);

                    break;

                case 'iframe':

                    var $iframe = $('<iframe src="' + this.settings.url + '" frameborder="0" allowfullscreen></iframe>');

                    $iframe.on('load', function() {

                        app.addTitle($iframe);
                        callback();

                    });

                    setTimeout(function(){

                        leaflet.elements.content
                            .empty()
                            .append($iframe);

                        $iframe.wrap('<div class="b-leaflet_box_iframe"></div>');

                    }, this.settings.overlayShowSpeed);

                    break;

                case 'url':
                case 'hashUrl':

                    var url = this.settings.contentType === 'hashUrl' ? this.settings.url.split('#')[0] + ' #' + this.settings.url.split('#')[1] : this.settings.url;

                    leaflet.elements.content
                        .load(url, function() {

                            callback();

                        });

                    break;

            }

        };

        App.prototype.addTitle = function($obj) {

            var $title = $('<div class="' + leaflet.settings.namespace + '_box_title" />'),
                title = false;

            if (!!this.settings.title) {

                title = typeof this.settings.title === 'function' ? this.settings.title.call(leaflet) : this.settings.title;

            }
            else if (!!leaflet.elements.link.attr('title')) {

                title = leaflet.elements.link.attr('title');

            }

            if (!!title) {

                leaflet.elements.content.append($title.css({ maxWidth: $obj.width() }).html(title));

            }

        };

        App.prototype.boxPosition = function() {

            var viewPortHeight = $(window).height(),
                viewPortInnerHeight = viewPortHeight - (this.settings.boxVerticalGutters * 2),

                boxVerticalPadding = leaflet.elements.box.outerHeight() - leaflet.elements.box.height(),
                contentHeightMax = viewPortInnerHeight - boxVerticalPadding;

            leaflet.elements.box.css({ maxHeight: (this.settings.scrollMode === 'outer') ? 'none' : contentHeightMax });

            leaflet.elements.content.css({ maxHeight: 'none' });
            leaflet.elements.content.css({ maxHeight: '' });

        };

        App.prototype.boxShow = function() {

            // Get content
            this.getContent($.proxy(function() {

                // Action when content is loaded
                if(!!this.settings.afterLoad) {

                    this.settings.afterLoad.call(leaflet.elements.box, this.states.scroll, this.settings.contentType, leaflet);

                }

                this.boxPosition();
                this.boxTransitionsIn[leaflet.elements.main.data('leafletSettings').animationStyleOfBox].call(this);

            }, this));

        };

        App.prototype.boxHide = function(callback) {

            this.boxTransitionsOut[leaflet.elements.main.data('leafletSettings').animationStyleOfBox].call(this);

            setTimeout($.proxy(function() {

                callback.call(this);

            }, this), this.settings.animateSpeed);

        };

        App.prototype.boxChange = function() {

            if (!leaflet.groupArray.length) {

                this.groupSources();

            }

            if (leaflet.elements.nav.is(':hidden')) {

                setTimeout(function() {

                    leaflet.elements.nav.toggle(!!leaflet.group.length);

                }, this.settings.animateSpeed);

            }

            switch (leaflet.elements.main.data('leafletSettings').animationStyleOfChange) {

                default:
                case 'fade':

                    leaflet.elements.document.toggleClass(this.docClassPfx + 'loading', true);

                    // Set transition properties
                    leaflet.elements.perspective
                        .css(this.states.pfx + 'transition-property', 'width')
                        .css('transition-property', 'width');

                    leaflet.elements.box
                        .css(this.states.pfx + 'transition-property', 'top, margin, height, transform, opacity, visibility')
                        .css('transition-property', 'top, margin, height, transform, opacity, visibility');

                    // Hide text block
                    leaflet.elements.content.css({ overflow: 'hidden', opacity: 0 });

                    // Fix box height
                    /*leaflet.elements.perspective
                        .css({
                            width: leaflet.elements.perspective.width()
                        });*/

                    leaflet.elements.box
                        .css({
                            height: leaflet.elements.box.outerHeight()
                        });

                    setTimeout($.proxy(function() {

                        // Get content
                        this.getContent($.proxy(function() {

                            // Action when content is loaded
                            if(!!this.settings.afterLoad) {

                                this.settings.afterLoad.call(leaflet.elements.box, this.states.scroll, this.settings.contentType, leaflet);

                            }

                            /*leaflet.elements.perspective
                                .css({
                                    width: leaflet.settings.boxWidth
                                });*/

                            leaflet.elements.box
                                .css({
                                    height: leaflet.elements.content.height()
                                });

                            setTimeout($.proxy(function() {

                                /*leaflet.elements.perspective
                                    .css({ maxWidth: leaflet.settings.boxWidth, width: '' });*/

                                leaflet.elements.box
                                    .css(this.states.pfx + 'transition-property', '')
                                    .css('transition-property', '')
                                    .css({ /*maxWidth: leaflet.settings.boxWidth, */height: '', width: '' });

                                // Show content block
                                leaflet.elements.content.css({ overflow: '', opacity: '' });

                                // Loading class
                                clearTimeout(leaflet.loadingTimeout);
                                leaflet.elements.document.toggleClass(this.docClassPfx + 'loading', false);

                                this.boxPosition();

                            }, this), this.settings.animateSpeed);


                        }, this));

                    }, this), leaflet.settings.animateSpeed);

                    break;

                case 'slide':

                    leaflet.elements.document.toggleClass(this.docClassPfx + 'loading', true);

                    leaflet.elements.box
                        .css(this.states.pfx + 'transform', 'translate(' + (-300 * leaflet.states.direction) + 'px,0)')
                        .css('transform', 'translate(' + (-300 * leaflet.states.direction) + 'px,0)')
                        .css(this.states.pfx + 'opacity', 0)
                        .css('opacity', 0);

                    setTimeout($.proxy(function() {

                        leaflet.elements.perspective
                            .css({ maxWidth: leaflet.settings.boxWidth });

                        leaflet.elements.box
                            .css({ maxWidth: leaflet.settings.boxWidth })
                            .css(this.states.pfx + 'transition-property', 'zoom')
                            .css('transition-property', 'zoom')
                            .css(this.states.pfx + 'transform', 'translate(' + (300 * leaflet.states.direction) + 'px,0)')
                            .css('transform', 'translate(' + (300 * leaflet.states.direction) + 'px,0)');

                        setTimeout($.proxy(function() {

                            this.getContent($.proxy(function() {

                                // Action when content is loaded
                                if (!!this.settings.afterLoad) {

                                    this.settings.afterLoad.call(leaflet.elements.box, this.states.scroll, this.settings.contentType, leaflet);

                                }

                                leaflet.elements.box
                                    .css(this.states.pfx + 'transition-property', '')
                                    .css('transition-property', '')
                                    .css(this.states.pfx + 'transform', 'translate(0,0)')
                                    .css('transform', 'translate(0,0)')
                                    .css(this.states.pfx + 'opacity', 1)
                                    .css('opacity', 1);

                                // Loading class
                                clearTimeout(leaflet.loadingTimeout);
                                leaflet.elements.document.toggleClass(this.docClassPfx + 'loading', false);

                            }, this));

                        }, this), this.settings.animateSpeed / 1.1);

                    }, this), this.settings.animateSpeed / 1.1);

                    break;

                case 'pushDown':

                    leaflet.elements.document.toggleClass(this.docClassPfx + 'loading', true);

                    leaflet.elements.box
                        .css(this.states.pfx + 'transform-origin', '50% 100%')
                        .css('transform-origin', '50% 100%')
                        .css(this.states.pfx + 'transform', 'translateY(25%) rotateX(45deg) scale(.85)')
                        .css('transform', 'translateY(25%) rotateX(45deg) scale(.85)')
                        .css(this.states.pfx + 'opacity', 0)
                        .css('opacity', 0);

                    setTimeout($.proxy(function() {

                        leaflet.elements.perspective
                            .css({ maxWidth: leaflet.settings.boxWidth });

                        leaflet.elements.box
                            .css({ maxWidth: leaflet.settings.boxWidth })
                            .css(this.states.pfx + 'transition-property', 'zoom')
                            .css('transition-property', 'zoom')
                            .css(this.states.pfx + 'transform', 'translateY(-100%) rotateX(45deg)')
                            .css('transform', 'translateY(-100%) rotateX(45deg)');

                        setTimeout($.proxy(function() {

                            this.getContent($.proxy(function() {

                                // Action when content is loaded
                                if(!!this.settings.afterLoad) {

                                    this.settings.afterLoad.call(leaflet.elements.box, this.states.scroll, this.settings.contentType, leaflet);

                                }

                                leaflet.elements.box
                                    .css(this.states.pfx + 'transition-property', '')
                                    .css('transition-property', '')
                                    .css(this.states.pfx + 'transform', 'translateY(0)')
                                    .css('transform', 'translateY(0)')
                                    .css(this.states.pfx + 'opacity', 1)
                                    .css('opacity', 1);

                                // Loading class
                                clearTimeout(leaflet.loadingTimeout);
                                leaflet.elements.document.toggleClass(this.docClassPfx + 'loading', false);

                            }, this));

                        }, this), this.settings.animateSpeed / 1.5);

                    }, this), this.settings.animateSpeed / 1.5);

                    break;

            }

        };


        // Box transition styles
        App.prototype.boxTransitionsIn = {

            fade: function() {

                leaflet.elements.box
                    .css('visibility', 'visible')
                    .css(this.states.pfx + 'opacity', 1)
                    .css('opacity', 1);

                clearTimeout(this.states.loadingTimeout);
                leaflet.elements.document.toggleClass(this.docClassPfx + 'loading', false);

            },

            scale: function() {

                leaflet.elements.box
                    .css(leaflet.pfx + 'transform', 'scale(1, 1)')
                    .css('transform', 'scale(1, 1)');

                this.boxTransitionsIn.fade.call(this);

            },

            superScale: function() {

                leaflet.elements.box
                    .css(leaflet.pfx + 'transform', 'scale(1, 1)')
                    .css('transform', 'scale(1, 1)');

                this.boxTransitionsIn.fade.call(this);

            },

            drop: function() {

                leaflet.elements.box
                    .css(leaflet.pfx + 'transform', 'translate(0, 0)')
                    .css('transform', 'translate(0, 0)');

                this.boxTransitionsIn.fade.call(this);

            },

            drop3d: function() {

                leaflet.elements.box
                    .css(leaflet.pfx + 'transform', 'translate3d(0, 0, 0) rotateX(0deg)')
                    .css('transform', 'translate3d(0, 0, 0) rotateX(0deg)');

                this.boxTransitionsIn.fade.call(this);

            },

            flip3d: function() {

                leaflet.elements.box
                    .css(this.states.pfx + 'transform', 'rotateY(0deg)')
                    .css('transform', 'rotateY(0deg)');

                this.boxTransitionsIn.fade.call(this);

            },

            flip3dVertical: function() {

                leaflet.elements.box
                    .css(leaflet.pfx + 'transform', 'rotateX(0deg)')
                    .css('transform', 'rotateX(0deg)');

                this.boxTransitionsIn.fade.call(this);

            },

            newspaper: function() {

                leaflet.elements.box
                    .css(leaflet.pfx + 'transform', 'scale(1, 1) rotate(0deg)')
                    .css('transform', 'scale(1, 1) rotate(0deg)');

                this.boxTransitionsIn.fade.call(this);

            },

            sideFall: function() {

                leaflet.elements.box
                    .css(leaflet.pfx + 'transform', 'translate(0) translateZ(0) rotate(0deg)')
                    .css('transform', 'translate(0) translateZ(0) rotate(0deg)');

                this.boxTransitionsIn.fade.call(this);

            }

        };

        App.prototype.boxTransitionsOut = {

            fade: function() {

                leaflet.elements.box
                    .css('visibility', '')
                    .css(this.states.pfx + 'opacity', '')
                    .css('opacity', '')
                    .css(this.states.pfx + 'transform', '')
                    .css('transform', '');

            },

            scale: function() {

                this.boxTransitionsOut.fade.call(this);

            },

            superScale: function() {

                this.boxTransitionsOut.fade.call(this);

            },

            drop: function() {

                this.boxTransitionsOut.fade.call(this);

            },

            drop3d: function() {

                this.boxTransitionsOut.fade.call(this);

            },

            flip3d: function() {

                this.boxTransitionsOut.fade.call(this);

            },

            flip3dVertical: function() {

                this.boxTransitionsOut.fade.call(this);

            },

            newspaper: function() {

                this.boxTransitionsOut.fade.call(this);

            },

            sideFall: function() {

                this.boxTransitionsOut.fade.call(this);

            }

        };


        // Helpers
        var helpers = {

            getPfx: function() {

                var element = document.createElement('div'),
                    propsArray = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'],
                    pfx = false;

                $.each(propsArray, function(key, val) {

                    if (element.style[propsArray[key]] !== undefined) {

                        pfx = '-' + (propsArray[key].replace('Perspective','').toLowerCase()) + '-';
                        return false;

                    }

                });

                return pfx;

            },

            getScrollBarWidth: function() {

                var $element = $('<div class="b-scrollBar-test"></div>').css({ position: 'absolute', left: -99999, top: -99999, overflowY: 'scroll', width: 50, height: 50, visibility: 'hidden' });

                $('body').append($element);

                var scrollBarWidth = $element[0].offsetWidth - $element[0].clientWidth;

                $element.remove();

                return scrollBarWidth;

            },

            unwrap: function($this, selector) {

                return $this.each(function() {
                    var t = this,
                        c = (typeof selector !== 'undefined') ? $(t).find(selector) : $(t).children().first();
                    if (c.length === 1) {
                        c.contents().appendTo(t);
                        c.remove();
                    }
                });

            },

            cookies: {

                set: function(options) {

                    var now = new Date,
                        cookies = options.key + '=' + options.value;

                    now.setDate(now.getDate() + 1);

                    cookies += options.expires ? '; expires=' + now.toUTCString() : '';
                    cookies += options.path ? '; path=' + options.path : '';

                    return document.cookie = cookies;

                },

                get: function(key) {

                    var matches = document.cookie.match(new RegExp(
                        "(?:^|; )" + key.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
                    ));

                    return matches ? decodeURIComponent(matches[1]) : false;

                },

                remove: function(key) {

                    leaflet.helpers.cookies.set({ key: key, value: '', expires: -1 })

                }

            },

            touches: {
                touchstart: {x: -1, y: -1 },
                touchmove: { x: -1, y: -1 }
            }

        };

        return {
            App: App
        };

    })(window);

    $.fn.leafLetPopUp = function(param) {

        var $body = $('body'),
            selector = this.selector;

        if (typeof param === 'object' || !param) {

            $(selector).data('leaflet', true);

            $body.on('click.leafletOpen', selector, function(e) {

                e.preventDefault();

                new LeafletPopup.App($(this), param || {}, 'init');

            });

            return this;

        } else {

            new LeafletPopup.App($(this), Array.prototype.slice.call(arguments, 1)[0] || {}, param);
            return this;

        }

    };

})(jQuery);
/* perfect-scrollbar v0.6.3 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* Copyright (c) 2015 Hyunje Alex Jun and other contributors
 * Licensed under the MIT License
 */
'use strict';

var ps = require('../main')
  , psInstances = require('../plugin/instances');

function mountJQuery(jQuery) {
  jQuery.fn.perfectScrollbar = function (settingOrCommand) {
    return this.each(function () {
      if (typeof settingOrCommand === 'object' ||
          typeof settingOrCommand === 'undefined') {
        // If it's an object or none, initialize.
        var settings = settingOrCommand;

        if (!psInstances.get(this)) {
          ps.initialize(this, settings);
        }
      } else {
        // Unless, it may be a command.
        var command = settingOrCommand;

        if (command === 'update') {
          ps.update(this);
        } else if (command === 'destroy') {
          ps.destroy(this);
        }
      }

      return jQuery(this);
    });
  };
}

if (typeof define === 'function' && define.amd) {
  // AMD. Register as an anonymous module.
  define(['jquery'], mountJQuery);
} else {
  var jq = window.jQuery ? window.jQuery : window.$;
  if (typeof jq !== 'undefined') {
    mountJQuery(jq);
  }
}

module.exports = mountJQuery;

},{"../main":7,"../plugin/instances":18}],2:[function(require,module,exports){
/* Copyright (c) 2015 Hyunje Alex Jun and other contributors
 * Licensed under the MIT License
 */
'use strict';

function oldAdd(element, className) {
  var classes = element.className.split(' ');
  if (classes.indexOf(className) < 0) {
    classes.push(className);
  }
  element.className = classes.join(' ');
}

function oldRemove(element, className) {
  var classes = element.className.split(' ');
  var idx = classes.indexOf(className);
  if (idx >= 0) {
    classes.splice(idx, 1);
  }
  element.className = classes.join(' ');
}

exports.add = function (element, className) {
  if (element.classList) {
    element.classList.add(className);
  } else {
    oldAdd(element, className);
  }
};

exports.remove = function (element, className) {
  if (element.classList) {
    element.classList.remove(className);
  } else {
    oldRemove(element, className);
  }
};

exports.list = function (element) {
  if (element.classList) {
    return element.classList;
  } else {
    return element.className.split(' ');
  }
};

},{}],3:[function(require,module,exports){
/* Copyright (c) 2015 Hyunje Alex Jun and other contributors
 * Licensed under the MIT License
 */
'use strict';

exports.e = function (tagName, className) {
  var element = document.createElement(tagName);
  element.className = className;
  return element;
};

exports.appendTo = function (child, parent) {
  parent.appendChild(child);
  return child;
};

function cssGet(element, styleName) {
  return window.getComputedStyle(element)[styleName];
}

function cssSet(element, styleName, styleValue) {
  if (typeof styleValue === 'number') {
    styleValue = styleValue.toString() + 'px';
  }
  element.style[styleName] = styleValue;
  return element;
}

function cssMultiSet(element, obj) {
  for (var key in obj) {
    var val = obj[key];
    if (typeof val === 'number') {
      val = val.toString() + 'px';
    }
    element.style[key] = val;
  }
  return element;
}

exports.css = function (element, styleNameOrObject, styleValue) {
  if (typeof styleNameOrObject === 'object') {
    // multiple set with object
    return cssMultiSet(element, styleNameOrObject);
  } else {
    if (typeof styleValue === 'undefined') {
      return cssGet(element, styleNameOrObject);
    } else {
      return cssSet(element, styleNameOrObject, styleValue);
    }
  }
};

exports.matches = function (element, query) {
  if (typeof element.matches !== 'undefined') {
    return element.matches(query);
  } else {
    if (typeof element.matchesSelector !== 'undefined') {
      return element.matchesSelector(query);
    } else if (typeof element.webkitMatchesSelector !== 'undefined') {
      return element.webkitMatchesSelector(query);
    } else if (typeof element.mozMatchesSelector !== 'undefined') {
      return element.mozMatchesSelector(query);
    } else if (typeof element.msMatchesSelector !== 'undefined') {
      return element.msMatchesSelector(query);
    }
  }
};

exports.remove = function (element) {
  if (typeof element.remove !== 'undefined') {
    element.remove();
  } else {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }
};

},{}],4:[function(require,module,exports){
/* Copyright (c) 2015 Hyunje Alex Jun and other contributors
 * Licensed under the MIT License
 */
'use strict';

var EventElement = function (element) {
  this.element = element;
  this.events = {};
};

EventElement.prototype.bind = function (eventName, handler) {
  if (typeof this.events[eventName] === 'undefined') {
    this.events[eventName] = [];
  }
  this.events[eventName].push(handler);
  this.element.addEventListener(eventName, handler, false);
};

EventElement.prototype.unbind = function (eventName, handler) {
  var isHandlerProvided = (typeof handler !== 'undefined');
  this.events[eventName] = this.events[eventName].filter(function (hdlr) {
    if (isHandlerProvided && hdlr !== handler) {
      return true;
    }
    this.element.removeEventListener(eventName, hdlr, false);
    return false;
  }, this);
};

EventElement.prototype.unbindAll = function () {
  for (var name in this.events) {
    this.unbind(name);
  }
};

var EventManager = function () {
  this.eventElements = [];
};

EventManager.prototype.eventElement = function (element) {
  var ee = this.eventElements.filter(function (eventElement) {
    return eventElement.element === element;
  })[0];
  if (typeof ee === 'undefined') {
    ee = new EventElement(element);
    this.eventElements.push(ee);
  }
  return ee;
};

EventManager.prototype.bind = function (element, eventName, handler) {
  this.eventElement(element).bind(eventName, handler);
};

EventManager.prototype.unbind = function (element, eventName, handler) {
  this.eventElement(element).unbind(eventName, handler);
};

EventManager.prototype.unbindAll = function () {
  for (var i = 0; i < this.eventElements.length; i++) {
    this.eventElements[i].unbindAll();
  }
};

EventManager.prototype.once = function (element, eventName, handler) {
  var ee = this.eventElement(element);
  var onceHandler = function (e) {
    ee.unbind(eventName, onceHandler);
    handler(e);
  };
  ee.bind(eventName, onceHandler);
};

module.exports = EventManager;

},{}],5:[function(require,module,exports){
/* Copyright (c) 2015 Hyunje Alex Jun and other contributors
 * Licensed under the MIT License
 */
'use strict';

module.exports = (function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function () {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();

},{}],6:[function(require,module,exports){
/* Copyright (c) 2015 Hyunje Alex Jun and other contributors
 * Licensed under the MIT License
 */
'use strict';

var cls = require('./class')
  , d = require('./dom');

exports.toInt = function (x) {
  return parseInt(x, 10) || 0;
};

exports.clone = function (obj) {
  if (obj === null) {
    return null;
  } else if (typeof obj === 'object') {
    var result = {};
    for (var key in obj) {
      result[key] = this.clone(obj[key]);
    }
    return result;
  } else {
    return obj;
  }
};

exports.extend = function (original, source) {
  var result = this.clone(original);
  for (var key in source) {
    result[key] = this.clone(source[key]);
  }
  return result;
};

exports.isEditable = function (el) {
  return d.matches(el, "input,[contenteditable]") ||
         d.matches(el, "select,[contenteditable]") ||
         d.matches(el, "textarea,[contenteditable]") ||
         d.matches(el, "button,[contenteditable]");
};

exports.removePsClasses = function (element) {
  var clsList = cls.list(element);
  for (var i = 0; i < clsList.length; i++) {
    var className = clsList[i];
    if (className.indexOf('ps-') === 0) {
      cls.remove(element, className);
    }
  }
};

exports.outerWidth = function (element) {
  return this.toInt(d.css(element, 'width')) +
         this.toInt(d.css(element, 'paddingLeft')) +
         this.toInt(d.css(element, 'paddingRight')) +
         this.toInt(d.css(element, 'borderLeftWidth')) +
         this.toInt(d.css(element, 'borderRightWidth'));
};

exports.startScrolling = function (element, axis) {
  cls.add(element, 'ps-in-scrolling');
  if (typeof axis !== 'undefined') {
    cls.add(element, 'ps-' + axis);
  } else {
    cls.add(element, 'ps-x');
    cls.add(element, 'ps-y');
  }
};

exports.stopScrolling = function (element, axis) {
  cls.remove(element, 'ps-in-scrolling');
  if (typeof axis !== 'undefined') {
    cls.remove(element, 'ps-' + axis);
  } else {
    cls.remove(element, 'ps-x');
    cls.remove(element, 'ps-y');
  }
};

exports.env = {
  isWebKit: 'WebkitAppearance' in document.documentElement.style,
  supportsTouch: (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch),
  supportsIePointer: window.navigator.msMaxTouchPoints !== null
};

},{"./class":2,"./dom":3}],7:[function(require,module,exports){
/* Copyright (c) 2015 Hyunje Alex Jun and other contributors
 * Licensed under the MIT License
 */
'use strict';

var destroy = require('./plugin/destroy')
  , initialize = require('./plugin/initialize')
  , update = require('./plugin/update');

module.exports = {
  initialize: initialize,
  update: update,
  destroy: destroy
};

},{"./plugin/destroy":9,"./plugin/initialize":17,"./plugin/update":20}],8:[function(require,module,exports){
/* Copyright (c) 2015 Hyunje Alex Jun and other contributors
 * Licensed under the MIT License
 */
'use strict';

module.exports = {
  wheelSpeed: 1,
  wheelPropagation: false,
  swipePropagation: true,
  minScrollbarLength: null,
  maxScrollbarLength: null,
  useBothWheelAxes: false,
  useKeyboard: true,
  suppressScrollX: false,
  suppressScrollY: false,
  scrollXMarginOffset: 0,
  scrollYMarginOffset: 0
};

},{}],9:[function(require,module,exports){
/* Copyright (c) 2015 Hyunje Alex Jun and other contributors
 * Licensed under the MIT License
 */
'use strict';

var d = require('../lib/dom')
  , h = require('../lib/helper')
  , instances = require('./instances');

module.exports = function (element) {
  var i = instances.get(element);

  i.event.unbindAll();
  d.remove(i.scrollbarX);
  d.remove(i.scrollbarY);
  d.remove(i.scrollbarXRail);
  d.remove(i.scrollbarYRail);
  h.removePsClasses(element);

  instances.remove(element);
};

},{"../lib/dom":3,"../lib/helper":6,"./instances":18}],10:[function(require,module,exports){
/* Copyright (c) 2015 Hyunje Alex Jun and other contributors
 * Licensed under the MIT License
 */
'use strict';

var h = require('../../lib/helper')
  , instances = require('../instances')
  , updateGeometry = require('../update-geometry');

function bindClickRailHandler(element, i) {
  function pageOffset(el) {
    return el.getBoundingClientRect();
  }
  var stopPropagation = window.Event.prototype.stopPropagation.bind;

  i.event.bind(i.scrollbarY, 'click', stopPropagation);
  i.event.bind(i.scrollbarYRail, 'click', function (e) {
    var halfOfScrollbarLength = h.toInt(i.scrollbarYHeight / 2);
    var positionTop = i.railYRatio * (e.pageY - window.scrollY - pageOffset(i.scrollbarYRail).top - halfOfScrollbarLength);
    var maxPositionTop = i.railYRatio * (i.railYHeight - i.scrollbarYHeight);
    var positionRatio = positionTop / maxPositionTop;

    if (positionRatio < 0) {
      positionRatio = 0;
    } else if (positionRatio > 1) {
      positionRatio = 1;
    }

    element.scrollTop = (i.contentHeight - i.containerHeight) * positionRatio;
    updateGeometry(element);

    e.stopPropagation();
  });

  i.event.bind(i.scrollbarX, 'click', stopPropagation);
  i.event.bind(i.scrollbarXRail, 'click', function (e) {
    var halfOfScrollbarLength = h.toInt(i.scrollbarXWidth / 2);
    var positionLeft = i.railXRatio * (e.pageX - window.scrollX - pageOffset(i.scrollbarXRail).left - halfOfScrollbarLength);
    var maxPositionLeft = i.railXRatio * (i.railXWidth - i.scrollbarXWidth);
    var positionRatio = positionLeft / maxPositionLeft;

    if (positionRatio < 0) {
      positionRatio = 0;
    } else if (positionRatio > 1) {
      positionRatio = 1;
    }

    element.scrollLeft = ((i.contentWidth - i.containerWidth) * positionRatio) - i.negativeScrollAdjustment;
    updateGeometry(element);

    e.stopPropagation();
  });
}

module.exports = function (element) {
  var i = instances.get(element);
  bindClickRailHandler(element, i);
};

},{"../../lib/helper":6,"../instances":18,"../update-geometry":19}],11:[function(require,module,exports){
/* Copyright (c) 2015 Hyunje Alex Jun and other contributors
 * Licensed under the MIT License
 */
'use strict';

var d = require('../../lib/dom')
  , h = require('../../lib/helper')
  , instances = require('../instances')
  , updateGeometry = require('../update-geometry');

function bindMouseScrollXHandler(element, i) {
  var currentLeft = null;
  var currentPageX = null;

  function updateScrollLeft(deltaX) {
    var newLeft = currentLeft + (deltaX * i.railXRatio);
    var maxLeft = i.scrollbarXRail.getBoundingClientRect().left + (i.railXRatio * (i.railXWidth - i.scrollbarXWidth));

    if (newLeft < 0) {
      i.scrollbarXLeft = 0;
    } else if (newLeft > maxLeft) {
      i.scrollbarXLeft = maxLeft;
    } else {
      i.scrollbarXLeft = newLeft;
    }

    var scrollLeft = h.toInt(i.scrollbarXLeft * (i.contentWidth - i.containerWidth) / (i.containerWidth - (i.railXRatio * i.scrollbarXWidth))) - i.negativeScrollAdjustment;
    element.scrollLeft = scrollLeft;
  }

  var mouseMoveHandler = function (e) {
    updateScrollLeft(e.pageX - currentPageX);
    updateGeometry(element);
    e.stopPropagation();
    e.preventDefault();
  };

  var mouseUpHandler = function () {
    h.stopScrolling(element, 'x');
    i.event.unbind(i.ownerDocument, 'mousemove', mouseMoveHandler);
  };

  i.event.bind(i.scrollbarX, 'mousedown', function (e) {
    currentPageX = e.pageX;
    currentLeft = h.toInt(d.css(i.scrollbarX, 'left')) * i.railXRatio;
    h.startScrolling(element, 'x');

    i.event.bind(i.ownerDocument, 'mousemove', mouseMoveHandler);
    i.event.once(i.ownerDocument, 'mouseup', mouseUpHandler);

    e.stopPropagation();
    e.preventDefault();
  });
}

function bindMouseScrollYHandler(element, i) {
  var currentTop = null;
  var currentPageY = null;

  function updateScrollTop(deltaY) {
    var newTop = currentTop + (deltaY * i.railYRatio);
    var maxTop = i.scrollbarYRail.getBoundingClientRect().top + (i.railYRatio * (i.railYHeight - i.scrollbarYHeight));

    if (newTop < 0) {
      i.scrollbarYTop = 0;
    } else if (newTop > maxTop) {
      i.scrollbarYTop = maxTop;
    } else {
      i.scrollbarYTop = newTop;
    }

    var scrollTop = h.toInt(i.scrollbarYTop * (i.contentHeight - i.containerHeight) / (i.containerHeight - (i.railYRatio * i.scrollbarYHeight)));
    element.scrollTop = scrollTop;
  }

  var mouseMoveHandler = function (e) {
    updateScrollTop(e.pageY - currentPageY);
    updateGeometry(element);
    e.stopPropagation();
    e.preventDefault();
  };

  var mouseUpHandler = function () {
    h.stopScrolling(element, 'y');
    i.event.unbind(i.ownerDocument, 'mousemove', mouseMoveHandler);
  };

  i.event.bind(i.scrollbarY, 'mousedown', function (e) {
    currentPageY = e.pageY;
    currentTop = h.toInt(d.css(i.scrollbarY, 'top')) * i.railYRatio;
    h.startScrolling(element, 'y');

    i.event.bind(i.ownerDocument, 'mousemove', mouseMoveHandler);
    i.event.once(i.ownerDocument, 'mouseup', mouseUpHandler);

    e.stopPropagation();
    e.preventDefault();
  });
}

module.exports = function (element) {
  var i = instances.get(element);
  bindMouseScrollXHandler(element, i);
  bindMouseScrollYHandler(element, i);
};

},{"../../lib/dom":3,"../../lib/helper":6,"../instances":18,"../update-geometry":19}],12:[function(require,module,exports){
/* Copyright (c) 2015 Hyunje Alex Jun and other contributors
 * Licensed under the MIT License
 */
'use strict';

var h = require('../../lib/helper')
  , instances = require('../instances')
  , updateGeometry = require('../update-geometry');

function bindKeyboardHandler(element, i) {
  var hovered = false;
  i.event.bind(element, 'mouseenter', function () {
    hovered = true;
  });
  i.event.bind(element, 'mouseleave', function () {
    hovered = false;
  });

  var shouldPrevent = false;
  function shouldPreventDefault(deltaX, deltaY) {
    var scrollTop = element.scrollTop;
    if (deltaX === 0) {
      if (!i.scrollbarYActive) {
        return false;
      }
      if ((scrollTop === 0 && deltaY > 0) || (scrollTop >= i.contentHeight - i.containerHeight && deltaY < 0)) {
        return !i.settings.wheelPropagation;
      }
    }

    var scrollLeft = element.scrollLeft;
    if (deltaY === 0) {
      if (!i.scrollbarXActive) {
        return false;
      }
      if ((scrollLeft === 0 && deltaX < 0) || (scrollLeft >= i.contentWidth - i.containerWidth && deltaX > 0)) {
        return !i.settings.wheelPropagation;
      }
    }
    return true;
  }

  i.event.bind(i.ownerDocument, 'keydown', function (e) {
    if (e.isDefaultPrevented && e.isDefaultPrevented()) {
      return;
    }

    if (!hovered) {
      return;
    }

    var activeElement = document.activeElement ? document.activeElement : i.ownerDocument.activeElement;
    if (activeElement) {
      // go deeper if element is a webcomponent
      while (activeElement.shadowRoot) {
        activeElement = activeElement.shadowRoot.activeElement;
      }
      if (h.isEditable(activeElement)) {
        return;
      }
    }

    var deltaX = 0;
    var deltaY = 0;

    switch (e.which) {
    case 37: // left
      deltaX = -30;
      break;
    case 38: // up
      deltaY = 30;
      break;
    case 39: // right
      deltaX = 30;
      break;
    case 40: // down
      deltaY = -30;
      break;
    case 33: // page up
      deltaY = 90;
      break;
    case 32: // space bar
    case 34: // page down
      deltaY = -90;
      break;
    case 35: // end
      if (e.ctrlKey) {
        deltaY = -i.contentHeight;
      } else {
        deltaY = -i.containerHeight;
      }
      break;
    case 36: // home
      if (e.ctrlKey) {
        deltaY = element.scrollTop;
      } else {
        deltaY = i.containerHeight;
      }
      break;
    default:
      return;
    }

    element.scrollTop = element.scrollTop - deltaY;
    element.scrollLeft = element.scrollLeft + deltaX;
    updateGeometry(element);

    shouldPrevent = shouldPreventDefault(deltaX, deltaY);
    if (shouldPrevent) {
      e.preventDefault();
    }
  });
}

module.exports = function (element) {
  var i = instances.get(element);
  bindKeyboardHandler(element, i);
};

},{"../../lib/helper":6,"../instances":18,"../update-geometry":19}],13:[function(require,module,exports){
/* Copyright (c) 2015 Hyunje Alex Jun and other contributors
 * Licensed under the MIT License
 */
'use strict';

var h = require('../../lib/helper')
  , instances = require('../instances')
  , updateGeometry = require('../update-geometry');

function bindMouseWheelHandler(element, i) {
  var shouldPrevent = false;

  function shouldPreventDefault(deltaX, deltaY) {
    var scrollTop = element.scrollTop;
    if (deltaX === 0) {
      if (!i.scrollbarYActive) {
        return false;
      }
      if ((scrollTop === 0 && deltaY > 0) || (scrollTop >= i.contentHeight - i.containerHeight && deltaY < 0)) {
        return !i.settings.wheelPropagation;
      }
    }

    var scrollLeft = element.scrollLeft;
    if (deltaY === 0) {
      if (!i.scrollbarXActive) {
        return false;
      }
      if ((scrollLeft === 0 && deltaX < 0) || (scrollLeft >= i.contentWidth - i.containerWidth && deltaX > 0)) {
        return !i.settings.wheelPropagation;
      }
    }
    return true;
  }

  function getDeltaFromEvent(e) {
    var deltaX = e.deltaX;
    var deltaY = -1 * e.deltaY;

    if (typeof deltaX === "undefined" || typeof deltaY === "undefined") {
      // OS X Safari
      deltaX = -1 * e.wheelDeltaX / 6;
      deltaY = e.wheelDeltaY / 6;
    }

    if (e.deltaMode && e.deltaMode === 1) {
      // Firefox in deltaMode 1: Line scrolling
      deltaX *= 10;
      deltaY *= 10;
    }

    if (deltaX !== deltaX && deltaY !== deltaY/* NaN checks */) {
      // IE in some mouse drivers
      deltaX = 0;
      deltaY = e.wheelDelta;
    }

    return [deltaX, deltaY];
  }

  function shouldBeConsumedByTextarea(deltaX, deltaY) {
    var hoveredTextarea = element.querySelector('textarea:hover');
    if (hoveredTextarea) {
      var maxScrollTop = hoveredTextarea.scrollHeight - hoveredTextarea.clientHeight;
      if (maxScrollTop > 0) {
        if (!(hoveredTextarea.scrollTop === 0 && deltaY > 0) &&
            !(hoveredTextarea.scrollTop === maxScrollTop && deltaY < 0)) {
          return true;
        }
      }
      var maxScrollLeft = hoveredTextarea.scrollLeft - hoveredTextarea.clientWidth;
      if (maxScrollLeft > 0) {
        if (!(hoveredTextarea.scrollLeft === 0 && deltaX < 0) &&
            !(hoveredTextarea.scrollLeft === maxScrollLeft && deltaX > 0)) {
          return true;
        }
      }
    }
    return false;
  }

  function mousewheelHandler(e) {
    // FIXME: this is a quick fix for the select problem in FF and IE.
    // If there comes an effective way to deal with the problem,
    // this lines should be removed.
    if (!h.env.isWebKit && element.querySelector('select:focus')) {
      return;
    }

    var delta = getDeltaFromEvent(e);

    var deltaX = delta[0];
    var deltaY = delta[1];

    if (shouldBeConsumedByTextarea(deltaX, deltaY)) {
      return;
    }

    shouldPrevent = false;
    if (!i.settings.useBothWheelAxes) {
      // deltaX will only be used for horizontal scrolling and deltaY will
      // only be used for vertical scrolling - this is the default
      element.scrollTop = element.scrollTop - (deltaY * i.settings.wheelSpeed);
      element.scrollLeft = element.scrollLeft + (deltaX * i.settings.wheelSpeed);
    } else if (i.scrollbarYActive && !i.scrollbarXActive) {
      // only vertical scrollbar is active and useBothWheelAxes option is
      // active, so let's scroll vertical bar using both mouse wheel axes
      if (deltaY) {
        element.scrollTop = element.scrollTop - (deltaY * i.settings.wheelSpeed);
      } else {
        element.scrollTop = element.scrollTop + (deltaX * i.settings.wheelSpeed);
      }
      shouldPrevent = true;
    } else if (i.scrollbarXActive && !i.scrollbarYActive) {
      // useBothWheelAxes and only horizontal bar is active, so use both
      // wheel axes for horizontal bar
      if (deltaX) {
        element.scrollLeft = element.scrollLeft + (deltaX * i.settings.wheelSpeed);
      } else {
        element.scrollLeft = element.scrollLeft - (deltaY * i.settings.wheelSpeed);
      }
      shouldPrevent = true;
    }

    updateGeometry(element);

    shouldPrevent = (shouldPrevent || shouldPreventDefault(deltaX, deltaY));
    if (shouldPrevent) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  if (typeof window.onwheel !== "undefined") {
    i.event.bind(element, 'wheel', mousewheelHandler);
  } else if (typeof window.onmousewheel !== "undefined") {
    i.event.bind(element, 'mousewheel', mousewheelHandler);
  }
}

module.exports = function (element) {
  var i = instances.get(element);
  bindMouseWheelHandler(element, i);
};

},{"../../lib/helper":6,"../instances":18,"../update-geometry":19}],14:[function(require,module,exports){
/* Copyright (c) 2015 Hyunje Alex Jun and other contributors
 * Licensed under the MIT License
 */
'use strict';

var instances = require('../instances')
  , updateGeometry = require('../update-geometry');

function bindNativeScrollHandler(element, i) {
  i.event.bind(element, 'scroll', function () {
    updateGeometry(element);
  });
}

module.exports = function (element) {
  var i = instances.get(element);
  bindNativeScrollHandler(element, i);
};

},{"../instances":18,"../update-geometry":19}],15:[function(require,module,exports){
/* Copyright (c) 2015 Hyunje Alex Jun and other contributors
 * Licensed under the MIT License
 */
'use strict';

var h = require('../../lib/helper')
  , instances = require('../instances')
  , updateGeometry = require('../update-geometry');

function bindSelectionHandler(element, i) {
  function getRangeNode() {
    var selection = window.getSelection ? window.getSelection() :
                    document.getSelection ? document.getSelection() : '';
    if (selection.toString().length === 0) {
      return null;
    } else {
      return selection.getRangeAt(0).commonAncestorContainer;
    }
  }

  var scrollingLoop = null;
  var scrollDiff = {top: 0, left: 0};
  function startScrolling() {
    if (!scrollingLoop) {
      scrollingLoop = setInterval(function () {
        if (!instances.get(element)) {
          clearInterval(scrollingLoop);
          return;
        }

        element.scrollTop = element.scrollTop + scrollDiff.top;
        element.scrollLeft = element.scrollLeft + scrollDiff.left;
        updateGeometry(element);
      }, 50); // every .1 sec
    }
  }
  function stopScrolling() {
    if (scrollingLoop) {
      clearInterval(scrollingLoop);
      scrollingLoop = null;
    }
    h.stopScrolling(element);
  }

  var isSelected = false;
  i.event.bind(i.ownerDocument, 'selectionchange', function () {
    if (element.contains(getRangeNode())) {
      isSelected = true;
    } else {
      isSelected = false;
      stopScrolling();
    }
  });
  i.event.bind(window, 'mouseup', function () {
    if (isSelected) {
      isSelected = false;
      stopScrolling();
    }
  });

  i.event.bind(window, 'mousemove', function (e) {
    if (isSelected) {
      var mousePosition = {x: e.pageX, y: e.pageY};
      var containerGeometry = {
        left: element.offsetLeft,
        right: element.offsetLeft + element.offsetWidth,
        top: element.offsetTop,
        bottom: element.offsetTop + element.offsetHeight
      };

      if (mousePosition.x < containerGeometry.left + 3) {
        scrollDiff.left = -5;
        h.startScrolling(element, 'x');
      } else if (mousePosition.x > containerGeometry.right - 3) {
        scrollDiff.left = 5;
        h.startScrolling(element, 'x');
      } else {
        scrollDiff.left = 0;
      }

      if (mousePosition.y < containerGeometry.top + 3) {
        if (containerGeometry.top + 3 - mousePosition.y < 5) {
          scrollDiff.top = -5;
        } else {
          scrollDiff.top = -20;
        }
        h.startScrolling(element, 'y');
      } else if (mousePosition.y > containerGeometry.bottom - 3) {
        if (mousePosition.y - containerGeometry.bottom + 3 < 5) {
          scrollDiff.top = 5;
        } else {
          scrollDiff.top = 20;
        }
        h.startScrolling(element, 'y');
      } else {
        scrollDiff.top = 0;
      }

      if (scrollDiff.top === 0 && scrollDiff.left === 0) {
        stopScrolling();
      } else {
        startScrolling();
      }
    }
  });
}

module.exports = function (element) {
  var i = instances.get(element);
  bindSelectionHandler(element, i);
};

},{"../../lib/helper":6,"../instances":18,"../update-geometry":19}],16:[function(require,module,exports){
/* Copyright (c) 2015 Hyunje Alex Jun and other contributors
 * Licensed under the MIT License
 */
'use strict';

var instances = require('../instances')
  , updateGeometry = require('../update-geometry');

function bindTouchHandler(element, i, supportsTouch, supportsIePointer) {
  function shouldPreventDefault(deltaX, deltaY) {
    var scrollTop = element.scrollTop;
    var scrollLeft = element.scrollLeft;
    var magnitudeX = Math.abs(deltaX);
    var magnitudeY = Math.abs(deltaY);

    if (magnitudeY > magnitudeX) {
      // user is perhaps trying to swipe up/down the page

      if (((deltaY < 0) && (scrollTop === i.contentHeight - i.containerHeight)) ||
          ((deltaY > 0) && (scrollTop === 0))) {
        return !i.settings.swipePropagation;
      }
    } else if (magnitudeX > magnitudeY) {
      // user is perhaps trying to swipe left/right across the page

      if (((deltaX < 0) && (scrollLeft === i.contentWidth - i.containerWidth)) ||
          ((deltaX > 0) && (scrollLeft === 0))) {
        return !i.settings.swipePropagation;
      }
    }

    return true;
  }

  function applyTouchMove(differenceX, differenceY) {
    element.scrollTop = element.scrollTop - differenceY;
    element.scrollLeft = element.scrollLeft - differenceX;

    updateGeometry(element);
  }

  var startOffset = {};
  var startTime = 0;
  var speed = {};
  var easingLoop = null;
  var inGlobalTouch = false;
  var inLocalTouch = false;

  function globalTouchStart() {
    inGlobalTouch = true;
  }
  function globalTouchEnd() {
    inGlobalTouch = false;
  }

  function getTouch(e) {
    if (e.targetTouches) {
      return e.targetTouches[0];
    } else {
      // Maybe IE pointer
      return e;
    }
  }
  function shouldHandle(e) {
    if (e.targetTouches && e.targetTouches.length === 1) {
      return true;
    }
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== e.MSPOINTER_TYPE_MOUSE) {
      return true;
    }
    return false;
  }
  function touchStart(e) {
    if (shouldHandle(e)) {
      inLocalTouch = true;

      var touch = getTouch(e);

      startOffset.pageX = touch.pageX;
      startOffset.pageY = touch.pageY;

      startTime = (new Date()).getTime();

      if (easingLoop !== null) {
        clearInterval(easingLoop);
      }

      e.stopPropagation();
    }
  }
  function touchMove(e) {
    if (!inGlobalTouch && inLocalTouch && shouldHandle(e)) {
      var touch = getTouch(e);

      var currentOffset = {pageX: touch.pageX, pageY: touch.pageY};

      var differenceX = currentOffset.pageX - startOffset.pageX;
      var differenceY = currentOffset.pageY - startOffset.pageY;

      applyTouchMove(differenceX, differenceY);
      startOffset = currentOffset;

      var currentTime = (new Date()).getTime();

      var timeGap = currentTime - startTime;
      if (timeGap > 0) {
        speed.x = differenceX / timeGap;
        speed.y = differenceY / timeGap;
        startTime = currentTime;
      }

      if (shouldPreventDefault(differenceX, differenceY)) {
        e.stopPropagation();
        e.preventDefault();
      }
    }
  }
  function touchEnd() {
    if (!inGlobalTouch && inLocalTouch) {
      inLocalTouch = false;

      clearInterval(easingLoop);
      easingLoop = setInterval(function () {
        if (!instances.get(element)) {
          clearInterval(easingLoop);
          return;
        }

        if (Math.abs(speed.x) < 0.01 && Math.abs(speed.y) < 0.01) {
          clearInterval(easingLoop);
          return;
        }

        applyTouchMove(speed.x * 30, speed.y * 30);

        speed.x *= 0.8;
        speed.y *= 0.8;
      }, 10);
    }
  }

  if (supportsTouch) {
    i.event.bind(window, 'touchstart', globalTouchStart);
    i.event.bind(window, 'touchend', globalTouchEnd);
    i.event.bind(element, 'touchstart', touchStart);
    i.event.bind(element, 'touchmove', touchMove);
    i.event.bind(element, 'touchend', touchEnd);
  }

  if (supportsIePointer) {
    if (window.PointerEvent) {
      i.event.bind(window, 'pointerdown', globalTouchStart);
      i.event.bind(window, 'pointerup', globalTouchEnd);
      i.event.bind(element, 'pointerdown', touchStart);
      i.event.bind(element, 'pointermove', touchMove);
      i.event.bind(element, 'pointerup', touchEnd);
    } else if (window.MSPointerEvent) {
      i.event.bind(window, 'MSPointerDown', globalTouchStart);
      i.event.bind(window, 'MSPointerUp', globalTouchEnd);
      i.event.bind(element, 'MSPointerDown', touchStart);
      i.event.bind(element, 'MSPointerMove', touchMove);
      i.event.bind(element, 'MSPointerUp', touchEnd);
    }
  }
}

module.exports = function (element, supportsTouch, supportsIePointer) {
  var i = instances.get(element);
  bindTouchHandler(element, i, supportsTouch, supportsIePointer);
};

},{"../instances":18,"../update-geometry":19}],17:[function(require,module,exports){
/* Copyright (c) 2015 Hyunje Alex Jun and other contributors
 * Licensed under the MIT License
 */
'use strict';

var cls = require('../lib/class')
  , h = require('../lib/helper')
  , instances = require('./instances')
  , updateGeometry = require('./update-geometry');

// Handlers
var clickRailHandler = require('./handler/click-rail')
  , dragScrollbarHandler = require('./handler/drag-scrollbar')
  , keyboardHandler = require('./handler/keyboard')
  , mouseWheelHandler = require('./handler/mouse-wheel')
  , nativeScrollHandler = require('./handler/native-scroll')
  , selectionHandler = require('./handler/selection')
  , touchHandler = require('./handler/touch');

module.exports = function (element, userSettings) {
  userSettings = typeof userSettings === 'object' ? userSettings : {};

  cls.add(element, 'ps-container');

  // Create a plugin instance.
  var i = instances.add(element);

  i.settings = h.extend(i.settings, userSettings);

  clickRailHandler(element);
  dragScrollbarHandler(element);
  mouseWheelHandler(element);
  nativeScrollHandler(element);
  selectionHandler(element);

  if (h.env.supportsTouch || h.env.supportsIePointer) {
    touchHandler(element, h.env.supportsTouch, h.env.supportsIePointer);
  }
  if (i.settings.useKeyboard) {
    keyboardHandler(element);
  }

  updateGeometry(element);
};

},{"../lib/class":2,"../lib/helper":6,"./handler/click-rail":10,"./handler/drag-scrollbar":11,"./handler/keyboard":12,"./handler/mouse-wheel":13,"./handler/native-scroll":14,"./handler/selection":15,"./handler/touch":16,"./instances":18,"./update-geometry":19}],18:[function(require,module,exports){
/* Copyright (c) 2015 Hyunje Alex Jun and other contributors
 * Licensed under the MIT License
 */
'use strict';

var d = require('../lib/dom')
  , defaultSettings = require('./default-setting')
  , EventManager = require('../lib/event-manager')
  , guid = require('../lib/guid')
  , h = require('../lib/helper');

var instances = {};

function Instance(element) {
  var i = this;

  i.settings = h.clone(defaultSettings);
  i.containerWidth = null;
  i.containerHeight = null;
  i.contentWidth = null;
  i.contentHeight = null;

  i.isRtl = d.css(element, 'direction') === "rtl";
  i.isNegativeScroll = (function () {
    var originalScrollLeft = element.scrollLeft;
    var result = null;
    element.scrollLeft = -1;
    result = element.scrollLeft < 0;
    element.scrollLeft = originalScrollLeft;
    return result;
  })();
  i.negativeScrollAdjustment = i.isNegativeScroll ? element.scrollWidth - element.clientWidth : 0;
  i.event = new EventManager();
  i.ownerDocument = element.ownerDocument || document;

  i.scrollbarXRail = d.appendTo(d.e('div', 'ps-scrollbar-x-rail'), element);
  i.scrollbarX = d.appendTo(d.e('div', 'ps-scrollbar-x'), i.scrollbarXRail);
  i.scrollbarXActive = null;
  i.scrollbarXWidth = null;
  i.scrollbarXLeft = null;
  i.scrollbarXBottom = h.toInt(d.css(i.scrollbarXRail, 'bottom'));
  i.isScrollbarXUsingBottom = i.scrollbarXBottom === i.scrollbarXBottom; // !isNaN
  i.scrollbarXTop = i.isScrollbarXUsingBottom ? null : h.toInt(d.css(i.scrollbarXRail, 'top'));
  i.railBorderXWidth = h.toInt(d.css(i.scrollbarXRail, 'borderLeftWidth')) + h.toInt(d.css(i.scrollbarXRail, 'borderRightWidth'));
  // Set rail to display:block to calculate margins
  d.css(i.scrollbarXRail, 'display', 'block');
  i.railXMarginWidth = h.toInt(d.css(i.scrollbarXRail, 'marginLeft')) + h.toInt(d.css(i.scrollbarXRail, 'marginRight'));
  d.css(i.scrollbarXRail, 'display', '');
  i.railXWidth = null;
  i.railXRatio = null;

  i.scrollbarYRail = d.appendTo(d.e('div', 'ps-scrollbar-y-rail'), element);
  i.scrollbarY = d.appendTo(d.e('div', 'ps-scrollbar-y'), i.scrollbarYRail);
  i.scrollbarYActive = null;
  i.scrollbarYHeight = null;
  i.scrollbarYTop = null;
  i.scrollbarYRight = h.toInt(d.css(i.scrollbarYRail, 'right'));
  i.isScrollbarYUsingRight = i.scrollbarYRight === i.scrollbarYRight; // !isNaN
  i.scrollbarYLeft = i.isScrollbarYUsingRight ? null : h.toInt(d.css(i.scrollbarYRail, 'left'));
  i.scrollbarYOuterWidth = i.isRtl ? h.outerWidth(i.scrollbarY) : null;
  i.railBorderYWidth = h.toInt(d.css(i.scrollbarYRail, 'borderTopWidth')) + h.toInt(d.css(i.scrollbarYRail, 'borderBottomWidth'));
  d.css(i.scrollbarYRail, 'display', 'block');
  i.railYMarginHeight = h.toInt(d.css(i.scrollbarYRail, 'marginTop')) + h.toInt(d.css(i.scrollbarYRail, 'marginBottom'));
  d.css(i.scrollbarYRail, 'display', '');
  i.railYHeight = null;
  i.railYRatio = null;
}

function getId(element) {
  if (typeof element.dataset === 'undefined') {
    return element.getAttribute('data-ps-id');
  } else {
    return element.dataset.psId;
  }
}

function setId(element, id) {
  if (typeof element.dataset === 'undefined') {
    element.setAttribute('data-ps-id', id);
  } else {
    element.dataset.psId = id;
  }
}

function removeId(element) {
  if (typeof element.dataset === 'undefined') {
    element.removeAttribute('data-ps-id');
  } else {
    delete element.dataset.psId;
  }
}

exports.add = function (element) {
  var newId = guid();
  setId(element, newId);
  instances[newId] = new Instance(element);
  return instances[newId];
};

exports.remove = function (element) {
  delete instances[getId(element)];
  removeId(element);
};

exports.get = function (element) {
  return instances[getId(element)];
};

},{"../lib/dom":3,"../lib/event-manager":4,"../lib/guid":5,"../lib/helper":6,"./default-setting":8}],19:[function(require,module,exports){
/* Copyright (c) 2015 Hyunje Alex Jun and other contributors
 * Licensed under the MIT License
 */
'use strict';

var cls = require('../lib/class')
  , d = require('../lib/dom')
  , h = require('../lib/helper')
  , instances = require('./instances');

function getThumbSize(i, thumbSize) {
  if (i.settings.minScrollbarLength) {
    thumbSize = Math.max(thumbSize, i.settings.minScrollbarLength);
  }
  if (i.settings.maxScrollbarLength) {
    thumbSize = Math.min(thumbSize, i.settings.maxScrollbarLength);
  }
  return thumbSize;
}

function updateCss(element, i) {
  var xRailOffset = {width: i.railXWidth};
  if (i.isRtl) {
    xRailOffset.left = i.negativeScrollAdjustment + element.scrollLeft + i.containerWidth - i.contentWidth;
  } else {
    xRailOffset.left = element.scrollLeft;
  }
  if (i.isScrollbarXUsingBottom) {
    xRailOffset.bottom = i.scrollbarXBottom - element.scrollTop;
  } else {
    xRailOffset.top = i.scrollbarXTop + element.scrollTop;
  }
  d.css(i.scrollbarXRail, xRailOffset);

  var yRailOffset = {top: element.scrollTop, height: i.railYHeight};
  if (i.isScrollbarYUsingRight) {
    if (i.isRtl) {
      yRailOffset.right = i.contentWidth - (i.negativeScrollAdjustment + element.scrollLeft) - i.scrollbarYRight - i.scrollbarYOuterWidth;
    } else {
      yRailOffset.right = i.scrollbarYRight - element.scrollLeft;
    }
  } else {
    if (i.isRtl) {
      yRailOffset.left = i.negativeScrollAdjustment + element.scrollLeft + i.containerWidth * 2 - i.contentWidth - i.scrollbarYLeft - i.scrollbarYOuterWidth;
    } else {
      yRailOffset.left = i.scrollbarYLeft + element.scrollLeft;
    }
  }
  d.css(i.scrollbarYRail, yRailOffset);

  d.css(i.scrollbarX, {left: i.scrollbarXLeft, width: i.scrollbarXWidth - i.railBorderXWidth});
  d.css(i.scrollbarY, {top: i.scrollbarYTop, height: i.scrollbarYHeight - i.railBorderYWidth});
}

module.exports = function (element) {
  var i = instances.get(element);

  i.containerWidth = element.clientWidth;
  i.containerHeight = element.clientHeight;
  i.contentWidth = element.scrollWidth;
  i.contentHeight = element.scrollHeight;

  if (!element.contains(i.scrollbarXRail)) {
    d.appendTo(i.scrollbarXRail, element);
  }
  if (!element.contains(i.scrollbarYRail)) {
    d.appendTo(i.scrollbarYRail, element);
  }

  if (!i.settings.suppressScrollX && i.containerWidth + i.settings.scrollXMarginOffset < i.contentWidth) {
    i.scrollbarXActive = true;
    i.railXWidth = i.containerWidth - i.railXMarginWidth;
    i.railXRatio = i.containerWidth / i.railXWidth;
    i.scrollbarXWidth = getThumbSize(i, h.toInt(i.railXWidth * i.containerWidth / i.contentWidth));
    i.scrollbarXLeft = h.toInt((i.negativeScrollAdjustment + element.scrollLeft) * (i.railXWidth - i.scrollbarXWidth) / (i.contentWidth - i.containerWidth));
  } else {
    i.scrollbarXActive = false;
    i.scrollbarXWidth = 0;
    i.scrollbarXLeft = 0;
    element.scrollLeft = 0;
  }

  if (!i.settings.suppressScrollY && i.containerHeight + i.settings.scrollYMarginOffset < i.contentHeight) {
    i.scrollbarYActive = true;
    i.railYHeight = i.containerHeight - i.railYMarginHeight;
    i.railYRatio = i.containerHeight / i.railYHeight;
    i.scrollbarYHeight = getThumbSize(i, h.toInt(i.railYHeight * i.containerHeight / i.contentHeight));
    i.scrollbarYTop = h.toInt(element.scrollTop * (i.railYHeight - i.scrollbarYHeight) / (i.contentHeight - i.containerHeight));
  } else {
    i.scrollbarYActive = false;
    i.scrollbarYHeight = 0;
    i.scrollbarYTop = 0;
    element.scrollTop = 0;
  }

  if (i.scrollbarXLeft >= i.railXWidth - i.scrollbarXWidth) {
    i.scrollbarXLeft = i.railXWidth - i.scrollbarXWidth;
  }
  if (i.scrollbarYTop >= i.railYHeight - i.scrollbarYHeight) {
    i.scrollbarYTop = i.railYHeight - i.scrollbarYHeight;
  }

  updateCss(element, i);

  cls[i.scrollbarXActive ? 'add' : 'remove'](element, 'ps-active-x');
  cls[i.scrollbarYActive ? 'add' : 'remove'](element, 'ps-active-y');
};

},{"../lib/class":2,"../lib/dom":3,"../lib/helper":6,"./instances":18}],20:[function(require,module,exports){
/* Copyright (c) 2015 Hyunje Alex Jun and other contributors
 * Licensed under the MIT License
 */
'use strict';

var d = require('../lib/dom')
  , h = require('../lib/helper')
  , instances = require('./instances')
  , updateGeometry = require('./update-geometry');

module.exports = function (element) {
  var i = instances.get(element);

  // Recalcuate negative scrollLeft adjustment
  i.negativeScrollAdjustment = i.isNegativeScroll ? element.scrollWidth - element.clientWidth : 0;

  // Recalculate rail margins
  d.css(i.scrollbarXRail, 'display', 'block');
  d.css(i.scrollbarYRail, 'display', 'block');
  i.railXMarginWidth = h.toInt(d.css(i.scrollbarXRail, 'marginLeft')) + h.toInt(d.css(i.scrollbarXRail, 'marginRight'));
  i.railYMarginHeight = h.toInt(d.css(i.scrollbarYRail, 'marginTop')) + h.toInt(d.css(i.scrollbarYRail, 'marginBottom'));

  // Hide scrollbars not to affect scrollWidth and scrollHeight
  d.css(i.scrollbarXRail, 'display', 'none');
  d.css(i.scrollbarYRail, 'display', 'none');

  updateGeometry(element);

  d.css(i.scrollbarXRail, 'display', '');
  d.css(i.scrollbarYRail, 'display', '');
};

},{"../lib/dom":3,"../lib/helper":6,"./instances":18,"./update-geometry":19}]},{},[1]);

/*!
 * jQuery Form Plugin
 * version: 3.51.0-2014.06.20
 * Requires jQuery v1.5 or later
 * Copyright (c) 2014 M. Alsup
 * Examples and documentation at: http://malsup.com/jquery/form/
 * Project repository: https://github.com/malsup/form
 * Dual licensed under the MIT and GPL licenses.
 * https://github.com/malsup/form#copyright-and-license
 */
/*global ActiveXObject */

// AMD support
(function (factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        // using AMD; register as anon module
        define(['jquery'], factory);
    } else {
        // no AMD; invoke directly
        factory( (typeof(jQuery) != 'undefined') ? jQuery : window.Zepto );
    }
}

(function($) {
"use strict";

/*
    Usage Note:
    -----------
    Do not use both ajaxSubmit and ajaxForm on the same form.  These
    functions are mutually exclusive.  Use ajaxSubmit if you want
    to bind your own submit handler to the form.  For example,

    $(document).ready(function() {
        $('#myForm').on('submit', function(e) {
            e.preventDefault(); // <-- important
            $(this).ajaxSubmit({
                target: '#output'
            });
        });
    });

    Use ajaxForm when you want the plugin to manage all the event binding
    for you.  For example,

    $(document).ready(function() {
        $('#myForm').ajaxForm({
            target: '#output'
        });
    });

    You can also use ajaxForm with delegation (requires jQuery v1.7+), so the
    form does not have to exist when you invoke ajaxForm:

    $('#myForm').ajaxForm({
        delegation: true,
        target: '#output'
    });

    When using ajaxForm, the ajaxSubmit function will be invoked for you
    at the appropriate time.
*/

/**
 * Feature detection
 */
var feature = {};
feature.fileapi = $("<input type='file'/>").get(0).files !== undefined;
feature.formdata = window.FormData !== undefined;

var hasProp = !!$.fn.prop;

// attr2 uses prop when it can but checks the return type for
// an expected string.  this accounts for the case where a form 
// contains inputs with names like "action" or "method"; in those
// cases "prop" returns the element
$.fn.attr2 = function() {
    if ( ! hasProp ) {
        return this.attr.apply(this, arguments);
    }
    var val = this.prop.apply(this, arguments);
    if ( ( val && val.jquery ) || typeof val === 'string' ) {
        return val;
    }
    return this.attr.apply(this, arguments);
};

/**
 * ajaxSubmit() provides a mechanism for immediately submitting
 * an HTML form using AJAX.
 */
$.fn.ajaxSubmit = function(options) {
    /*jshint scripturl:true */

    // fast fail if nothing selected (http://dev.jquery.com/ticket/2752)
    if (!this.length) {
        log('ajaxSubmit: skipping submit process - no element selected');
        return this;
    }

    var method, action, url, $form = this;

    if (typeof options == 'function') {
        options = { success: options };
    }
    else if ( options === undefined ) {
        options = {};
    }

    method = options.type || this.attr2('method');
    action = options.url  || this.attr2('action');

    url = (typeof action === 'string') ? $.trim(action) : '';
    url = url || window.location.href || '';
    if (url) {
        // clean url (don't include hash vaue)
        url = (url.match(/^([^#]+)/)||[])[1];
    }

    options = $.extend(true, {
        url:  url,
        success: $.ajaxSettings.success,
        type: method || $.ajaxSettings.type,
        iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank'
    }, options);

    // hook for manipulating the form data before it is extracted;
    // convenient for use with rich editors like tinyMCE or FCKEditor
    var veto = {};
    this.trigger('form-pre-serialize', [this, options, veto]);
    if (veto.veto) {
        log('ajaxSubmit: submit vetoed via form-pre-serialize trigger');
        return this;
    }

    // provide opportunity to alter form data before it is serialized
    if (options.beforeSerialize && options.beforeSerialize(this, options) === false) {
        log('ajaxSubmit: submit aborted via beforeSerialize callback');
        return this;
    }

    var traditional = options.traditional;
    if ( traditional === undefined ) {
        traditional = $.ajaxSettings.traditional;
    }

    var elements = [];
    var qx, a = this.formToArray(options.semantic, elements);
    if (options.data) {
        options.extraData = options.data;
        qx = $.param(options.data, traditional);
    }

    // give pre-submit callback an opportunity to abort the submit
    if (options.beforeSubmit && options.beforeSubmit(a, this, options) === false) {
        log('ajaxSubmit: submit aborted via beforeSubmit callback');
        return this;
    }

    // fire vetoable 'validate' event
    this.trigger('form-submit-validate', [a, this, options, veto]);
    if (veto.veto) {
        log('ajaxSubmit: submit vetoed via form-submit-validate trigger');
        return this;
    }

    var q = $.param(a, traditional);
    if (qx) {
        q = ( q ? (q + '&' + qx) : qx );
    }
    if (options.type.toUpperCase() == 'GET') {
        options.url += (options.url.indexOf('?') >= 0 ? '&' : '?') + q;
        options.data = null;  // data is null for 'get'
    }
    else {
        options.data = q; // data is the query string for 'post'
    }

    var callbacks = [];
    if (options.resetForm) {
        callbacks.push(function() { $form.resetForm(); });
    }
    if (options.clearForm) {
        callbacks.push(function() { $form.clearForm(options.includeHidden); });
    }

    // perform a load on the target only if dataType is not provided
    if (!options.dataType && options.target) {
        var oldSuccess = options.success || function(){};
        callbacks.push(function(data) {
            var fn = options.replaceTarget ? 'replaceWith' : 'html';
            $(options.target)[fn](data).each(oldSuccess, arguments);
        });
    }
    else if (options.success) {
        callbacks.push(options.success);
    }

    options.success = function(data, status, xhr) { // jQuery 1.4+ passes xhr as 3rd arg
        var context = options.context || this ;    // jQuery 1.4+ supports scope context
        for (var i=0, max=callbacks.length; i < max; i++) {
            callbacks[i].apply(context, [data, status, xhr || $form, $form]);
        }
    };

    if (options.error) {
        var oldError = options.error;
        options.error = function(xhr, status, error) {
            var context = options.context || this;
            oldError.apply(context, [xhr, status, error, $form]);
        };
    }

     if (options.complete) {
        var oldComplete = options.complete;
        options.complete = function(xhr, status) {
            var context = options.context || this;
            oldComplete.apply(context, [xhr, status, $form]);
        };
    }

    // are there files to upload?

    // [value] (issue #113), also see comment:
    // https://github.com/malsup/form/commit/588306aedba1de01388032d5f42a60159eea9228#commitcomment-2180219
    var fileInputs = $('input[type=file]:enabled', this).filter(function() { return $(this).val() !== ''; });

    var hasFileInputs = fileInputs.length > 0;
    var mp = 'multipart/form-data';
    var multipart = ($form.attr('enctype') == mp || $form.attr('encoding') == mp);

    var fileAPI = feature.fileapi && feature.formdata;
    log("fileAPI :" + fileAPI);
    var shouldUseFrame = (hasFileInputs || multipart) && !fileAPI;

    var jqxhr;

    // options.iframe allows user to force iframe mode
    // 06-NOV-09: now defaulting to iframe mode if file input is detected
    if (options.iframe !== false && (options.iframe || shouldUseFrame)) {
        // hack to fix Safari hang (thanks to Tim Molendijk for this)
        // see:  http://groups.google.com/group/jquery-dev/browse_thread/thread/36395b7ab510dd5d
        if (options.closeKeepAlive) {
            $.get(options.closeKeepAlive, function() {
                jqxhr = fileUploadIframe(a);
            });
        }
        else {
            jqxhr = fileUploadIframe(a);
        }
    }
    else if ((hasFileInputs || multipart) && fileAPI) {
        jqxhr = fileUploadXhr(a);
    }
    else {
        jqxhr = $.ajax(options);
    }

    $form.removeData('jqxhr').data('jqxhr', jqxhr);

    // clear element array
    for (var k=0; k < elements.length; k++) {
        elements[k] = null;
    }

    // fire 'notify' event
    this.trigger('form-submit-notify', [this, options]);
    return this;

    // utility fn for deep serialization
    function deepSerialize(extraData){
        var serialized = $.param(extraData, options.traditional).split('&');
        var len = serialized.length;
        var result = [];
        var i, part;
        for (i=0; i < len; i++) {
            // #252; undo param space replacement
            serialized[i] = serialized[i].replace(/\+/g,' ');
            part = serialized[i].split('=');
            // #278; use array instead of object storage, favoring array serializations
            result.push([decodeURIComponent(part[0]), decodeURIComponent(part[1])]);
        }
        return result;
    }

     // XMLHttpRequest Level 2 file uploads (big hat tip to francois2metz)
    function fileUploadXhr(a) {
        var formdata = new FormData();

        for (var i=0; i < a.length; i++) {
            formdata.append(a[i].name, a[i].value);
        }

        if (options.extraData) {
            var serializedData = deepSerialize(options.extraData);
            for (i=0; i < serializedData.length; i++) {
                if (serializedData[i]) {
                    formdata.append(serializedData[i][0], serializedData[i][1]);
                }
            }
        }

        options.data = null;

        var s = $.extend(true, {}, $.ajaxSettings, options, {
            contentType: false,
            processData: false,
            cache: false,
            type: method || 'POST'
        });

        if (options.uploadProgress) {
            // workaround because jqXHR does not expose upload property
            s.xhr = function() {
                var xhr = $.ajaxSettings.xhr();
                if (xhr.upload) {
                    xhr.upload.addEventListener('progress', function(event) {
                        var percent = 0;
                        var position = event.loaded || event.position; /*event.position is deprecated*/
                        var total = event.total;
                        if (event.lengthComputable) {
                            percent = Math.ceil(position / total * 100);
                        }
                        options.uploadProgress(event, position, total, percent);
                    }, false);
                }
                return xhr;
            };
        }

        s.data = null;
        var beforeSend = s.beforeSend;
        s.beforeSend = function(xhr, o) {
            //Send FormData() provided by user
            if (options.formData) {
                o.data = options.formData;
            }
            else {
                o.data = formdata;
            }
            if(beforeSend) {
                beforeSend.call(this, xhr, o);
            }
        };
        return $.ajax(s);
    }

    // private function for handling file uploads (hat tip to YAHOO!)
    function fileUploadIframe(a) {
        var form = $form[0], el, i, s, g, id, $io, io, xhr, sub, n, timedOut, timeoutHandle;
        var deferred = $.Deferred();

        // #341
        deferred.abort = function(status) {
            xhr.abort(status);
        };

        if (a) {
            // ensure that every serialized input is still enabled
            for (i=0; i < elements.length; i++) {
                el = $(elements[i]);
                if ( hasProp ) {
                    el.prop('disabled', false);
                }
                else {
                    el.removeAttr('disabled');
                }
            }
        }

        s = $.extend(true, {}, $.ajaxSettings, options);
        s.context = s.context || s;
        id = 'jqFormIO' + (new Date().getTime());
        if (s.iframeTarget) {
            $io = $(s.iframeTarget);
            n = $io.attr2('name');
            if (!n) {
                $io.attr2('name', id);
            }
            else {
                id = n;
            }
        }
        else {
            $io = $('<iframe name="' + id + '" src="'+ s.iframeSrc +'" />');
            $io.css({ position: 'absolute', top: '-1000px', left: '-1000px' });
        }
        io = $io[0];


        xhr = { // mock object
            aborted: 0,
            responseText: null,
            responseXML: null,
            status: 0,
            statusText: 'n/a',
            getAllResponseHeaders: function() {},
            getResponseHeader: function() {},
            setRequestHeader: function() {},
            abort: function(status) {
                var e = (status === 'timeout' ? 'timeout' : 'aborted');
                log('aborting upload... ' + e);
                this.aborted = 1;

                try { // #214, #257
                    if (io.contentWindow.document.execCommand) {
                        io.contentWindow.document.execCommand('Stop');
                    }
                }
                catch(ignore) {}

                $io.attr('src', s.iframeSrc); // abort op in progress
                xhr.error = e;
                if (s.error) {
                    s.error.call(s.context, xhr, e, status);
                }
                if (g) {
                    $.event.trigger("ajaxError", [xhr, s, e]);
                }
                if (s.complete) {
                    s.complete.call(s.context, xhr, e);
                }
            }
        };

        g = s.global;
        // trigger ajax global events so that activity/block indicators work like normal
        if (g && 0 === $.active++) {
            $.event.trigger("ajaxStart");
        }
        if (g) {
            $.event.trigger("ajaxSend", [xhr, s]);
        }

        if (s.beforeSend && s.beforeSend.call(s.context, xhr, s) === false) {
            if (s.global) {
                $.active--;
            }
            deferred.reject();
            return deferred;
        }
        if (xhr.aborted) {
            deferred.reject();
            return deferred;
        }

        // add submitting element to data if we know it
        sub = form.clk;
        if (sub) {
            n = sub.name;
            if (n && !sub.disabled) {
                s.extraData = s.extraData || {};
                s.extraData[n] = sub.value;
                if (sub.type == "image") {
                    s.extraData[n+'.x'] = form.clk_x;
                    s.extraData[n+'.y'] = form.clk_y;
                }
            }
        }

        var CLIENT_TIMEOUT_ABORT = 1;
        var SERVER_ABORT = 2;
                
        function getDoc(frame) {
            /* it looks like contentWindow or contentDocument do not
             * carry the protocol property in ie8, when running under ssl
             * frame.document is the only valid response document, since
             * the protocol is know but not on the other two objects. strange?
             * "Same origin policy" http://en.wikipedia.org/wiki/Same_origin_policy
             */
            
            var doc = null;
            
            // IE8 cascading access check
            try {
                if (frame.contentWindow) {
                    doc = frame.contentWindow.document;
                }
            } catch(err) {
                // IE8 access denied under ssl & missing protocol
                log('cannot get iframe.contentWindow document: ' + err);
            }

            if (doc) { // successful getting content
                return doc;
            }

            try { // simply checking may throw in ie8 under ssl or mismatched protocol
                doc = frame.contentDocument ? frame.contentDocument : frame.document;
            } catch(err) {
                // last attempt
                log('cannot get iframe.contentDocument: ' + err);
                doc = frame.document;
            }
            return doc;
        }

        // Rails CSRF hack (thanks to Yvan Barthelemy)
        var csrf_token = $('meta[name=csrf-token]').attr('content');
        var csrf_param = $('meta[name=csrf-param]').attr('content');
        if (csrf_param && csrf_token) {
            s.extraData = s.extraData || {};
            s.extraData[csrf_param] = csrf_token;
        }

        // take a breath so that pending repaints get some cpu time before the upload starts
        function doSubmit() {
            // make sure form attrs are set
            var t = $form.attr2('target'), 
                a = $form.attr2('action'), 
                mp = 'multipart/form-data',
                et = $form.attr('enctype') || $form.attr('encoding') || mp;

            // update form attrs in IE friendly way
            form.setAttribute('target',id);
            if (!method || /post/i.test(method) ) {
                form.setAttribute('method', 'POST');
            }
            if (a != s.url) {
                form.setAttribute('action', s.url);
            }

            // ie borks in some cases when setting encoding
            if (! s.skipEncodingOverride && (!method || /post/i.test(method))) {
                $form.attr({
                    encoding: 'multipart/form-data',
                    enctype:  'multipart/form-data'
                });
            }

            // support timout
            if (s.timeout) {
                timeoutHandle = setTimeout(function() { timedOut = true; cb(CLIENT_TIMEOUT_ABORT); }, s.timeout);
            }

            // look for server aborts
            function checkState() {
                try {
                    var state = getDoc(io).readyState;
                    log('state = ' + state);
                    if (state && state.toLowerCase() == 'uninitialized') {
                        setTimeout(checkState,50);
                    }
                }
                catch(e) {
                    log('Server abort: ' , e, ' (', e.name, ')');
                    cb(SERVER_ABORT);
                    if (timeoutHandle) {
                        clearTimeout(timeoutHandle);
                    }
                    timeoutHandle = undefined;
                }
            }

            // add "extra" data to form if provided in options
            var extraInputs = [];
            try {
                if (s.extraData) {
                    for (var n in s.extraData) {
                        if (s.extraData.hasOwnProperty(n)) {
                           // if using the $.param format that allows for multiple values with the same name
                           if($.isPlainObject(s.extraData[n]) && s.extraData[n].hasOwnProperty('name') && s.extraData[n].hasOwnProperty('value')) {
                               extraInputs.push(
                               $('<input type="hidden" name="'+s.extraData[n].name+'">').val(s.extraData[n].value)
                                   .appendTo(form)[0]);
                           } else {
                               extraInputs.push(
                               $('<input type="hidden" name="'+n+'">').val(s.extraData[n])
                                   .appendTo(form)[0]);
                           }
                        }
                    }
                }

                if (!s.iframeTarget) {
                    // add iframe to doc and submit the form
                    $io.appendTo('body');
                }
                if (io.attachEvent) {
                    io.attachEvent('onload', cb);
                }
                else {
                    io.addEventListener('load', cb, false);
                }
                setTimeout(checkState,15);

                try {
                    form.submit();
                } catch(err) {
                    // just in case form has element with name/id of 'submit'
                    var submitFn = document.createElement('form').submit;
                    submitFn.apply(form);
                }
            }
            finally {
                // reset attrs and remove "extra" input elements
                form.setAttribute('action',a);
                form.setAttribute('enctype', et); // #380
                if(t) {
                    form.setAttribute('target', t);
                } else {
                    $form.removeAttr('target');
                }
                $(extraInputs).remove();
            }
        }

        if (s.forceSync) {
            doSubmit();
        }
        else {
            setTimeout(doSubmit, 10); // this lets dom updates render
        }

        var data, doc, domCheckCount = 50, callbackProcessed;

        function cb(e) {
            if (xhr.aborted || callbackProcessed) {
                return;
            }
            
            doc = getDoc(io);
            if(!doc) {
                log('cannot access response document');
                e = SERVER_ABORT;
            }
            if (e === CLIENT_TIMEOUT_ABORT && xhr) {
                xhr.abort('timeout');
                deferred.reject(xhr, 'timeout');
                return;
            }
            else if (e == SERVER_ABORT && xhr) {
                xhr.abort('server abort');
                deferred.reject(xhr, 'error', 'server abort');
                return;
            }

            if (!doc || doc.location.href == s.iframeSrc) {
                // response not received yet
                if (!timedOut) {
                    return;
                }
            }
            if (io.detachEvent) {
                io.detachEvent('onload', cb);
            }
            else {
                io.removeEventListener('load', cb, false);
            }

            var status = 'success', errMsg;
            try {
                if (timedOut) {
                    throw 'timeout';
                }

                var isXml = s.dataType == 'xml' || doc.XMLDocument || $.isXMLDoc(doc);
                log('isXml='+isXml);
                if (!isXml && window.opera && (doc.body === null || !doc.body.innerHTML)) {
                    if (--domCheckCount) {
                        // in some browsers (Opera) the iframe DOM is not always traversable when
                        // the onload callback fires, so we loop a bit to accommodate
                        log('requeing onLoad callback, DOM not available');
                        setTimeout(cb, 250);
                        return;
                    }
                    // let this fall through because server response could be an empty document
                    //log('Could not access iframe DOM after mutiple tries.');
                    //throw 'DOMException: not available';
                }

                //log('response detected');
                var docRoot = doc.body ? doc.body : doc.documentElement;
                xhr.responseText = docRoot ? docRoot.innerHTML : null;
                xhr.responseXML = doc.XMLDocument ? doc.XMLDocument : doc;
                if (isXml) {
                    s.dataType = 'xml';
                }
                xhr.getResponseHeader = function(header){
                    var headers = {'content-type': s.dataType};
                    return headers[header.toLowerCase()];
                };
                // support for XHR 'status' & 'statusText' emulation :
                if (docRoot) {
                    xhr.status = Number( docRoot.getAttribute('status') ) || xhr.status;
                    xhr.statusText = docRoot.getAttribute('statusText') || xhr.statusText;
                }

                var dt = (s.dataType || '').toLowerCase();
                var scr = /(json|script|text)/.test(dt);
                if (scr || s.textarea) {
                    // see if user embedded response in textarea
                    var ta = doc.getElementsByTagName('textarea')[0];
                    if (ta) {
                        xhr.responseText = ta.value;
                        // support for XHR 'status' & 'statusText' emulation :
                        xhr.status = Number( ta.getAttribute('status') ) || xhr.status;
                        xhr.statusText = ta.getAttribute('statusText') || xhr.statusText;
                    }
                    else if (scr) {
                        // account for browsers injecting pre around json response
                        var pre = doc.getElementsByTagName('pre')[0];
                        var b = doc.getElementsByTagName('body')[0];
                        if (pre) {
                            xhr.responseText = pre.textContent ? pre.textContent : pre.innerText;
                        }
                        else if (b) {
                            xhr.responseText = b.textContent ? b.textContent : b.innerText;
                        }
                    }
                }
                else if (dt == 'xml' && !xhr.responseXML && xhr.responseText) {
                    xhr.responseXML = toXml(xhr.responseText);
                }

                try {
                    data = httpData(xhr, dt, s);
                }
                catch (err) {
                    status = 'parsererror';
                    xhr.error = errMsg = (err || status);
                }
            }
            catch (err) {
                log('error caught: ',err);
                status = 'error';
                xhr.error = errMsg = (err || status);
            }

            if (xhr.aborted) {
                log('upload aborted');
                status = null;
            }

            if (xhr.status) { // we've set xhr.status
                status = (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) ? 'success' : 'error';
            }

            // ordering of these callbacks/triggers is odd, but that's how $.ajax does it
            if (status === 'success') {
                if (s.success) {
                    s.success.call(s.context, data, 'success', xhr);
                }
                deferred.resolve(xhr.responseText, 'success', xhr);
                if (g) {
                    $.event.trigger("ajaxSuccess", [xhr, s]);
                }
            }
            else if (status) {
                if (errMsg === undefined) {
                    errMsg = xhr.statusText;
                }
                if (s.error) {
                    s.error.call(s.context, xhr, status, errMsg);
                }
                deferred.reject(xhr, 'error', errMsg);
                if (g) {
                    $.event.trigger("ajaxError", [xhr, s, errMsg]);
                }
            }

            if (g) {
                $.event.trigger("ajaxComplete", [xhr, s]);
            }

            if (g && ! --$.active) {
                $.event.trigger("ajaxStop");
            }

            if (s.complete) {
                s.complete.call(s.context, xhr, status);
            }

            callbackProcessed = true;
            if (s.timeout) {
                clearTimeout(timeoutHandle);
            }

            // clean up
            setTimeout(function() {
                if (!s.iframeTarget) {
                    $io.remove();
                }
                else { //adding else to clean up existing iframe response.
                    $io.attr('src', s.iframeSrc);
                }
                xhr.responseXML = null;
            }, 100);
        }

        var toXml = $.parseXML || function(s, doc) { // use parseXML if available (jQuery 1.5+)
            if (window.ActiveXObject) {
                doc = new ActiveXObject('Microsoft.XMLDOM');
                doc.async = 'false';
                doc.loadXML(s);
            }
            else {
                doc = (new DOMParser()).parseFromString(s, 'text/xml');
            }
            return (doc && doc.documentElement && doc.documentElement.nodeName != 'parsererror') ? doc : null;
        };
        var parseJSON = $.parseJSON || function(s) {
            /*jslint evil:true */
            return window['eval']('(' + s + ')');
        };

        var httpData = function( xhr, type, s ) { // mostly lifted from jq1.4.4

            var ct = xhr.getResponseHeader('content-type') || '',
                xml = type === 'xml' || !type && ct.indexOf('xml') >= 0,
                data = xml ? xhr.responseXML : xhr.responseText;

            if (xml && data.documentElement.nodeName === 'parsererror') {
                if ($.error) {
                    $.error('parsererror');
                }
            }
            if (s && s.dataFilter) {
                data = s.dataFilter(data, type);
            }
            if (typeof data === 'string') {
                if (type === 'json' || !type && ct.indexOf('json') >= 0) {
                    data = parseJSON(data);
                } else if (type === "script" || !type && ct.indexOf("javascript") >= 0) {
                    $.globalEval(data);
                }
            }
            return data;
        };

        return deferred;
    }
};

/**
 * ajaxForm() provides a mechanism for fully automating form submission.
 *
 * The advantages of using this method instead of ajaxSubmit() are:
 *
 * 1: This method will include coordinates for <input type="image" /> elements (if the element
 *    is used to submit the form).
 * 2. This method will include the submit element's name/value data (for the element that was
 *    used to submit the form).
 * 3. This method binds the submit() method to the form for you.
 *
 * The options argument for ajaxForm works exactly as it does for ajaxSubmit.  ajaxForm merely
 * passes the options argument along after properly binding events for submit elements and
 * the form itself.
 */
$.fn.ajaxForm = function(options) {
    options = options || {};
    options.delegation = options.delegation && $.isFunction($.fn.on);

    // in jQuery 1.3+ we can fix mistakes with the ready state
    if (!options.delegation && this.length === 0) {
        var o = { s: this.selector, c: this.context };
        if (!$.isReady && o.s) {
            log('DOM not ready, queuing ajaxForm');
            $(function() {
                $(o.s,o.c).ajaxForm(options);
            });
            return this;
        }
        // is your DOM ready?  http://docs.jquery.com/Tutorials:Introducing_$(document).ready()
        log('terminating; zero elements found by selector' + ($.isReady ? '' : ' (DOM not ready)'));
        return this;
    }

    if ( options.delegation ) {
        $(document)
            .off('submit.form-plugin', this.selector, doAjaxSubmit)
            .off('click.form-plugin', this.selector, captureSubmittingElement)
            .on('submit.form-plugin', this.selector, options, doAjaxSubmit)
            .on('click.form-plugin', this.selector, options, captureSubmittingElement);
        return this;
    }

    return this.ajaxFormUnbind()
        .bind('submit.form-plugin', options, doAjaxSubmit)
        .bind('click.form-plugin', options, captureSubmittingElement);
};

// private event handlers
function doAjaxSubmit(e) {
    /*jshint validthis:true */
    var options = e.data;
    if (!e.isDefaultPrevented()) { // if event has been canceled, don't proceed
        e.preventDefault();
        $(e.target).ajaxSubmit(options); // #365
    }
}

function captureSubmittingElement(e) {
    /*jshint validthis:true */
    var target = e.target;
    var $el = $(target);
    if (!($el.is("[type=submit],[type=image]"))) {
        // is this a child element of the submit el?  (ex: a span within a button)
        var t = $el.closest('[type=submit]');
        if (t.length === 0) {
            return;
        }
        target = t[0];
    }
    var form = this;
    form.clk = target;
    if (target.type == 'image') {
        if (e.offsetX !== undefined) {
            form.clk_x = e.offsetX;
            form.clk_y = e.offsetY;
        } else if (typeof $.fn.offset == 'function') {
            var offset = $el.offset();
            form.clk_x = e.pageX - offset.left;
            form.clk_y = e.pageY - offset.top;
        } else {
            form.clk_x = e.pageX - target.offsetLeft;
            form.clk_y = e.pageY - target.offsetTop;
        }
    }
    // clear form vars
    setTimeout(function() { form.clk = form.clk_x = form.clk_y = null; }, 100);
}


// ajaxFormUnbind unbinds the event handlers that were bound by ajaxForm
$.fn.ajaxFormUnbind = function() {
    return this.unbind('submit.form-plugin click.form-plugin');
};

/**
 * formToArray() gathers form element data into an array of objects that can
 * be passed to any of the following ajax functions: $.get, $.post, or load.
 * Each object in the array has both a 'name' and 'value' property.  An example of
 * an array for a simple login form might be:
 *
 * [ { name: 'username', value: 'jresig' }, { name: 'password', value: 'secret' } ]
 *
 * It is this array that is passed to pre-submit callback functions provided to the
 * ajaxSubmit() and ajaxForm() methods.
 */
$.fn.formToArray = function(semantic, elements) {
    var a = [];
    if (this.length === 0) {
        return a;
    }

    var form = this[0];
    var formId = this.attr('id');
    var els = semantic ? form.getElementsByTagName('*') : form.elements;
    var els2;

    if (els && !/MSIE [678]/.test(navigator.userAgent)) { // #390
        els = $(els).get();  // convert to standard array
    }

    // #386; account for inputs outside the form which use the 'form' attribute
    if ( formId ) {
        els2 = $(':input[form="' + formId + '"]').get(); // hat tip @thet
        if ( els2.length ) {
            els = (els || []).concat(els2);
        }
    }

    if (!els || !els.length) {
        return a;
    }

    var i,j,n,v,el,max,jmax;
    for(i=0, max=els.length; i < max; i++) {
        el = els[i];
        n = el.name;
        if (!n || el.disabled) {
            continue;
        }

        if (semantic && form.clk && el.type == "image") {
            // handle image inputs on the fly when semantic == true
            if(form.clk == el) {
                a.push({name: n, value: $(el).val(), type: el.type });
                a.push({name: n+'.x', value: form.clk_x}, {name: n+'.y', value: form.clk_y});
            }
            continue;
        }

        v = $.fieldValue(el, true);
        if (v && v.constructor == Array) {
            if (elements) {
                elements.push(el);
            }
            for(j=0, jmax=v.length; j < jmax; j++) {
                a.push({name: n, value: v[j]});
            }
        }
        else if (feature.fileapi && el.type == 'file') {
            if (elements) {
                elements.push(el);
            }
            var files = el.files;
            if (files.length) {
                for (j=0; j < files.length; j++) {
                    a.push({name: n, value: files[j], type: el.type});
                }
            }
            else {
                // #180
                a.push({ name: n, value: '', type: el.type });
            }
        }
        else if (v !== null && typeof v != 'undefined') {
            if (elements) {
                elements.push(el);
            }
            a.push({name: n, value: v, type: el.type, required: el.required});
        }
    }

    if (!semantic && form.clk) {
        // input type=='image' are not found in elements array! handle it here
        var $input = $(form.clk), input = $input[0];
        n = input.name;
        if (n && !input.disabled && input.type == 'image') {
            a.push({name: n, value: $input.val()});
            a.push({name: n+'.x', value: form.clk_x}, {name: n+'.y', value: form.clk_y});
        }
    }
    return a;
};

/**
 * Serializes form data into a 'submittable' string. This method will return a string
 * in the format: name1=value1&amp;name2=value2
 */
$.fn.formSerialize = function(semantic) {
    //hand off to jQuery.param for proper encoding
    return $.param(this.formToArray(semantic));
};

/**
 * Serializes all field elements in the jQuery object into a query string.
 * This method will return a string in the format: name1=value1&amp;name2=value2
 */
$.fn.fieldSerialize = function(successful) {
    var a = [];
    this.each(function() {
        var n = this.name;
        if (!n) {
            return;
        }
        var v = $.fieldValue(this, successful);
        if (v && v.constructor == Array) {
            for (var i=0,max=v.length; i < max; i++) {
                a.push({name: n, value: v[i]});
            }
        }
        else if (v !== null && typeof v != 'undefined') {
            a.push({name: this.name, value: v});
        }
    });
    //hand off to jQuery.param for proper encoding
    return $.param(a);
};

/**
 * Returns the value(s) of the element in the matched set.  For example, consider the following form:
 *
 *  <form><fieldset>
 *      <input name="A" type="text" />
 *      <input name="A" type="text" />
 *      <input name="B" type="checkbox" value="B1" />
 *      <input name="B" type="checkbox" value="B2"/>
 *      <input name="C" type="radio" value="C1" />
 *      <input name="C" type="radio" value="C2" />
 *  </fieldset></form>
 *
 *  var v = $('input[type=text]').fieldValue();
 *  // if no values are entered into the text inputs
 *  v == ['','']
 *  // if values entered into the text inputs are 'foo' and 'bar'
 *  v == ['foo','bar']
 *
 *  var v = $('input[type=checkbox]').fieldValue();
 *  // if neither checkbox is checked
 *  v === undefined
 *  // if both checkboxes are checked
 *  v == ['B1', 'B2']
 *
 *  var v = $('input[type=radio]').fieldValue();
 *  // if neither radio is checked
 *  v === undefined
 *  // if first radio is checked
 *  v == ['C1']
 *
 * The successful argument controls whether or not the field element must be 'successful'
 * (per http://www.w3.org/TR/html4/interact/forms.html#successful-controls).
 * The default value of the successful argument is true.  If this value is false the value(s)
 * for each element is returned.
 *
 * Note: This method *always* returns an array.  If no valid value can be determined the
 *    array will be empty, otherwise it will contain one or more values.
 */
$.fn.fieldValue = function(successful) {
    for (var val=[], i=0, max=this.length; i < max; i++) {
        var el = this[i];
        var v = $.fieldValue(el, successful);
        if (v === null || typeof v == 'undefined' || (v.constructor == Array && !v.length)) {
            continue;
        }
        if (v.constructor == Array) {
            $.merge(val, v);
        }
        else {
            val.push(v);
        }
    }
    return val;
};

/**
 * Returns the value of the field element.
 */
$.fieldValue = function(el, successful) {
    var n = el.name, t = el.type, tag = el.tagName.toLowerCase();
    if (successful === undefined) {
        successful = true;
    }

    if (successful && (!n || el.disabled || t == 'reset' || t == 'button' ||
        (t == 'checkbox' || t == 'radio') && !el.checked ||
        (t == 'submit' || t == 'image') && el.form && el.form.clk != el ||
        tag == 'select' && el.selectedIndex == -1)) {
            return null;
    }

    if (tag == 'select') {
        var index = el.selectedIndex;
        if (index < 0) {
            return null;
        }
        var a = [], ops = el.options;
        var one = (t == 'select-one');
        var max = (one ? index+1 : ops.length);
        for(var i=(one ? index : 0); i < max; i++) {
            var op = ops[i];
            if (op.selected) {
                var v = op.value;
                if (!v) { // extra pain for IE...
                    v = (op.attributes && op.attributes.value && !(op.attributes.value.specified)) ? op.text : op.value;
                }
                if (one) {
                    return v;
                }
                a.push(v);
            }
        }
        return a;
    }
    return $(el).val();
};

/**
 * Clears the form data.  Takes the following actions on the form's input fields:
 *  - input text fields will have their 'value' property set to the empty string
 *  - select elements will have their 'selectedIndex' property set to -1
 *  - checkbox and radio inputs will have their 'checked' property set to false
 *  - inputs of type submit, button, reset, and hidden will *not* be effected
 *  - button elements will *not* be effected
 */
$.fn.clearForm = function(includeHidden) {
    return this.each(function() {
        $('input,select,textarea', this).clearFields(includeHidden);
    });
};

/**
 * Clears the selected form elements.
 */
$.fn.clearFields = $.fn.clearInputs = function(includeHidden) {
    var re = /^(?:color|date|datetime|email|month|number|password|range|search|tel|text|time|url|week)$/i; // 'hidden' is not in this list
    return this.each(function() {
        var t = this.type, tag = this.tagName.toLowerCase();
        if (re.test(t) || tag == 'textarea') {
            this.value = '';
        }
        else if (t == 'checkbox' || t == 'radio') {
            this.checked = false;
        }
        else if (tag == 'select') {
            this.selectedIndex = -1;
        }
        else if (t == "file") {
            if (/MSIE/.test(navigator.userAgent)) {
                $(this).replaceWith($(this).clone(true));
            } else {
                $(this).val('');
            }
        }
        else if (includeHidden) {
            // includeHidden can be the value true, or it can be a selector string
            // indicating a special test; for example:
            //  $('#myForm').clearForm('.special:hidden')
            // the above would clean hidden inputs that have the class of 'special'
            if ( (includeHidden === true && /hidden/.test(t)) ||
                 (typeof includeHidden == 'string' && $(this).is(includeHidden)) ) {
                this.value = '';
            }
        }
    });
};

/**
 * Resets the form data.  Causes all form elements to be reset to their original value.
 */
$.fn.resetForm = function() {
    return this.each(function() {
        // guard against an input with the name of 'reset'
        // note that IE reports the reset function as an 'object'
        if (typeof this.reset == 'function' || (typeof this.reset == 'object' && !this.reset.nodeType)) {
            this.reset();
        }
    });
};

/**
 * Enables or disables any matching elements.
 */
$.fn.enable = function(b) {
    if (b === undefined) {
        b = true;
    }
    return this.each(function() {
        this.disabled = !b;
    });
};

/**
 * Checks/unchecks any matching checkboxes or radio buttons and
 * selects/deselects and matching option elements.
 */
$.fn.selected = function(select) {
    if (select === undefined) {
        select = true;
    }
    return this.each(function() {
        var t = this.type;
        if (t == 'checkbox' || t == 'radio') {
            this.checked = select;
        }
        else if (this.tagName.toLowerCase() == 'option') {
            var $sel = $(this).parent('select');
            if (select && $sel[0] && $sel[0].type == 'select-one') {
                // deselect all other options
                $sel.find('option').selected(false);
            }
            this.selected = select;
        }
    });
};

// expose debug var
$.fn.ajaxSubmit.debug = false;

// helper fn for console logging
function log() {
    if (!$.fn.ajaxSubmit.debug) {
        return;
    }
    var msg = '[jquery.form] ' + Array.prototype.join.call(arguments,'');
    if (window.console && window.console.log) {
        window.console.log(msg);
    }
    else if (window.opera && window.opera.postError) {
        window.opera.postError(msg);
    }
}

}));

/*!
* jquery.inputmask.bundle.js
* https://github.com/RobinHerbots/jquery.inputmask
* Copyright (c) 2010 - 2016 Robin Herbots
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
* Version: 3.2.8-31
*/
!function($) {
    function Inputmask(alias, options) {
        return this instanceof Inputmask ? ($.isPlainObject(alias) ? options = alias : (options = options || {}, 
        options.alias = alias), this.el = void 0, this.opts = $.extend(!0, {}, this.defaults, options), 
        this.noMasksCache = options && void 0 !== options.definitions, this.userOptions = options || {}, 
        this.events = {}, void resolveAlias(this.opts.alias, options, this.opts)) : new Inputmask(alias, options);
    }
    function isInputEventSupported(eventName) {
        var el = document.createElement("input"), evName = "on" + eventName, isSupported = evName in el;
        return isSupported || (el.setAttribute(evName, "return;"), isSupported = "function" == typeof el[evName]), 
        el = null, isSupported;
    }
    function isElementTypeSupported(input, opts) {
        var elementType = input.getAttribute("type"), isSupported = "INPUT" === input.tagName && -1 !== $.inArray(elementType, opts.supportsInputType) || input.isContentEditable || "TEXTAREA" === input.tagName;
        if (!isSupported && "INPUT" === input.tagName) {
            var el = document.createElement("input");
            el.setAttribute("type", elementType), isSupported = "text" === el.type, el = null;
        }
        return isSupported;
    }
    function resolveAlias(aliasStr, options, opts) {
        var aliasDefinition = opts.aliases[aliasStr];
        return aliasDefinition ? (aliasDefinition.alias && resolveAlias(aliasDefinition.alias, void 0, opts), 
        $.extend(!0, opts, aliasDefinition), $.extend(!0, opts, options), !0) : (null === opts.mask && (opts.mask = aliasStr), 
        !1);
    }
    function importAttributeOptions(npt, opts, userOptions) {
        function importOption(option, optionData) {
            optionData = void 0 !== optionData ? optionData : npt.getAttribute("data-inputmask-" + option), 
            null !== optionData && ("string" == typeof optionData && (0 === option.indexOf("on") ? optionData = window[optionData] : "false" === optionData ? optionData = !1 : "true" === optionData && (optionData = !0)), 
            userOptions[option] = optionData);
        }
        var option, dataoptions, optionData, p, attrOptions = npt.getAttribute("data-inputmask");
        if (attrOptions && "" !== attrOptions && (attrOptions = attrOptions.replace(new RegExp("'", "g"), '"'), 
        dataoptions = JSON.parse("{" + attrOptions + "}")), dataoptions) {
            optionData = void 0;
            for (p in dataoptions) if ("alias" === p.toLowerCase()) {
                optionData = dataoptions[p];
                break;
            }
        }
        importOption("alias", optionData), userOptions.alias && resolveAlias(userOptions.alias, userOptions, opts);
        for (option in opts) {
            if (dataoptions) {
                optionData = void 0;
                for (p in dataoptions) if (p.toLowerCase() === option.toLowerCase()) {
                    optionData = dataoptions[p];
                    break;
                }
            }
            importOption(option, optionData);
        }
        return $.extend(!0, opts, userOptions), opts;
    }
    function generateMaskSet(opts, nocache) {
        function analyseMask(mask) {
            function MaskToken(isGroup, isOptional, isQuantifier, isAlternator) {
                this.matches = [], this.isGroup = isGroup || !1, this.isOptional = isOptional || !1, 
                this.isQuantifier = isQuantifier || !1, this.isAlternator = isAlternator || !1, 
                this.quantifier = {
                    min: 1,
                    max: 1
                };
            }
            function insertTestDefinition(mtoken, element, position) {
                var maskdef = opts.definitions[element];
                position = void 0 !== position ? position : mtoken.matches.length;
                var prevMatch = mtoken.matches[position - 1];
                if (maskdef && !escaped) {
                    maskdef.placeholder = $.isFunction(maskdef.placeholder) ? maskdef.placeholder(opts) : maskdef.placeholder;
                    for (var prevalidators = maskdef.prevalidator, prevalidatorsL = prevalidators ? prevalidators.length : 0, i = 1; i < maskdef.cardinality; i++) {
                        var prevalidator = prevalidatorsL >= i ? prevalidators[i - 1] : [], validator = prevalidator.validator, cardinality = prevalidator.cardinality;
                        mtoken.matches.splice(position++, 0, {
                            fn: validator ? "string" == typeof validator ? new RegExp(validator) : new function() {
                                this.test = validator;
                            }() : new RegExp("."),
                            cardinality: cardinality ? cardinality : 1,
                            optionality: mtoken.isOptional,
                            newBlockMarker: void 0 === prevMatch || prevMatch.def !== (maskdef.definitionSymbol || element),
                            casing: maskdef.casing,
                            def: maskdef.definitionSymbol || element,
                            placeholder: maskdef.placeholder,
                            mask: element
                        }), prevMatch = mtoken.matches[position - 1];
                    }
                    mtoken.matches.splice(position++, 0, {
                        fn: maskdef.validator ? "string" == typeof maskdef.validator ? new RegExp(maskdef.validator) : new function() {
                            this.test = maskdef.validator;
                        }() : new RegExp("."),
                        cardinality: maskdef.cardinality,
                        optionality: mtoken.isOptional,
                        newBlockMarker: void 0 === prevMatch || prevMatch.def !== (maskdef.definitionSymbol || element),
                        casing: maskdef.casing,
                        def: maskdef.definitionSymbol || element,
                        placeholder: maskdef.placeholder,
                        mask: element
                    });
                } else mtoken.matches.splice(position++, 0, {
                    fn: null,
                    cardinality: 0,
                    optionality: mtoken.isOptional,
                    newBlockMarker: void 0 === prevMatch || prevMatch.def !== element,
                    casing: null,
                    def: opts.staticDefinitionSymbol || element,
                    placeholder: void 0 !== opts.staticDefinitionSymbol ? element : void 0,
                    mask: element
                }), escaped = !1;
            }
            function verifyGroupMarker(lastMatch, isOpenGroup) {
                lastMatch.isGroup && (lastMatch.isGroup = !1, insertTestDefinition(lastMatch, opts.groupmarker.start, 0), 
                isOpenGroup !== !0 && insertTestDefinition(lastMatch, opts.groupmarker.end));
            }
            function maskCurrentToken(m, currentToken, lastMatch, extraCondition) {
                currentToken.matches.length > 0 && (void 0 === extraCondition || extraCondition) && (lastMatch = currentToken.matches[currentToken.matches.length - 1], 
                verifyGroupMarker(lastMatch)), insertTestDefinition(currentToken, m);
            }
            function defaultCase() {
                if (openenings.length > 0) {
                    if (currentOpeningToken = openenings[openenings.length - 1], maskCurrentToken(m, currentOpeningToken, lastMatch, !currentOpeningToken.isAlternator), 
                    currentOpeningToken.isAlternator) {
                        alternator = openenings.pop();
                        for (var mndx = 0; mndx < alternator.matches.length; mndx++) alternator.matches[mndx].isGroup = !1;
                        openenings.length > 0 ? (currentOpeningToken = openenings[openenings.length - 1], 
                        currentOpeningToken.matches.push(alternator)) : currentToken.matches.push(alternator);
                    }
                } else maskCurrentToken(m, currentToken, lastMatch);
            }
            function reverseTokens(maskToken) {
                function reverseStatic(st) {
                    return st === opts.optionalmarker.start ? st = opts.optionalmarker.end : st === opts.optionalmarker.end ? st = opts.optionalmarker.start : st === opts.groupmarker.start ? st = opts.groupmarker.end : st === opts.groupmarker.end && (st = opts.groupmarker.start), 
                    st;
                }
                maskToken.matches = maskToken.matches.reverse();
                for (var match in maskToken.matches) {
                    var intMatch = parseInt(match);
                    if (maskToken.matches[match].isQuantifier && maskToken.matches[intMatch + 1] && maskToken.matches[intMatch + 1].isGroup) {
                        var qt = maskToken.matches[match];
                        maskToken.matches.splice(match, 1), maskToken.matches.splice(intMatch + 1, 0, qt);
                    }
                    void 0 !== maskToken.matches[match].matches ? maskToken.matches[match] = reverseTokens(maskToken.matches[match]) : maskToken.matches[match] = reverseStatic(maskToken.matches[match]);
                }
                return maskToken;
            }
            for (var match, m, openingToken, currentOpeningToken, alternator, lastMatch, groupToken, tokenizer = /(?:[?*+]|\{[0-9\+\*]+(?:,[0-9\+\*]*)?\})|[^.?*+^${[]()|\\]+|./g, escaped = !1, currentToken = new MaskToken(), openenings = [], maskTokens = []; match = tokenizer.exec(mask); ) if (m = match[0], 
            escaped) defaultCase(); else switch (m.charAt(0)) {
              case opts.escapeChar:
                escaped = !0;
                break;

              case opts.optionalmarker.end:
              case opts.groupmarker.end:
                if (openingToken = openenings.pop(), void 0 !== openingToken) if (openenings.length > 0) {
                    if (currentOpeningToken = openenings[openenings.length - 1], currentOpeningToken.matches.push(openingToken), 
                    currentOpeningToken.isAlternator) {
                        alternator = openenings.pop();
                        for (var mndx = 0; mndx < alternator.matches.length; mndx++) alternator.matches[mndx].isGroup = !1;
                        openenings.length > 0 ? (currentOpeningToken = openenings[openenings.length - 1], 
                        currentOpeningToken.matches.push(alternator)) : currentToken.matches.push(alternator);
                    }
                } else currentToken.matches.push(openingToken); else defaultCase();
                break;

              case opts.optionalmarker.start:
                openenings.push(new MaskToken(!1, !0));
                break;

              case opts.groupmarker.start:
                openenings.push(new MaskToken(!0));
                break;

              case opts.quantifiermarker.start:
                var quantifier = new MaskToken(!1, !1, !0);
                m = m.replace(/[{}]/g, "");
                var mq = m.split(","), mq0 = isNaN(mq[0]) ? mq[0] : parseInt(mq[0]), mq1 = 1 === mq.length ? mq0 : isNaN(mq[1]) ? mq[1] : parseInt(mq[1]);
                if (("*" === mq1 || "+" === mq1) && (mq0 = "*" === mq1 ? 0 : 1), quantifier.quantifier = {
                    min: mq0,
                    max: mq1
                }, openenings.length > 0) {
                    var matches = openenings[openenings.length - 1].matches;
                    match = matches.pop(), match.isGroup || (groupToken = new MaskToken(!0), groupToken.matches.push(match), 
                    match = groupToken), matches.push(match), matches.push(quantifier);
                } else match = currentToken.matches.pop(), match.isGroup || (groupToken = new MaskToken(!0), 
                groupToken.matches.push(match), match = groupToken), currentToken.matches.push(match), 
                currentToken.matches.push(quantifier);
                break;

              case opts.alternatormarker:
                openenings.length > 0 ? (currentOpeningToken = openenings[openenings.length - 1], 
                lastMatch = currentOpeningToken.matches.pop()) : lastMatch = currentToken.matches.pop(), 
                lastMatch.isAlternator ? openenings.push(lastMatch) : (alternator = new MaskToken(!1, !1, !1, !0), 
                alternator.matches.push(lastMatch), openenings.push(alternator));
                break;

              default:
                defaultCase();
            }
            for (;openenings.length > 0; ) openingToken = openenings.pop(), verifyGroupMarker(openingToken, !0), 
            currentToken.matches.push(openingToken);
            return currentToken.matches.length > 0 && (lastMatch = currentToken.matches[currentToken.matches.length - 1], 
            verifyGroupMarker(lastMatch), maskTokens.push(currentToken)), opts.numericInput && reverseTokens(maskTokens[0]), 
            maskTokens;
        }
        function generateMask(mask, metadata) {
            if (null === mask || "" === mask) return void 0;
            if (1 === mask.length && opts.greedy === !1 && 0 !== opts.repeat && (opts.placeholder = ""), 
            opts.repeat > 0 || "*" === opts.repeat || "+" === opts.repeat) {
                var repeatStart = "*" === opts.repeat ? 0 : "+" === opts.repeat ? 1 : opts.repeat;
                mask = opts.groupmarker.start + mask + opts.groupmarker.end + opts.quantifiermarker.start + repeatStart + "," + opts.repeat + opts.quantifiermarker.end;
            }
            var masksetDefinition;
            return void 0 === Inputmask.prototype.masksCache[mask] || nocache === !0 ? (masksetDefinition = {
                mask: mask,
                maskToken: analyseMask(mask),
                validPositions: {},
                _buffer: void 0,
                buffer: void 0,
                tests: {},
                metadata: metadata
            }, nocache !== !0 && (Inputmask.prototype.masksCache[opts.numericInput ? mask.split("").reverse().join("") : mask] = masksetDefinition, 
            masksetDefinition = $.extend(!0, {}, Inputmask.prototype.masksCache[opts.numericInput ? mask.split("").reverse().join("") : mask]))) : masksetDefinition = $.extend(!0, {}, Inputmask.prototype.masksCache[opts.numericInput ? mask.split("").reverse().join("") : mask]), 
            masksetDefinition;
        }
        function preProcessMask(mask) {
            return mask = mask.toString();
        }
        var ms;
        if ($.isFunction(opts.mask) && (opts.mask = opts.mask(opts)), $.isArray(opts.mask)) {
            if (opts.mask.length > 1) {
                opts.keepStatic = null === opts.keepStatic ? !0 : opts.keepStatic;
                var altMask = "(";
                return $.each(opts.numericInput ? opts.mask.reverse() : opts.mask, function(ndx, msk) {
                    altMask.length > 1 && (altMask += ")|("), altMask += preProcessMask(void 0 === msk.mask || $.isFunction(msk.mask) ? msk : msk.mask);
                }), altMask += ")", generateMask(altMask, opts.mask);
            }
            opts.mask = opts.mask.pop();
        }
        return opts.mask && (ms = void 0 === opts.mask.mask || $.isFunction(opts.mask.mask) ? generateMask(preProcessMask(opts.mask), opts.mask) : generateMask(preProcessMask(opts.mask.mask), opts.mask)), 
        ms;
    }
    function maskScope(actionObj, maskset, opts) {
        function getMaskTemplate(baseOnInput, minimalPos, includeInput) {
            minimalPos = minimalPos || 0;
            var ndxIntlzr, test, testPos, maskTemplate = [], pos = 0, lvp = getLastValidPosition();
            do {
                if (baseOnInput === !0 && getMaskSet().validPositions[pos]) {
                    var validPos = getMaskSet().validPositions[pos];
                    test = validPos.match, ndxIntlzr = validPos.locator.slice(), maskTemplate.push(includeInput === !0 ? validPos.input : getPlaceholder(pos, test));
                } else testPos = getTestTemplate(pos, ndxIntlzr, pos - 1), test = testPos.match, 
                ndxIntlzr = testPos.locator.slice(), (opts.jitMasking === !1 || lvp > pos || isFinite(opts.jitMasking) && opts.jitMasking > pos) && maskTemplate.push(getPlaceholder(pos, test));
                pos++;
            } while ((void 0 === maxLength || maxLength > pos - 1) && null !== test.fn || null === test.fn && "" !== test.def || minimalPos >= pos);
            return "" === maskTemplate[maskTemplate.length - 1] && maskTemplate.pop(), maskTemplate;
        }
        function getMaskSet() {
            return maskset;
        }
        function resetMaskSet(soft) {
            var maskset = getMaskSet();
            maskset.buffer = void 0, soft !== !0 && (maskset.tests = {}, maskset._buffer = void 0, 
            maskset.validPositions = {}, maskset.p = 0);
        }
        function getLastValidPosition(closestTo, strict) {
            var before = -1, after = -1, valids = getMaskSet().validPositions;
            void 0 === closestTo && (closestTo = -1);
            for (var posNdx in valids) {
                var psNdx = parseInt(posNdx);
                valids[psNdx] && (strict || null !== valids[psNdx].match.fn) && (closestTo >= psNdx && (before = psNdx), 
                psNdx >= closestTo && (after = psNdx));
            }
            return -1 !== before && closestTo - before > 1 || closestTo > after ? before : after;
        }
        function setValidPosition(pos, validTest, fromSetValid, isSelection) {
            if (isSelection || opts.insertMode && void 0 !== getMaskSet().validPositions[pos] && void 0 === fromSetValid) {
                var i, positionsClone = $.extend(!0, {}, getMaskSet().validPositions), lvp = getLastValidPosition();
                for (i = pos; lvp >= i; i++) delete getMaskSet().validPositions[i];
                getMaskSet().validPositions[pos] = validTest;
                var j, valid = !0, vps = getMaskSet().validPositions;
                for (i = j = pos; lvp >= i; i++) {
                    var t = positionsClone[i];
                    if (void 0 !== t) for (var posMatch = j, prevPosMatch = -1; posMatch < getMaskLength() && (null == t.match.fn && vps[i] && (vps[i].match.optionalQuantifier === !0 || vps[i].match.optionality === !0) || null != t.match.fn); ) if (null === t.match.fn || !opts.keepStatic && vps[i] && (void 0 !== vps[i + 1] && getTests(i + 1, vps[i].locator.slice(), i).length > 1 || void 0 !== vps[i].alternation) ? posMatch++ : posMatch = seekNext(j), 
                    positionCanMatchDefinition(posMatch, t.match.def)) {
                        var result = isValid(posMatch, t.input, !0, !0);
                        if (valid = result !== !1, j = result.caret || result.insert ? getLastValidPosition() : posMatch, 
                        valid) break;
                    } else {
                        if (valid = null == t.match.fn, prevPosMatch === posMatch) break;
                        prevPosMatch = posMatch;
                    }
                    if (!valid) break;
                }
                if (!valid) return getMaskSet().validPositions = $.extend(!0, {}, positionsClone), 
                resetMaskSet(!0), !1;
            } else getMaskSet().validPositions[pos] = validTest;
            return resetMaskSet(!0), !0;
        }
        function stripValidPositions(start, end, nocheck, strict) {
            function IsEnclosedStatic(pos) {
                var posMatch = getMaskSet().validPositions[pos];
                if (void 0 !== posMatch && null === posMatch.match.fn) {
                    var prevMatch = getMaskSet().validPositions[pos - 1], nextMatch = getMaskSet().validPositions[pos + 1];
                    return void 0 !== prevMatch && void 0 !== nextMatch;
                }
                return !1;
            }
            var i, startPos = start;
            for (getMaskSet().p = start, i = end - 1; i >= startPos; i--) void 0 !== getMaskSet().validPositions[i] && (nocheck === !0 || !IsEnclosedStatic(i) && opts.canClearPosition(getMaskSet(), i, getLastValidPosition(), strict, opts) !== !1) && delete getMaskSet().validPositions[i];
            for (resetMaskSet(!0), i = startPos + 1; i <= getLastValidPosition(); ) {
                for (;void 0 !== getMaskSet().validPositions[startPos]; ) startPos++;
                var s = getMaskSet().validPositions[startPos];
                if (startPos > i && (i = startPos + 1), void 0 === getMaskSet().validPositions[i] && isMask(i) || void 0 !== s) i++; else {
                    var t = getTestTemplate(i);
                    positionCanMatchDefinition(startPos, t.match.def) ? isValid(startPos, t.input || getPlaceholder(i), !0) !== !1 && (delete getMaskSet().validPositions[i], 
                    i++) : isMask(i) || (i++, startPos--), startPos++;
                }
            }
            resetMaskSet(!0);
        }
        function getTestTemplate(pos, ndxIntlzr, tstPs) {
            var testPos = getMaskSet().validPositions[pos];
            if (void 0 === testPos) for (var testPositions = getTests(pos, ndxIntlzr, tstPs), lvp = getLastValidPosition(), lvTest = getMaskSet().validPositions[lvp] || getTests(0)[0], lvTestAltArr = void 0 !== lvTest.alternation ? lvTest.locator[lvTest.alternation].toString().split(",") : [], ndx = 0; ndx < testPositions.length && (testPos = testPositions[ndx], 
            !(testPos.match && (opts.greedy && testPos.match.optionalQuantifier !== !0 || (testPos.match.optionality === !1 || testPos.match.newBlockMarker === !1) && testPos.match.optionalQuantifier !== !0) && (void 0 === lvTest.alternation || lvTest.alternation !== testPos.alternation || void 0 !== testPos.locator[lvTest.alternation] && checkAlternationMatch(testPos.locator[lvTest.alternation].toString().split(","), lvTestAltArr)))); ndx++) ;
            return testPos;
        }
        function getTest(pos) {
            return getMaskSet().validPositions[pos] ? getMaskSet().validPositions[pos].match : getTests(pos)[0].match;
        }
        function positionCanMatchDefinition(pos, def) {
            for (var valid = !1, tests = getTests(pos), tndx = 0; tndx < tests.length; tndx++) if (tests[tndx].match && tests[tndx].match.def === def) {
                valid = !0;
                break;
            }
            return valid;
        }
        function selectBestMatch(pos, alternateNdx) {
            var bestMatch, indexPos;
            return (getMaskSet().tests[pos] || getMaskSet().validPositions[pos]) && $.each(getMaskSet().tests[pos] || [ getMaskSet().validPositions[pos] ], function(ndx, lmnt) {
                var ndxPos = lmnt.alternation ? lmnt.locator[lmnt.alternation].toString().indexOf(alternateNdx) : -1;
                (void 0 === indexPos || indexPos > ndxPos) && -1 !== ndxPos && (bestMatch = lmnt, 
                indexPos = ndxPos);
            }), bestMatch;
        }
        function getTests(pos, ndxIntlzr, tstPs) {
            function resolveTestFromToken(maskToken, ndxInitializer, loopNdx, quantifierRecurse) {
                function handleMatch(match, loopNdx, quantifierRecurse) {
                    function isFirstMatch(latestMatch, tokenGroup) {
                        var firstMatch = 0 === $.inArray(latestMatch, tokenGroup.matches);
                        return firstMatch || $.each(tokenGroup.matches, function(ndx, match) {
                            return match.isQuantifier === !0 && (firstMatch = isFirstMatch(latestMatch, tokenGroup.matches[ndx - 1])) ? !1 : void 0;
                        }), firstMatch;
                    }
                    function resolveNdxInitializer(pos, alternateNdx) {
                        var bestMatch = selectBestMatch(pos, alternateNdx);
                        return bestMatch ? bestMatch.locator.slice(bestMatch.alternation + 1) : [];
                    }
                    if (testPos > 1e4) throw "Inputmask: There is probably an error in your mask definition or in the code. Create an issue on github with an example of the mask you are using. " + getMaskSet().mask;
                    if (testPos === pos && void 0 === match.matches) return matches.push({
                        match: match,
                        locator: loopNdx.reverse(),
                        cd: cacheDependency
                    }), !0;
                    if (void 0 !== match.matches) {
                        if (match.isGroup && quantifierRecurse !== match) {
                            if (match = handleMatch(maskToken.matches[$.inArray(match, maskToken.matches) + 1], loopNdx)) return !0;
                        } else if (match.isOptional) {
                            var optionalToken = match;
                            if (match = resolveTestFromToken(match, ndxInitializer, loopNdx, quantifierRecurse)) {
                                if (latestMatch = matches[matches.length - 1].match, !isFirstMatch(latestMatch, optionalToken)) return !0;
                                insertStop = !0, testPos = pos;
                            }
                        } else if (match.isAlternator) {
                            var maltMatches, alternateToken = match, malternateMatches = [], currentMatches = matches.slice(), loopNdxCnt = loopNdx.length, altIndex = ndxInitializer.length > 0 ? ndxInitializer.shift() : -1;
                            if (-1 === altIndex || "string" == typeof altIndex) {
                                var amndx, currentPos = testPos, ndxInitializerClone = ndxInitializer.slice(), altIndexArr = [];
                                if ("string" == typeof altIndex) altIndexArr = altIndex.split(","); else for (amndx = 0; amndx < alternateToken.matches.length; amndx++) altIndexArr.push(amndx);
                                for (var ndx = 0; ndx < altIndexArr.length; ndx++) {
                                    if (amndx = parseInt(altIndexArr[ndx]), matches = [], ndxInitializer = resolveNdxInitializer(testPos, amndx), 
                                    match = handleMatch(alternateToken.matches[amndx] || maskToken.matches[amndx], [ amndx ].concat(loopNdx), quantifierRecurse) || match, 
                                    match !== !0 && void 0 !== match && altIndexArr[altIndexArr.length - 1] < alternateToken.matches.length) {
                                        var ntndx = $.inArray(match, maskToken.matches) + 1;
                                        maskToken.matches.length > ntndx && (match = handleMatch(maskToken.matches[ntndx], [ ntndx ].concat(loopNdx.slice(1, loopNdx.length)), quantifierRecurse), 
                                        match && (altIndexArr.push(ntndx.toString()), $.each(matches, function(ndx, lmnt) {
                                            lmnt.alternation = loopNdx.length - 1;
                                        })));
                                    }
                                    maltMatches = matches.slice(), testPos = currentPos, matches = [];
                                    for (var i = 0; i < ndxInitializerClone.length; i++) ndxInitializer[i] = ndxInitializerClone[i];
                                    for (var ndx1 = 0; ndx1 < maltMatches.length; ndx1++) {
                                        var altMatch = maltMatches[ndx1];
                                        altMatch.alternation = altMatch.alternation || loopNdxCnt;
                                        for (var ndx2 = 0; ndx2 < malternateMatches.length; ndx2++) {
                                            var altMatch2 = malternateMatches[ndx2];
                                            if (altMatch.match.def === altMatch2.match.def && ("string" != typeof altIndex || -1 !== $.inArray(altMatch.locator[altMatch.alternation].toString(), altIndexArr))) {
                                                altMatch.match.mask === altMatch2.match.mask && (maltMatches.splice(ndx1, 1), ndx1--), 
                                                -1 === altMatch2.locator[altMatch.alternation].toString().indexOf(altMatch.locator[altMatch.alternation]) && (altMatch2.locator[altMatch.alternation] = altMatch2.locator[altMatch.alternation] + "," + altMatch.locator[altMatch.alternation], 
                                                altMatch2.alternation = altMatch.alternation);
                                                break;
                                            }
                                        }
                                    }
                                    malternateMatches = malternateMatches.concat(maltMatches);
                                }
                                "string" == typeof altIndex && (malternateMatches = $.map(malternateMatches, function(lmnt, ndx) {
                                    if (isFinite(ndx)) {
                                        var mamatch, alternation = lmnt.alternation, altLocArr = lmnt.locator[alternation].toString().split(",");
                                        lmnt.locator[alternation] = void 0, lmnt.alternation = void 0;
                                        for (var alndx = 0; alndx < altLocArr.length; alndx++) mamatch = -1 !== $.inArray(altLocArr[alndx], altIndexArr), 
                                        mamatch && (void 0 !== lmnt.locator[alternation] ? (lmnt.locator[alternation] += ",", 
                                        lmnt.locator[alternation] += altLocArr[alndx]) : lmnt.locator[alternation] = parseInt(altLocArr[alndx]), 
                                        lmnt.alternation = alternation);
                                        if (void 0 !== lmnt.locator[alternation]) return lmnt;
                                    }
                                })), matches = currentMatches.concat(malternateMatches), testPos = pos, insertStop = matches.length > 0;
                            } else match = handleMatch(alternateToken.matches[altIndex] || maskToken.matches[altIndex], [ altIndex ].concat(loopNdx), quantifierRecurse);
                            if (match) return !0;
                        } else if (match.isQuantifier && quantifierRecurse !== maskToken.matches[$.inArray(match, maskToken.matches) - 1]) for (var qt = match, qndx = ndxInitializer.length > 0 ? ndxInitializer.shift() : 0; qndx < (isNaN(qt.quantifier.max) ? qndx + 1 : qt.quantifier.max) && pos >= testPos; qndx++) {
                            var tokenGroup = maskToken.matches[$.inArray(qt, maskToken.matches) - 1];
                            if (match = handleMatch(tokenGroup, [ qndx ].concat(loopNdx), tokenGroup)) {
                                if (latestMatch = matches[matches.length - 1].match, latestMatch.optionalQuantifier = qndx > qt.quantifier.min - 1, 
                                isFirstMatch(latestMatch, tokenGroup)) {
                                    if (qndx > qt.quantifier.min - 1) {
                                        insertStop = !0, testPos = pos;
                                        break;
                                    }
                                    return !0;
                                }
                                return !0;
                            }
                        } else if (match = resolveTestFromToken(match, ndxInitializer, loopNdx, quantifierRecurse)) return !0;
                    } else testPos++;
                }
                for (var tndx = ndxInitializer.length > 0 ? ndxInitializer.shift() : 0; tndx < maskToken.matches.length; tndx++) if (maskToken.matches[tndx].isQuantifier !== !0) {
                    var match = handleMatch(maskToken.matches[tndx], [ tndx ].concat(loopNdx), quantifierRecurse);
                    if (match && testPos === pos) return match;
                    if (testPos > pos) break;
                }
            }
            function mergeLocators(tests) {
                var test = tests[0] || tests;
                return test.locator.slice();
            }
            var latestMatch, maskTokens = getMaskSet().maskToken, testPos = ndxIntlzr ? tstPs : 0, ndxInitializer = ndxIntlzr || [ 0 ], matches = [], insertStop = !1, cacheDependency = ndxIntlzr ? ndxIntlzr.join("") : "";
            if (pos > -1) {
                if (void 0 === ndxIntlzr) {
                    for (var test, previousPos = pos - 1; void 0 === (test = getMaskSet().validPositions[previousPos] || getMaskSet().tests[previousPos]) && previousPos > -1; ) previousPos--;
                    void 0 !== test && previousPos > -1 && (ndxInitializer = mergeLocators(test), cacheDependency = ndxInitializer.join(""), 
                    test = test[0] || test, testPos = previousPos);
                }
                if (getMaskSet().tests[pos] && getMaskSet().tests[pos][0].cd === cacheDependency) return getMaskSet().tests[pos];
                for (var mtndx = ndxInitializer.shift(); mtndx < maskTokens.length; mtndx++) {
                    var match = resolveTestFromToken(maskTokens[mtndx], ndxInitializer, [ mtndx ]);
                    if (match && testPos === pos || testPos > pos) break;
                }
            }
            return (0 === matches.length || insertStop) && matches.push({
                match: {
                    fn: null,
                    cardinality: 0,
                    optionality: !0,
                    casing: null,
                    def: ""
                },
                locator: []
            }), getMaskSet().tests[pos] = $.extend(!0, [], matches), getMaskSet().tests[pos];
        }
        function getBufferTemplate() {
            return void 0 === getMaskSet()._buffer && (getMaskSet()._buffer = getMaskTemplate(!1, 1)), 
            getMaskSet()._buffer;
        }
        function getBuffer(noCache) {
            if (void 0 === getMaskSet().buffer || noCache === !0) {
                if (noCache === !0) for (var testNdx in getMaskSet().tests) void 0 === getMaskSet().validPositions[testNdx] && delete getMaskSet().tests[testNdx];
                getMaskSet().buffer = getMaskTemplate(!0, getLastValidPosition(), !0);
            }
            return getMaskSet().buffer;
        }
        function refreshFromBuffer(start, end, buffer) {
            var i;
            if (buffer = buffer, start === !0) resetMaskSet(), start = 0, end = buffer.length; else for (i = start; end > i; i++) delete getMaskSet().validPositions[i], 
            delete getMaskSet().tests[i];
            for (i = start; end > i; i++) resetMaskSet(!0), buffer[i] !== opts.skipOptionalPartCharacter && isValid(i, buffer[i], !0, !0);
        }
        function casing(elem, test) {
            switch (test.casing) {
              case "upper":
                elem = elem.toUpperCase();
                break;

              case "lower":
                elem = elem.toLowerCase();
            }
            return elem;
        }
        function checkAlternationMatch(altArr1, altArr2) {
            for (var altArrC = opts.greedy ? altArr2 : altArr2.slice(0, 1), isMatch = !1, alndx = 0; alndx < altArr1.length; alndx++) if (-1 !== $.inArray(altArr1[alndx], altArrC)) {
                isMatch = !0;
                break;
            }
            return isMatch;
        }
        function isValid(pos, c, strict, fromSetValid) {
            function isSelection(posObj) {
                return isRTL ? posObj.begin - posObj.end > 1 || posObj.begin - posObj.end === 1 && opts.insertMode : posObj.end - posObj.begin > 1 || posObj.end - posObj.begin === 1 && opts.insertMode;
            }
            function _isValid(position, c, strict, fromSetValid) {
                var rslt = !1;
                return $.each(getTests(position), function(ndx, tst) {
                    for (var test = tst.match, loopend = c ? 1 : 0, chrs = "", i = test.cardinality; i > loopend; i--) chrs += getBufferElement(position - (i - 1));
                    if (c && (chrs += c), getBuffer(!0), rslt = null != test.fn ? test.fn.test(chrs, getMaskSet(), position, strict, opts, isSelection(pos)) : c !== test.def && c !== opts.skipOptionalPartCharacter || "" === test.def ? !1 : {
                        c: test.placeholder || test.def,
                        pos: position
                    }, rslt !== !1) {
                        var elem = void 0 !== rslt.c ? rslt.c : c;
                        elem = elem === opts.skipOptionalPartCharacter && null === test.fn ? test.placeholder || test.def : elem;
                        var validatedPos = position, possibleModifiedBuffer = getBuffer();
                        if (void 0 !== rslt.remove && ($.isArray(rslt.remove) || (rslt.remove = [ rslt.remove ]), 
                        $.each(rslt.remove.sort(function(a, b) {
                            return b - a;
                        }), function(ndx, lmnt) {
                            stripValidPositions(lmnt, lmnt + 1, !0);
                        })), void 0 !== rslt.insert && ($.isArray(rslt.insert) || (rslt.insert = [ rslt.insert ]), 
                        $.each(rslt.insert.sort(function(a, b) {
                            return a - b;
                        }), function(ndx, lmnt) {
                            isValid(lmnt.pos, lmnt.c, !1, fromSetValid);
                        })), rslt.refreshFromBuffer) {
                            var refresh = rslt.refreshFromBuffer;
                            if (strict = !0, refreshFromBuffer(refresh === !0 ? refresh : refresh.start, refresh.end, possibleModifiedBuffer), 
                            void 0 === rslt.pos && void 0 === rslt.c) return rslt.pos = getLastValidPosition(), 
                            !1;
                            if (validatedPos = void 0 !== rslt.pos ? rslt.pos : position, validatedPos !== position) return rslt = $.extend(rslt, isValid(validatedPos, elem, !0, fromSetValid)), 
                            !1;
                        } else if (rslt !== !0 && void 0 !== rslt.pos && rslt.pos !== position && (validatedPos = rslt.pos, 
                        refreshFromBuffer(position, validatedPos, getBuffer().slice()), validatedPos !== position)) return rslt = $.extend(rslt, isValid(validatedPos, elem, !0)), 
                        !1;
                        return rslt !== !0 && void 0 === rslt.pos && void 0 === rslt.c ? !1 : (ndx > 0 && resetMaskSet(!0), 
                        setValidPosition(validatedPos, $.extend({}, tst, {
                            input: casing(elem, test)
                        }), fromSetValid, isSelection(pos)) || (rslt = !1), !1);
                    }
                }), rslt;
            }
            function alternate(pos, c, strict, fromSetValid) {
                for (var lastAlt, alternation, isValidRslt, altPos, i, validPos, validPsClone = $.extend(!0, {}, getMaskSet().validPositions), testsClone = $.extend(!0, {}, getMaskSet().tests), lAlt = getLastValidPosition(); lAlt >= 0 && (altPos = getMaskSet().validPositions[lAlt], 
                !altPos || void 0 === altPos.alternation || (lastAlt = lAlt, alternation = getMaskSet().validPositions[lastAlt].alternation, 
                getTestTemplate(lastAlt).locator[altPos.alternation] === altPos.locator[altPos.alternation])); lAlt--) ;
                if (void 0 !== alternation) {
                    lastAlt = parseInt(lastAlt);
                    for (var decisionPos in getMaskSet().validPositions) if (decisionPos = parseInt(decisionPos), 
                    altPos = getMaskSet().validPositions[decisionPos], decisionPos >= lastAlt && void 0 !== altPos.alternation) {
                        var altNdxs;
                        0 === lastAlt ? (altNdxs = [], $.each(getMaskSet().tests[lastAlt], function(ndx, test) {
                            void 0 !== test.locator[alternation] && (altNdxs = altNdxs.concat(test.locator[alternation].toString().split(",")));
                        })) : altNdxs = getMaskSet().validPositions[lastAlt].locator[alternation].toString().split(",");
                        var decisionTaker = void 0 !== altPos.locator[alternation] ? altPos.locator[alternation] : altNdxs[0];
                        decisionTaker.length > 0 && (decisionTaker = decisionTaker.split(",")[0]);
                        for (var mndx = 0; mndx < altNdxs.length; mndx++) {
                            var validInputs = [], staticInputsBeforePos = 0, staticInputsBeforePosAlternate = 0;
                            if (decisionTaker < altNdxs[mndx]) {
                                for (var possibilityPos, possibilities, dp = decisionPos; dp >= 0; dp--) if (possibilityPos = getMaskSet().validPositions[dp], 
                                void 0 !== possibilityPos) {
                                    var bestMatch = selectBestMatch(dp, altNdxs[mndx]);
                                    getMaskSet().validPositions[dp].match.def !== bestMatch.match.def && (validInputs.push(getMaskSet().validPositions[dp].input), 
                                    getMaskSet().validPositions[dp] = bestMatch, getMaskSet().validPositions[dp].input = getPlaceholder(dp), 
                                    null === getMaskSet().validPositions[dp].match.fn && staticInputsBeforePosAlternate++, 
                                    possibilityPos = bestMatch), possibilities = possibilityPos.locator[alternation], 
                                    possibilityPos.locator[alternation] = parseInt(altNdxs[mndx]);
                                    break;
                                }
                                if (decisionTaker !== possibilityPos.locator[alternation]) {
                                    for (i = decisionPos + 1; i < getLastValidPosition(void 0, !0) + 1; i++) validPos = getMaskSet().validPositions[i], 
                                    validPos && null != validPos.match.fn ? validInputs.push(validPos.input) : pos > i && staticInputsBeforePos++, 
                                    delete getMaskSet().validPositions[i], delete getMaskSet().tests[i];
                                    for (resetMaskSet(!0), opts.keepStatic = !opts.keepStatic, isValidRslt = !0; validInputs.length > 0; ) {
                                        var input = validInputs.shift();
                                        if (input !== opts.skipOptionalPartCharacter && !(isValidRslt = isValid(getLastValidPosition(void 0, !0) + 1, input, !1, fromSetValid))) break;
                                    }
                                    if (possibilityPos.alternation = alternation, possibilityPos.locator[alternation] = possibilities, 
                                    isValidRslt) {
                                        var targetLvp = getLastValidPosition(pos) + 1;
                                        for (i = decisionPos + 1; i < getLastValidPosition() + 1; i++) validPos = getMaskSet().validPositions[i], 
                                        (void 0 === validPos || null == validPos.match.fn) && pos > i && staticInputsBeforePosAlternate++;
                                        pos += staticInputsBeforePosAlternate - staticInputsBeforePos, isValidRslt = isValid(pos > targetLvp ? targetLvp : pos, c, strict, fromSetValid);
                                    }
                                    if (opts.keepStatic = !opts.keepStatic, isValidRslt) return isValidRslt;
                                    resetMaskSet(), getMaskSet().validPositions = $.extend(!0, {}, validPsClone), getMaskSet().tests = $.extend(!0, {}, testsClone);
                                }
                            }
                        }
                        break;
                    }
                }
                return !1;
            }
            function trackbackAlternations(originalPos, newPos) {
                for (var vp = getMaskSet().validPositions[newPos], targetLocator = vp.locator, tll = targetLocator.length, ps = originalPos; newPos > ps; ps++) if (void 0 === getMaskSet().validPositions[ps] && !isMask(ps, !0)) {
                    var tests = getTests(ps), bestMatch = tests[0], equality = -1;
                    $.each(tests, function(ndx, tst) {
                        for (var i = 0; tll > i && (void 0 !== tst.locator[i] && checkAlternationMatch(tst.locator[i].toString().split(","), targetLocator[i].toString().split(","))); i++) i > equality && (equality = i, 
                        bestMatch = tst);
                    }), setValidPosition(ps, $.extend({}, bestMatch, {
                        input: bestMatch.match.placeholder || bestMatch.match.def
                    }), !0);
                }
            }
            strict = strict === !0;
            var maskPos = pos;
            void 0 !== pos.begin && (maskPos = isRTL && !isSelection(pos) ? pos.end : pos.begin);
            for (var result = !1, positionsClone = $.extend(!0, {}, getMaskSet().validPositions), pndx = maskPos - 1; pndx > -1 && !getMaskSet().validPositions[pndx]; pndx--) ;
            var testTemplate;
            for (pndx++; maskPos > pndx; pndx++) void 0 === getMaskSet().validPositions[pndx] && ((testTemplate = getTestTemplate(pndx)).match.def === opts.radixPointDefinitionSymbol || !isMask(pndx, !0) || $.inArray(opts.radixPoint, getBuffer()) < pndx && testTemplate.match.fn && testTemplate.match.fn.test(getPlaceholder(pndx), getMaskSet(), pndx, !1, opts)) && _isValid(getLastValidPosition() + 1, testTemplate.match.placeholder || (null == testTemplate.match.fn ? testTemplate.match.def : "" !== getPlaceholder(pndx) ? getPlaceholder(pndx) : getBuffer()[pndx]), !0, fromSetValid);
            if (isSelection(pos) && (handleRemove(void 0, Inputmask.keyCode.DELETE, pos), maskPos = getMaskSet().p), 
            maskPos < getMaskLength() && (result = _isValid(maskPos, c, strict, fromSetValid), 
            (!strict || fromSetValid === !0) && result === !1)) {
                var currentPosValid = getMaskSet().validPositions[maskPos];
                if (!currentPosValid || null !== currentPosValid.match.fn || currentPosValid.match.def !== c && c !== opts.skipOptionalPartCharacter) {
                    if ((opts.insertMode || void 0 === getMaskSet().validPositions[seekNext(maskPos)]) && !isMask(maskPos, !0)) {
                        var staticChar = getTestTemplate(maskPos).match;
                        staticChar = staticChar.placeholder || staticChar.def, _isValid(maskPos, staticChar, strict, fromSetValid);
                        for (var nPos = maskPos + 1, snPos = seekNext(maskPos); snPos >= nPos; nPos++) if (result = _isValid(nPos, c, strict, fromSetValid), 
                        result !== !1) {
                            trackbackAlternations(maskPos, nPos), maskPos = nPos;
                            break;
                        }
                    }
                } else result = {
                    caret: seekNext(maskPos)
                };
            }
            return result === !1 && opts.keepStatic && (result = alternate(maskPos, c, strict, fromSetValid)), 
            result === !0 && (result = {
                pos: maskPos
            }), $.isFunction(opts.postValidation) && result !== !1 && !strict && fromSetValid !== !0 && (result = opts.postValidation(getBuffer(!0), result, opts) ? result : !1), 
            void 0 === result.pos && (result.pos = maskPos), result === !1 && (resetMaskSet(!0), 
            getMaskSet().validPositions = $.extend(!0, {}, positionsClone)), result;
        }
        function isMask(pos, strict) {
            var test;
            if (strict ? (test = getTestTemplate(pos).match, "" === test.def && (test = getTest(pos))) : test = getTest(pos), 
            null != test.fn) return test.fn;
            if (strict !== !0 && pos > -1 && !opts.keepStatic && void 0 === getMaskSet().validPositions[pos]) {
                var tests = getTests(pos);
                return tests.length > 2;
            }
            return !1;
        }
        function getMaskLength() {
            var maskLength;
            maxLength = void 0 !== el ? el.maxLength : void 0, -1 === maxLength && (maxLength = void 0);
            var pos, lvp = getLastValidPosition(), testPos = getMaskSet().validPositions[lvp], ndxIntlzr = void 0 !== testPos ? testPos.locator.slice() : void 0;
            for (pos = lvp + 1; void 0 === testPos || null !== testPos.match.fn || null === testPos.match.fn && "" !== testPos.match.def; pos++) testPos = getTestTemplate(pos, ndxIntlzr, pos - 1), 
            ndxIntlzr = testPos.locator.slice();
            var lastTest = getTest(pos - 1);
            return maskLength = "" !== lastTest.def ? pos : pos - 1, void 0 === maxLength || maxLength > maskLength ? maskLength : maxLength;
        }
        function seekNext(pos, newBlock) {
            var maskL = getMaskLength();
            if (pos >= maskL) return maskL;
            for (var position = pos; ++position < maskL && (newBlock === !0 && (getTest(position).newBlockMarker !== !0 || !isMask(position)) || newBlock !== !0 && !isMask(position) && (opts.nojumps !== !0 || opts.nojumpsThreshold > position)); ) ;
            return position;
        }
        function seekPrevious(pos, newBlock) {
            var position = pos;
            if (0 >= position) return 0;
            for (;--position > 0 && (newBlock === !0 && getTest(position).newBlockMarker !== !0 || newBlock !== !0 && !isMask(position)); ) ;
            return position;
        }
        function getBufferElement(position) {
            return void 0 === getMaskSet().validPositions[position] ? getPlaceholder(position) : getMaskSet().validPositions[position].input;
        }
        function writeBuffer(input, buffer, caretPos, event, triggerInputEvent) {
            if (event && $.isFunction(opts.onBeforeWrite)) {
                var result = opts.onBeforeWrite(event, buffer, caretPos, opts);
                if (result) {
                    if (result.refreshFromBuffer) {
                        var refresh = result.refreshFromBuffer;
                        refreshFromBuffer(refresh === !0 ? refresh : refresh.start, refresh.end, result.buffer || buffer), 
                        buffer = getBuffer(!0);
                    }
                    void 0 !== caretPos && (caretPos = void 0 !== result.caret ? result.caret : caretPos);
                }
            }
            input.inputmask._valueSet(buffer.join("")), void 0 === caretPos || void 0 !== event && "blur" === event.type || caret(input, caretPos), 
            triggerInputEvent === !0 && (skipInputEvent = !0, $(input).trigger("input"));
        }
        function getPlaceholder(pos, test) {
            if (test = test || getTest(pos), void 0 !== test.placeholder) return test.placeholder;
            if (null === test.fn) {
                if (pos > -1 && !opts.keepStatic && void 0 === getMaskSet().validPositions[pos]) {
                    var prevTest, tests = getTests(pos), staticAlternations = 0;
                    if (tests.length > 2) for (var i = 0; i < tests.length; i++) if (tests[i].match.optionality !== !0 && tests[i].match.optionalQuantifier !== !0 && (null === tests[i].match.fn || void 0 === prevTest || tests[i].match.fn.test(prevTest.match.def, getMaskSet(), pos, !0, opts) !== !1) && (staticAlternations++, 
                    null === tests[i].match.fn && (prevTest = tests[i]), staticAlternations > 1)) return opts.placeholder.charAt(pos % opts.placeholder.length);
                }
                return test.def;
            }
            return opts.placeholder.charAt(pos % opts.placeholder.length);
        }
        function checkVal(input, writeOut, strict, nptvl) {
            function isTemplateMatch() {
                var isMatch = !1, charCodeNdx = getBufferTemplate().slice(initialNdx, seekNext(initialNdx)).join("").indexOf(charCodes);
                if (-1 !== charCodeNdx && !isMask(initialNdx)) {
                    isMatch = !0;
                    for (var bufferTemplateArr = getBufferTemplate().slice(initialNdx, initialNdx + charCodeNdx), i = 0; i < bufferTemplateArr.length; i++) if (" " !== bufferTemplateArr[i]) {
                        isMatch = !1;
                        break;
                    }
                }
                return isMatch;
            }
            var result, inputValue = nptvl.slice(), charCodes = "", initialNdx = 0;
            if (resetMaskSet(), getMaskSet().p = seekNext(-1), !strict) if (opts.autoUnmask !== !0) {
                var staticInput = getBufferTemplate().slice(0, seekNext(-1)).join(""), matches = inputValue.join("").match(new RegExp("^" + Inputmask.escapeRegex(staticInput), "g"));
                matches && matches.length > 0 && (inputValue.splice(0, matches.length * staticInput.length), 
                initialNdx = seekNext(initialNdx));
            } else initialNdx = seekNext(initialNdx);
            $.each(inputValue, function(ndx, charCode) {
                if (void 0 !== charCode) {
                    var keypress = new $.Event("keypress");
                    keypress.which = charCode.charCodeAt(0), charCodes += charCode;
                    var lvp = getLastValidPosition(void 0, !0), lvTest = getMaskSet().validPositions[lvp], nextTest = getTestTemplate(lvp + 1, lvTest ? lvTest.locator.slice() : void 0, lvp);
                    if (!isTemplateMatch() || strict || opts.autoUnmask) {
                        var pos = strict ? ndx : null == nextTest.match.fn && nextTest.match.optionality && lvp + 1 < getMaskSet().p ? lvp + 1 : getMaskSet().p;
                        result = keypressEvent.call(input, keypress, !0, !1, strict, pos), initialNdx = pos + 1, 
                        charCodes = "";
                    } else result = keypressEvent.call(input, keypress, !0, !1, !0, lvp + 1);
                    if (!strict && $.isFunction(opts.onBeforeWrite) && (result = opts.onBeforeWrite(keypress, getBuffer(), result.forwardPosition, opts), 
                    result && result.refreshFromBuffer)) {
                        var refresh = result.refreshFromBuffer;
                        refreshFromBuffer(refresh === !0 ? refresh : refresh.start, refresh.end, result.buffer), 
                        resetMaskSet(!0), result.caret && (getMaskSet().p = result.caret);
                    }
                }
            }), writeOut && writeBuffer(input, getBuffer(), document.activeElement === input ? seekNext(getLastValidPosition(0)) : void 0, new $.Event("checkval"));
        }
        function unmaskedvalue(input) {
            if (input && void 0 === input.inputmask) return input.value;
            var umValue = [], vps = getMaskSet().validPositions;
            for (var pndx in vps) vps[pndx].match && null != vps[pndx].match.fn && umValue.push(vps[pndx].input);
            var unmaskedValue = 0 === umValue.length ? null : (isRTL ? umValue.reverse() : umValue).join("");
            if (null !== unmaskedValue) {
                var bufferValue = (isRTL ? getBuffer().slice().reverse() : getBuffer()).join("");
                $.isFunction(opts.onUnMask) && (unmaskedValue = opts.onUnMask(bufferValue, unmaskedValue, opts) || unmaskedValue);
            }
            return unmaskedValue;
        }
        function caret(input, begin, end, notranslate) {
            function translatePosition(pos) {
                if (notranslate !== !0 && isRTL && "number" == typeof pos && (!opts.greedy || "" !== opts.placeholder)) {
                    var bffrLght = getBuffer().join("").length;
                    pos = bffrLght - pos;
                }
                return pos;
            }
            var range;
            if ("number" != typeof begin) return input.setSelectionRange ? (begin = input.selectionStart, 
            end = input.selectionEnd) : window.getSelection ? (range = window.getSelection().getRangeAt(0), 
            (range.commonAncestorContainer.parentNode === input || range.commonAncestorContainer === input) && (begin = range.startOffset, 
            end = range.endOffset)) : document.selection && document.selection.createRange && (range = document.selection.createRange(), 
            begin = 0 - range.duplicate().moveStart("character", -input.inputmask._valueGet().length), 
            end = begin + range.text.length), {
                begin: translatePosition(begin),
                end: translatePosition(end)
            };
            begin = translatePosition(begin), end = translatePosition(end), end = "number" == typeof end ? end : begin;
            var scrollCalc = parseInt(((input.ownerDocument.defaultView || window).getComputedStyle ? (input.ownerDocument.defaultView || window).getComputedStyle(input, null) : input.currentStyle).fontSize) * end;
            if (input.scrollLeft = scrollCalc > input.scrollWidth ? scrollCalc : 0, mobile || opts.insertMode !== !1 || begin !== end || end++, 
            input.setSelectionRange) input.selectionStart = begin, input.selectionEnd = end; else if (window.getSelection) {
                if (range = document.createRange(), void 0 === input.firstChild || null === input.firstChild) {
                    var textNode = document.createTextNode("");
                    input.appendChild(textNode);
                }
                range.setStart(input.firstChild, begin < input.inputmask._valueGet().length ? begin : input.inputmask._valueGet().length), 
                range.setEnd(input.firstChild, end < input.inputmask._valueGet().length ? end : input.inputmask._valueGet().length), 
                range.collapse(!0);
                var sel = window.getSelection();
                sel.removeAllRanges(), sel.addRange(range);
            } else input.createTextRange && (range = input.createTextRange(), range.collapse(!0), 
            range.moveEnd("character", end), range.moveStart("character", begin), range.select());
        }
        function determineLastRequiredPosition(returnDefinition) {
            var pos, testPos, buffer = getBuffer(), bl = buffer.length, lvp = getLastValidPosition(), positions = {}, lvTest = getMaskSet().validPositions[lvp], ndxIntlzr = void 0 !== lvTest ? lvTest.locator.slice() : void 0;
            for (pos = lvp + 1; pos < buffer.length; pos++) testPos = getTestTemplate(pos, ndxIntlzr, pos - 1), 
            ndxIntlzr = testPos.locator.slice(), positions[pos] = $.extend(!0, {}, testPos);
            var lvTestAlt = lvTest && void 0 !== lvTest.alternation ? lvTest.locator[lvTest.alternation] : void 0;
            for (pos = bl - 1; pos > lvp && (testPos = positions[pos], (testPos.match.optionality || testPos.match.optionalQuantifier || lvTestAlt && (lvTestAlt !== positions[pos].locator[lvTest.alternation] && null != testPos.match.fn || null === testPos.match.fn && testPos.locator[lvTest.alternation] && checkAlternationMatch(testPos.locator[lvTest.alternation].toString().split(","), lvTestAlt.toString().split(",")) && "" !== getTests(pos)[0].def)) && buffer[pos] === getPlaceholder(pos, testPos.match)); pos--) bl--;
            return returnDefinition ? {
                l: bl,
                def: positions[bl] ? positions[bl].match : void 0
            } : bl;
        }
        function clearOptionalTail(buffer) {
            for (var rl = determineLastRequiredPosition(), lmib = buffer.length - 1; lmib > rl && !isMask(lmib); lmib--) ;
            return buffer.splice(rl, lmib + 1 - rl), buffer;
        }
        function isComplete(buffer) {
            if ($.isFunction(opts.isComplete)) return opts.isComplete(buffer, opts);
            if ("*" === opts.repeat) return void 0;
            var complete = !1, lrp = determineLastRequiredPosition(!0), aml = seekPrevious(lrp.l);
            if (void 0 === lrp.def || lrp.def.newBlockMarker || lrp.def.optionality || lrp.def.optionalQuantifier) {
                complete = !0;
                for (var i = 0; aml >= i; i++) {
                    var test = getTestTemplate(i).match;
                    if (null !== test.fn && void 0 === getMaskSet().validPositions[i] && test.optionality !== !0 && test.optionalQuantifier !== !0 || null === test.fn && buffer[i] !== getPlaceholder(i, test)) {
                        complete = !1;
                        break;
                    }
                }
            }
            return complete;
        }
        function patchValueProperty(npt) {
            function patchValhook(type) {
                if ($.valHooks && (void 0 === $.valHooks[type] || $.valHooks[type].inputmaskpatch !== !0)) {
                    var valhookGet = $.valHooks[type] && $.valHooks[type].get ? $.valHooks[type].get : function(elem) {
                        return elem.value;
                    }, valhookSet = $.valHooks[type] && $.valHooks[type].set ? $.valHooks[type].set : function(elem, value) {
                        return elem.value = value, elem;
                    };
                    $.valHooks[type] = {
                        get: function(elem) {
                            if (elem.inputmask) {
                                if (elem.inputmask.opts.autoUnmask) return elem.inputmask.unmaskedvalue();
                                var result = valhookGet(elem);
                                return -1 !== getLastValidPosition() ? result : "";
                            }
                            return valhookGet(elem);
                        },
                        set: function(elem, value) {
                            var result, $elem = $(elem);
                            return result = valhookSet(elem, value), elem.inputmask && $elem.trigger("setvalue"), 
                            result;
                        },
                        inputmaskpatch: !0
                    };
                }
            }
            function getter() {
                return this.inputmask ? this.inputmask.opts.autoUnmask ? this.inputmask.unmaskedvalue() : -1 !== getLastValidPosition() ? document.activeElement === this && opts.clearMaskOnLostFocus ? (isRTL ? clearOptionalTail(getBuffer().slice()).reverse() : clearOptionalTail(getBuffer().slice())).join("") : valueGet.call(this) : "" : valueGet.call(this);
            }
            function setter(value) {
                valueSet.call(this, value), this.inputmask && $(this).trigger("setvalue");
            }
            function installNativeValueSetFallback(npt) {
                EventRuler.on(npt, "mouseenter", function(event) {
                    var $input = $(this), input = this, value = input.inputmask._valueGet();
                    value !== getBuffer().join("") && $input.trigger("setvalue");
                });
            }
            var valueGet, valueSet;
            if (!npt.inputmask.__valueGet) {
                if (Object.getOwnPropertyDescriptor) {
                    var valueProperty = Object.getPrototypeOf ? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(npt), "value") : void 0;
                    valueProperty && valueProperty.get && valueProperty.set ? (valueGet = valueProperty.get, 
                    valueSet = valueProperty.set, Object.defineProperty(npt, "value", {
                        get: getter,
                        set: setter,
                        configurable: !0
                    })) : "INPUT" !== npt.tagName && (valueGet = function() {
                        return this.textContent;
                    }, valueSet = function(value) {
                        this.textContent = value;
                    }, Object.defineProperty(npt, "value", {
                        get: getter,
                        set: setter,
                        configurable: !0
                    }));
                } else document.__lookupGetter__ && npt.__lookupGetter__("value") && (valueGet = npt.__lookupGetter__("value"), 
                valueSet = npt.__lookupSetter__("value"), npt.__defineGetter__("value", getter), 
                npt.__defineSetter__("value", setter));
                void 0 === valueGet && (valueGet = function() {
                    return npt.value;
                }, valueSet = function(value) {
                    npt.value = value;
                }, patchValhook(npt.type), installNativeValueSetFallback(npt)), npt.inputmask.__valueGet = valueGet, 
                npt.inputmask._valueGet = function(overruleRTL) {
                    return isRTL && overruleRTL !== !0 ? valueGet.call(this.el).split("").reverse().join("") : valueGet.call(this.el);
                }, npt.inputmask.__valueSet = valueSet, npt.inputmask._valueSet = function(value, overruleRTL) {
                    valueSet.call(this.el, null === value || void 0 === value ? "" : overruleRTL !== !0 && isRTL ? value.split("").reverse().join("") : value);
                };
            }
        }
        function handleRemove(input, k, pos, strict) {
            function generalize() {
                if (opts.keepStatic) {
                    resetMaskSet(!0);
                    var lastAlt, validInputs = [], positionsClone = $.extend(!0, {}, getMaskSet().validPositions);
                    for (lastAlt = getLastValidPosition(); lastAlt >= 0; lastAlt--) {
                        var validPos = getMaskSet().validPositions[lastAlt];
                        if (validPos && (null != validPos.match.fn && validInputs.push(validPos.input), 
                        delete getMaskSet().validPositions[lastAlt], void 0 !== validPos.alternation && validPos.locator[validPos.alternation] === getTestTemplate(lastAlt).locator[validPos.alternation])) break;
                    }
                    if (lastAlt > -1) for (;validInputs.length > 0; ) {
                        getMaskSet().p = seekNext(getLastValidPosition());
                        var keypress = new $.Event("keypress");
                        keypress.which = validInputs.pop().charCodeAt(0), keypressEvent.call(input, keypress, !0, !1, !1, getMaskSet().p);
                    } else getMaskSet().validPositions = $.extend(!0, {}, positionsClone);
                }
            }
            if ((opts.numericInput || isRTL) && (k === Inputmask.keyCode.BACKSPACE ? k = Inputmask.keyCode.DELETE : k === Inputmask.keyCode.DELETE && (k = Inputmask.keyCode.BACKSPACE), 
            isRTL)) {
                var pend = pos.end;
                pos.end = pos.begin, pos.begin = pend;
            }
            k === Inputmask.keyCode.BACKSPACE && (pos.end - pos.begin < 1 || opts.insertMode === !1) ? (pos.begin = seekPrevious(pos.begin), 
            void 0 === getMaskSet().validPositions[pos.begin] || getMaskSet().validPositions[pos.begin].input !== opts.groupSeparator && getMaskSet().validPositions[pos.begin].input !== opts.radixPoint || pos.begin--) : k === Inputmask.keyCode.DELETE && pos.begin === pos.end && (pos.end = isMask(pos.end) ? pos.end + 1 : seekNext(pos.end) + 1, 
            void 0 === getMaskSet().validPositions[pos.begin] || getMaskSet().validPositions[pos.begin].input !== opts.groupSeparator && getMaskSet().validPositions[pos.begin].input !== opts.radixPoint || pos.end++), 
            stripValidPositions(pos.begin, pos.end, !1, strict), strict !== !0 && generalize();
            var lvp = getLastValidPosition(pos.begin);
            lvp < pos.begin ? (-1 === lvp && resetMaskSet(), getMaskSet().p = seekNext(lvp)) : strict !== !0 && (getMaskSet().p = pos.begin);
        }
        function keydownEvent(e) {
            var input = this, $input = $(input), k = e.keyCode, pos = caret(input);
            if (k === Inputmask.keyCode.BACKSPACE || k === Inputmask.keyCode.DELETE || iphone && k === Inputmask.keyCode.BACKSPACE_SAFARI || e.ctrlKey && k === Inputmask.keyCode.X && !isInputEventSupported("cut")) e.preventDefault(), 
            handleRemove(input, k, pos), writeBuffer(input, getBuffer(), getMaskSet().p, e, undoValue !== getBuffer().join("")), 
            input.inputmask._valueGet() === getBufferTemplate().join("") ? $input.trigger("cleared") : isComplete(getBuffer()) === !0 && $input.trigger("complete"), 
            opts.showTooltip && (input.title = opts.tooltip || getMaskSet().mask); else if (k === Inputmask.keyCode.END || k === Inputmask.keyCode.PAGE_DOWN) {
                e.preventDefault();
                var caretPos = seekNext(getLastValidPosition());
                opts.insertMode || caretPos !== getMaskLength() || e.shiftKey || caretPos--, caret(input, e.shiftKey ? pos.begin : caretPos, caretPos, !0);
            } else k === Inputmask.keyCode.HOME && !e.shiftKey || k === Inputmask.keyCode.PAGE_UP ? (e.preventDefault(), 
            caret(input, 0, e.shiftKey ? pos.begin : 0, !0)) : (opts.undoOnEscape && k === Inputmask.keyCode.ESCAPE || 90 === k && e.ctrlKey) && e.altKey !== !0 ? (checkVal(input, !0, !1, undoValue.split("")), 
            $input.trigger("click")) : k !== Inputmask.keyCode.INSERT || e.shiftKey || e.ctrlKey ? opts.tabThrough === !0 && k === Inputmask.keyCode.TAB ? (e.shiftKey === !0 ? (null === getTest(pos.begin).fn && (pos.begin = seekNext(pos.begin)), 
            pos.end = seekPrevious(pos.begin, !0), pos.begin = seekPrevious(pos.end, !0)) : (pos.begin = seekNext(pos.begin, !0), 
            pos.end = seekNext(pos.begin, !0), pos.end < getMaskLength() && pos.end--), pos.begin < getMaskLength() && (e.preventDefault(), 
            caret(input, pos.begin, pos.end))) : opts.insertMode !== !1 || e.shiftKey || (k === Inputmask.keyCode.RIGHT ? setTimeout(function() {
                var caretPos = caret(input);
                caret(input, caretPos.begin);
            }, 0) : k === Inputmask.keyCode.LEFT && setTimeout(function() {
                var caretPos = caret(input);
                caret(input, isRTL ? caretPos.begin + 1 : caretPos.begin - 1);
            }, 0)) : (opts.insertMode = !opts.insertMode, caret(input, opts.insertMode || pos.begin !== getMaskLength() ? pos.begin : pos.begin - 1));
            opts.onKeyDown.call(this, e, getBuffer(), caret(input).begin, opts), ignorable = -1 !== $.inArray(k, opts.ignorables);
        }
        function keypressEvent(e, checkval, writeOut, strict, ndx) {
            var input = this, $input = $(input), k = e.which || e.charCode || e.keyCode;
            if (!(checkval === !0 || e.ctrlKey && e.altKey) && (e.ctrlKey || e.metaKey || ignorable)) return k === Inputmask.keyCode.ENTER && undoValue !== getBuffer().join("") && (undoValue = getBuffer().join(""), 
            setTimeout(function() {
                $input.trigger("change");
            }, 0)), !0;
            if (k) {
                46 === k && e.shiftKey === !1 && "," === opts.radixPoint && (k = 44);
                var forwardPosition, pos = checkval ? {
                    begin: ndx,
                    end: ndx
                } : caret(input), c = String.fromCharCode(k);
                getMaskSet().writeOutBuffer = !0;
                var valResult = isValid(pos, c, strict);
                if (valResult !== !1) {
                    var p = valResult.pos;
                    if (resetMaskSet(!0), void 0 !== valResult.caret) forwardPosition = valResult.caret; else {
                        var vps = getMaskSet().validPositions;
                        forwardPosition = !opts.keepStatic && (void 0 !== vps[p + 1] && getTests(p + 1, vps[p].locator.slice(), p).length > 1 || void 0 !== vps[p].alternation) ? p + 1 : seekNext(p);
                    }
                    getMaskSet().p = forwardPosition;
                }
                if (writeOut !== !1) {
                    var self = this;
                    if (setTimeout(function() {
                        opts.onKeyValidation.call(self, k, valResult, opts);
                    }, 0), getMaskSet().writeOutBuffer && valResult !== !1) {
                        var buffer = getBuffer();
                        writeBuffer(input, buffer, opts.numericInput && void 0 === valResult.caret ? seekPrevious(forwardPosition) : forwardPosition, e, checkval !== !0), 
                        checkval !== !0 && setTimeout(function() {
                            isComplete(buffer) === !0 && $input.trigger("complete");
                        }, 0);
                    }
                }
                if (opts.showTooltip && (input.title = opts.tooltip || getMaskSet().mask), e.preventDefault(), 
                checkval) return valResult.forwardPosition = forwardPosition, valResult;
            }
        }
        function pasteEvent(e) {
            var tempValue, input = this, ev = e.originalEvent || e, $input = $(input), inputValue = input.inputmask._valueGet(!0), caretPos = caret(input);
            isRTL && (tempValue = caretPos.end, caretPos.end = caretPos.begin, caretPos.begin = tempValue);
            var valueBeforeCaret = inputValue.substr(0, caretPos.begin), valueAfterCaret = inputValue.substr(caretPos.end, inputValue.length);
            valueBeforeCaret === (isRTL ? getBufferTemplate().reverse() : getBufferTemplate()).slice(0, caretPos.begin).join("") && (valueBeforeCaret = ""), 
            valueAfterCaret === (isRTL ? getBufferTemplate().reverse() : getBufferTemplate()).slice(caretPos.end).join("") && (valueAfterCaret = ""), 
            isRTL && (tempValue = valueBeforeCaret, valueBeforeCaret = valueAfterCaret, valueAfterCaret = tempValue), 
            window.clipboardData && window.clipboardData.getData ? inputValue = valueBeforeCaret + window.clipboardData.getData("Text") + valueAfterCaret : ev.clipboardData && ev.clipboardData.getData && (inputValue = valueBeforeCaret + ev.clipboardData.getData("text/plain") + valueAfterCaret);
            var pasteValue = inputValue;
            if ($.isFunction(opts.onBeforePaste)) {
                if (pasteValue = opts.onBeforePaste(inputValue, opts), pasteValue === !1) return e.preventDefault();
                pasteValue || (pasteValue = inputValue);
            }
            return checkVal(input, !1, !1, isRTL ? pasteValue.split("").reverse() : pasteValue.toString().split("")), 
            writeBuffer(input, getBuffer(), seekNext(getLastValidPosition()), e, !0), isComplete(getBuffer()) === !0 && $input.trigger("complete"), 
            e.preventDefault();
        }
        function inputFallBackEvent(e) {
            var input = this, inputValue = input.inputmask._valueGet();
            if (getBuffer().join("") !== inputValue) {
                var caretPos = caret(input);
                if (inputValue = inputValue.replace(new RegExp("(" + Inputmask.escapeRegex(getBufferTemplate().join("")) + ")*"), ""), 
                iemobile) {
                    var inputChar = inputValue.replace(getBuffer().join(""), "");
                    if (1 === inputChar.length) {
                        var keypress = new $.Event("keypress");
                        return keypress.which = inputChar.charCodeAt(0), keypressEvent.call(input, keypress, !0, !0, !1, getMaskSet().validPositions[caretPos.begin - 1] ? caretPos.begin : caretPos.begin - 1), 
                        !1;
                    }
                }
                if (caretPos.begin > inputValue.length && (caret(input, inputValue.length), caretPos = caret(input)), 
                getBuffer().length - inputValue.length !== 1 || inputValue.charAt(caretPos.begin) === getBuffer()[caretPos.begin] || inputValue.charAt(caretPos.begin + 1) === getBuffer()[caretPos.begin] || isMask(caretPos.begin)) {
                    for (var lvp = getLastValidPosition() + 1, bufferTemplate = getBuffer().slice(lvp).join(""); null === inputValue.match(Inputmask.escapeRegex(bufferTemplate) + "$"); ) bufferTemplate = bufferTemplate.slice(1);
                    inputValue = inputValue.replace(bufferTemplate, ""), inputValue = inputValue.split(""), 
                    checkVal(input, !0, !1, inputValue), isComplete(getBuffer()) === !0 && $(input).trigger("complete");
                } else e.keyCode = Inputmask.keyCode.BACKSPACE, keydownEvent.call(input, e);
                e.preventDefault();
            }
        }
        function setValueEvent(e) {
            var input = this, value = input.inputmask._valueGet();
            checkVal(input, !0, !1, ($.isFunction(opts.onBeforeMask) ? opts.onBeforeMask(value, opts) || value : value).split("")), 
            undoValue = getBuffer().join(""), (opts.clearMaskOnLostFocus || opts.clearIncomplete) && input.inputmask._valueGet() === getBufferTemplate().join("") && input.inputmask._valueSet("");
        }
        function focusEvent(e) {
            var input = this, nptValue = input.inputmask._valueGet();
            opts.showMaskOnFocus && (!opts.showMaskOnHover || opts.showMaskOnHover && "" === nptValue) ? input.inputmask._valueGet() !== getBuffer().join("") && writeBuffer(input, getBuffer(), seekNext(getLastValidPosition())) : mouseEnter === !1 && caret(input, seekNext(getLastValidPosition())), 
            opts.positionCaretOnTab === !0 && setTimeout(function() {
                caret(input, seekNext(getLastValidPosition()));
            }, 0), undoValue = getBuffer().join("");
        }
        function mouseleaveEvent(e) {
            var input = this;
            if (mouseEnter = !1, opts.clearMaskOnLostFocus && document.activeElement !== input) {
                var buffer = getBuffer().slice(), nptValue = input.inputmask._valueGet();
                nptValue !== input.getAttribute("placeholder") && "" !== nptValue && (-1 === getLastValidPosition() && nptValue === getBufferTemplate().join("") ? buffer = [] : clearOptionalTail(buffer), 
                writeBuffer(input, buffer));
            }
        }
        function clickEvent(e) {
            function doRadixFocus(clickPos) {
                if (opts.radixFocus && "" !== opts.radixPoint) {
                    var vps = getMaskSet().validPositions;
                    if (void 0 === vps[clickPos] || vps[clickPos].input === getPlaceholder(clickPos)) {
                        if (clickPos < seekNext(-1)) return !0;
                        var radixPos = $.inArray(opts.radixPoint, getBuffer());
                        if (-1 !== radixPos) {
                            for (var vp in vps) if (vp > radixPos && vps[vp].input !== getPlaceholder(vp)) return !1;
                            return !0;
                        }
                    }
                }
                return !1;
            }
            var input = this;
            setTimeout(function() {
                if (document.activeElement === input) {
                    var selectedCaret = caret(input);
                    if (selectedCaret.begin === selectedCaret.end) if (doRadixFocus(selectedCaret.begin)) caret(input, opts.numericInput ? seekNext($.inArray(opts.radixPoint, getBuffer())) : $.inArray(opts.radixPoint, getBuffer())); else {
                        var clickPosition = selectedCaret.begin, lvclickPosition = getLastValidPosition(clickPosition, !0), lastPosition = seekNext(lvclickPosition);
                        if (lastPosition > clickPosition) caret(input, isMask(clickPosition) || isMask(clickPosition - 1) ? clickPosition : seekNext(clickPosition)); else {
                            var placeholder = getPlaceholder(lastPosition);
                            ("" !== placeholder && getBuffer()[lastPosition] !== placeholder || !isMask(lastPosition, !0) && getTest(lastPosition).def === placeholder) && (lastPosition = seekNext(lastPosition)), 
                            caret(input, lastPosition);
                        }
                    }
                }
            }, 0);
        }
        function dblclickEvent(e) {
            var input = this;
            setTimeout(function() {
                caret(input, 0, seekNext(getLastValidPosition()));
            }, 0);
        }
        function cutEvent(e) {
            var input = this, $input = $(input), pos = caret(input), ev = e.originalEvent || e, clipboardData = window.clipboardData || ev.clipboardData, clipData = isRTL ? getBuffer().slice(pos.end, pos.begin) : getBuffer().slice(pos.begin, pos.end);
            clipboardData.setData("text", isRTL ? clipData.reverse().join("") : clipData.join("")), 
            document.execCommand && document.execCommand("copy"), handleRemove(input, Inputmask.keyCode.DELETE, pos), 
            writeBuffer(input, getBuffer(), getMaskSet().p, e, undoValue !== getBuffer().join("")), 
            input.inputmask._valueGet() === getBufferTemplate().join("") && $input.trigger("cleared"), 
            opts.showTooltip && (input.title = opts.tooltip || getMaskSet().mask);
        }
        function blurEvent(e) {
            var $input = $(this), input = this;
            if (input.inputmask) {
                var nptValue = input.inputmask._valueGet(), buffer = getBuffer().slice();
                undoValue !== buffer.join("") && setTimeout(function() {
                    $input.trigger("change"), undoValue = buffer.join("");
                }, 0), "" !== nptValue && (opts.clearMaskOnLostFocus && (-1 === getLastValidPosition() && nptValue === getBufferTemplate().join("") ? buffer = [] : clearOptionalTail(buffer)), 
                isComplete(buffer) === !1 && (setTimeout(function() {
                    $input.trigger("incomplete");
                }, 0), opts.clearIncomplete && (resetMaskSet(), buffer = opts.clearMaskOnLostFocus ? [] : getBufferTemplate().slice())), 
                writeBuffer(input, buffer, void 0, e));
            }
        }
        function mouseenterEvent(e) {
            var input = this;
            mouseEnter = !0, document.activeElement !== input && opts.showMaskOnHover && input.inputmask._valueGet() !== getBuffer().join("") && writeBuffer(input, getBuffer());
        }
        function submitEvent(e) {
            undoValue !== getBuffer().join("") && $el.trigger("change"), opts.clearMaskOnLostFocus && -1 === getLastValidPosition() && el.inputmask._valueGet && el.inputmask._valueGet() === getBufferTemplate().join("") && el.inputmask._valueSet(""), 
            opts.removeMaskOnSubmit && (el.inputmask._valueSet(el.inputmask.unmaskedvalue(), !0), 
            setTimeout(function() {
                writeBuffer(el, getBuffer());
            }, 0));
        }
        function resetEvent(e) {
            setTimeout(function() {
                $el.trigger("setvalue");
            }, 0);
        }
        function mask(elem) {
            if (el = elem, $el = $(el), opts.showTooltip && (el.title = opts.tooltip || getMaskSet().mask), 
            ("rtl" === el.dir || opts.rightAlign) && (el.style.textAlign = "right"), ("rtl" === el.dir || opts.numericInput) && (el.dir = "ltr", 
            el.removeAttribute("dir"), el.inputmask.isRTL = !0, isRTL = !0), EventRuler.off(el), 
            patchValueProperty(el), isElementTypeSupported(el, opts) && (EventRuler.on(el, "submit", submitEvent), 
            EventRuler.on(el, "reset", resetEvent), EventRuler.on(el, "mouseenter", mouseenterEvent), 
            EventRuler.on(el, "blur", blurEvent), EventRuler.on(el, "focus", focusEvent), EventRuler.on(el, "mouseleave", mouseleaveEvent), 
            EventRuler.on(el, "click", clickEvent), EventRuler.on(el, "dblclick", dblclickEvent), 
            EventRuler.on(el, "paste", pasteEvent), EventRuler.on(el, "dragdrop", pasteEvent), 
            EventRuler.on(el, "drop", pasteEvent), EventRuler.on(el, "cut", cutEvent), EventRuler.on(el, "complete", opts.oncomplete), 
            EventRuler.on(el, "incomplete", opts.onincomplete), EventRuler.on(el, "cleared", opts.oncleared), 
            EventRuler.on(el, "keydown", keydownEvent), EventRuler.on(el, "keypress", keypressEvent), 
            EventRuler.on(el, "input", inputFallBackEvent)), EventRuler.on(el, "setvalue", setValueEvent), 
            "" !== el.inputmask._valueGet() || opts.clearMaskOnLostFocus === !1 || document.activeElement === el) {
                var initialValue = $.isFunction(opts.onBeforeMask) ? opts.onBeforeMask(el.inputmask._valueGet(), opts) || el.inputmask._valueGet() : el.inputmask._valueGet();
                checkVal(el, !0, !1, initialValue.split(""));
                var buffer = getBuffer().slice();
                undoValue = buffer.join(""), isComplete(buffer) === !1 && opts.clearIncomplete && resetMaskSet(), 
                opts.clearMaskOnLostFocus && document.activeElement !== el && (-1 === getLastValidPosition() ? buffer = [] : clearOptionalTail(buffer)), 
                writeBuffer(el, buffer), document.activeElement === el && caret(el, seekNext(getLastValidPosition()));
            }
        }
        var undoValue, el, $el, maxLength, valueBuffer, isRTL = !1, skipKeyPressEvent = !1, skipInputEvent = !1, ignorable = !1, mouseEnter = !0, EventRuler = {
            on: function(input, eventName, eventHandler) {
                var ev = function(e) {
                    if (void 0 === this.inputmask && "FORM" !== this.nodeName) {
                        var imOpts = $.data(this, "_inputmask_opts");
                        imOpts ? new Inputmask(imOpts).mask(this) : EventRuler.off(this);
                    } else {
                        if ("setvalue" === e.type || !(this.disabled || this.readOnly && !("keydown" === e.type && e.ctrlKey && 67 === e.keyCode || opts.tabThrough === !1 && e.keyCode === Inputmask.keyCode.TAB))) {
                            switch (e.type) {
                              case "input":
                                if (skipInputEvent === !0) return skipInputEvent = !1, e.preventDefault();
                                break;

                              case "keydown":
                                skipKeyPressEvent = !1, skipInputEvent = !1;
                                break;

                              case "keypress":
                                if (skipKeyPressEvent === !0) return e.preventDefault();
                                skipKeyPressEvent = !0;
                                break;

                              case "click":
                                if (iemobile) {
                                    var that = this;
                                    return setTimeout(function() {
                                        eventHandler.apply(that, arguments);
                                    }, 0), !1;
                                }
                            }
                            var returnVal = eventHandler.apply(this, arguments);
                            return returnVal === !1 && (e.preventDefault(), e.stopPropagation()), returnVal;
                        }
                        e.preventDefault();
                    }
                };
                input.inputmask.events[eventName] = input.inputmask.events[eventName] || [], input.inputmask.events[eventName].push(ev), 
                -1 !== $.inArray(eventName, [ "submit", "reset" ]) ? null != input.form && $(input.form).on(eventName, ev) : $(input).on(eventName, ev);
            },
            off: function(input, event) {
                if (input.inputmask && input.inputmask.events) {
                    var events;
                    event ? (events = [], events[event] = input.inputmask.events[event]) : events = input.inputmask.events, 
                    $.each(events, function(eventName, evArr) {
                        for (;evArr.length > 0; ) {
                            var ev = evArr.pop();
                            -1 !== $.inArray(eventName, [ "submit", "reset" ]) ? null != input.form && $(input.form).off(eventName, ev) : $(input).off(eventName, ev);
                        }
                        delete input.inputmask.events[eventName];
                    });
                }
            }
        };
        if (void 0 !== actionObj) switch (actionObj.action) {
          case "isComplete":
            return el = actionObj.el, isComplete(getBuffer());

          case "unmaskedvalue":
            return el = actionObj.el, void 0 !== el && void 0 !== el.inputmask ? (maskset = el.inputmask.maskset, 
            opts = el.inputmask.opts, isRTL = el.inputmask.isRTL) : (valueBuffer = actionObj.value, 
            opts.numericInput && (isRTL = !0), valueBuffer = ($.isFunction(opts.onBeforeMask) ? opts.onBeforeMask(valueBuffer, opts) || valueBuffer : valueBuffer).split(""), 
            checkVal(void 0, !1, !1, isRTL ? valueBuffer.reverse() : valueBuffer), $.isFunction(opts.onBeforeWrite) && opts.onBeforeWrite(void 0, getBuffer(), 0, opts)), 
            unmaskedvalue(el);

          case "mask":
            el = actionObj.el, maskset = el.inputmask.maskset, opts = el.inputmask.opts, isRTL = el.inputmask.isRTL, 
            undoValue = getBuffer().join(""), mask(el);
            break;

          case "format":
            return opts.numericInput && (isRTL = !0), valueBuffer = ($.isFunction(opts.onBeforeMask) ? opts.onBeforeMask(actionObj.value, opts) || actionObj.value : actionObj.value).split(""), 
            checkVal(void 0, !1, !1, isRTL ? valueBuffer.reverse() : valueBuffer), $.isFunction(opts.onBeforeWrite) && opts.onBeforeWrite(void 0, getBuffer(), 0, opts), 
            actionObj.metadata ? {
                value: isRTL ? getBuffer().slice().reverse().join("") : getBuffer().join(""),
                metadata: maskScope({
                    action: "getmetadata"
                }, maskset, opts)
            } : isRTL ? getBuffer().slice().reverse().join("") : getBuffer().join("");

          case "isValid":
            opts.numericInput && (isRTL = !0), actionObj.value ? (valueBuffer = actionObj.value.split(""), 
            checkVal(void 0, !1, !0, isRTL ? valueBuffer.reverse() : valueBuffer)) : actionObj.value = getBuffer().join("");
            for (var buffer = getBuffer(), rl = determineLastRequiredPosition(), lmib = buffer.length - 1; lmib > rl && !isMask(lmib); lmib--) ;
            return buffer.splice(rl, lmib + 1 - rl), isComplete(buffer) && actionObj.value === getBuffer().join("");

          case "getemptymask":
            return getBufferTemplate().join("");

          case "remove":
            el = actionObj.el, $el = $(el), maskset = el.inputmask.maskset, opts = el.inputmask.opts, 
            el.inputmask._valueSet(unmaskedvalue(el)), EventRuler.off(el);
            var valueProperty;
            Object.getOwnPropertyDescriptor && Object.getPrototypeOf ? (valueProperty = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value"), 
            valueProperty && el.inputmask.__valueGet && Object.defineProperty(el, "value", {
                get: el.inputmask.__valueGet,
                set: el.inputmask.__valueSet,
                configurable: !0
            })) : document.__lookupGetter__ && el.__lookupGetter__("value") && el.inputmask.__valueGet && (el.__defineGetter__("value", el.inputmask.__valueGet), 
            el.__defineSetter__("value", el.inputmask.__valueSet)), el.inputmask = void 0;
            break;

          case "getmetadata":
            if ($.isArray(maskset.metadata)) {
                for (var alternation, lvp = getLastValidPosition(void 0, !0), firstAlt = lvp; firstAlt >= 0; firstAlt--) if (getMaskSet().validPositions[firstAlt] && void 0 !== getMaskSet().validPositions[firstAlt].alternation) {
                    alternation = getMaskSet().validPositions[firstAlt].alternation;
                    break;
                }
                return void 0 !== alternation ? maskset.metadata[getMaskSet().validPositions[firstAlt].locator[alternation]] : [];
            }
            return maskset.metadata;
        }
    }
    Inputmask.prototype = {
        defaults: {
            placeholder: "_",
            optionalmarker: {
                start: "[",
                end: "]"
            },
            quantifiermarker: {
                start: "{",
                end: "}"
            },
            groupmarker: {
                start: "(",
                end: ")"
            },
            alternatormarker: "|",
            escapeChar: "\\",
            mask: null,
            oncomplete: $.noop,
            onincomplete: $.noop,
            oncleared: $.noop,
            repeat: 0,
            greedy: !0,
            autoUnmask: !1,
            removeMaskOnSubmit: !1,
            clearMaskOnLostFocus: !0,
            insertMode: !0,
            clearIncomplete: !1,
            aliases: {},
            alias: null,
            onKeyDown: $.noop,
            onBeforeMask: null,
            onBeforePaste: function(pastedValue, opts) {
                return $.isFunction(opts.onBeforeMask) ? opts.onBeforeMask(pastedValue, opts) : pastedValue;
            },
            onBeforeWrite: null,
            onUnMask: null,
            showMaskOnFocus: !0,
            showMaskOnHover: !0,
            onKeyValidation: $.noop,
            skipOptionalPartCharacter: " ",
            showTooltip: !1,
            tooltip: void 0,
            numericInput: !1,
            rightAlign: !1,
            undoOnEscape: !0,
            radixPoint: "",
            radixPointDefinitionSymbol: void 0,
            groupSeparator: "",
            radixFocus: !1,
            nojumps: !1,
            nojumpsThreshold: 0,
            keepStatic: null,
            positionCaretOnTab: !1,
            tabThrough: !1,
            supportsInputType: [ "text", "tel", "password" ],
            definitions: {
                "9": {
                    validator: "[0-9]",
                    cardinality: 1,
                    definitionSymbol: "*"
                },
                a: {
                    validator: "[A-Za-z\u0410-\u044f\u0401\u0451\xc0-\xff\xb5]",
                    cardinality: 1,
                    definitionSymbol: "*"
                },
                "*": {
                    validator: "[0-9A-Za-z\u0410-\u044f\u0401\u0451\xc0-\xff\xb5]",
                    cardinality: 1
                }
            },
            ignorables: [ 8, 9, 13, 19, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 93, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123 ],
            isComplete: null,
            canClearPosition: $.noop,
            postValidation: null,
            staticDefinitionSymbol: void 0,
            jitMasking: !1
        },
        masksCache: {},
        mask: function(elems) {
            var that = this;
            return "string" == typeof elems && (elems = document.getElementById(elems) || document.querySelectorAll(elems)), 
            elems = elems.nodeName ? [ elems ] : elems, $.each(elems, function(ndx, el) {
                var scopedOpts = $.extend(!0, {}, that.opts);
                importAttributeOptions(el, scopedOpts, $.extend(!0, {}, that.userOptions));
                var maskset = generateMaskSet(scopedOpts, that.noMasksCache);
                void 0 !== maskset && (void 0 !== el.inputmask && el.inputmask.remove(), el.inputmask = new Inputmask(), 
                el.inputmask.opts = scopedOpts, el.inputmask.noMasksCache = that.noMasksCache, el.inputmask.userOptions = $.extend(!0, {}, that.userOptions), 
                el.inputmask.el = el, el.inputmask.maskset = maskset, el.inputmask.isRTL = !1, $.data(el, "_inputmask_opts", scopedOpts), 
                maskScope({
                    action: "mask",
                    el: el
                }));
            }), elems && elems[0] ? elems[0].inputmask || this : this;
        },
        option: function(options) {
            return "string" == typeof options ? this.opts[options] : "object" == typeof options ? ($.extend(this.opts, options), 
            $.extend(this.userOptions, options), this.el && (void 0 !== options.mask || void 0 !== options.alias ? this.mask(this.el) : ($.data(this.el, "_inputmask_opts", this.opts), 
            maskScope({
                action: "mask",
                el: this.el
            }))), this) : void 0;
        },
        unmaskedvalue: function(value) {
            return maskScope({
                action: "unmaskedvalue",
                el: this.el,
                value: value
            }, this.el && this.el.inputmask ? this.el.inputmask.maskset : generateMaskSet(this.opts, this.noMasksCache), this.opts);
        },
        remove: function() {
            return this.el ? (maskScope({
                action: "remove",
                el: this.el
            }), this.el.inputmask = void 0, this.el) : void 0;
        },
        getemptymask: function() {
            return maskScope({
                action: "getemptymask"
            }, this.maskset || generateMaskSet(this.opts, this.noMasksCache), this.opts);
        },
        hasMaskedValue: function() {
            return !this.opts.autoUnmask;
        },
        isComplete: function() {
            return maskScope({
                action: "isComplete",
                el: this.el
            }, this.maskset || generateMaskSet(this.opts, this.noMasksCache), this.opts);
        },
        getmetadata: function() {
            return maskScope({
                action: "getmetadata"
            }, this.maskset || generateMaskSet(this.opts, this.noMasksCache), this.opts);
        },
        isValid: function(value) {
            return maskScope({
                action: "isValid",
                value: value
            }, this.maskset || generateMaskSet(this.opts, this.noMasksCache), this.opts);
        },
        format: function(value, metadata) {
            return maskScope({
                action: "format",
                value: value,
                metadata: metadata
            }, this.maskset || generateMaskSet(this.opts, this.noMasksCache), this.opts);
        }
    }, Inputmask.extendDefaults = function(options) {
        $.extend(!0, Inputmask.prototype.defaults, options);
    }, Inputmask.extendDefinitions = function(definition) {
        $.extend(!0, Inputmask.prototype.defaults.definitions, definition);
    }, Inputmask.extendAliases = function(alias) {
        $.extend(!0, Inputmask.prototype.defaults.aliases, alias);
    }, Inputmask.format = function(value, options, metadata) {
        return Inputmask(options).format(value, metadata);
    }, Inputmask.unmask = function(value, options) {
        return Inputmask(options).unmaskedvalue(value);
    }, Inputmask.isValid = function(value, options) {
        return Inputmask(options).isValid(value);
    }, Inputmask.remove = function(elems) {
        $.each(elems, function(ndx, el) {
            el.inputmask && el.inputmask.remove();
        });
    }, Inputmask.escapeRegex = function(str) {
        var specials = [ "/", ".", "*", "+", "?", "|", "(", ")", "[", "]", "{", "}", "\\", "$", "^" ];
        return str.replace(new RegExp("(\\" + specials.join("|\\") + ")", "gim"), "\\$1");
    }, Inputmask.keyCode = {
        ALT: 18,
        BACKSPACE: 8,
        BACKSPACE_SAFARI: 127,
        CAPS_LOCK: 20,
        COMMA: 188,
        COMMAND: 91,
        COMMAND_LEFT: 91,
        COMMAND_RIGHT: 93,
        CONTROL: 17,
        DELETE: 46,
        DOWN: 40,
        END: 35,
        ENTER: 13,
        ESCAPE: 27,
        HOME: 36,
        INSERT: 45,
        LEFT: 37,
        MENU: 93,
        NUMPAD_ADD: 107,
        NUMPAD_DECIMAL: 110,
        NUMPAD_DIVIDE: 111,
        NUMPAD_ENTER: 108,
        NUMPAD_MULTIPLY: 106,
        NUMPAD_SUBTRACT: 109,
        PAGE_DOWN: 34,
        PAGE_UP: 33,
        PERIOD: 190,
        RIGHT: 39,
        SHIFT: 16,
        SPACE: 32,
        TAB: 9,
        UP: 38,
        WINDOWS: 91,
        X: 88
    };
    var ua = navigator.userAgent, mobile = /mobile/i.test(ua), iemobile = /iemobile/i.test(ua), iphone = /iphone/i.test(ua) && !iemobile;
    /android.*safari.*/i.test(ua) && !iemobile;
    return window.Inputmask = Inputmask, Inputmask;
}(jQuery), function($, Inputmask) {
    return void 0 === $.fn.inputmask && ($.fn.inputmask = function(fn, options) {
        var nptmask, input = this[0];
        if (void 0 === options && (options = {}), "string" == typeof fn) switch (fn) {
          case "unmaskedvalue":
            return input && input.inputmask ? input.inputmask.unmaskedvalue() : $(input).val();

          case "remove":
            return this.each(function() {
                this.inputmask && this.inputmask.remove();
            });

          case "getemptymask":
            return input && input.inputmask ? input.inputmask.getemptymask() : "";

          case "hasMaskedValue":
            return input && input.inputmask ? input.inputmask.hasMaskedValue() : !1;

          case "isComplete":
            return input && input.inputmask ? input.inputmask.isComplete() : !0;

          case "getmetadata":
            return input && input.inputmask ? input.inputmask.getmetadata() : void 0;

          case "setvalue":
            $(input).val(options), input && void 0 !== input.inputmask && $(input).triggerHandler("setvalue");
            break;

          case "option":
            if ("string" != typeof options) return this.each(function() {
                return void 0 !== this.inputmask ? this.inputmask.option(options) : void 0;
            });
            if (input && void 0 !== input.inputmask) return input.inputmask.option(options);
            break;

          default:
            return options.alias = fn, nptmask = new Inputmask(options), this.each(function() {
                nptmask.mask(this);
            });
        } else {
            if ("object" == typeof fn) return nptmask = new Inputmask(fn), void 0 === fn.mask && void 0 === fn.alias ? this.each(function() {
                return void 0 !== this.inputmask ? this.inputmask.option(fn) : void nptmask.mask(this);
            }) : this.each(function() {
                nptmask.mask(this);
            });
            if (void 0 === fn) return this.each(function() {
                nptmask = new Inputmask(options), nptmask.mask(this);
            });
        }
    }), $.fn.inputmask;
}(jQuery, Inputmask), function($, Inputmask) {
    return Inputmask.extendDefinitions({
        h: {
            validator: "[01][0-9]|2[0-3]",
            cardinality: 2,
            prevalidator: [ {
                validator: "[0-2]",
                cardinality: 1
            } ]
        },
        s: {
            validator: "[0-5][0-9]",
            cardinality: 2,
            prevalidator: [ {
                validator: "[0-5]",
                cardinality: 1
            } ]
        },
        d: {
            validator: "0[1-9]|[12][0-9]|3[01]",
            cardinality: 2,
            prevalidator: [ {
                validator: "[0-3]",
                cardinality: 1
            } ]
        },
        m: {
            validator: "0[1-9]|1[012]",
            cardinality: 2,
            prevalidator: [ {
                validator: "[01]",
                cardinality: 1
            } ]
        },
        y: {
            validator: "(19|20)\\d{2}",
            cardinality: 4,
            prevalidator: [ {
                validator: "[12]",
                cardinality: 1
            }, {
                validator: "(19|20)",
                cardinality: 2
            }, {
                validator: "(19|20)\\d",
                cardinality: 3
            } ]
        }
    }), Inputmask.extendAliases({
        "dd/mm/yyyy": {
            mask: "1/2/y",
            placeholder: "dd/mm/yyyy",
            regex: {
                val1pre: new RegExp("[0-3]"),
                val1: new RegExp("0[1-9]|[12][0-9]|3[01]"),
                val2pre: function(separator) {
                    var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                    return new RegExp("((0[1-9]|[12][0-9]|3[01])" + escapedSeparator + "[01])");
                },
                val2: function(separator) {
                    var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                    return new RegExp("((0[1-9]|[12][0-9])" + escapedSeparator + "(0[1-9]|1[012]))|(30" + escapedSeparator + "(0[13-9]|1[012]))|(31" + escapedSeparator + "(0[13578]|1[02]))");
                }
            },
            leapday: "29/02/",
            separator: "/",
            yearrange: {
                minyear: 1900,
                maxyear: 2099
            },
            isInYearRange: function(chrs, minyear, maxyear) {
                if (isNaN(chrs)) return !1;
                var enteredyear = parseInt(chrs.concat(minyear.toString().slice(chrs.length))), enteredyear2 = parseInt(chrs.concat(maxyear.toString().slice(chrs.length)));
                return (isNaN(enteredyear) ? !1 : enteredyear >= minyear && maxyear >= enteredyear) || (isNaN(enteredyear2) ? !1 : enteredyear2 >= minyear && maxyear >= enteredyear2);
            },
            determinebaseyear: function(minyear, maxyear, hint) {
                var currentyear = new Date().getFullYear();
                if (minyear > currentyear) return minyear;
                if (currentyear > maxyear) {
                    for (var maxYearPrefix = maxyear.toString().slice(0, 2), maxYearPostfix = maxyear.toString().slice(2, 4); maxYearPrefix + hint > maxyear; ) maxYearPrefix--;
                    var maxxYear = maxYearPrefix + maxYearPostfix;
                    return minyear > maxxYear ? minyear : maxxYear;
                }
                if (currentyear >= minyear && maxyear >= currentyear) {
                    for (var currentYearPrefix = currentyear.toString().slice(0, 2); currentYearPrefix + hint > maxyear; ) currentYearPrefix--;
                    var currentYearAndHint = currentYearPrefix + hint;
                    return minyear > currentYearAndHint ? minyear : currentYearAndHint;
                }
                return currentyear;
            },
            onKeyDown: function(e, buffer, caretPos, opts) {
                var $input = $(this);
                if (e.ctrlKey && e.keyCode === Inputmask.keyCode.RIGHT) {
                    var today = new Date();
                    $input.val(today.getDate().toString() + (today.getMonth() + 1).toString() + today.getFullYear().toString()), 
                    $input.trigger("setvalue");
                }
            },
            getFrontValue: function(mask, buffer, opts) {
                for (var start = 0, length = 0, i = 0; i < mask.length && "2" !== mask.charAt(i); i++) {
                    var definition = opts.definitions[mask.charAt(i)];
                    definition ? (start += length, length = definition.cardinality) : length++;
                }
                return buffer.join("").substr(start, length);
            },
            definitions: {
                "1": {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        var isValid = opts.regex.val1.test(chrs);
                        return strict || isValid || chrs.charAt(1) !== opts.separator && -1 === "-./".indexOf(chrs.charAt(1)) || !(isValid = opts.regex.val1.test("0" + chrs.charAt(0))) ? isValid : (maskset.buffer[pos - 1] = "0", 
                        {
                            refreshFromBuffer: {
                                start: pos - 1,
                                end: pos
                            },
                            pos: pos,
                            c: chrs.charAt(0)
                        });
                    },
                    cardinality: 2,
                    prevalidator: [ {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            var pchrs = chrs;
                            isNaN(maskset.buffer[pos + 1]) || (pchrs += maskset.buffer[pos + 1]);
                            var isValid = 1 === pchrs.length ? opts.regex.val1pre.test(pchrs) : opts.regex.val1.test(pchrs);
                            if (!strict && !isValid) {
                                if (isValid = opts.regex.val1.test(chrs + "0")) return maskset.buffer[pos] = chrs, 
                                maskset.buffer[++pos] = "0", {
                                    pos: pos,
                                    c: "0"
                                };
                                if (isValid = opts.regex.val1.test("0" + chrs)) return maskset.buffer[pos] = "0", 
                                pos++, {
                                    pos: pos
                                };
                            }
                            return isValid;
                        },
                        cardinality: 1
                    } ]
                },
                "2": {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        var frontValue = opts.getFrontValue(maskset.mask, maskset.buffer, opts);
                        -1 !== frontValue.indexOf(opts.placeholder[0]) && (frontValue = "01" + opts.separator);
                        var isValid = opts.regex.val2(opts.separator).test(frontValue + chrs);
                        if (!strict && !isValid && (chrs.charAt(1) === opts.separator || -1 !== "-./".indexOf(chrs.charAt(1))) && (isValid = opts.regex.val2(opts.separator).test(frontValue + "0" + chrs.charAt(0)))) return maskset.buffer[pos - 1] = "0", 
                        {
                            refreshFromBuffer: {
                                start: pos - 1,
                                end: pos
                            },
                            pos: pos,
                            c: chrs.charAt(0)
                        };
                        if (opts.mask.indexOf("2") === opts.mask.length - 1 && isValid) {
                            var dayMonthValue = maskset.buffer.join("").substr(4, 4) + chrs;
                            if (dayMonthValue !== opts.leapday) return !0;
                            var year = parseInt(maskset.buffer.join("").substr(0, 4), 10);
                            return year % 4 === 0 ? year % 100 === 0 ? year % 400 === 0 ? !0 : !1 : !0 : !1;
                        }
                        return isValid;
                    },
                    cardinality: 2,
                    prevalidator: [ {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            isNaN(maskset.buffer[pos + 1]) || (chrs += maskset.buffer[pos + 1]);
                            var frontValue = opts.getFrontValue(maskset.mask, maskset.buffer, opts);
                            -1 !== frontValue.indexOf(opts.placeholder[0]) && (frontValue = "01" + opts.separator);
                            var isValid = 1 === chrs.length ? opts.regex.val2pre(opts.separator).test(frontValue + chrs) : opts.regex.val2(opts.separator).test(frontValue + chrs);
                            return strict || isValid || !(isValid = opts.regex.val2(opts.separator).test(frontValue + "0" + chrs)) ? isValid : (maskset.buffer[pos] = "0", 
                            pos++, {
                                pos: pos
                            });
                        },
                        cardinality: 1
                    } ]
                },
                y: {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        if (opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear)) {
                            var dayMonthValue = maskset.buffer.join("").substr(0, 6);
                            if (dayMonthValue !== opts.leapday) return !0;
                            var year = parseInt(chrs, 10);
                            return year % 4 === 0 ? year % 100 === 0 ? year % 400 === 0 ? !0 : !1 : !0 : !1;
                        }
                        return !1;
                    },
                    cardinality: 4,
                    prevalidator: [ {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            var isValid = opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                            if (!strict && !isValid) {
                                var yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs + "0").toString().slice(0, 1);
                                if (isValid = opts.isInYearRange(yearPrefix + chrs, opts.yearrange.minyear, opts.yearrange.maxyear)) return maskset.buffer[pos++] = yearPrefix.charAt(0), 
                                {
                                    pos: pos
                                };
                                if (yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs + "0").toString().slice(0, 2), 
                                isValid = opts.isInYearRange(yearPrefix + chrs, opts.yearrange.minyear, opts.yearrange.maxyear)) return maskset.buffer[pos++] = yearPrefix.charAt(0), 
                                maskset.buffer[pos++] = yearPrefix.charAt(1), {
                                    pos: pos
                                };
                            }
                            return isValid;
                        },
                        cardinality: 1
                    }, {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            var isValid = opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                            if (!strict && !isValid) {
                                var yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs).toString().slice(0, 2);
                                if (isValid = opts.isInYearRange(chrs[0] + yearPrefix[1] + chrs[1], opts.yearrange.minyear, opts.yearrange.maxyear)) return maskset.buffer[pos++] = yearPrefix.charAt(1), 
                                {
                                    pos: pos
                                };
                                if (yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs).toString().slice(0, 2), 
                                opts.isInYearRange(yearPrefix + chrs, opts.yearrange.minyear, opts.yearrange.maxyear)) {
                                    var dayMonthValue = maskset.buffer.join("").substr(0, 6);
                                    if (dayMonthValue !== opts.leapday) isValid = !0; else {
                                        var year = parseInt(chrs, 10);
                                        isValid = year % 4 === 0 ? year % 100 === 0 ? year % 400 === 0 ? !0 : !1 : !0 : !1;
                                    }
                                } else isValid = !1;
                                if (isValid) return maskset.buffer[pos - 1] = yearPrefix.charAt(0), maskset.buffer[pos++] = yearPrefix.charAt(1), 
                                maskset.buffer[pos++] = chrs.charAt(0), {
                                    refreshFromBuffer: {
                                        start: pos - 3,
                                        end: pos
                                    },
                                    pos: pos
                                };
                            }
                            return isValid;
                        },
                        cardinality: 2
                    }, {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            return opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                        },
                        cardinality: 3
                    } ]
                }
            },
            insertMode: !1,
            autoUnmask: !1
        },
        "mm/dd/yyyy": {
            placeholder: "mm/dd/yyyy",
            alias: "dd/mm/yyyy",
            regex: {
                val2pre: function(separator) {
                    var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                    return new RegExp("((0[13-9]|1[012])" + escapedSeparator + "[0-3])|(02" + escapedSeparator + "[0-2])");
                },
                val2: function(separator) {
                    var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                    return new RegExp("((0[1-9]|1[012])" + escapedSeparator + "(0[1-9]|[12][0-9]))|((0[13-9]|1[012])" + escapedSeparator + "30)|((0[13578]|1[02])" + escapedSeparator + "31)");
                },
                val1pre: new RegExp("[01]"),
                val1: new RegExp("0[1-9]|1[012]")
            },
            leapday: "02/29/",
            onKeyDown: function(e, buffer, caretPos, opts) {
                var $input = $(this);
                if (e.ctrlKey && e.keyCode === Inputmask.keyCode.RIGHT) {
                    var today = new Date();
                    $input.val((today.getMonth() + 1).toString() + today.getDate().toString() + today.getFullYear().toString()), 
                    $input.trigger("setvalue");
                }
            }
        },
        "yyyy/mm/dd": {
            mask: "y/1/2",
            placeholder: "yyyy/mm/dd",
            alias: "mm/dd/yyyy",
            leapday: "/02/29",
            onKeyDown: function(e, buffer, caretPos, opts) {
                var $input = $(this);
                if (e.ctrlKey && e.keyCode === Inputmask.keyCode.RIGHT) {
                    var today = new Date();
                    $input.val(today.getFullYear().toString() + (today.getMonth() + 1).toString() + today.getDate().toString()), 
                    $input.trigger("setvalue");
                }
            }
        },
        "dd.mm.yyyy": {
            mask: "1.2.y",
            placeholder: "dd.mm.yyyy",
            leapday: "29.02.",
            separator: ".",
            alias: "dd/mm/yyyy"
        },
        "dd-mm-yyyy": {
            mask: "1-2-y",
            placeholder: "dd-mm-yyyy",
            leapday: "29-02-",
            separator: "-",
            alias: "dd/mm/yyyy"
        },
        "mm.dd.yyyy": {
            mask: "1.2.y",
            placeholder: "mm.dd.yyyy",
            leapday: "02.29.",
            separator: ".",
            alias: "mm/dd/yyyy"
        },
        "mm-dd-yyyy": {
            mask: "1-2-y",
            placeholder: "mm-dd-yyyy",
            leapday: "02-29-",
            separator: "-",
            alias: "mm/dd/yyyy"
        },
        "yyyy.mm.dd": {
            mask: "y.1.2",
            placeholder: "yyyy.mm.dd",
            leapday: ".02.29",
            separator: ".",
            alias: "yyyy/mm/dd"
        },
        "yyyy-mm-dd": {
            mask: "y-1-2",
            placeholder: "yyyy-mm-dd",
            leapday: "-02-29",
            separator: "-",
            alias: "yyyy/mm/dd"
        },
        datetime: {
            mask: "1/2/y h:s",
            placeholder: "dd/mm/yyyy hh:mm",
            alias: "dd/mm/yyyy",
            regex: {
                hrspre: new RegExp("[012]"),
                hrs24: new RegExp("2[0-4]|1[3-9]"),
                hrs: new RegExp("[01][0-9]|2[0-4]"),
                ampm: new RegExp("^[a|p|A|P][m|M]"),
                mspre: new RegExp("[0-5]"),
                ms: new RegExp("[0-5][0-9]")
            },
            timeseparator: ":",
            hourFormat: "24",
            definitions: {
                h: {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        if ("24" === opts.hourFormat && 24 === parseInt(chrs, 10)) return maskset.buffer[pos - 1] = "0", 
                        maskset.buffer[pos] = "0", {
                            refreshFromBuffer: {
                                start: pos - 1,
                                end: pos
                            },
                            c: "0"
                        };
                        var isValid = opts.regex.hrs.test(chrs);
                        if (!strict && !isValid && (chrs.charAt(1) === opts.timeseparator || -1 !== "-.:".indexOf(chrs.charAt(1))) && (isValid = opts.regex.hrs.test("0" + chrs.charAt(0)))) return maskset.buffer[pos - 1] = "0", 
                        maskset.buffer[pos] = chrs.charAt(0), pos++, {
                            refreshFromBuffer: {
                                start: pos - 2,
                                end: pos
                            },
                            pos: pos,
                            c: opts.timeseparator
                        };
                        if (isValid && "24" !== opts.hourFormat && opts.regex.hrs24.test(chrs)) {
                            var tmp = parseInt(chrs, 10);
                            return 24 === tmp ? (maskset.buffer[pos + 5] = "a", maskset.buffer[pos + 6] = "m") : (maskset.buffer[pos + 5] = "p", 
                            maskset.buffer[pos + 6] = "m"), tmp -= 12, 10 > tmp ? (maskset.buffer[pos] = tmp.toString(), 
                            maskset.buffer[pos - 1] = "0") : (maskset.buffer[pos] = tmp.toString().charAt(1), 
                            maskset.buffer[pos - 1] = tmp.toString().charAt(0)), {
                                refreshFromBuffer: {
                                    start: pos - 1,
                                    end: pos + 6
                                },
                                c: maskset.buffer[pos]
                            };
                        }
                        return isValid;
                    },
                    cardinality: 2,
                    prevalidator: [ {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            var isValid = opts.regex.hrspre.test(chrs);
                            return strict || isValid || !(isValid = opts.regex.hrs.test("0" + chrs)) ? isValid : (maskset.buffer[pos] = "0", 
                            pos++, {
                                pos: pos
                            });
                        },
                        cardinality: 1
                    } ]
                },
                s: {
                    validator: "[0-5][0-9]",
                    cardinality: 2,
                    prevalidator: [ {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            var isValid = opts.regex.mspre.test(chrs);
                            return strict || isValid || !(isValid = opts.regex.ms.test("0" + chrs)) ? isValid : (maskset.buffer[pos] = "0", 
                            pos++, {
                                pos: pos
                            });
                        },
                        cardinality: 1
                    } ]
                },
                t: {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        return opts.regex.ampm.test(chrs + "m");
                    },
                    casing: "lower",
                    cardinality: 1
                }
            },
            insertMode: !1,
            autoUnmask: !1
        },
        datetime12: {
            mask: "1/2/y h:s t\\m",
            placeholder: "dd/mm/yyyy hh:mm xm",
            alias: "datetime",
            hourFormat: "12"
        },
        "mm/dd/yyyy hh:mm xm": {
            mask: "1/2/y h:s t\\m",
            placeholder: "mm/dd/yyyy hh:mm xm",
            alias: "datetime12",
            regex: {
                val2pre: function(separator) {
                    var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                    return new RegExp("((0[13-9]|1[012])" + escapedSeparator + "[0-3])|(02" + escapedSeparator + "[0-2])");
                },
                val2: function(separator) {
                    var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                    return new RegExp("((0[1-9]|1[012])" + escapedSeparator + "(0[1-9]|[12][0-9]))|((0[13-9]|1[012])" + escapedSeparator + "30)|((0[13578]|1[02])" + escapedSeparator + "31)");
                },
                val1pre: new RegExp("[01]"),
                val1: new RegExp("0[1-9]|1[012]")
            },
            leapday: "02/29/",
            onKeyDown: function(e, buffer, caretPos, opts) {
                var $input = $(this);
                if (e.ctrlKey && e.keyCode === Inputmask.keyCode.RIGHT) {
                    var today = new Date();
                    $input.val((today.getMonth() + 1).toString() + today.getDate().toString() + today.getFullYear().toString()), 
                    $input.trigger("setvalue");
                }
            }
        },
        "hh:mm t": {
            mask: "h:s t\\m",
            placeholder: "hh:mm xm",
            alias: "datetime",
            hourFormat: "12"
        },
        "h:s t": {
            mask: "h:s t\\m",
            placeholder: "hh:mm xm",
            alias: "datetime",
            hourFormat: "12"
        },
        "hh:mm:ss": {
            mask: "h:s:s",
            placeholder: "hh:mm:ss",
            alias: "datetime",
            autoUnmask: !1
        },
        "hh:mm": {
            mask: "h:s",
            placeholder: "hh:mm",
            alias: "datetime",
            autoUnmask: !1
        },
        date: {
            alias: "dd/mm/yyyy"
        },
        "mm/yyyy": {
            mask: "1/y",
            placeholder: "mm/yyyy",
            leapday: "donotuse",
            separator: "/",
            alias: "mm/dd/yyyy"
        },
        shamsi: {
            regex: {
                val2pre: function(separator) {
                    var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                    return new RegExp("((0[1-9]|1[012])" + escapedSeparator + "[0-3])");
                },
                val2: function(separator) {
                    var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                    return new RegExp("((0[1-9]|1[012])" + escapedSeparator + "(0[1-9]|[12][0-9]))|((0[1-9]|1[012])" + escapedSeparator + "30)|((0[1-6])" + escapedSeparator + "31)");
                },
                val1pre: new RegExp("[01]"),
                val1: new RegExp("0[1-9]|1[012]")
            },
            yearrange: {
                minyear: 1300,
                maxyear: 1499
            },
            mask: "y/1/2",
            leapday: "/12/30",
            placeholder: "yyyy/mm/dd",
            alias: "mm/dd/yyyy",
            clearIncomplete: !0
        }
    }), Inputmask;
}(jQuery, Inputmask), function($, Inputmask) {
    return Inputmask.extendDefinitions({
        A: {
            validator: "[A-Za-z\u0410-\u044f\u0401\u0451\xc0-\xff\xb5]",
            cardinality: 1,
            casing: "upper"
        },
        "&": {
            validator: "[0-9A-Za-z\u0410-\u044f\u0401\u0451\xc0-\xff\xb5]",
            cardinality: 1,
            casing: "upper"
        },
        "#": {
            validator: "[0-9A-Fa-f]",
            cardinality: 1,
            casing: "upper"
        }
    }), Inputmask.extendAliases({
        url: {
            definitions: {
                i: {
                    validator: ".",
                    cardinality: 1
                }
            },
            mask: "(\\http://)|(\\http\\s://)|(ftp://)|(ftp\\s://)i{+}",
            insertMode: !1,
            autoUnmask: !1
        },
        ip: {
            mask: "i[i[i]].i[i[i]].i[i[i]].i[i[i]]",
            definitions: {
                i: {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        return pos - 1 > -1 && "." !== maskset.buffer[pos - 1] ? (chrs = maskset.buffer[pos - 1] + chrs, 
                        chrs = pos - 2 > -1 && "." !== maskset.buffer[pos - 2] ? maskset.buffer[pos - 2] + chrs : "0" + chrs) : chrs = "00" + chrs, 
                        new RegExp("25[0-5]|2[0-4][0-9]|[01][0-9][0-9]").test(chrs);
                    },
                    cardinality: 1
                }
            },
            onUnMask: function(maskedValue, unmaskedValue, opts) {
                return maskedValue;
            }
        },
        email: {
            mask: "*{1,64}[.*{1,64}][.*{1,64}][.*{1,63}]@-{1,63}[.-{1,63}][.-{1,63}][.-{1,63}]",
            greedy: !1,
            onBeforePaste: function(pastedValue, opts) {
                return pastedValue = pastedValue.toLowerCase(), pastedValue.replace("mailto:", "");
            },
            definitions: {
                "*": {
                    validator: "[0-9A-Za-z!#$%&'*+/=?^_`{|}~-]",
                    cardinality: 1,
                    casing: "lower"
                },
                "-": {
                    validator: "[0-9A-Za-z-]",
                    cardinality: 1,
                    casing: "lower"
                }
            },
            onUnMask: function(maskedValue, unmaskedValue, opts) {
                return maskedValue;
            }
        },
        mac: {
            mask: "##:##:##:##:##:##"
        },
        vin: {
            mask: "V{13}9{4}",
            definitions: {
                V: {
                    validator: "[A-HJ-NPR-Za-hj-npr-z\\d]",
                    cardinality: 1,
                    casing: "upper"
                }
            },
            clearIncomplete: !0,
            autoUnmask: !0
        }
    }), Inputmask;
}(jQuery, Inputmask), function($, Inputmask) {
    return Inputmask.extendAliases({
        numeric: {
            mask: function(opts) {
                function autoEscape(txt) {
                    for (var escapedTxt = "", i = 0; i < txt.length; i++) escapedTxt += opts.definitions[txt.charAt(i)] || opts.optionalmarker.start === txt.charAt(i) || opts.optionalmarker.end === txt.charAt(i) || opts.quantifiermarker.start === txt.charAt(i) || opts.quantifiermarker.end === txt.charAt(i) || opts.groupmarker.start === txt.charAt(i) || opts.groupmarker.end === txt.charAt(i) || opts.alternatormarker === txt.charAt(i) ? "\\" + txt.charAt(i) : txt.charAt(i);
                    return escapedTxt;
                }
                if (0 !== opts.repeat && isNaN(opts.integerDigits) && (opts.integerDigits = opts.repeat), 
                opts.repeat = 0, opts.groupSeparator === opts.radixPoint && ("." === opts.radixPoint ? opts.groupSeparator = "," : "," === opts.radixPoint ? opts.groupSeparator = "." : opts.groupSeparator = ""), 
                " " === opts.groupSeparator && (opts.skipOptionalPartCharacter = void 0), opts.autoGroup = opts.autoGroup && "" !== opts.groupSeparator, 
                opts.autoGroup && ("string" == typeof opts.groupSize && isFinite(opts.groupSize) && (opts.groupSize = parseInt(opts.groupSize)), 
                isFinite(opts.integerDigits))) {
                    var seps = Math.floor(opts.integerDigits / opts.groupSize), mod = opts.integerDigits % opts.groupSize;
                    opts.integerDigits = parseInt(opts.integerDigits) + (0 === mod ? seps - 1 : seps), 
                    opts.integerDigits < 1 && (opts.integerDigits = "*");
                }
                opts.placeholder.length > 1 && (opts.placeholder = opts.placeholder.charAt(0)), 
                opts.radixFocus = opts.radixFocus && "" !== opts.placeholder && opts.integerOptional === !0, 
                opts.definitions[";"] = opts.definitions["~"], opts.definitions[";"].definitionSymbol = "~", 
                opts.numericInput === !0 && (opts.radixFocus = !1, opts.digitsOptional = !1, isNaN(opts.digits) && (opts.digits = 2), 
                opts.decimalProtect = !1);
                var mask = autoEscape(opts.prefix);
                return mask += "[+]", mask += opts.integerOptional === !0 ? "~{1," + opts.integerDigits + "}" : "~{" + opts.integerDigits + "}", 
                void 0 !== opts.digits && (isNaN(opts.digits) || parseInt(opts.digits) > 0) && (opts.decimalProtect && (opts.radixPointDefinitionSymbol = ":"), 
                mask += opts.digitsOptional ? "[" + (opts.decimalProtect ? ":" : opts.radixPoint) + ";{1," + opts.digits + "}]" : (opts.decimalProtect ? ":" : opts.radixPoint) + ";{" + opts.digits + "}"), 
                mask += "[-]", mask += autoEscape(opts.suffix), opts.greedy = !1, mask;
            },
            placeholder: "",
            greedy: !1,
            digits: "*",
            digitsOptional: !0,
            radixPoint: ".",
            radixFocus: !0,
            groupSize: 3,
            groupSeparator: "",
            autoGroup: !1,
            allowPlus: !0,
            allowMinus: !0,
            negationSymbol: {
                front: "-",
                back: ""
            },
            integerDigits: "+",
            integerOptional: !0,
            prefix: "",
            suffix: "",
            rightAlign: !0,
            decimalProtect: !0,
            min: null,
            max: null,
            step: 1,
            insertMode: !0,
            autoUnmask: !1,
            unmaskAsNumber: !1,
            postFormat: function(buffer, pos, opts) {
                opts.numericInput === !0 && (buffer = buffer.reverse(), isFinite(pos) && (pos = buffer.join("").length - pos - 1));
                var i, l, suffixStripped = !1;
                buffer.length >= opts.suffix.length && buffer.join("").indexOf(opts.suffix) === buffer.length - opts.suffix.length && (buffer.length = buffer.length - opts.suffix.length, 
                suffixStripped = !0), pos = pos >= buffer.length ? buffer.length - 1 : pos < opts.prefix.length ? opts.prefix.length : pos;
                var needsRefresh = !1, charAtPos = buffer[pos], cbuf = buffer.slice();
                charAtPos === opts.groupSeparator && (cbuf.splice(pos--, 1), charAtPos = cbuf[pos]), 
                charAtPos !== opts.radixPoint && charAtPos !== opts.negationSymbol.front && charAtPos !== opts.negationSymbol.back && (cbuf[pos] = "?");
                var bufVal = cbuf.join(""), bufValOrigin = bufVal;
                if (bufVal.length > 0 && opts.autoGroup || -1 !== bufVal.indexOf(opts.groupSeparator)) {
                    var escapedGroupSeparator = Inputmask.escapeRegex(opts.groupSeparator);
                    needsRefresh = 0 === bufVal.indexOf(opts.groupSeparator), bufVal = bufVal.replace(new RegExp(escapedGroupSeparator, "g"), "");
                    var radixSplit = bufVal.split(opts.radixPoint);
                    if (bufVal = "" === opts.radixPoint ? bufVal : radixSplit[0], bufVal !== opts.prefix + "?0" && bufVal.length >= opts.groupSize + opts.prefix.length) for (var reg = new RegExp("([-+]?[\\d?]+)([\\d?]{" + opts.groupSize + "})"); reg.test(bufVal) && "" !== opts.groupSeparator; ) bufVal = bufVal.replace(reg, "$1" + opts.groupSeparator + "$2"), 
                    bufVal = bufVal.replace(opts.groupSeparator + opts.groupSeparator, opts.groupSeparator);
                    "" !== opts.radixPoint && radixSplit.length > 1 && (bufVal += opts.radixPoint + radixSplit[1]);
                }
                for (needsRefresh = bufValOrigin !== bufVal, buffer.length = bufVal.length, i = 0, 
                l = bufVal.length; l > i; i++) buffer[i] = bufVal.charAt(i);
                var newPos = $.inArray("?", buffer);
                if (-1 === newPos && (newPos = $.inArray(charAtPos, buffer)), buffer[newPos] = charAtPos, 
                !needsRefresh && suffixStripped) for (i = 0, l = opts.suffix.length; l > i; i++) buffer.push(opts.suffix.charAt(i));
                return newPos = opts.numericInput && isFinite(pos) ? buffer.join("").length - newPos - 1 : newPos, 
                opts.numericInput && (buffer = buffer.reverse(), $.inArray(opts.radixPoint, buffer) < newPos && buffer.join("").length - opts.suffix.length !== newPos && (newPos -= 1)), 
                {
                    pos: newPos,
                    refreshFromBuffer: needsRefresh,
                    buffer: buffer
                };
            },
            onBeforeWrite: function(e, buffer, caretPos, opts) {
                var rslt;
                if (e && ("blur" === e.type || "checkval" === e.type || "keydown" === e.type)) {
                    var maskedValue = opts.numericInput ? buffer.slice().reverse().join("") : buffer.join(""), processValue = maskedValue.replace(opts.prefix, "");
                    processValue = processValue.replace(opts.suffix, ""), processValue = processValue.replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), ""), 
                    "," === opts.radixPoint && (processValue = processValue.replace(opts.radixPoint, "."));
                    var isNegative = processValue.match(new RegExp("[-" + Inputmask.escapeRegex(opts.negationSymbol.front) + "]", "g"));
                    if (isNegative = null !== isNegative && 1 === isNegative.length, processValue = processValue.replace(new RegExp("[-" + Inputmask.escapeRegex(opts.negationSymbol.front) + "]", "g"), ""), 
                    processValue = processValue.replace(new RegExp(Inputmask.escapeRegex(opts.negationSymbol.back) + "$"), ""), 
                    processValue = processValue === opts.negationSymbol.front ? processValue + "0" : processValue, 
                    "" !== processValue && isFinite(processValue)) {
                        var floatValue = parseFloat(processValue), signedFloatValue = isNegative ? -1 * floatValue : floatValue;
                        if (null !== opts.min && isFinite(opts.min) && signedFloatValue < parseFloat(opts.min) ? (floatValue = Math.abs(opts.min), 
                        isNegative = opts.min < 0) : null !== opts.max && isFinite(opts.max) && signedFloatValue > parseFloat(opts.max) && (floatValue = Math.abs(opts.max), 
                        isNegative = opts.max < 0), processValue = floatValue.toString().replace(".", opts.radixPoint).split(""), 
                        isFinite(opts.digits)) {
                            var radixPosition = $.inArray(opts.radixPoint, processValue), rpb = $.inArray(opts.radixPoint, maskedValue);
                            -1 === radixPosition && (processValue.push(opts.radixPoint), radixPosition = processValue.length - 1);
                            for (var i = 1; i <= opts.digits; i++) opts.digitsOptional || void 0 !== processValue[radixPosition + i] && processValue[radixPosition + i] !== opts.placeholder.charAt(0) ? -1 !== rpb && void 0 !== maskedValue[rpb + i] && (processValue[radixPosition + i] = processValue[radixPosition + i] || maskedValue[rpb + i]) : processValue[radixPosition + i] = "0";
                            processValue[processValue.length - 1] === opts.radixPoint && delete processValue[processValue.length - 1];
                        }
                        if (floatValue.toString() !== processValue && floatValue.toString() + "." !== processValue || isNegative) return !isNegative || 0 === floatValue && "blur" === e.type || (processValue.unshift(opts.negationSymbol.front), 
                        processValue.push(opts.negationSymbol.back)), processValue = (opts.prefix + processValue.join("")).split(""), 
                        opts.numericInput && (processValue = processValue.reverse()), rslt = opts.postFormat(processValue, opts.numericInput ? caretPos : caretPos - 1, opts), 
                        rslt.buffer && (rslt.refreshFromBuffer = rslt.buffer.join("") !== buffer.join("")), 
                        rslt;
                    }
                }
                return opts.autoGroup ? (rslt = opts.postFormat(buffer, opts.numericInput ? caretPos : caretPos - 1, opts), 
                rslt.caret = caretPos <= opts.prefix.length ? rslt.pos : rslt.pos + 1, rslt) : void 0;
            },
            regex: {
                integerPart: function(opts) {
                    return new RegExp("[" + Inputmask.escapeRegex(opts.negationSymbol.front) + "+]?\\d+");
                },
                integerNPart: function(opts) {
                    return new RegExp("[\\d" + Inputmask.escapeRegex(opts.groupSeparator) + Inputmask.escapeRegex(opts.placeholder.charAt(0)) + "]+");
                }
            },
            signHandler: function(chrs, maskset, pos, strict, opts) {
                if (!strict && opts.allowMinus && "-" === chrs || opts.allowPlus && "+" === chrs) {
                    var matchRslt = maskset.buffer.join("").match(opts.regex.integerPart(opts));
                    if (matchRslt && matchRslt[0].length > 0) return maskset.buffer[matchRslt.index] === ("-" === chrs ? "+" : opts.negationSymbol.front) ? "-" === chrs ? "" !== opts.negationSymbol.back ? {
                        pos: matchRslt.index,
                        c: opts.negationSymbol.front,
                        remove: matchRslt.index,
                        caret: pos,
                        insert: {
                            pos: maskset.buffer.length - opts.suffix.length - 1,
                            c: opts.negationSymbol.back
                        }
                    } : {
                        pos: matchRslt.index,
                        c: opts.negationSymbol.front,
                        remove: matchRslt.index,
                        caret: pos
                    } : "" !== opts.negationSymbol.back ? {
                        pos: matchRslt.index,
                        c: "+",
                        remove: [ matchRslt.index, maskset.buffer.length - opts.suffix.length - 1 ],
                        caret: pos
                    } : {
                        pos: matchRslt.index,
                        c: "+",
                        remove: matchRslt.index,
                        caret: pos
                    } : maskset.buffer[matchRslt.index] === ("-" === chrs ? opts.negationSymbol.front : "+") ? "-" === chrs && "" !== opts.negationSymbol.back ? {
                        remove: [ matchRslt.index, maskset.buffer.length - opts.suffix.length - 1 ],
                        caret: pos - 1
                    } : {
                        remove: matchRslt.index,
                        caret: pos - 1
                    } : "-" === chrs ? "" !== opts.negationSymbol.back ? {
                        pos: matchRslt.index,
                        c: opts.negationSymbol.front,
                        caret: pos + 1,
                        insert: {
                            pos: maskset.buffer.length - opts.suffix.length,
                            c: opts.negationSymbol.back
                        }
                    } : {
                        pos: matchRslt.index,
                        c: opts.negationSymbol.front,
                        caret: pos + 1
                    } : {
                        pos: matchRslt.index,
                        c: chrs,
                        caret: pos + 1
                    };
                }
                return !1;
            },
            radixHandler: function(chrs, maskset, pos, strict, opts) {
                if (!strict && opts.numericInput !== !0 && chrs === opts.radixPoint && void 0 !== opts.digits && (isNaN(opts.digits) || parseInt(opts.digits) > 0)) {
                    var radixPos = $.inArray(opts.radixPoint, maskset.buffer), integerValue = maskset.buffer.join("").match(opts.regex.integerPart(opts));
                    if (-1 !== radixPos && maskset.validPositions[radixPos]) return maskset.validPositions[radixPos - 1] ? {
                        caret: radixPos + 1
                    } : {
                        pos: integerValue.index,
                        c: integerValue[0],
                        caret: radixPos + 1
                    };
                    if (!integerValue || "0" === integerValue[0] && integerValue.index + 1 !== pos) return maskset.buffer[integerValue ? integerValue.index : pos] = "0", 
                    {
                        pos: (integerValue ? integerValue.index : pos) + 1,
                        c: opts.radixPoint
                    };
                }
                return !1;
            },
            leadingZeroHandler: function(chrs, maskset, pos, strict, opts, isSelection) {
                if (!strict) if (opts.numericInput === !0) {
                    var buffer = maskset.buffer.slice("").reverse(), char = buffer[opts.prefix.length];
                    if ("0" === char) return {
                        pos: pos,
                        remove: buffer.length - opts.prefix.length - 1
                    };
                } else {
                    var radixPosition = $.inArray(opts.radixPoint, maskset.buffer), matchRslt = maskset.buffer.slice(0, -1 !== radixPosition ? radixPosition : void 0).join("").match(opts.regex.integerNPart(opts));
                    if (matchRslt && (-1 === radixPosition || radixPosition >= pos)) {
                        var decimalPart = -1 === radixPosition ? 0 : parseInt(maskset.buffer.slice(radixPosition + 1).join(""));
                        if (0 === matchRslt[0].indexOf("" !== opts.placeholder ? opts.placeholder.charAt(0) : "0") && (matchRslt.index + 1 === pos || isSelection !== !0 && 0 === decimalPart)) return maskset.buffer.splice(matchRslt.index, 1), 
                        pos = matchRslt.index, {
                            pos: pos,
                            remove: matchRslt.index
                        };
                        if ("0" === chrs && pos <= matchRslt.index && matchRslt[0] !== opts.groupSeparator) return !1;
                    }
                }
                return !0;
            },
            definitions: {
                "~": {
                    validator: function(chrs, maskset, pos, strict, opts, isSelection) {
                        var isValid = opts.signHandler(chrs, maskset, pos, strict, opts);
                        if (!isValid && (isValid = opts.radixHandler(chrs, maskset, pos, strict, opts), 
                        !isValid && (isValid = strict ? new RegExp("[0-9" + Inputmask.escapeRegex(opts.groupSeparator) + "]").test(chrs) : new RegExp("[0-9]").test(chrs), 
                        isValid === !0 && (isValid = opts.leadingZeroHandler(chrs, maskset, pos, strict, opts, isSelection), 
                        isValid === !0)))) {
                            var radixPosition = $.inArray(opts.radixPoint, maskset.buffer);
                            isValid = -1 !== radixPosition && (opts.digitsOptional === !1 || maskset.validPositions[pos]) && opts.numericInput !== !0 && pos > radixPosition && !strict ? {
                                pos: pos,
                                remove: pos
                            } : {
                                pos: pos
                            };
                        }
                        return isValid;
                    },
                    cardinality: 1
                },
                "+": {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        var isValid = opts.signHandler(chrs, maskset, pos, strict, opts);
                        return !isValid && (strict && opts.allowMinus && chrs === opts.negationSymbol.front || opts.allowMinus && "-" === chrs || opts.allowPlus && "+" === chrs) && (isValid = strict || "-" !== chrs ? !0 : "" !== opts.negationSymbol.back ? {
                            pos: pos,
                            c: "-" === chrs ? opts.negationSymbol.front : "+",
                            caret: pos + 1,
                            insert: {
                                pos: maskset.buffer.length,
                                c: opts.negationSymbol.back
                            }
                        } : {
                            pos: pos,
                            c: "-" === chrs ? opts.negationSymbol.front : "+",
                            caret: pos + 1
                        }), isValid;
                    },
                    cardinality: 1,
                    placeholder: ""
                },
                "-": {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        var isValid = opts.signHandler(chrs, maskset, pos, strict, opts);
                        return !isValid && strict && opts.allowMinus && chrs === opts.negationSymbol.back && (isValid = !0), 
                        isValid;
                    },
                    cardinality: 1,
                    placeholder: ""
                },
                ":": {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        var isValid = opts.signHandler(chrs, maskset, pos, strict, opts);
                        if (!isValid) {
                            var radix = "[" + Inputmask.escapeRegex(opts.radixPoint) + "]";
                            isValid = new RegExp(radix).test(chrs), isValid && maskset.validPositions[pos] && maskset.validPositions[pos].match.placeholder === opts.radixPoint && (isValid = {
                                caret: pos + 1
                            });
                        }
                        return isValid ? {
                            c: opts.radixPoint
                        } : isValid;
                    },
                    cardinality: 1,
                    placeholder: function(opts) {
                        return opts.radixPoint;
                    }
                }
            },
            onUnMask: function(maskedValue, unmaskedValue, opts) {
                var processValue = maskedValue.replace(opts.prefix, "");
                return processValue = processValue.replace(opts.suffix, ""), processValue = processValue.replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), ""), 
                opts.unmaskAsNumber ? ("" !== opts.radixPoint && -1 !== processValue.indexOf(opts.radixPoint) && (processValue = processValue.replace(Inputmask.escapeRegex.call(this, opts.radixPoint), ".")), 
                Number(processValue)) : processValue;
            },
            isComplete: function(buffer, opts) {
                var maskedValue = buffer.join(""), bufClone = buffer.slice();
                if (opts.postFormat(bufClone, 0, opts), bufClone.join("") !== maskedValue) return !1;
                var processValue = maskedValue.replace(opts.prefix, "");
                return processValue = processValue.replace(opts.suffix, ""), processValue = processValue.replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), ""), 
                "," === opts.radixPoint && (processValue = processValue.replace(Inputmask.escapeRegex(opts.radixPoint), ".")), 
                isFinite(processValue);
            },
            onBeforeMask: function(initialValue, opts) {
                if ("" !== opts.radixPoint && isFinite(initialValue)) initialValue = initialValue.toString().replace(".", opts.radixPoint); else {
                    var kommaMatches = initialValue.match(/,/g), dotMatches = initialValue.match(/\./g);
                    dotMatches && kommaMatches ? dotMatches.length > kommaMatches.length ? (initialValue = initialValue.replace(/\./g, ""), 
                    initialValue = initialValue.replace(",", opts.radixPoint)) : kommaMatches.length > dotMatches.length ? (initialValue = initialValue.replace(/,/g, ""), 
                    initialValue = initialValue.replace(".", opts.radixPoint)) : initialValue = initialValue.indexOf(".") < initialValue.indexOf(",") ? initialValue.replace(/\./g, "") : initialValue = initialValue.replace(/,/g, "") : initialValue = initialValue.replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), "");
                }
                if (0 === opts.digits && (-1 !== initialValue.indexOf(".") ? initialValue = initialValue.substring(0, initialValue.indexOf(".")) : -1 !== initialValue.indexOf(",") && (initialValue = initialValue.substring(0, initialValue.indexOf(",")))), 
                "" !== opts.radixPoint && isFinite(opts.digits) && -1 !== initialValue.indexOf(opts.radixPoint)) {
                    var valueParts = initialValue.split(opts.radixPoint), decPart = valueParts[1].match(new RegExp("\\d*"))[0];
                    if (parseInt(opts.digits) < decPart.toString().length) {
                        var digitsFactor = Math.pow(10, parseInt(opts.digits));
                        initialValue = initialValue.replace(Inputmask.escapeRegex(opts.radixPoint), "."), 
                        initialValue = Math.round(parseFloat(initialValue) * digitsFactor) / digitsFactor, 
                        initialValue = initialValue.toString().replace(".", opts.radixPoint);
                    }
                }
                return initialValue.toString();
            },
            canClearPosition: function(maskset, position, lvp, strict, opts) {
                var positionInput = maskset.validPositions[position].input, canClear = positionInput !== opts.radixPoint || null !== maskset.validPositions[position].match.fn && opts.decimalProtect === !1 || isFinite(positionInput) || position === lvp || positionInput === opts.groupSeparator || positionInput === opts.negationSymbol.front || positionInput === opts.negationSymbol.back;
                return canClear;
            },
            onKeyDown: function(e, buffer, caretPos, opts) {
                var $input = $(this);
                if (e.ctrlKey) switch (e.keyCode) {
                  case Inputmask.keyCode.UP:
                    $input.val(parseFloat(this.inputmask.unmaskedvalue()) + parseInt(opts.step)), $input.trigger("setvalue");
                    break;

                  case Inputmask.keyCode.DOWN:
                    $input.val(parseFloat(this.inputmask.unmaskedvalue()) - parseInt(opts.step)), $input.trigger("setvalue");
                }
            }
        },
        currency: {
            prefix: "$ ",
            groupSeparator: ",",
            alias: "numeric",
            placeholder: "0",
            autoGroup: !0,
            digits: 2,
            digitsOptional: !1,
            clearMaskOnLostFocus: !1
        },
        decimal: {
            alias: "numeric"
        },
        integer: {
            alias: "numeric",
            digits: 0,
            radixPoint: ""
        },
        percentage: {
            alias: "numeric",
            digits: 2,
            radixPoint: ".",
            placeholder: "0",
            autoGroup: !1,
            min: 0,
            max: 100,
            suffix: " %",
            allowPlus: !1,
            allowMinus: !1
        }
    }), Inputmask;
}(jQuery, Inputmask), function($, Inputmask) {
    return Inputmask.extendAliases({
        phone: {
            url: "phone-codes/phone-codes.js",
            countrycode: "",
            phoneCodeCache: {},
            mask: function(opts) {
                if (void 0 === opts.phoneCodeCache[opts.url]) {
                    var maskList = [];
                    opts.definitions["#"] = opts.definitions[9], $.ajax({
                        url: opts.url,
                        async: !1,
                        type: "get",
                        dataType: "json",
                        success: function(response) {
                            maskList = response;
                        },
                        error: function(xhr, ajaxOptions, thrownError) {
                            alert(thrownError + " - " + opts.url);
                        }
                    }), opts.phoneCodeCache[opts.url] = maskList.sort(function(a, b) {
                        return (a.mask || a) < (b.mask || b) ? -1 : 1;
                    });
                }
                return opts.phoneCodeCache[opts.url];
            },
            keepStatic: !1,
            nojumps: !0,
            nojumpsThreshold: 1,
            onBeforeMask: function(value, opts) {
                var processedValue = value.replace(/^0{1,2}/, "").replace(/[\s]/g, "");
                return (processedValue.indexOf(opts.countrycode) > 1 || -1 === processedValue.indexOf(opts.countrycode)) && (processedValue = "+" + opts.countrycode + processedValue), 
                processedValue;
            }
        },
        phonebe: {
            alias: "phone",
            url: "phone-codes/phone-be.js",
            countrycode: "32",
            nojumpsThreshold: 4
        }
    }), Inputmask;
}(jQuery, Inputmask), function($, Inputmask) {
    return Inputmask.extendAliases({
        Regex: {
            mask: "r",
            greedy: !1,
            repeat: "*",
            regex: null,
            regexTokens: null,
            tokenizer: /\[\^?]?(?:[^\\\]]+|\\[\S\s]?)*]?|\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9][0-9]*|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)|\((?:\?[:=!]?)?|(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??|[^.?*+^${[()|\\]+|./g,
            quantifierFilter: /[0-9]+[^,]/,
            isComplete: function(buffer, opts) {
                return new RegExp(opts.regex).test(buffer.join(""));
            },
            definitions: {
                r: {
                    validator: function(chrs, maskset, pos, strict, opts) {
                        function RegexToken(isGroup, isQuantifier) {
                            this.matches = [], this.isGroup = isGroup || !1, this.isQuantifier = isQuantifier || !1, 
                            this.quantifier = {
                                min: 1,
                                max: 1
                            }, this.repeaterPart = void 0;
                        }
                        function analyseRegex() {
                            var match, m, currentToken = new RegexToken(), opengroups = [];
                            for (opts.regexTokens = []; match = opts.tokenizer.exec(opts.regex); ) switch (m = match[0], 
                            m.charAt(0)) {
                              case "(":
                                opengroups.push(new RegexToken(!0));
                                break;

                              case ")":
                                groupToken = opengroups.pop(), opengroups.length > 0 ? opengroups[opengroups.length - 1].matches.push(groupToken) : currentToken.matches.push(groupToken);
                                break;

                              case "{":
                              case "+":
                              case "*":
                                var quantifierToken = new RegexToken(!1, !0);
                                m = m.replace(/[{}]/g, "");
                                var mq = m.split(","), mq0 = isNaN(mq[0]) ? mq[0] : parseInt(mq[0]), mq1 = 1 === mq.length ? mq0 : isNaN(mq[1]) ? mq[1] : parseInt(mq[1]);
                                if (quantifierToken.quantifier = {
                                    min: mq0,
                                    max: mq1
                                }, opengroups.length > 0) {
                                    var matches = opengroups[opengroups.length - 1].matches;
                                    match = matches.pop(), match.isGroup || (groupToken = new RegexToken(!0), groupToken.matches.push(match), 
                                    match = groupToken), matches.push(match), matches.push(quantifierToken);
                                } else match = currentToken.matches.pop(), match.isGroup || (groupToken = new RegexToken(!0), 
                                groupToken.matches.push(match), match = groupToken), currentToken.matches.push(match), 
                                currentToken.matches.push(quantifierToken);
                                break;

                              default:
                                opengroups.length > 0 ? opengroups[opengroups.length - 1].matches.push(m) : currentToken.matches.push(m);
                            }
                            currentToken.matches.length > 0 && opts.regexTokens.push(currentToken);
                        }
                        function validateRegexToken(token, fromGroup) {
                            var isvalid = !1;
                            fromGroup && (regexPart += "(", openGroupCount++);
                            for (var mndx = 0; mndx < token.matches.length; mndx++) {
                                var matchToken = token.matches[mndx];
                                if (matchToken.isGroup === !0) isvalid = validateRegexToken(matchToken, !0); else if (matchToken.isQuantifier === !0) {
                                    var crrntndx = $.inArray(matchToken, token.matches), matchGroup = token.matches[crrntndx - 1], regexPartBak = regexPart;
                                    if (isNaN(matchToken.quantifier.max)) {
                                        for (;matchToken.repeaterPart && matchToken.repeaterPart !== regexPart && matchToken.repeaterPart.length > regexPart.length && !(isvalid = validateRegexToken(matchGroup, !0)); ) ;
                                        isvalid = isvalid || validateRegexToken(matchGroup, !0), isvalid && (matchToken.repeaterPart = regexPart), 
                                        regexPart = regexPartBak + matchToken.quantifier.max;
                                    } else {
                                        for (var i = 0, qm = matchToken.quantifier.max - 1; qm > i && !(isvalid = validateRegexToken(matchGroup, !0)); i++) ;
                                        regexPart = regexPartBak + "{" + matchToken.quantifier.min + "," + matchToken.quantifier.max + "}";
                                    }
                                } else if (void 0 !== matchToken.matches) for (var k = 0; k < matchToken.length && !(isvalid = validateRegexToken(matchToken[k], fromGroup)); k++) ; else {
                                    var testExp;
                                    if ("[" == matchToken.charAt(0)) {
                                        testExp = regexPart, testExp += matchToken;
                                        for (var j = 0; openGroupCount > j; j++) testExp += ")";
                                        var exp = new RegExp("^(" + testExp + ")$");
                                        isvalid = exp.test(bufferStr);
                                    } else for (var l = 0, tl = matchToken.length; tl > l; l++) if ("\\" !== matchToken.charAt(l)) {
                                        testExp = regexPart, testExp += matchToken.substr(0, l + 1), testExp = testExp.replace(/\|$/, "");
                                        for (var j = 0; openGroupCount > j; j++) testExp += ")";
                                        var exp = new RegExp("^(" + testExp + ")$");
                                        if (isvalid = exp.test(bufferStr)) break;
                                    }
                                    regexPart += matchToken;
                                }
                                if (isvalid) break;
                            }
                            return fromGroup && (regexPart += ")", openGroupCount--), isvalid;
                        }
                        var bufferStr, groupToken, cbuffer = maskset.buffer.slice(), regexPart = "", isValid = !1, openGroupCount = 0;
                        null === opts.regexTokens && analyseRegex(), cbuffer.splice(pos, 0, chrs), bufferStr = cbuffer.join("");
                        for (var i = 0; i < opts.regexTokens.length; i++) {
                            var regexToken = opts.regexTokens[i];
                            if (isValid = validateRegexToken(regexToken, regexToken.isGroup)) break;
                        }
                        return isValid;
                    },
                    cardinality: 1
                }
            }
        }
    }), Inputmask;
}(jQuery, Inputmask);
/*

Uniform v2.1.2
Copyright © 2009 Josh Pyles / Pixelmatrix Design LLC
http://pixelmatrixdesign.com

Requires jQuery 1.3 or newer

Much thanks to Thomas Reynolds and Buck Wilson for their help and advice on
this.

Disabling text selection is made possible by Mathias Bynens
<http://mathiasbynens.be/> and his noSelect plugin.
<https://github.com/mathiasbynens/jquery-noselect>, which is embedded.

Also, thanks to David Kaneda and Eugene Bond for their contributions to the
plugin.

Tyler Akins has also rewritten chunks of the plugin, helped close many issues,
and ensured version 2 got out the door.

License:
MIT License - http://www.opensource.org/licenses/mit-license.php

Enjoy!

*/
/*global jQuery, document, navigator*/

(function (wind, $, undef) {
    "use strict";

    /**
     * Use .prop() if jQuery supports it, otherwise fall back to .attr()
     *
     * @param jQuery $el jQuery'd element on which we're calling attr/prop
     * @param ... All other parameters are passed to jQuery's function
     * @return The result from jQuery
     */
    function attrOrProp($el) {
        var args = Array.prototype.slice.call(arguments, 1);

        if ($el.prop) {
            // jQuery 1.6+
            return $el.prop.apply($el, args);
        }

        // jQuery 1.5 and below
        return $el.attr.apply($el, args);
    }

    /**
     * For backwards compatibility with older jQuery libraries, only bind
     * one thing at a time.  Also, this function adds our namespace to
     * events in one consistent location, shrinking the minified code.
     *
     * The properties on the events object are the names of the events
     * that we are supposed to add to.  It can be a space separated list.
     * The namespace will be added automatically.
     *
     * @param jQuery $el
     * @param Object options Uniform options for this element
     * @param Object events Events to bind, properties are event names
     */
    function bindMany($el, options, events) {
        var name, namespaced;

        for (name in events) {
            if (events.hasOwnProperty(name)) {
                namespaced = name.replace(/ |$/g, options.eventNamespace);
                $el.bind(namespaced, events[name]);
            }
        }
    }

    /**
     * Bind the hover, active, focus, and blur UI updates
     *
     * @param jQuery $el Original element
     * @param jQuery $target Target for the events (our div/span)
     * @param Object options Uniform options for the element $target
     */
    function bindUi($el, $target, options) {
        bindMany($el, options, {
            focus: function () {
                $target.addClass(options.focusClass);
            },
            blur: function () {
                $target.removeClass(options.focusClass);
                $target.removeClass(options.activeClass);
            },
            mouseenter: function () {
                $target.addClass(options.hoverClass);
            },
            mouseleave: function () {
                $target.removeClass(options.hoverClass);
                $target.removeClass(options.activeClass);
            },
            "mousedown touchbegin": function () {
                if (!$el.is(":disabled")) {
                    $target.addClass(options.activeClass);
                }
            },
            "mouseup touchend": function () {
                $target.removeClass(options.activeClass);
            }
        });
    }

    /**
     * Remove the hover, focus, active classes.
     *
     * @param jQuery $el Element with classes
     * @param Object options Uniform options for the element
     */
    function classClearStandard($el, options) {
        $el.removeClass(options.hoverClass + " " + options.focusClass + " " + options.activeClass);
    }

    /**
     * Add or remove a class, depending on if it's "enabled"
     *
     * @param jQuery $el Element that has the class added/removed
     * @param String className Class or classes to add/remove
     * @param Boolean enabled True to add the class, false to remove
     */
    function classUpdate($el, className, enabled) {
        if (enabled) {
            $el.addClass(className);
        } else {
            $el.removeClass(className);
        }
    }

    /**
     * Updating the "checked" property can be a little tricky.  This
     * changed in jQuery 1.6 and now we can pass booleans to .prop().
     * Prior to that, one either adds an attribute ("checked=checked") or
     * removes the attribute.
     *
     * @param jQuery $tag Our Uniform span/div
     * @param jQuery $el Original form element
     * @param Object options Uniform options for this element
     */
    function classUpdateChecked($tag, $el, options) {
        var c = "checked",
            isChecked = $el.is(":" + c);

        if ($el.prop) {
            // jQuery 1.6+
            $el.prop(c, isChecked);
        } else {
            // jQuery 1.5 and below
            if (isChecked) {
                $el.attr(c, c);
            } else {
                $el.removeAttr(c);
            }
        }

        classUpdate($tag, options.checkedClass, isChecked);
    }

    /**
     * Set or remove the "disabled" class for disabled elements, based on
     * if the element is detected to be disabled.
     *
     * @param jQuery $tag Our Uniform span/div
     * @param jQuery $el Original form element
     * @param Object options Uniform options for this element
     */
    function classUpdateDisabled($tag, $el, options) {
        classUpdate($tag, options.disabledClass, $el.is(":disabled"));
    }

    /**
     * Wrap an element inside of a container or put the container next
     * to the element.  See the code for examples of the different methods.
     *
     * Returns the container that was added to the HTML.
     *
     * @param jQuery $el Element to wrap
     * @param jQuery $container Add this new container around/near $el
     * @param String method One of "after", "before" or "wrap"
     * @return $container after it has been cloned for adding to $el
     */
    function divSpanWrap($el, $container, method) {
        switch (method) {
        case "after":
            // Result:  <element /> <container />
            $el.after($container);
            return $el.next();
        case "before":
            // Result:  <container /> <element />
            $el.before($container);
            return $el.prev();
        case "wrap":
            // Result:  <container> <element /> </container>
            $el.wrap($container);
            return $el.parent();
        }

        return null;
    }


    /**
     * Create a div/span combo for uniforming an element
     *
     * @param jQuery $el Element to wrap
     * @param Object options Options for the element, set by the user
     * @param Object divSpanConfig Options for how we wrap the div/span
     * @return Object Contains the div and span as properties
     */
    function divSpan($el, options, divSpanConfig) {
        var $div, $span, id;

        if (!divSpanConfig) {
            divSpanConfig = {};
        }

        divSpanConfig = $.extend({
            bind: {},
            divClass: null,
            divWrap: "wrap",
            spanClass: null,
            spanHtml: null,
            spanWrap: "wrap"
        }, divSpanConfig);

        $div = divSpanConfig.isLabel ? $('<label />') : $('<div />');
        $span = $('<span />');

        // Automatically hide this div/span if the element is hidden.
        // Do not hide if the element is hidden because a parent is hidden.
        if (options.autoHide && $el.is(':hidden') && $el.css('display') === 'none') {
            $div.hide();
        }

        if (divSpanConfig.divClass) {
            $div.addClass(divSpanConfig.divClass);
        }

        if (options.wrapperClass) {
            $div.addClass(options.wrapperClass);
        }

        if (divSpanConfig.spanClass) {
            $span.addClass(divSpanConfig.spanClass);
        }

        id = attrOrProp($el, 'id');

        if (options.useID && id) {
            attrOrProp($div, 'id', options.idPrefix + '-' + id);
        }

        if (divSpanConfig.spanHtml) {
            $span.html(divSpanConfig.spanHtml);
        }

        $div = divSpanWrap($el, $div, divSpanConfig.divWrap);
        $span = divSpanWrap($el, $span, divSpanConfig.spanWrap);
        classUpdateDisabled($div, $el, options);
        return {
            div: $div,
            span: $span
        };
    }


    /**
     * Wrap an element with a span to apply a global wrapper class
     *
     * @param jQuery $el Element to wrap
     * @param object options
     * @return jQuery Wrapper element
     */
    function wrapWithWrapperClass($el, options) {
        var $span;

        if (!options.wrapperClass) {
            return null;
        }

        $span = $('<span />').addClass(options.wrapperClass);
        $span = divSpanWrap($el, $span, "wrap");
        return $span;
    }


    /**
     * Test if high contrast mode is enabled.
     *
     * In high contrast mode, background images can not be set and
     * they are always returned as 'none'.
     *
     * @return boolean True if in high contrast mode
     */
    function highContrast() {
        var c, $div, el, rgb;

        // High contrast mode deals with white and black
        rgb = 'rgb(120,2,153)';
        $div = $('<div style="width:0;height:0;color:' + rgb + '">');
        $('body').append($div);
        el = $div.get(0);

        // $div.css() will get the style definition, not
        // the actually displaying style
        if (wind.getComputedStyle) {
            c = wind.getComputedStyle(el, '').color;
        } else {
            c = (el.currentStyle || el.style || {}).color;
        }

        $div.remove();
        return c.replace(/ /g, '') !== rgb;
    }


    /**
     * Change text into safe HTML
     *
     * @param String text
     * @return String HTML version
     */
    function htmlify(text) {
        if (!text) {
            return "";
        }

        return $('<span />').text(text).html();
    }

    /**
     * If not MSIE, return false.
     * If it is, return the version number.
     *
     * @return false|number
     */
    function isMsie() {
        return navigator.cpuClass && !navigator.product;
    }

    /**
     * Return true if this version of IE allows styling
     *
     * @return boolean
     */
    function isMsieSevenOrNewer() {
        if (wind.XMLHttpRequest !== undefined) {
            return true;
        }

        return false;
    }

    /**
     * Test if the element is a multiselect
     *
     * @param jQuery $el Element
     * @return boolean true/false
     */
    function isMultiselect($el) {
        var elSize;

        if ($el[0].multiple) {
            return true;
        }

        elSize = attrOrProp($el, "size");

        if (!elSize || elSize <= 1) {
            return false;
        }

        return true;
    }

    /**
     * Meaningless utility function.  Used mostly for improving minification.
     *
     * @return false
     */
    function returnFalse() {
        return false;
    }

    /**
     * noSelect plugin, very slightly modified
     * http://mths.be/noselect v1.0.3
     *
     * @param jQuery $elem Element that we don't want to select
     * @param Object options Uniform options for the element
     */
    function noSelect($elem, options) {
        var none = 'none';
        bindMany($elem, options, {
            'selectstart dragstart mousedown': returnFalse
        });

        $elem.css({
            MozUserSelect: none,
            msUserSelect: none,
            webkitUserSelect: none,
            userSelect: none
        });
    }

    /**
     * Updates the filename tag based on the value of the real input
     * element.
     *
     * @param jQuery $el Actual form element
     * @param jQuery $filenameTag Span/div to update
     * @param Object options Uniform options for this element
     */
    function setFilename($el, $filenameTag, options) {
        var filename = $el.val();

        if (filename === "") {
            filename = options.fileDefaultHtml;
        } else {
            filename = filename.split(/[\/\\]+/);
            filename = filename[(filename.length - 1)];
        }

        $filenameTag.text(filename);
    }


    /**
     * Function from jQuery to swap some CSS values, run a callback,
     * then restore the CSS.  Modified to pass JSLint and handle undefined
     * values with 'use strict'.
     *
     * @param jQuery $el Element
     * @param object newCss CSS values to swap out
     * @param Function callback Function to run
     */
    function swap($elements, newCss, callback) {
        var restore, item;

        restore = [];

        $elements.each(function () {
            var name;

            for (name in newCss) {
                if (Object.prototype.hasOwnProperty.call(newCss, name)) {
                    restore.push({
                        el: this,
                        name: name,
                        old: this.style[name]
                    });

                    this.style[name] = newCss[name];
                }
            }
        });

        callback();

        while (restore.length) {
            item = restore.pop();
            item.el.style[item.name] = item.old;
        }
    }


    /**
     * The browser doesn't provide sizes of elements that are not visible.
     * This will clone an element and add it to the DOM for calculations.
     *
     * @param jQuery $el
     * @param String method
     */
    function sizingInvisible($el, callback) {
        var targets;

        // We wish to target ourselves and any parents as long as
        // they are not visible
        targets = $el.parents();
        targets.push($el[0]);
        targets = targets.not(':visible');
        swap(targets, {
            visibility: "hidden",
            display: "block",
            position: "absolute"
        }, callback);
    }


    /**
     * Standard way to unwrap the div/span combination from an element
     *
     * @param jQuery $el Element that we wish to preserve
     * @param Object options Uniform options for the element
     * @return Function This generated function will perform the given work
     */
    function unwrapUnwrapUnbindFunction($el, options) {
        return function () {
            $el.unwrap().unwrap().unbind(options.eventNamespace);
        };
    }

    var allowStyling = true,  // False if IE6 or other unsupported browsers
        highContrastTest = false,  // Was the high contrast test ran?
        uniformHandlers = [  // Objects that take care of "unification"
            {
                // Buttons
                match: function ($el) {
                    return $el.is("a, button, :submit, :reset, input[type='button']");
                },
                apply: function ($el, options) {
                    var $div, defaultSpanHtml, ds, getHtml, doingClickEvent;
                    defaultSpanHtml = options.submitDefaultHtml;

                    if ($el.is(":reset")) {
                        defaultSpanHtml = options.resetDefaultHtml;
                    }

                    if ($el.is("a, button")) {
                        // Use the HTML inside the tag
                        getHtml = function () {
                            return $el.html() || defaultSpanHtml;
                        };
                    } else {
                        // Use the value property of the element
                        getHtml = function () {
                            return htmlify(attrOrProp($el, "value")) || defaultSpanHtml;
                        };
                    }

                    ds = divSpan($el, options, {
                        divClass: options.buttonClass,
                        spanHtml: getHtml()
                    });
                    $div = ds.div;
                    bindUi($el, $div, options);
                    doingClickEvent = false;
                    bindMany($div, options, {
                        "click touchend": function () {
                            var ev, res, target, href;

                            if (doingClickEvent) {
                                return;
                            }

                            if ($el.is(':disabled')) {
                                return;
                            }

                            doingClickEvent = true;

                            if ($el[0].dispatchEvent) {
                                ev = document.createEvent("MouseEvents");
                                ev.initEvent("click", true, true);
                                res = $el[0].dispatchEvent(ev);

                                if ($el.is('a') && res) {
                                    target = attrOrProp($el, 'target');
                                    href = attrOrProp($el, 'href');

                                    if (!target || target === '_self') {
                                        document.location.href = href;
                                    } else {
                                        wind.open(href, target);
                                    }
                                }
                            } else {
                                $el.click();
                            }

                            doingClickEvent = false;
                        }
                    });
                    noSelect($div, options);
                    return {
                        remove: function () {
                            // Move $el out
                            $div.after($el);

                            // Remove div and span
                            $div.remove();

                            // Unbind events
                            $el.unbind(options.eventNamespace);
                            return $el;
                        },
                        update: function () {
                            classClearStandard($div, options);
                            classUpdateDisabled($div, $el, options);
                            $el.detach();
                            ds.span.html(getHtml()).append($el);
                        }
                    };
                }
            },
            {
                // Checkboxes
                match: function ($el) {
                    return $el.is(":checkbox");
                },
                apply: function ($el, options) {
                    var ds, $div, $span;
                    ds = divSpan($el, options, {
                        divClass: options.checkboxClass
                    });
                    $div = ds.div;
                    $span = ds.span;

                    // Add focus classes, toggling, active, etc.
                    bindUi($el, $div, options);
                    bindMany($el, options, {
                        "click touchend": function () {
                            classUpdateChecked($div, $el, options);
                            classUpdateChecked($span, $el, options);
                        }
                    });
                    classUpdateChecked($div, $el, options);
                    classUpdateChecked($span, $el, options);
                    return {
                        remove: unwrapUnwrapUnbindFunction($el, options),
                        update: function () {
                            classClearStandard($div, options);
                            $span.removeClass(options.checkedClass);
                            classUpdateChecked($div, $el, options);
                            classUpdateChecked($span, $el, options);
                            classUpdateDisabled($div, $el, options);
                        }
                    };
                }
            },
            {
                // File selection / uploads
                match: function ($el) {
                    return $el.is(":file");
                },
                apply: function ($el, options) {
                    var ds, $div, $filename, $button;

                    // The "span" is the button
                    ds = divSpan($el, options, {
                        divClass: options.fileClass,
                        spanClass: options.fileButtonClass,
                        spanHtml: options.fileButtonHtml,
                        spanWrap: "after",
                        isLabel: true
                    });
                    $div = ds.div;
                    $button = ds.span;
                    $filename = $("<span />").html(options.fileDefaultHtml);
                    $filename.addClass(options.filenameClass);
                    $filename = divSpanWrap($el, $filename, "after");

                    // Set the size
                    if (!attrOrProp($el, "size")) {
                        attrOrProp($el, "size", $div.width() / 10);
                    }

                    // Actions
                    function filenameUpdate() {
                        setFilename($el, $filename, options);
                    }

                    bindUi($el, $div, options);

                    // Account for input saved across refreshes
                    filenameUpdate();

                    // IE7 doesn't fire onChange until blur or second fire.
                    if (isMsie()) {
                        // IE considers browser chrome blocking I/O, so it
                        // suspends tiemouts until after the file has
                        // been selected.
                        bindMany($el, options, {
                            click: function () {
                                $el.trigger("change");
                                setTimeout(filenameUpdate, 0);
                            }
                        });
                    } else {
                        // All other browsers behave properly
                        bindMany($el, options, {
                            change: filenameUpdate
                        });
                    }

                    noSelect($filename, options);
                    noSelect($button, options);
                    return {
                        remove: function () {
                            // Remove filename and button
                            $filename.remove();
                            $button.remove();

                            // Unwrap parent div, remove events
                            return $el.unwrap().unbind(options.eventNamespace);
                        },
                        update: function () {
                            classClearStandard($div, options);
                            setFilename($el, $filename, options);
                            classUpdateDisabled($div, $el, options);
                        }
                    };
                }
            },
            {
                // Input fields (text)
                match: function ($el) {
                    if ($el.is("input")) {
                        var t = (" " + attrOrProp($el, "type") + " ").toLowerCase(),
                            allowed = " color date datetime datetime-local email month number password search tel text time url week ";
                        return allowed.indexOf(t) >= 0;
                    }

                    return false;
                },
                apply: function ($el, options) {
                    var elType, $wrapper;

                    elType = attrOrProp($el, "type");
                    $el.addClass(options.inputClass);
                    $wrapper = wrapWithWrapperClass($el, options);
                    bindUi($el, $el, options);

                    if (options.inputAddTypeAsClass) {
                        $el.addClass(elType);
                    }

                    return {
                        remove: function () {
                            $el.removeClass(options.inputClass);

                            if (options.inputAddTypeAsClass) {
                                $el.removeClass(elType);
                            }

                            if ($wrapper) {
                                $el.unwrap();
                            }
                        },
                        update: returnFalse
                    };
                }
            },
            {
                // Radio buttons
                match: function ($el) {
                    return $el.is(":radio");
                },
                apply: function ($el, options) {
                    var ds, $div, $span;
                    ds = divSpan($el, options, {
                        divClass: options.radioClass
                    });
                    $div = ds.div;
                    $span = ds.span;

                    // Add classes for focus, handle active, checked
                    bindUi($el, $div, options);
                    bindMany($el, options, {
                        "click touchend": function () {
                            // Find all radios with the same name, then update
                            // them with $.uniform.update() so the right
                            // per-element options are used
                            $.uniform.update($(':radio[name="' + attrOrProp($el, "name") + '"]'));
                        }
                    });
                    classUpdateChecked($div, $el, options);
                    classUpdateChecked($span, $el, options);
                    return {
                        remove: unwrapUnwrapUnbindFunction($el, options),
                        update: function () {
                            classClearStandard($div, options);
                            classUpdateChecked($div, $el, options);
                            classUpdateChecked($span, $el, options);
                            classUpdateDisabled($div, $el, options);
                        }
                    };
                }
            },
            {
                // Select lists, but do not style multiselects here
                match: function ($el) {
                    if ($el.is("select") && !isMultiselect($el)) {
                        return true;
                    }

                    return false;
                },
                apply: function ($el, options) {
                    var ds, $div, $span, origElemWidth;

                    if (options.selectAutoWidth) {
                        sizingInvisible($el, function () {
                            origElemWidth = $el.width();
                        });
                    }

                    ds = divSpan($el, options, {
                        divClass: options.selectClass,
                        spanHtml: ($el.find(":selected:first") || $el.find("option:first")).html(),
                        spanClass: !($el.find(":selected:first") || $el.find("option:first")).attr('value') ? 'placeholder' : null,
                        spanWrap: "before"
                    });
                    $div = ds.div;
                    $span = ds.span;

                    if (options.selectAutoWidth) {
                        // Use the width of the select and adjust the
                        // span and div accordingly
                        sizingInvisible($el, function () {
                            // Force "display: block" - related to bug #287
                            swap($([ $span[0], $div[0] ]), {
                                display: "block"
                            }, function () {
                                var spanPad;
                                spanPad = $span.outerWidth() - $span.width();
                                $div.width(origElemWidth + spanPad);
                                $span.width(origElemWidth);
                            });
                        });
                    } else {
                        // Force the select to fill the size of the div
                        $div.addClass('fixedWidth');
                    }

                    // Take care of events
                    bindUi($el, $div, options);
                    bindMany($el, options, {
                        change: function () {
                            $span.html($el.find(":selected").html());
                            $span.toggleClass('placeholder', !($el.find(":selected:first") || $el.find("option:first")).attr('value'));

                            $div.removeClass(options.activeClass);
                        },
                        "click touchend": function () {
                            // IE7 and IE8 may not update the value right
                            // until after click event - issue #238
                            var selHtml = $el.find(":selected").html();

                            if ($span.html() !== selHtml) {
                                // Change was detected
                                // Fire the change event on the select tag
                                $el.trigger('change');
                            }
                        },
                        keyup: function () {
                            $span.html($el.find(":selected").html());
                        }
                    });
                    noSelect($span, options);
                    return {
                        remove: function () {
                            // Remove sibling span
                            $span.remove();

                            // Unwrap parent div
                            $el.unwrap().unbind(options.eventNamespace);
                            return $el;
                        },
                        update: function () {
                            if (options.selectAutoWidth) {
                                // Easier to remove and reapply formatting
                                $.uniform.restore($el);
                                $el.uniform(options);
                            } else {
                                classClearStandard($div, options);

                                // Reset current selected text
                                $span.html($el.find(":selected").html());
                                $span.toggleClass('placeholder', !($el.find(":selected:first") || $el.find("option:first")).attr('value'));
                                classUpdateDisabled($div, $el, options);
                            }
                        }
                    };
                }
            },
            {
                // Select lists - multiselect lists only
                match: function ($el) {
                    if ($el.is("select") && isMultiselect($el)) {
                        return true;
                    }

                    return false;
                },
                apply: function ($el, options) {
                    var $wrapper;

                    $el.addClass(options.selectMultiClass);
                    $wrapper = wrapWithWrapperClass($el, options);
                    bindUi($el, $el, options);

                    return {
                        remove: function () {
                            $el.removeClass(options.selectMultiClass);

                            if ($wrapper) {
                                $el.unwrap();
                            }
                        },
                        update: returnFalse
                    };
                }
            },
            {
                // Textareas
                match: function ($el) {
                    return $el.is("textarea");
                },
                apply: function ($el, options) {
                    var $wrapper;

                    $el.addClass(options.textareaClass);
                    $wrapper = wrapWithWrapperClass($el, options);
                    bindUi($el, $el, options);

                    return {
                        remove: function () {
                            $el.removeClass(options.textareaClass);

                            if ($wrapper) {
                                $el.unwrap();
                            }
                        },
                        update: returnFalse
                    };
                }
            }
        ];

    // IE6 can't be styled - can't set opacity on select
    if (isMsie() && !isMsieSevenOrNewer()) {
        allowStyling = false;
    }

    $.uniform = {
        // Default options that can be overridden globally or when uniformed
        // globally:  $.uniform.defaults.fileButtonHtml = "Pick A File";
        // on uniform:  $('input').uniform({fileButtonHtml: "Pick a File"});
        defaults: {
            activeClass: "active",
            autoHide: true,
            buttonClass: "button",
            checkboxClass: "checker",
            checkedClass: "checked",
            disabledClass: "disabled",
            eventNamespace: ".uniform",
            fileButtonClass: "action",
            fileButtonHtml: "Choose File",
            fileClass: "uploader",
            fileDefaultHtml: "No file selected",
            filenameClass: "filename",
            focusClass: "focus",
            hoverClass: "hover",
            idPrefix: "uniform",
            inputAddTypeAsClass: true,
            inputClass: "uniform-input",
            radioClass: "radio",
            resetDefaultHtml: "Reset",
            resetSelector: false,  // We'll use our own function when you don't specify one
            selectAutoWidth: true,
            selectClass: "selector",
            selectMultiClass: "uniform-multiselect",
            submitDefaultHtml: "Submit",  // Only text allowed
            textareaClass: "uniform",
            useID: true,
            wrapperClass: null
        },

        // All uniformed elements - DOM objects
        elements: []
    };

    $.fn.uniform = function (options) {
        var el = this;
        options = $.extend({}, $.uniform.defaults, options);

        // If we are in high contrast mode, do not allow styling
        if (!highContrastTest) {
            highContrastTest = true;

            if (highContrast()) {
                allowStyling = false;
            }
        }

        // Only uniform on browsers that work
        if (!allowStyling) {
            return this;
        }

        // Code for specifying a reset button
        if (options.resetSelector) {
            $(options.resetSelector).mouseup(function () {
                wind.setTimeout(function () {
                    $.uniform.update(el);
                }, 10);
            });
        }

        return this.each(function () {
            var $el = $(this), i, handler, callbacks;

            // Avoid uniforming elements already uniformed - just update
            if ($el.data("uniformed")) {
                $.uniform.update($el);
                return;
            }

            // See if we have any handler for this type of element
            for (i = 0; i < uniformHandlers.length; i = i + 1) {
                handler = uniformHandlers[i];

                if (handler.match($el, options)) {
                    callbacks = handler.apply($el, options);
                    $el.data("uniformed", callbacks);

                    // Store element in our global array
                    $.uniform.elements.push($el.get(0));
                    return;
                }
            }

            // Could not style this element
        });
    };

    $.uniform.restore = $.fn.uniform.restore = function (elem) {
        if (elem === undef) {
            elem = $.uniform.elements;
        }

        $(elem).each(function () {
            var $el = $(this), index, elementData;
            elementData = $el.data("uniformed");

            // Skip elements that are not uniformed
            if (!elementData) {
                return;
            }

            // Unbind events, remove additional markup that was added
            elementData.remove();

            // Remove item from list of uniformed elements
            index = $.inArray(this, $.uniform.elements);

            if (index >= 0) {
                $.uniform.elements.splice(index, 1);
            }

            $el.removeData("uniformed");
        });
    };

    $.uniform.update = $.fn.uniform.update = function (elem) {
        if (elem === undef) {
            elem = $.uniform.elements;
        }

        $(elem).each(function () {

            var $el = $(this), elementData;
            elementData = $el.data("uniformed");

            // Skip elements that are not uniformed
            if (!elementData) {
                return;
            }

            elementData.update($el, elementData.options);
        });
    };
}(this, jQuery));

;(function($) {
  'use strict';

  var pluginName = 'selectric',
      classList = 'Input Items Open Disabled TempShow HideSelect Wrapper Hover Responsive Above Scroll Group GroupLabel',
      bindSufix = '.sl',
      defaults = {
        onChange: function(elm) { $(elm).change(); },
        maxHeight: 300,
        keySearchTimeout: 500,
        arrowButtonMarkup: '<b class="button">&#x25be;</b>',
        disableOnMobile: true,
        openOnHover: false,
        hoverIntentTimeout: 500,
        expandToItemText: false,
        responsive: false,
        preventWindowScroll: true,
        inheritOriginalWidth: false,
        allowWrap: true,
        customClass: {
            placeholder: 'placeholder',
            prefix: pluginName,
            camelCase: false,
            overwrite: true
        },
        optionsItemBuilder: '{text}', // function(itemData, element, index)
        labelBuilder: '{text}' // function(currItem)
      },
      hooks = {
        add: function(callbackName, hookName, fn) {
          if ( !this[callbackName] )
            this[callbackName] = {};

          this[callbackName][hookName] = fn;
        },
        remove: function(callbackName, hookName) {
          delete this[callbackName][hookName];
        }
      },
      _utils = {
        // Replace diacritics
        replaceDiacritics: function(s) {
          // /[\340-\346]/g, // a
          // /[\350-\353]/g, // e
          // /[\354-\357]/g, // i
          // /[\362-\370]/g, // o
          // /[\371-\374]/g, // u
          // /[\361]/g,      // n
          // /[\347]/g,      // c
          // /[\377]/g       // y
          var d = '40-46 50-53 54-57 62-70 71-74 61 47 77'.replace(/\d+/g, '\\3$&').split(' '),
              k = d.length;

          while (k--)
            s = s.toLowerCase().replace(RegExp('[' + d[k] + ']', 'g'), 'aeiouncy'.charAt(k));

          return s;
        },
        // https://gist.github.com/atesgoral/984375
        format: function(f) {var a=arguments;return(""+f).replace(/{(\d+|(\w+))}/g,function(s,i,p) {return p&&a[1]?a[1][p]:a[i]})},
        nextEnabledItem: function(selectItems, selected) {
          while ( selectItems[ selected = (selected + 1) % selectItems.length ].disabled ) {}
          return selected;
        },
        previousEnabledItem: function(selectItems, selected) {
          while ( selectItems[ selected = (selected > 0 ? selected : selectItems.length) - 1 ].disabled ) {}
          return selected;
        },
        toDash: function(str) {
          return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        },
        triggerCallback: function(fn, scope) {
          var elm = scope.element,
              func = scope.options['on' + fn];

          if ( $.isFunction(func) )
            func.call(elm, elm, scope);

          if ( hooks[fn] ) {
            $.each(hooks[fn], function() {
              this.call(elm, elm, scope);
            });
          }

          $(elm).trigger(pluginName + '-' + _utils.toDash(fn), scope);
        }
      },
      $doc = $(document),
      $win = $(window),
      Selectric = function(element, opts) {
        var _this = this,
            $original = $(element),
            $input, $items, $itemsScroll, $wrapper, $label, $outerWrapper, $li,
            isOpen = false,
            isEnabled = false,
            selected,
            currValue,
            itemsHeight,
            itemsInnerHeight,
            finalWidth,
            optionsLength,
            eventTriggers,
            isMobile = /android|ip(hone|od|ad)/i.test(navigator.userAgent),
            tabindex = $original.prop('tabindex'),
            labelBuilder;

        function _init(opts) {
          _this.options = $.extend(true, {}, defaults, _this.options, opts);
          _this.classes = {};
          _this.element = element;

          _utils.triggerCallback('BeforeInit', _this);

          // Disable on mobile browsers
          if ( _this.options.disableOnMobile && isMobile ) {
            _this.disableOnMobile = true;
            return;
          }

          // Preserve data
          _destroy(true);

          // Generate classNames for elements
          var customClass   = _this.options.customClass,
              postfixes     = classList.split(' '),
              originalWidth = $original.width();

          $.each(postfixes, function(i, currClass) {
            var c = customClass.prefix + '-' + currClass;
            _this.classes[currClass.toLowerCase()] = customClass.camelCase ? c : _utils.toDash(c);
          });

          $input        = $('<input/>', { 'class': _this.classes.input, 'readonly': isMobile });
          $items        = $('<div/>',   { 'class': _this.classes.items, 'tabindex': -1 });
          $itemsScroll  = $('<div/>',   { 'class': _this.classes.scroll });
          $wrapper      = $('<div/>',   { 'class': customClass.prefix, 'html': _this.options.arrowButtonMarkup });
          $label        = $('<div class="label"/>');
          $outerWrapper = $original.wrap('<div>').parent().append($wrapper.prepend($label), $items/*, $input*/);

          eventTriggers = {
            open    : _open,
            close   : _close,
            destroy : _destroy,
            refresh : _refresh,
            init    : _init
          };

          $original.on(eventTriggers).wrap('<div class="' + _this.classes.hideselect + '">');
          $.extend(_this, eventTriggers);

          labelBuilder = _this.options.labelBuilder;

          if ( _this.options.inheritOriginalWidth && originalWidth > 0 )
            $outerWrapper.width(originalWidth);

          _populate();
        }

        // Generate options markup and event binds
        function _populate() {
          _this.items = [];

          var $options = $original.children(),
              _$li = '<div class="' + pluginName + '-list">',
              $justOptions = $original.find('option'),
              selectedIndex = $justOptions.index($justOptions.filter(':selected')),
              currIndex = 0;

          currValue = (selected = ~selectedIndex ? selectedIndex : 0);

          if ( optionsLength = $options.length ) {
            // Build options markup
            $options.each(function() {
              var $elm = $(this);

              if ( $elm.is('optgroup') ) {
                var groupDisabled = $elm.prop('disabled'),
                    $children = $elm.children();

                _$li += _utils.format('<div class="{1}"><li class="{2}">{3}</li>',
                  $.trim([_this.classes.group, groupDisabled ? 'disabled' : '', $elm.prop('class')].join(' ')),
                  _this.classes.grouplabel,
                  $elm.prop('label')
                );

                if ( groupDisabled ) {
                  $children.prop('disabled', true);
                }

                $children.each(buildOption);

                _$li += '</div>';
              } else {
                buildOption.call($elm);
              }

              function buildOption() {
                var $elm = $(this),
                    optionText = $elm.html(),
                    selectDisabled = $elm.prop('disabled'),
                    itemBuilder = _this.options.optionsItemBuilder;

                _this.items[currIndex] = {
                  element  : $elm,
                  value    : $elm.val(),
                  text     : optionText,
                  slug     : _utils.replaceDiacritics(optionText),
                  disabled : selectDisabled
                };

                _$li += _utils.format('<li class="' + pluginName + '-list-option' + (!$elm.val() || $elm.val() === '' || typeof $elm.val() === 'undefined' || !!$elm.data('placeholder') ? ' placeholder ' : ' ') + '{2}" data-index="{1}">{3}</li>',
                  currIndex,
                  $.trim([currIndex == currValue ? 'selected' : '', currIndex == optionsLength - 1 ? 'last' : '', selectDisabled ? 'disabled' : ''].join(' ')),
                  $.isFunction(itemBuilder) ? itemBuilder(_this.items[currIndex], $elm, currIndex) : _utils.format(itemBuilder, _this.items[currIndex])
                );

                currIndex++;
              }
            });

            $items.append( $itemsScroll.html(_$li + '</div>') );

            $label.html(
              $.isFunction(labelBuilder) ? labelBuilder(_this.items[currValue]) : _utils.format(labelBuilder, _this.items[currValue])
            )
          }

          $wrapper.add($original).add($outerWrapper).add($input).off(bindSufix);

          $outerWrapper.prop('class', [
            _this.classes.wrapper,
            _this.options.customClass.overwrite ?
              $original.prop('class').replace(/\S+/g, _this.options.customClass.prefix + '-$&') :
              $original.prop('class'),
            _this.options.responsive ? _this.classes.responsive : ''
          ].join(' '));

          if ( !$original.prop('disabled') ) {
            isEnabled = true;

            // Not disabled, so... Removing disabled class and bind hover
            $outerWrapper.removeClass(_this.classes.disabled).on('mouseenter' + bindSufix + ' mouseleave' + bindSufix, function(e) {
              $(this).toggleClass(_this.classes.hover);

              // Delay close effect when openOnHover is true
              if ( _this.options.openOnHover ) {
                clearTimeout(_this.closeTimer);
                e.type == 'mouseleave' ? _this.closeTimer = setTimeout(_close, _this.options.hoverIntentTimeout) : _open();
              }
            });

            // Toggle open/close
            $wrapper.on('click' + bindSufix, function(e) {
              isOpen ? _close() : _open(e);
            });

            $input
              .prop({
                tabindex: tabindex,
                disabled: false
              })
              .on('keypress' + bindSufix, _handleSystemKeys)
              .on('keydown' + bindSufix, function(e) {
                _handleSystemKeys(e);

                // Clear search
                clearTimeout(_this.resetStr);
                _this.resetStr = setTimeout(function() {
                  $input.val('');
                }, _this.options.keySearchTimeout);

                var key = e.keyCode || e.which;

                // If it's a directional key
                // 37 => Left
                // 38 => Up
                // 39 => Right
                // 40 => Down
                if ( key > 36 && key < 41 ) {
                  if ( !_this.options.allowWrap ) {
                    if ( (key < 39 && selected == 0) || (key > 38 && (selected + 1) == _this.items.length) ) {
                      return;
                    }
                  }

                  _select(_utils[(key < 39 ? 'previous' : 'next') + 'EnabledItem'](_this.items, selected));
                }
              })
              .on('focusin' + bindSufix, function(e) {
                // Stupid, but necessary... Prevent the flicker when
                // focusing out and back again in the browser window
                $input.one('blur', function() {
                  $input.blur();
                });

                isOpen || _open(e);
              })
              .on('oninput' in $input[0] ? 'input' : 'keyup', function() {
                if ( $input.val().length ) {
                  // Search in select options
                  $.each(_this.items, function(i, elm) {
                    if ( RegExp('^' + $input.val(), 'i').test(elm.slug) && !elm.disabled ) {
                      _select(i);
                      return false;
                    }
                  });
                }
              });

            $original.prop('tabindex', false);

            // Remove styles from items box
            // Fix incorrect height when refreshed is triggered with fewer options
            $li = $('li', $items.removeAttr('style')).on({
              // Prevent <input> blur on Chrome
              mousedown: function(e) {
                e.preventDefault();
                e.stopPropagation();
              },
              click: function() {
                // The second parameter is to close the box after click
                _select($(this).data('index'), true);

                // Chrome doesn't close options box if select is wrapped with a label
                // We need to 'return false' to avoid that
                return false;
              }
            }).filter('[data-index]');
          } else {
            $outerWrapper.addClass(_this.classes.disabled);
            $input.prop('disabled', true);
          }

          _utils.triggerCallback('Init', _this);
        }

        function _refresh() {
          _utils.triggerCallback('Refresh', _this);
          _populate();
        }

        // Behavior when system keys is pressed
        function _handleSystemKeys(e) {
          var key = e.keyCode || e.which;

          if ( key == 13 ) {
            e.preventDefault();
          }

          // Tab / Enter / ESC
          if ( /^(9|13|27)$/.test(key) ) {
            e.stopPropagation();
            _select(selected, true);
          }
        }

        // Set options box width/height
        function _calculateOptionsDimensions() {
          // Calculate options box height
          // Set a temporary class on the hidden parent of the element
          var hiddenChildren = $items.closest(':visible').children(':hidden').addClass(_this.classes.tempshow),
              maxHeight = _this.options.maxHeight,
              itemsWidth = $items.outerWidth(),
              wrapperWidth = $wrapper.outerWidth() - (itemsWidth - $items.width());

          // Set the dimensions, minimum is wrapper width, expand for long items if option is true
          if ( !_this.options.expandToItemText || wrapperWidth > itemsWidth )
            finalWidth = wrapperWidth;
          else {
            // Make sure the scrollbar width is included
            $items.css('overflow', 'scroll');

            // Set a really long width for $outerWrapper
            $outerWrapper.width(9e4);
            finalWidth = $items.width();
            // Set scroll bar to auto
            $items.css('overflow', '');
            $outerWrapper.width('');
          }

          $items.width(finalWidth).height() > maxHeight && $items.height(maxHeight);

          // Remove the temporary class
          hiddenChildren.removeClass(_this.classes.tempshow);
        }

        // Open the select options box
        function _open(e) {
          _utils.triggerCallback('BeforeOpen', _this);

          if ( e ) {
            e.preventDefault();
            e.stopPropagation();
          }

          if ( isEnabled ) {
            _calculateOptionsDimensions();

            // Find any other opened instances of select and close it
            $('.' + _this.classes.hideselect, '.' + _this.classes.open).children()[pluginName]('close');

            isOpen = true;
            itemsHeight = $items.outerHeight();
            itemsInnerHeight = $items.height();

            // Toggle options box visibility
            $outerWrapper.addClass(_this.classes.open);

            // Give dummy input focus
            $input.val('').is(':focus') || $input.focus();

            $doc.on('click' + bindSufix, _close).on('scroll' + bindSufix, _isInViewport);
            _isInViewport();

            // Prevent window scroll when using mouse wheel inside items box
            if ( _this.options.preventWindowScroll ) {
              $doc.on('mousewheel' + bindSufix + ' DOMMouseScroll' + bindSufix, '.' + _this.classes.scroll, function(e) {
                var orgEvent = e.originalEvent,
                    scrollTop = $(this).scrollTop(),
                    deltaY = 0;

                if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail * -1; }
                if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta;  }
                if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY; }
                if ( 'deltaY'      in orgEvent ) { deltaY = orgEvent.deltaY * -1; }

                if ( scrollTop == (this.scrollHeight - itemsInnerHeight) && deltaY < 0 || scrollTop == 0 && deltaY > 0 ) {
                  e.preventDefault();
                }
              });
            }

            _detectItemVisibility(selected);

            _utils.triggerCallback('Open', _this);
          }
        }

        // Detect is the options box is inside the window
        function _isInViewport() {
          $outerWrapper.toggleClass(_this.classes.above, $outerWrapper.offset().top + $outerWrapper.outerHeight() + itemsHeight > $win.scrollTop() + $win.height());
        }

        // Close the select options box
        function _close(e) {
          _utils.triggerCallback('BeforeClose', _this);

          if ( currValue != selected ) {
            _utils.triggerCallback('BeforeChange', _this);

            var text = _this.items[selected].text;

            // Apply changed value to original select
            $original
              .prop('selectedIndex', currValue = selected)
              .data('value', text);

            // Change label text
            $label.html(
              $.isFunction(labelBuilder) ? labelBuilder(_this.items[selected]) : _utils.format(labelBuilder, _this.items[selected])
            );

            _utils.triggerCallback('Change', _this);
          }

            if (typeof e !== 'undefined') {

                if (!$(e.target).is('input')) {

                    // Remove custom events on document
                    $doc.off(bindSufix);

                    // Remove visible class to hide options box
                    $outerWrapper.removeClass(_this.classes.open);

                }

            } else {

                // Remove custom events on document
                $doc.off(bindSufix);

                // Remove visible class to hide options box
                $outerWrapper.removeClass(_this.classes.open);

            }

          isOpen = false;

          _utils.triggerCallback('Close', _this);
        }

        // Select option
        function _select(index, close) {
          // Parameter index is required
          if ( index == undefined ) {
            return;
          }

          // If element is disabled, can't select it
          if ( !_this.items[index].disabled ) {
            // If 'close' is false (default), the options box won't close after
            // each selected item, this is necessary for keyboard navigation
            $li
              .removeClass('selected')
              .eq(selected = index)
              .addClass('selected');

            _detectItemVisibility(index);
            close && _close();
          }
        }

        // Detect if currently selected option is visible and scroll the options box to show it
        function _detectItemVisibility(index) {
          var liHeight = $li.eq(index).outerHeight(),
              liTop = $li[index].offsetTop,
              itemsScrollTop = $itemsScroll.scrollTop(),
              scrollT = liTop + liHeight * 2;

          $itemsScroll.scrollTop(
            scrollT > itemsScrollTop + itemsHeight ? scrollT - itemsHeight :
              liTop - liHeight < itemsScrollTop ? liTop - liHeight :
                itemsScrollTop
          );
        }

        // Unbind and remove
        function _destroy(preserveData) {
          if ( isEnabled ) {
            $items.add($wrapper).add($input).remove();
            !preserveData && $original.removeData(pluginName).removeData('value');
            $original.prop('tabindex', tabindex).off(bindSufix).off(eventTriggers).unwrap().unwrap();
            isEnabled = false;
          }
        }

        _init(opts);
      };

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function(args) {
    return this.each(function() {
      var data = $.data(this, pluginName);

      if ( data && !data.disableOnMobile )
        (''+args === args && data[args]) ? data[args]() : data.init(args);
      else
        $.data(this, pluginName, new Selectric(this, args));
    });
  };

  $.fn[pluginName].hooks = hooks;
}(jQuery));

/* http://plugins.jquery.com/validate */
;(function(defaults, $, window, undefined) {

    var type = ['input:not([type]),input[type="color"],input[type="date"],input[type="datetime"],input[type="datetime-local"],input[type="email"],input[type="file"],input[type="hidden"],input[type="month"],input[type="number"],input[type="password"],input[type="range"],input[type="search"],input[type="tel"],input[type="text"],input[type="time"],input[type="url"],input[type="week"],textarea', 'select', 'input[type="checkbox"],input[type="radio"]'],

        // All field types
        allTypes = type.join(','),

        extend = {},

        // Method to validate each fields
        validateField = function(event, options) {

            var

                // Field status
                status = {
                    pattern : true,
                    conditional : true,
                    required : true
                },

                // Current field
                field = $(this),

                // Current field value
                fieldValue = field.val() || '',

                // An index of extend
                fieldValidate = field.data('validate'),

                // A validation object (jQuery.fn.validateExtend)
                validation = fieldValidate !== undefined ? extend[fieldValidate] : {},

                // One index or more separated for spaces to prepare the field value
                fieldPrepare = field.data('prepare') || validation.prepare,

                // A regular expression to validate field value
                fieldPattern = (field.data('pattern') || ($.type(validation.pattern) == 'regexp' ? validation.pattern : /(?:)/)),

                // Is case sensitive? (Boolean)
                fieldIgnoreCase = field.attr('data-ignore-case') || field.data('ignoreCase') || validation.ignoreCase,

                // A field mask
                fieldMask = field.data('mask') || validation.mask,

                // A index in the conditional object containing a function to validate the field value
                fieldConditional = field.data('conditional') || validation.conditional,

                // Is required?
                fieldRequired = field.data('required'),

                // The description element id
                fieldDescribedby = field.data('describedby') || validation.describedby,

                // An index of description object
                fieldDescription = field.data('description') || validation.description,

                // Trim spaces?
                fieldTrim = field.data('trim'),

                reTrue = /^(true|)$/i,

                reFalse = /^false$/i,

                // The description object
                fieldDescription = $.isPlainObject(fieldDescription) ? fieldDescription : (options.description[fieldDescription] || {}),

                name = 'validate';

            //fieldRequired = fieldRequired != '' ? fieldRequired/*(fieldRequired || !!validation.required)*/ : true;
            fieldRequired = typeof fieldRequired === 'undefined' ? false : typeof fieldRequired === 'boolean' ? fieldRequired : true;

            //console.log(field.attr('name') + ':', fieldRequired);

            fieldTrim = fieldTrim != '' ? (fieldTrim || !!validation.trim) : true;

            // Trim spaces?
            if(reTrue.test(fieldTrim)) {

                fieldValue = $.trim(fieldValue);
            }

            // The fieldPrepare is a function?
            if($.isFunction(fieldPrepare)) {

                // Updates the fieldValue variable
                fieldValue = String(fieldPrepare.call(field, fieldValue));
            } else {

                // Is a function?
                if($.isFunction(options.prepare[fieldPrepare])) {

                    // Updates the fieldValue variable
                    fieldValue = String(options.prepare[fieldPrepare].call(field, fieldValue));
                }
            }

            // Is not RegExp?
            if($.type(fieldPattern) != 'regexp') {

                fieldIgnoreCase = !reFalse.test(fieldIgnoreCase);

                // Converts to RegExp
                fieldPattern = fieldIgnoreCase ? RegExp(fieldPattern, 'i') : RegExp(fieldPattern);
            }

            // The conditional exists?
            if(fieldConditional != undefined) {

                // The fieldConditional is a function?
                if($.isFunction(fieldConditional)) {

                    status.conditional = !!fieldConditional.call(field, fieldValue, options);
                } else {

                    var

                        // Splits the conditionals in an array
                        conditionals = fieldConditional.split(/[\s\t]+/);

                    // Each conditional
                    for(var counter = 0, len = conditionals.length; counter < len; counter++) {

                        if(options.conditional.hasOwnProperty(conditionals[counter]) && !options.conditional[conditionals[counter]].call(field, fieldValue, options)) {

                            status.conditional = false;
                        }
                    }
                }
            }

            fieldRequired = reTrue.test(fieldRequired);

            // Is required?
            if (fieldRequired) {

                // Verifies the field type
                if(field.is(type[0] + ',' + type[1])) {

                    // Is empty?
                    if(!fieldValue.length > 0) {

                        status.required = false;
                    }

                } else if(field.is(type[2])) {

                    if (field.is('[name]')) {

                        // Is checked?
                        if($('[name="' + field.prop('name') + '"]:checked').length == 0) {

                            status.required = false;
                        }

                    } else {

                        status.required = field.is(':checked');
                    }
                }

            }

            // Verifies the field type
            if(field.is(type[0])) {

                // Test the field value pattern
                if(fieldPattern.test(fieldValue)) {

                    // If the event type is not equals to keyup
                    if(event.type != 'keyup' && fieldMask !== undefined) {

                        var matches = fieldValue.match(fieldPattern);

                        // Each characters group
                        for(var i = 0, len = matches.length; i < len; i++) {

                            // Replace the groups
                            fieldMask = fieldMask.replace(RegExp('\\$\\{' + i + '(?::`([^`]*)`)?\\}', 'g'), (matches[i] !== undefined ? matches[i] : '$1'));
                        }

                        fieldMask = fieldMask.replace(/\$\{\d+(?::`([^`]*)`)?\}/g, '$1');

                        // Test the field value pattern
                        if(fieldPattern.test(fieldMask)) {

                            // Update the field value
                            field.val(fieldMask);
                        }
                    }
                } else {

                    // If the field is required
                    if(fieldRequired) {

                        status.pattern = false;
                    } else {

                        if(fieldValue.length > 0) {

                            status.pattern = false;
                        }
                    }
                }
            }

            var

                describedby = $('[id="' + fieldDescribedby +'"]'),

                log = fieldDescription.valid;

            if(describedby.length > 0 && event.type != 'keyup') {

                if(!status.required) {

                    log = fieldDescription.required;
                } else if(!status.pattern) {

                    log = fieldDescription.pattern;
                } else if(!status.conditional) {

                    log = fieldDescription.conditional;
                }

                describedby.html(log || '');
            }

            if(typeof(validation.each) == 'function') {

                validation.each.call(field, event, status, options);
            }

            // Call the eachField callback
            options.eachField.call(field, event, status, options);

            // If the field is valid
            if(status.required && status.pattern && status.conditional) {

                // If WAI-ARIA is enabled
                if(!!options.waiAria) {

                    field.prop('aria-invalid', false);
                }

                if(typeof(validation.valid) == 'function') {

                    validation.valid.call(field, event, status, options);
                }

                // Call the eachValidField callback
                options.eachValidField.call(field, event, status, options);
            } else {

                // If WAI-ARIA is enabled
                if(!!options.waiAria) {

                    field.prop('aria-invalid', true);
                }

                if(typeof(validation.invalid) == 'function') {

                    validation.invalid.call(field, event, status, options);
                }

                // Call the eachInvalidField callback
                options.eachInvalidField.call(field, event, status, options);
            }

            // Returns the field status
            return status;
        };

    $.extend({

        // Method to extends validations
        validateExtend : function(options) {

            return $.extend(extend, options);
        },

        // Method to change the default properties of jQuery.fn.validate method
        validateSetup : function(options) {

            return $.extend(defaults, options);
        }
    }).fn.extend({

        // Method to validate forms
        validate : function(options) {

            options = $.extend({}, defaults, options);

            return $(this).validateDestroy().each(function() {

                var form = $(this);

                // This is a form?
                if(form.is('form')) {

                    form.data(name, {
                        options : options
                    });

                    var fields = form.find(allTypes),

                        // Events namespace
                        namespace = options.namespace;

                    if(form.is('[id]')) {

                        fields = fields.add('[form="' + form.prop('id') + '"]').filter(allTypes);
                    }

                    fields = fields.filter(options.filter);

                    // If onKeyup is enabled
                    if(!!options.onKeyup) {

                        fields.filter(type[0]).on('keyup.' + namespace, function(event) {

                            validateField.call(this, event, options);
                        });
                    }

                    // If onBlur is enabled
                    if(!!options.onBlur) {

                        fields.on('blur.' + namespace, function(event) {

                            validateField.call(this, event, options);
                        });
                    }

                    // If onChange is enabled
                    if(!!options.onChange) {

                        fields.on('change.' + namespace, function(event) {

                            validateField.call(this, event, options);
                        });
                    }

                    // If onSubmit is enabled
                    if(!!options.onSubmit) {

                        form.on('submit.' + namespace, function(event) {

                            var formValid = true;

                            form.find(allTypes).each(function() {

                                var status = validateField.call(this, event, options);

                                if(!status.pattern || !status.conditional || !status.required) {

                                    formValid = false;
                                }
                            });

                            // If form is valid
                            if(formValid) {

                                // Send form?
                                if(!options.sendForm) {

                                    event.preventDefault();
                                }

                                // Is a function?
                                if($.isFunction(options.valid)) {

                                    options.valid.call(form, event, options);
                                }
                            } else {

                                event.preventDefault();
                                event.stopImmediatePropagation();

                                // Is a function?
                                if($.isFunction(options.invalid)) {

                                    options.invalid.call(form, event, options);
                                }
                            }
                        });
                    }

                    // Button switching
                    if (!!options.buttonSwitching) {

                        form.on('blur.' + namespace + ' change.' + namespace + ' keyup.' + namespace + ' buttonCheckUp', allTypes, function(event) {

                            var form = $(this).closest('form'),
                                formValid = true;

                            form.find(allTypes).each(function() {

                                var status = validateField.call(this, event, options);

                                if (!status.pattern || !status.conditional || !status.required) {
                                    formValid = false;
                                }

                            });

                            // Is a function?
                            if ($.isFunction(options.switching)) {

                                options.switching.call(form, event, options, formValid);

                            }

                        });

                    }

                }
            });
        },

        // Method to destroy validations
        validateDestroy : function(options) {

            var form = $(this),

                dataValidate = form.data(name);

            if (!!options && !!options.namespace) {

                form.off('blur.' + options.namespace + ' change.' + options.namespace + ' keyup.' + options.namespace + ' buttonCheckUp');

            }

            // If this is a form
            if(form.is('form') && $.isPlainObject(dataValidate) && typeof(dataValidate.options.nameSpace) == 'string') {

                var fields = form.removeData(name).find(allTypes).add(form);

                if(form.is('[id]')) {

                    fields = fields.add($('[form="' + form.prop('id') + '"]').filter(allTypes));
                }

                fields.off('.' + dataValidate.options.nameSpace);
            }

            return form;
        }
    });
})({

    // Send form if is valid?
    sendForm : true,

    // Use WAI-ARIA properties
    waiAria : true,

    // Validate on submit?
    onSubmit : true,

    // Validate on onKeyup?
    onKeyup : false,

    // Validate on onBlur?
    onBlur : false,

    // Validate on onChange?
    onChange : false,

    // Default namespace
    nameSpace : 'validate',

    // Conditional functions
    conditional : {},

    // Prepare functions
    prepare : {},

    // Fields descriptions
    description : {},

    // Callback
    eachField : $.noop,

    // Callback
    eachInvalidField : $.noop,

    // Callback
    eachValidField : $.noop,

    // Callback
    invalid : $.noop,

    // Callback
    valid : $.noop,

    // Callback
    switching : $.noop,

    // A fielter to the fields
    filter : '*',

    buttonSwitching: false

}, jQuery, window);
$(document).ready(function() {

    // User interface
    site.init();

    // Init UI modules
    siteModules.hashNav();

    siteModules.dropDown({
        selector: 'js-dropDown'
    });

    siteModules.accordions({
        selector: '.js-accordion'
    });

    siteModules.tabs({
        selector: '.js-tabs'
    });

    siteModules.spoilers({
        selector: '.js-spoiler'
    });

    siteModules.pockets({
        selector: '.js-pocket'
    });

    siteModules.loadingOnRequire({
        btn: '.js-loading-on-require'
    });

    siteModules.imagesOnRetinaDisplays();

    // Init plugins
    sitePlugins.popUps();
    sitePlugins.scrollBars();

    sitePlugins.carousels({
        selector: '.b-carousel'
    });

    // Init forms handlers
    forms.init('.b-page');

});

// UI
var site = (function(window, undefined) {

    'use strict';

    function onLoadPage() {

        $(window).bind('load.pageReady', function() {

            // YMaps API
            //helpers.async('http://api-maps.yandex.ru/2.1/?load=package.full&lang=ru-RU&onload=YandexMaps.init');

            // YShare API
            //helpers.async('//yastatic.net/es5-shims/0.0.2/es5-shims.min.js');
            helpers.async('//yastatic.net/share2/share.js');

            // ReCaptcha
            // helpers.async('https://www.google.com/recaptcha/api.js?onload=reCaptchaOnLoad&render=explicit');

            // VK API
            // helpers.async('//vk.com/js/api/openapi.js?116');

            // Facebook API
            // helpers.async('//connect.facebook.net/ru_RU/sdk.js#xfbml=1&version=v2.6');

        });

    }

    function targetBlank() {

        $('a[data-target="_blank"]')
            .on('click', function() {

                return !window.open($(this).attr('href'));

            });

    }

    function orderedLists() {

        $('ol[start]').each(function() {

            $(this).css({ counterReset: 'list ' + (parseInt($(this).attr('start')) - 1) });

        });

    }

    function backgrounds(options) {

        options = !!options ? options : {};
        options.namespace = !!options.namespace ? options.namespace + ' ' : '';

        var $img = $(options.namespace + '[data-background-image]'),
            $color = $(options.namespace + '[data-background-color]');

        $img.each(function() {

            $(this).css({
                backgroundImage: 'url(' + $(this).data('backgroundImage') + ')'
            });

        });

        $color.each(function() {

            $(this).css({
                backgroundColor: $(this).data('backgroundColor')
            });

        });

    }

    function verticalAlignment() {

        $('.js-flexRows').flexRows({
            auto: true,
            strong: false,
            selector: '.js-flexRowsTile'
        });

        $('.b-mp-sights_feed').flexRows({
            auto: true,
            strong: false,
            selector: '.b-mp-sight'
        });

    }

    function footerBottom() {

        var $page = $('.b-page'),
            $footer = $('.b-footer', $page),

            screens = [/*'xs', 'sm', */'md', 'lg'];

        _processing();

        $footer.on('footer.refresh', _processing);

        $(window).bind('load.refreshFooterPosition resize.refreshFooterPosition', _processing);

        function _processing() {

            if (screens.indexOf(helpers.screen()) >= 0) {

                $page.css({ paddingBottom: $footer.outerHeight(true) });
                $footer.css({ position: 'absolute', zIndex: 0, left: 0, bottom: 0, right: 0, minWidth: 320 })

            } else {

                $page.css({ paddingBottom: '' });
                $footer.css({ position: '', zIndex: '', left: '', bottom: '', right: '', minWidth: '' });

            }

        }

    }

    function header() {

        $('body')
            .on('focus.hdrSearchFocus', '.b-header_bar_search_field input', function() {

                $(this).closest('.b-header_bar_search').toggleClass('active', true);

            })
            .on('blur.hdrSearchBlur', '.b-header_bar_search_field input', function() {

                $(this).closest('.b-header_bar_search').toggleClass('active', !!$(this).val().length);

            });

    }

    return {
        init: function() {

            // Footer positioning
            footerBottom();

            // On load page
            onLoadPage();

            // Vertical align
            verticalAlignment();

            // Valid target attribute
            targetBlank();

            // Set start num for ol
            orderedLists();

            // Background
            backgrounds();

            // Header
            header();

        },
        setBackgrounds: backgrounds
    };

})(window);
var forms = (function(window, undefined) {

    'use strict';

    function init(namespace) {

        forms.styleControls(namespace + ' input[type="checkbox"], ' + namespace + ' input[type="radio"]', namespace + ' select:not([multiple]):not(.js-selectric)', namespace + ' input[type="file"]:not(.js-dropZone, .js-uploader, .js-photo-uploader-input)');
        forms.styleSelects(namespace + ' select.js-selectric');

        forms.maskedInput(namespace);
        forms.makePlaceholders(namespace + ' [placeholder]');

        forms.validate(namespace);
        forms.resetForm();

        forms.rangeFields(namespace);
        forms.datePicker(namespace);

    }

    function validate(namespace) {

        $(namespace + ' form:not(.js-order)').each(function() {

            var $form = $(this);

            if ($.isFunction($.fn.validate) && $form.data('checkup')) {

                $form
                    .validate({
                        onChange: !!$form.data('checkupOnChange') ? $form.data('checkupOnChange') : false,
                        onKeyup: !!$form.data('checkupOnKeyup') ? $form.data('checkupOnKeyup') : false,
                        onBlur: !!$form.data('checkupOnBlur') ? $form.data('checkupOnBlur') : false,
                        conditional: {

                            passwords: function() {

                                return $(this).val() === $('[data-conditional-check="passwords"]').val();

                            },

                            checkboxes: function() {

                                var flag = true;

                                $(this).closest('.b-form_box_field').find('input[type="checkbox"]').each(function() {

                                    flag = $(this).is(':checked');

                                    return !flag;

                                });

                                return flag;

                            }

                        },
                        eachValidField: function() {

                            formNotifications.hideErrorLabel.call($(this));

                        },
                        eachInvalidField: function(status, options) {

                            var conditional = !!$(this).data('conditionalType') ? formNotifications.labels.conditional[$(this).data('conditionalType')] : formNotifications.labels.conditional[$(this).data('conditional')] || formNotifications.labels.conditional.def,
                                pattern = !!$(this).data('patternType') ? formNotifications.labels.pattern[$(this).data('patternType')] : formNotifications.labels.pattern.def,

                                notification = (options.required) ? ((!options.conditional) ? conditional : (!options.pattern) ? pattern : '') : !!$(this).data('requiredType') ? formNotifications.labels.required[$(this).data('requiredType')] : formNotifications.labels.required.def;

                            formNotifications.showErrorLabel.call($(this), notification, 0);

                        },
                        valid: function(e) {

                            var $form = $(this),
                                $btn = $(this).find('button[type="submit"].e-btn'),

                                xhrSubmit = !!$(this).data('xhr'),

                                validHandler = $(this).data('handler'),
                                validHandlerMethod = $(this).data('handlerProperty');

                            if (typeof window[validHandler] === 'function') {

                                window[validHandler].call($form, e);

                            }
                            else if (typeof window[validHandler] === 'object') {

                                if (!!window[validHandler][validHandlerMethod]) {

                                    window[validHandler][validHandlerMethod].call($form, e);

                                }

                            }

                            if (xhrSubmit) {

                                e.preventDefault();

                                if ($.isFunction($.fn.ajaxSubmit)) {

                                    $form.ajaxSubmit({
                                        url: $form.attr('action'),
                                        method: $form.attr('method'),
                                        dataType: 'json',
                                        beforeSubmit: function() {

                                            $btn.toggleClass('request');

                                        },
                                        success: function(response) {

                                            $btn.toggleClass('request');
                                            xhrFormHandler.response.call($form, response);

                                            $form.trigger('order.success');

                                        }
                                    });

                                } else {

                                    $.ajax({
                                        url: $form.attr('action'),
                                        method: $form.attr('method'),
                                        data: $form.serialize(),
                                        dataType: 'json',
                                        before: function() {

                                            $btn.toggleClass('request');

                                        },
                                        success: function(response) {

                                            $btn.toggleClass('request');
                                            xhrFormHandler.response.call($form, response);

                                            $form.trigger('order.success');

                                        }
                                    });

                                }

                            }

                        }

                    })
                    .on('focus rating selectric-before-open refresh.validate', 'input, textarea, select', function() {

                        $(this).closest('.m-valid').removeClass('m-valid');
                        $(this).closest('.m-error').removeClass('m-error');

                    });

            }

            // Check to toggle a button
            if ($form.data('checkupBtn')) {

                $form.validate({
                    nameSpace : 'buttonSwitching',
                    onKeyup: true,
                    onBlur: true,
                    buttonSwitching: true,
                    switching: function(event, options, btnState) {

                        $(this).data('validateStatus', options);

                        var xhrValidateState = typeof $form.data('xhrValidateState') !== 'undefined' ? $form.data('xhrValidateState') : true,
                            prop = btnState && xhrValidateState;

                        $(this).find('button[type="submit"]').prop('disabled', !prop);

                    }
                });

            }

        }); // End loop

    }

    function styleControls(input, select, file) {

        if ($.isFunction($.fn.uniform)) {

            // Inputs
            $(input)
                .not('.js-switch')
                .uniform();

            // Select
            if(!!select) {

                $(select).uniform({
                    selectAutoWidth: false,
                    selectClass: 'e-select'
                });

            }

            // File
            if(!!file) {

                $(file).each(function() {

                    $(this).uniform({
                        fileButtonHtml: '',
                        fileClass: 'e-uploader e-btn e-btn_grey e-btn_overlay i-ico i-ico-upload',
                        filenameClass: 'e-uploader_file',
                        fileButtonClass: 'e-uploader_btn',
                        fileDefaultHtml: $(this).data('label') || 'Загрузить'
                    });

                });

            }

        }

    }

    function styleSelects(selector) {

        if (helpers.mobile()) {

            if ($.isFunction($.fn.uniform)) {

                $(selector).uniform({
                    selectAutoWidth: false,
                    selectClass: 'e-select'
                });

            }

        }
        else {

            if ($.isFunction($.fn.selectric)) {

                $(selector).selectric({
                    maxHeight: 184,
                    arrowButtonMarkup: '',
                    disableOnMobile: false,
                    optionsItemBuilder: function(data, el) {

                        var storage = $(el).data();

                        return data.text + ((!!storage.price && !!storage.currency) ? '&nbsp;&ndash; <strong>' + storage.price + '&nbsp;<i class="' + storage.currency + '"></i></strong>' : '');

                    },
                    labelBuilder: function(data) {

                        var icon = 'i-sprite i-sprite-chevron-down',
                            text = data.value !== '' ? data.text : '<span class="placeholder">' + data.text + '</span>';

                        return !!icon ? '<span class="' + icon + '">' + text + '</span>' : text;

                    }
                });

                filterField();

                strongWidth();
                $(window).bind('resize.selectricWidth', strongWidth);

            }

        }

        function filterField() {

            $(selector).each(function() {

                if (!!$(this).data('filterField')) {

                    var $wg = $(this).closest('.selectric-wrapper'),
                        $wgDrop = $('.selectric-items', $wg),
                        $wgList = $('.selectric-list', $wg),

                        $field = $('<div class="selectric-filter"></div>'),
                        $fieldInput = $('<input type="text" placeholder="Поиск" />').appendTo($field),

                        $wgListNotFound = $('<div class="selectric-list-not-found"">Совпадений не найдено</div>').hide(),

                        length = 0;

                    $wgDrop.prepend($field);
                    $wgDrop.append($wgListNotFound);

                    $fieldInput.keyup(function() {

                        var valThis = $(this).val().toLowerCase();

                        $wgList.find('li').each(function() {

                            var text = $(this).text().toLowerCase();

                            length += text.indexOf(valThis) === 0 ? 1 : 0;
                            $(this).toggle(text.indexOf(valThis) === 0);

                        });

                        $wgListNotFound.toggle(!length);

                    });

                    $(this).on('selectric-open', function() {

                        setTimeout(function() {

                            $fieldInput.focus();

                        }, 250);

                    });

                    $(this).on('selectric-before-close', function() {

                        $fieldInput.val('');
                        $wgList.find('li').show();

                    });

                }

            });

        }

        function strongWidth() {

            $(selector).each(function() {

                var $wg = $(this).closest('.selectric-wrapper').css({ width: '' });

                if (!!$(this).data('width')) {

                    switch ($(this).data('width')) {

                        default:

                            $wg.css({ width: $(this).data('width') });
                            break;

                        case 'strong':

                            $wg.css({ width: $wg.outerWidth() });
                            break;

                    }

                }

            });

        }

    }

    function makePlaceholders(selector) {

        $(selector).each(function() {

            makeLabelsPlaceholders.call($(this));

        });

    }

    function makeLabelsPlaceholders() {

        var placeholdersIsSupports = 'placeholder' in document.createElement('input');

        if (!placeholdersIsSupports && this.is('input:not([type="radio"]):not([type="checkbox"]):not(.js-spinner), textarea')) {

            var $field = this.attr('id', !!this.attr('id') ? this.attr('id') : helpers.randomString(6)),
                $placeholder = $('<label class="b-form_box_field_placeholder" for="' + this.attr('id') + '">' + this.attr('placeholder') + '</label>').toggleClass('complete', !!this.val().length);

            $field
                .after($placeholder)
                .on('focus blur change', function() {

                    $placeholder.toggleClass('complete', !!$(this).val().length);

                });

        }

    }

    function maskedInput(namespace) {

        if ($.isFunction($.fn.inputmask)) {

            $(namespace + ' [data-masking]').each(function() {

                $(this).inputmask({
                    mask: $(this).data('masking') || '+7 (999) 999-99-99',
                    placeholder: '_',
                    showMaskOnHover: false
                });

            });

        }

    }

    function resetForm() {

        $('body').on('click', '.js-reset-form', function(e) {

            e.preventDefault();

            var $form = $(this).closest('form');

            $form[0].reset();

            $form.find('input[type="text"], select').not('[data-default]').val('');
            $form.find('input[type="radio"], input[type="checkbox"]').prop('checked', false);

            $form.find('select').selectric('refresh');

            $form.find('.js-range').slider('option', {
                values: [
                    $($form.find('.js-range').data('from')).data('default'),
                    $($form.find('.js-range').data('to')).data('default')
                ]
            });

            $.uniform.update();

        });

    }

    function datePicker(namespace) {

        $(namespace + ' .js-calendar').each(function() {

            var $field = $(this);

            if (!!helpers.mobile()) {

                var $date = $('<input type="date" />');

                $field.closest('.b-form_box_field').toggleClass('b-form_box_field_date', true);
                $field.after($date);

                $date.on('change', function() {

                    $field.val(_format($field, $(this).val()));

                    if (!!$field.data('bindingMin')) {

                        _bindingDates();

                    }

                });

            }
            else {

                if ($.isFunction($.fn.datepicker)) {

                    $field
                        .datepicker({
                            dateFormat: 'dd.mm.yy',
                            showOtherMonths: true,
                            selectOtherMonths: true
                        })
                        .datepicker('option', $.datepicker.regional[$field.data('local') || 'ru-RU']);

                }

            }

        });

        function _format($field, date) {

            if (new Date(Date.parse(date)) < new Date(Date.parse($field.attr('min')))) {

                date = $field.attr('min');

            }

            var arr = date.split('-');
            return arr[2] + '.' + arr[1] + '.' + arr[0];

        }

    }

    function rangeFields(namespace) {

        $(namespace).on('change.rangeFields keyup.rangeFields', '[data-range-min]', function(e) {

            var $this = $(this),

                min = parseInt($($this.data('rangeMin')).val(), 10),
                val = parseInt($this.val(), 10),

                step = $this.data('rangeStep') || 1;

            if (val <= min) {

                $this.val(min + step);

            }

        });

        $(namespace).on('change.rangeFields keyup.rangeFields', '[data-range-max]', function(e) {

            var $this = $(this),

                max = parseInt($($this.data('rangeMax')).val(), 10),
                val = parseInt($this.val(), 10),

                step = $this.data('rangeStep') || 1;

            if (val >= max) {

                $($this.data('rangeMax')).val(val + step);

            }

        });

    }

    function reCaptcha(namespace) {

        var $wg = $(namespace + ' .js-reCaptcha');

        $wg.each(function() {

            var id = helpers.randomString(8),
                $form = $(this).closest('form');

            $(this).append($('<div class="g-recaptcha" id="' + id + '"></div>'));

            grecaptcha.render(id, {
                sitekey: $(this).data('siteKey') || helpers.reCaptchaKey || '',
                callback: function(response) {

                    if (!!response) {

                        $form.find('button[type="submit"].e-btn').prop('disabled', false);

                    }

                }
            });

        });

    }

    return {
        init: init,
        datePicker: datePicker,
        makePlaceholders: makePlaceholders,
        maskedInput: maskedInput,
        rangeFields: rangeFields,
        reCaptcha: reCaptcha,
        resetForm: resetForm,
        styleControls: styleControls,
        styleSelects: styleSelects,
        validate: validate
    };

})(window);

var formNotifications = (function(window, undefined) {

    var settings = {
        errorClass: 'm-error',
        errorSuffix: '_error',
        validClass: 'm-valid'
    };

    var extendLabels = typeof formNotices !== 'undefined' ? formNotices : {},

        labels = {
            required: {
                def: 'Это поле необходимо заполнить'
            },
            conditional: {
                def: 'Введенные данные не совпадают',
                credit: 'Некорректный номер банковской карты',
                passwords: 'Введенные пароли не совпадают',
                checkboxes: 'Необходимо выбрать один из параметров',
                inn: 'Ошибка в ИНН',
                snils: 'Ошибка в номере СНИЛС'
            },
            pattern: {
                def: 'Некорректный формат данных',
                email: 'Некорректный адрес электронной почты',
                phone: 'Некорректный номер телефона'
            },
            uploader: {
                count: 'Вы пытаетесь загрузить больше изображений, чем это допустимо',
                uploading: 'Во время загрузки изображений возникла ошибка'
            },
            submit: {
                success: 'Спасибо. Мы свяжемся с вами в ближайшее время.',
                error: 'Ошибка.'
            }
        };

    labels = $.extend({}, labels, extendLabels);

    // Notification alerts
    function showMessage(msg, status, hideForm, callback) {

        var $notice = this.find('.b-form_message').length ? this.find('.b-form_message') : $('<div class="b-form_message"></div>').prependTo(this),
            suffix = status ? 'success' : 'error';

        $notice
            .height($notice.height())
            .html('<div class="b-form_message_balloon b-form_message_balloon__' + suffix + '"><div class="b-form_message_balloon_capsule"><div class="b-form_message_balloon_capsule_inner">' + msg + '</div></div></div>');

        $notice
            .toggleClass('b-form_message__show', true)
            .animate({ height: $notice.find('.b-form_message_balloon').height(), paddingBottom: hideForm ? 0 : 30 }, 300, 'easeOutQuart', function() {

                $(this).css({ height: '' });

            });

        if (hideForm) {

            this
                .find('form')
                .toggleClass('b-form__hide', true)
                .slideUp({ duration: 300, easing: 'easeOutQuart' });

        }

        // Callback
        if(!!callback) {

            callback.call(this);

        }

    }

    function showMessageInPopUp(msg, status, hideForm, callback) {

        var $form = this.find('form'),
            $msg =
                $('<div class="b-form_message b-form_message__show">' +
                    '<div class="b-form_message_balloon b-form_message_balloon__' + (status ? 'success' : 'error') + '">' +
                    '<div class="b-form_message_balloon_capsule">' +
                    '<div class="b-form_message_balloon_capsule_inner">' + msg + '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>');

        if ($form.data('inPopUpClear')) {

            $msg = msg;

        }

        this.leafLetPopUp('show', {
            animationStyleOfBox: 'scale',
            animationStyleOfChange: 'slide',
            boxWidth: 590,
            boxHorizontalGutters: 50,
            boxVerticalGutters: 50,
            closeBtnLocation: 'no',
            closeBtnClass: 'i-icon i-close-circle',
            content: $msg,
            overlayOpacity: .65,
            scrollLocker: $('.b-page'),
            beforeLoad: function() {

                var $this = this;

                $this.find('.b-leaflet_box').addClass('b-form_message_balloon_leaflet');

            },
            afterLoad: function() {

                if (hideForm) {

                    $form
                        .toggleClass('disabled', true)
                        .find('input, select, textarea, button')
                        .prop('disabled', true);

                    $.uniform.update($form.find('input, select, textarea'));

                }

                // Callback
                if(!!callback) {

                    callback.call(this);

                }

            }
        });

    }

    function hideMessage() {

        var $notice = this.find('.b-form_message').length ? this.find('.b-form_message') : $('<div class="b-form_message"></div>').prependTo(this);

        $notice
            .slideUp({duration: 300, easing: 'easeOutQuart' });

    }

    // Notification labels
    function showErrorLabel(text, status) {

        var $field = this.closest('.b-form_box_field');

        $field
            .find('.b-form_box' + settings.errorSuffix).remove();

        $field
            //.find('.b-form_box_field')
            .append('<div class="b-form_box' + settings.errorSuffix + '">' + text + '</div>');

        setTimeout(function() {

            $field
                .removeClass(settings.validClass)
                .addClass(settings.errorClass);

        }, 100);

    }

    function hideErrorLabel() {

        var $field = this.closest('.b-form_box_field');

        $field.removeClass(settings.errorClass);
        $field.find('.b-form_box' + settings.errorSuffix).remove();

        if ($field.find('[data-required]').length) {

            setTimeout(function() {

                $field.addClass(settings.validClass);

            }, 100);

        }

    }

    return {
        labels: labels,
        showErrorLabel: showErrorLabel,
        showMessage: showMessage,
        showMessageInPopUp: showMessageInPopUp,
        hideErrorLabel: hideErrorLabel,
        hideMessage: hideMessage
    };

})(window);

var xhrFormHandler = (function(window, undefined) {

    function response(response) {

        var $form = this,
            message = '';

        // start check
        if (typeof response.fields === 'boolean' && response.fields) {

            if (response.captcha || typeof response.captcha === 'undefined') {

                // Success action
                message = response.msg || formNotifications.labels.submit.success;

                if (!!$form.data('inPopUp')) {

                    formNotifications.showMessageInPopUp.call(this.closest('.b-form'), message, true, response.hideForm);

                } else {

                    formNotifications.showMessage.call(this.closest('.b-form'), message, true, response.hideForm);

                }

            } else {

                // Captcha error action
                message = response.msg || formNotifications.labels.submit.error;
                captchaHandler.call(this, response);

            }

            // Redirect user
            if (!!response.redirect) {

                redirect(response.redirect);

            }

        } else if (typeof response.fields === 'object') {

            // Get error message string
            var messageStr = ' Некорректно заполнены поля: ';

            $.each(response.fields, function(key, value) {

                var fieldName = $form.find('[name="' + key + '"]').attr('placeholder') || $form.find('[name="' + key + '"]').closest('.b-form_box').find('.b-form_box_title').text().replace(' *', '');

                messageStr += '&laquo;' + fieldName + '&raquo;, ';

            });

            message = response.msg || formNotifications.labels.submit.error + messageStr.substring(0, messageStr.length - 2) + '.';

            // Init handlers
            captchaHandler.call(this, response);

            if (!!$form.data('inPopUp')) {

                formNotifications.showMessageInPopUp.call(this.closest('.b-form'), message, false, false, function(form) {

                    highlightFields($form, response.fields);

                });

            } else {

                formNotifications.showMessage.call(this.closest('.b-form'), message, false, false, function(form) {

                    highlightFields($form, response.fields);

                });
            }


        } else {

            if ('console' in window) {
                console.log('Неверный формат ответа обработчика формы');
                console.log(response);
            }

        }

    }

    function highlightFields(form, array) {

        $.each(array, function(key, value) {

            formNotifications.showErrorLabel.call(form.find('[name="' + key + '"]'), value, 0);

        });

    }

    function captchaHandler(response) {

        this.find('[name*="captcha"]').val('');
        this.find('img').attr('src', response.captchaImg);

        if (!response.captcha && typeof response.captcha !== 'undefined') {

            formNotifications.showErrorLabel.call(this, forms.msg.captcha, 0);

        }

    }

    function redirect(settings) {

        var seconds = settings.timer / 1000,
            $counter = $(settings.counter).text(seconds),

            withCounting = $counter.length && !!settings.timer,
            timeout = setTimeout(withCounting ? countdown : redirect, withCounting ? 1000 : !!settings.timer ? settings.timer : 100);

        function countdown() {

            $counter[0].innerHTML--;

            if ($counter[0].innerHTML === 0) {

                redirect();
                clearTimeout(timeout);

            } else {

                setTimeout(countdown, 1000);

            }

        }

        function redirect() {

            window.location = settings.url;

        }

    }

    return {
        response: response
    };

})(window);


var siteModules = (function(window, undefined) {

    function accordions(options) {

        options.selector = !!options.selector ? options.selector : '.js-accordion';
        options.namespace = !!options.namespace ? options.namespace + ' ' : '';

        // Init
        init(options);

        $(window).bind('resize.pocketReInit', function() {

            helpers.delay.call($('body'), init(options), 250);

        });

        function init(options) {

            var $accordion = $(options.namespace + options.selector);

            $accordion.each(function() {

                var $accordion = $(this),
                    screens = !!$accordion.data('resolutions') ? $accordion.data('resolutions').split(',') : ['xs', 'sm', 'md', 'lg'];

                $accordion.data('screens', screens);

                if (screens.indexOf(helpers.screen()) >= 0) {

                    $accordion.find('li > ul, li > div').slideUp({ duration: 0 });
                    $accordion.find('.opened').find('> ul, > div').slideDown({ duration: 0 });

                }
                else {

                    $accordion.find('li > ul, li > div').show();

                }

                    $accordion
                        .find(/*'li > a, */'li > a > .js-accordion-trigger, li > span')
                        .unbind('click.accordionClick')
                        .each(function() {

                            var childLevel = !!$(this).closest('li').find('> ul, > div').length;

                            $(this)
                                .closest('li')
                                .toggleClass('hasChild', childLevel);

                            if (screens.indexOf(helpers.screen()) >= 0) {

                                $(this)
                                    .bind('click.accordionClick', function(e) {

                                        //if (childLevel) {
                                        if ($(this).closest('li').hasClass('hasChild')) {

                                            e.preventDefault();

                                            // Close neighbors items
                                            if (!!$accordion.data('neighbors')) {

                                                var $siblings = $(this).closest('li').siblings();

                                                $siblings.toggleClass('opened', false);

                                                $siblings
                                                    .find('> ul, > div')
                                                    .slideUp({ duration: 200, easing: 'easeOutQuart', complete: function() { $(window).trigger('aside.refresh'); } });

                                            }

                                            // Open current item
                                            var $current = $(this).closest('li');

                                            $current.toggleClass('opened');

                                            $current
                                                .find('> ul, > div')
                                                .slideToggle({ duration: 200, easing: 'easeOutQuart', complete: function() { $(window).trigger('aside.refresh'); } });

                                        }

                                    });

                            } else {

                                /*$(this)
                                    .closest('li')
                                    .toggleClass('hasChild', false);*/

                            }

                        });

                $accordion
                    .unbind('accordion.close')
                    .bind('accordion.close', function() {

                        if ($accordion.data('screens').indexOf(helpers.screen()) >= 0) {

                            $(this).find('li').each(function() {

                                $(this).toggleClass('opened', false);

                                $(this)
                                    .find('> ul, > div')
                                    .slideUp({ duration: 200, easing: 'easeOutQuart', complete: function() { $(window).trigger('aside.refresh'); } });

                            });

                        }

                    });

                $accordion
                    .unbind('accordion.open')
                    .bind('accordion.open', function() {

                        if ($accordion.data('screens').indexOf(helpers.screen()) >= 0) {

                            $(this).find('li').each(function() {

                                $(this).toggleClass('opened', true);

                                $(this)
                                    .find('> ul, > div')
                                    .slideDown({ duration: 200, easing: 'easeOutQuart', complete: function() { $(window).trigger('aside.refresh'); } });

                            });

                        }

                    });

            });

        }

    }

    function autoComplete(namespace) {

        namespace = !!namespace ? namespace + ' ' : '';

        var $fields = $(namespace + '.js-autoComplete');

        $fields.each(function() {

            var $this = $(this).attr('autocomplete', 'off'),
                $wrapper = $this.parent(),

                $wg = $('<div class="b-autoComplete"></div>').appendTo($wrapper),
                $wgList = $('<ul class="b-autoComplete_list"></ul>').prependTo($wg);

            $this.on('keypress.autoComplete get.autoComplete', function(e) {

                var value = $(this).val();

                if (value.length > 1) {

                    $.ajax({
                        url: $this.closest('form').attr('action') || $this.data('source'),
                        method: $this.closest('form').attr('method') || 'post',
                        data: $this.closest('form').serialize(),
                        dataType: 'json',
                        success: function (response) {

                            if (response.status) {

                                $wgList.html(response.results);
                                $wg.toggleClass('opened', true);

                                site.setBackgrounds({
                                    namespace: '.b-autoComplete_list'
                                });

                                $(document)
                                    .unbind('touchend.closeAutoComplete click.closeAutoComplete')
                                    .bind((navigator.userAgent.match(/iPhone|iPad|iPod/i)) ? 'touchend.closeAutoComplete' : 'click.closeAutoComplete', function(e) {

                                        var $target = $(e.target),

                                            wgClass = $wrapper.attr('class').split(' ')[0],
                                            targetIsWg = $target.hasClass(wgClass) || !!$target.closest('.' + wgClass).length && !$target.is('button[type="reset"]');

                                        if (!targetIsWg) {

                                            $wg.toggleClass('opened', false);

                                            setTimeout(function() {

                                                $wgList.empty();

                                            }, 350);

                                        }

                                    });

                            }

                        }
                    });

                }

            });

        });

    }

    function dropDown(options) {

        var $locker = !!options.locker ? options.locker : $('.b-page');

        options.switch = !!options.switch ? options.switch : 'opened';

        $(document).bind(/*(navigator.userAgent.match(/iPhone|iPad|iPod/i)) ? 'touchend.dropDown' + options.selector : */'click.dropDown' + options.selector, function(e) {

            var $target = $(e.target),

                targetIsSwitcher = $target.hasClass(options.selector + '-toggle') || !!$target.closest('.' + options.selector + '-toggle').length,
                isSwipeAction = helpers.touches.touchmove.y > -1 && (Math.abs(helpers.touches.touchstart.y - helpers.touches.touchmove.y) > 5);

            if (targetIsSwitcher) {

                $target = $target.hasClass(options.selector + '-toggle') ? $target : $target.closest('.' + options.selector + '-toggle');

                if ($target.is('a')) { e.preventDefault(); }

                var screens = !!$target.data('resolutions') ? $target.data('resolutions').split(',') : ['xs', 'sm', 'md', 'lg'],
                    touchOnly = !!$target.data('touch') ? $target.data('touch') : false;

                if (screens.indexOf(helpers.screen()) >= 0 && touchOnly ? !!helpers.mobile() : true) {

                    e.preventDefault();

                    var $dropDown = $target.closest('.' + options.selector),
                        state = $dropDown.hasClass(options.switch);

                    $('.' + options.selector).toggleClass(options.switch, false);

                    $dropDown.toggleClass(options.switch, !state);
                    $dropDown.find('.' + options.selector + '-box').toggleClass(options.switch, !state);

                    if (!!options.onToggle) {

                        options.onToggle.call($dropDown, !state);

                    }

                    if (!!$dropDown.data('lock')) {

                        if (!state) {

                            _lockPage.call($locker);

                        } else {

                            _unLockPage.call($locker);

                        }

                    }

                    setTimeout(function() {

                        $(window).trigger('aside.stepRefresh');

                    }, 300);

                }

            }
            else if (!isSwipeAction && (!$target.closest('.' + options.selector + '-box').length || $target.hasClass(options.selector + '-close'))) {

                $('.' + options.selector).each(function() {

                    var $this = $(this),

                        state = $this.hasClass('opened'),
                        screens = !!$(this).find(options.selector + '-toggle').data('resolutions') ? $(this).find(options.selector + '-toggle').data('resolutions').split(',') : ['xs', 'sm', 'md', 'lg'];

                    if (screens.indexOf(helpers.screen()) >= 0) {

                        $this.toggleClass(options.switch, false);

                        if ($this.data('lock') && state) {

                            _unLockPage.call($locker);

                        }

                        if (!!options.onToggle) {

                            options.onToggle.call($this, false);

                        }

                        setTimeout(function() {

                            $(window).trigger('aside.stepRefresh');

                        }, 300);

                    }

                });

            }

            helpers.touches = {
                touchstart: {x: -1, y: -1 },
                touchmove: { x: -1, y: -1 }
            };

        });

        $('.' + options.selector)
            .on('dropDown.open', function() {

                $(this).toggleClass(options.switch, true);

                if (!!$(this).data('lock')) {

                    _lockPage.call($locker);

                }

            })
            .on('dropDown.close', function() {

                $(this).toggleClass(options.switch, false);
                _unLockPage.call($locker);

            });

        function _lockPage() {

            var $body = $('body'),
                scroll = document.documentElement.scrollTop || document.body.scrollTop;

            this.data('isLocked', true);
            this.data('vpOverflow', $body.css('overflow'));
            this.data('lockScrollState', scroll);

            $body.css({
                position: 'fixed',
                overflow: 'hidden',
                paddingRight: helpers.getScrollBarWidth(),
                marginTop: -scroll,
                height: '100%'
            });

        }

        function _unLockPage() {

            if (!!this.data('isLocked')) {

                setTimeout($.proxy(function() {

                    $('body').css({
                        position: '',
                        overflow: '',
                        paddingRight: '',
                        marginTop: '',
                        height: ''
                    });

                    window.scrollBy(0, this.data('lockScrollState'));

                }, this), 300);

            }

        }

    }

    function spoilers(options) {

        options = !!options ? options : {};
        options.namespace = !!options.namespace ? options.namespace + ' ' : '';

        options.toggleClass = !!options.toggleClass ? options.toggleClass : 'opened';

        // Hash check
        var hash = location.hash;

        if (!!hash && hash.match('spoiler')) {

            $(options.selector).each(function() {

                $(this).removeClass('opened');

                if ($(this).attr('id') === hash.split('#')[1]) {

                    $(this).addClass('opened');

                }

            });

        }

        // Init
        init(options);

        $(window).bind('resize.spoilerReInit', function() {

            init(options);

        });

        function init(options) {

            $(options.namespace + options.selector).each(function() {

                var $spoiler = $(this).toggleClass('js-spoiler-active', true),

                    $body = $spoiler.find(options.selector + '-box').css({ display: '' }),
                    $toggle = $spoiler.find(options.selector + '-toggle').unbind('click.spoiler'),

                    screens = !!$spoiler.data('resolutions') ? $spoiler.data('resolutions').split(',') : ['xs', 'sm', 'md', 'lg'];

                if (screens.indexOf(helpers.screen()) >= 0) {

                    $spoiler.not('.' + options.toggleClass).find(options.selector + '-box').slideDown(0).slideUp(0);
                    $spoiler.filter('.' + options.toggleClass).find(options.selector + '-box').slideDown(0);

                    $toggle
                        .bind('click.spoiler', function(e) {

                            if (!$(e.target).is('a[href]:not(a[href="#"])')) {

                                e.preventDefault();

                            }

                            if (!$(e.target).hasClass('e-hint') && !$(e.target).closest('.e-hint').length) {

                                var item = $(this).closest(options.selector),
                                    state = item.hasClass(options.toggleClass) && item.find(/*'> ' + */options.selector + '-box').is(':visible');

                                if (!state) {

                                    spoilerOpen.call(item, options.selector, options.onToggle);

                                } else {

                                    spoilerClose.call(item, options.selector, options.onToggle);

                                }

                                // Close neighbors items
                                if (!!item.data('closeNeighbors')) {

                                    var $neighbors = typeof item.data('closeNeighbors') === 'boolean' ? item.siblings(options.selector) : item.closest(item.data('closeNeighbors')).find(options.selector);

                                    $neighbors.each(function() {
                                        spoilerClose.call($(this), options.selector);
                                    });

                                }

                            }

                        });

                } else {

                    $spoiler.find(options.selector + '-box').show();

                }

            });

        }

        function spoilerClose(sel, callback) {

            this.toggleClass(options.toggleClass, false);

            var toggle = !!this.find(/*'> ' + */sel + '-toggle').data('closed') ? this.find(/*'> ' + */sel + '-toggle').data('closed') : this.find(/*'> ' + */sel + '-toggle').html();

            if (!!this.find(/*'> ' + */sel + '-toggle').data('closed')) {

                this.find(/*'> ' + */sel + '-toggle').html(toggle);

            }

            this.find(/*'> ' + */sel + '-toggle').toggleClass('active', false);
            this.find(/*'> ' + */sel + '-box').slideUp({ duration: 250, easing: 'easeOutQuart',
                step: function() {

                    $(window).trigger('aside.stepRefresh');

                },
                complete: function() {

                    //$(window).trigger('aside.refresh');

                    if(typeof callback !== 'undefined' && callback) {

                        callback(this);

                    }

                }
            });

        }

        function spoilerOpen(sel, callback) {

            this.toggleClass(options.toggleClass, true);

            var toggle = !!this.find(/*'> ' + */sel + '-toggle').data('opened') ? this.find(sel + '-toggle').data('opened') : this.find(/*'> ' + */sel + '-toggle').html();

            if (!!this.find(/*'> ' + */sel + '-toggle').data('opened')) {

                this.find(/*'> ' + */sel + '-toggle').html(toggle);

            }

            this.find(/*'> ' + */sel + '-toggle').toggleClass('active', true);
            this.find(/*'> ' + */sel + '-box').slideDown({ duration: 250, easing: 'easeOutQuart',
                step: function() {

                    $(window).trigger('aside.stepRefresh');

                },
                complete: function() {

                    //$(window).trigger('aside.refresh');

                    if(typeof callback !== 'undefined' && callback) {

                        callback(this);

                    }

                }
            });

        }

    }

    function pockets(options) {

        // Init
        init(options);

        $(window).bind('load.pocketReInit resize.pocketReInit', function() {

            helpers.delay.call($('body'), function() {

                init(options);

            }, 250);

        });

        function init(options) {

            $(options.selector).each(function() {

                var $pocket = $(this),

                    $pocketBody = $pocket.find(options.selector + '-box'),
                    $pocketBodyInner = $pocket.find(options.selector + '-box-inner').css({ overflow: 'hidden' }),
                    $pocketToggle = $pocket.find(options.selector + '-toggle').unbind('click.pocketModule'),

                    screens = !!$pocket.data('resolutions') ? $pocket.data('resolutions').split(',') : ['xs', 'sm', 'md', 'lg'],

                    heights = !!$pocket.data('heights') ? $pocket.data('heights').split(',') : false,
                    blocks = !!$pocket.data('blocks') ? $pocket.data('blocks').split(',') : false,

                    lines = !!$pocket.data('lines') ? $pocket.data('lines').split(',') : [2, 3, 4, 6, 6];

                if (screens.indexOf(helpers.screen()) >= 0) {

                    $pocket.toggleClass('active', true);
                    $pocketBody.css({ overflow: 'hidden' });

                    var maxHeight = $pocketBodyInner.length ? $pocketBodyInner.outerHeight() : $pocketBody.outerHeight();

                    $pocket.data('range', { min: 0, max: maxHeight });

                    if (!!heights) {

                        $pocket.data('range', {
                            min: parseInt(heights[screens.indexOf(helpers.screen())], 10),
                            max: maxHeight
                        });

                    }
                    else if (!!blocks) {

                        var minHeight = 0,
                            margin = 0,

                            length = blocks[screens.indexOf(helpers.screen())];

                        $pocketBodyInner.find('> *').each(function(i) {

                            if (i < length) {

                                minHeight += $(this).outerHeight();

                                if (i > 0) {

                                    minHeight += Math.max(margin, parseInt($(this).css('margin-top'), 10));

                                }

                                margin = parseInt($(this).css('margin-bottom'), 10);

                            }
                            else {

                                return false;

                            }

                        });

                        $pocket.data('range', {
                            min: minHeight,
                            max: maxHeight
                        });

                    }
                    else if (!!lines) {

                        $pocket.data('range', {
                            min: _getLineHeight.call($pocketBody) * lines[screens.indexOf(helpers.screen())] - 2,
                            max: maxHeight
                        });

                    }

                    if (!$pocket.data('noAnimation')) {

                        $pocketBody
                            .css(helpers.pfx + 'transition', 'max-height ' + options.duration + 'ms')
                            .css('transition', 'max-height ' + options.duration + 'ms');

                    }

                    setTimeout(function() {

                        if (typeof $pocket.data('range') !== 'undefined') {

                            $pocket.not('.opened').find(options.selector + '-box').css({ maxHeight: $pocket.data('range').min });

                        }

                        if ($.isFunction($.fn.owlCarousel)) {

                            $pocketBody.closest('.owl-carousel').trigger('refresh.owl.carousel');

                        }

                    }, 10);

                    $pocketToggle
                        .toggleClass('excess', $pocket.data('range').max <= $pocket.data('range').min)
                        .bind('click.pocketModule', function(e) {

                            e.preventDefault();

                            var $this = $(this).closest(options.selector),
                                state = $this.hasClass('opened');

                            _pocketToggle.call($this, options, !state);

                            // Close neighbors items
                            if (!!$this.data('closeNeighbors')) {

                                var $neighbors = typeof $this.data('closeNeighbors') === 'boolean' ? $this.siblings(options.selector) : $this.closest($this.data('closeNeighbors')).find(options.selector);

                                $neighbors.each(function() {

                                    _pocketToggle.call($(this), options, false);

                                });

                            }

                        });

                } else {

                    $pocket.toggleClass('active', false);

                    $pocketBody.css({ maxHeight: '', overflow: 'visible' });
                    $pocketBodyInner.css({ overflow: '' });

                }

            });

        }

        function _getLineHeight() {

            var lineHeight = this.css('line-height') !== 'normal' ? parseFloat(this.css('line-height')) : 1.14,
                fontSize = Math.ceil(parseFloat(this.css('font-size')));

            lineHeight = typeof lineHeight !== 'undefined' && lineHeight < fontSize ? lineHeight * fontSize : lineHeight;

            return parseInt(typeof lineHeight !== 'undefined' ? lineHeight : fontSize, 10);

        }

        function _pocketToggle(options, state) {

            if (typeof options.onToggle !== 'undefined' && options.onToggle) {

                options.onToggle.call(this, state);

            }

            var $pocket = this,

                $pocketBody = $pocket.find(options.selector + '-box'),
                $pocketBodyInner = $pocket.find(options.selector + '-box-inner'),
                $pocketToggle = $pocket.find(options.selector + '-toggle'),

                stringFlag = state ? 'opened' : 'closed',
                height = state ? $pocketBodyInner.length ? $pocketBodyInner.outerHeight() : $pocket.data('range').max : $pocket.data('range').min;

            $pocket.toggleClass('opened', state);

            $pocketBody.css({ maxHeight: height });
            $pocketToggle.html(!!$pocketToggle.data(stringFlag) ? $pocketToggle.data(stringFlag) : $pocketToggle.html());

            if (!!$pocket.data('noAnimation')) {

                $pocketBody.css({ overflow: state ? '' : 'hidden' });
                $pocketBodyInner.css({ overflow: state ? '' : 'hidden' });

            }

            // Refresh carousel height
            var $parentCarousel = $pocket.closest('.owl-carousel');

            if ($parentCarousel.length) {

                var carouselData = $parentCarousel.data('owl.carousel');

                if (!!carouselData.options.responsive[carouselData._breakpoint].autoHeight) {

                    $parentCarousel.trigger('refresh.owl.carousel');

                }

            }

            setTimeout($.proxy(function() {

                if (typeof options.onToggled != 'undefined' && options.onToggled) {

                    options.onToggled.call(this, state);

                }

            }, this), options.duration);

        }

    }

    function tabs(options) {

        options = !!options ? options : {};
        options.namespace = !!options.namespace ? options.namespace + ' ' : '';

        var widget = options.selector,
            toggle = options.selector + '-toggle',
            toggleItem = options.selector + '-toggle-control',
            content = options.selector + '-wrapper',
            contentAdd = options.selector + '-wrapper-add',
            page = options.selector + '-page',
            manual = options.selector + '-manual';

        init(options);

        $(window).bind('resize.tabsReInit', function() {

            init(options);

        });

        function init(options) {

            $(options.namespace + options.selector).each(function() {

                var $wg = $(this),

                    $wrapper = $(this).find(content),
                    $wrapperAdd = $(this).find(contentAdd),

                    screens = !!$(this).data('resolutions') ? $(this).data('resolutions').split(',') : ['xs', 'sm', 'md', 'lg'];

                if (screens.indexOf(helpers.screen()) >= 0) {

                    // Init tabs
                    $(this).toggleClass('js-init', true);

                    setTimeout(function() {

                        $(this).toggleClass('js-transition', true);

                    }, 500);

                    if (!$(this).find(toggle + ' a.current').length)
                        $(this).find(toggle + ' a:first').addClass('current');

                    if (!$(this).find(toggleItem + '.current').length)
                        $(this).find(toggleItem + ':first').addClass('current');

                    var hash = $(this).find(toggle + ' a.current, ' + toggleItem + '.current').data('hash') || $(this).find(toggle + ' a.current, ' + toggle + ' ' + toggleItem + '.current').attr('href'),
                        height = $(page + hash).outerHeight(true);

                    $(this)
                        .find(page)
                        .toggleClass('opened', false);

                    $(this)
                        .find(page + hash + ', ' + page + hash + '-tab')
                        .toggleClass('opened', true);

                    // Listening events
                    var $btn = $(this).find(options.selector + '-toggle a[href*="#"], ' + toggleItem + ', ' + manual);

                    $btn
                        .unbind(!$btn.is('input') ? 'click.switchTabs' : 'change.changeTabs')
                        .bind(!$btn.is('input') ? 'click.switchTabs' : 'change.changeTabs', function(e) {

                            e.preventDefault();

                            $wrapper.css({ height: $(page + hash + ', ' + page + hash + '-tab').outerHeight(true) });

                            hash = $(this).data('hash') || $(this).attr('href');
                            height = $(page + hash + ', ' + page + hash + '-tab').outerHeight(true);

                            // Off tabs
                            $(this)
                                .closest(widget)
                                .find(toggle + ' a, ' + toggleItem)
                                .toggleClass('current', false);

                            $(this)
                                .closest(widget)
                                .find(page)
                                .toggleClass('opened', false);

                            // On select tab
                            $(this)
                                .toggleClass('current', true);

                            $(this)
                                .closest(widget)
                                .find(page + hash + ', ' + page + hash + '-tab')
                                .toggleClass('opened', true);

                            if ($(this).is(manual)) {

                                $wg.find(options.selector + '-toggle a[href="' + $(this).attr('href') + '"]').toggleClass('current', true);

                            }

                            // Correct wrapper
                            $wrapper.css({ height: '' });
                            /*
                            $wrapper.stop(true).animate({ height: height }, 500, 'easeOutQuart', function() {

                                $(this).css({ height: '' });

                            });
                            */

                            // Callback fire
                            if(typeof options.onToggle !== 'undefined' && options.onToggle) {

                                options.onToggle.call($wg, $(this), $(this).closest(options.selector).find(options.selector + '-page' + ($(this).data('hash') || $(this).attr('href'))));

                            }

                        });

                    // Set hash
                    if (window.location.hash !== '#' && window.location.hash.length > 1) {

                        var $target = $(this).find(toggle + ' [href="' + window.location.hash + '"], ' + toggle + ' [data-hash="' + window.location.hash + '"]');
                            $target.trigger('click.switchTabs');

                    }

                } else {

                    $(this).toggleClass('js-init', false);

                    $(this)
                        .find(toggle + ' a')
                        .toggleClass('current', false);

                    /*$(this)
                        .find(page)
                        .toggleClass('opened', false);*/

                    $(this)
                        .find(content)
                        .css({ height: '' });

                }

            });

        }

    }

    function hashNav() {

        $('body')
            .on('click.hashNav', 'a[href^="#"]:not([href="#"], [class*="js-"], [class*="js-tabs"] a)', function(e) {

                var url = $(this).attr('href'),
                    threshold = ($(this).data('threshold') || 0) /* + $header.outerHeight()*/,

                    $element = !!$(url).length ? $(url) : $('[name="' + (url.substring(1)) + '"]');

                if (!!$(this).data('tab')) {

                    $('.js-tabs a[href="' + $(this).attr('href') + '"]').trigger('click.switchTabs')

                }

                if (url.length > 1 && $element.length) {

                    e.preventDefault();

                    var destination = $element.offset().top - threshold;
                    $('html, body').animate({ scrollTop: destination }, 400, 'easeOutQuart');

                    window.location.hash = url;

                }

            });

    }

    function swipeOfTables(options) {

        var $collection = $(options.collection);

        $(window).bind('load.buildSwipeOfTables resize.refreshSwipeOfTables', _processing);

        function _processing() {

            $collection.each(function() {

                if (!$(this).closest('.b-table_overflow').length) {

                    $(this).wrap('<div class="b-table_overflow"></div>');

                }

                var $container = $(this).closest('.b-table_overflow'),

                    tableWidth = $(this).width(),
                    containerWidth = $container.width();

                if (tableWidth > containerWidth) {

                    $(this)
                        .closest('.b-table_overflow')
                        .addClass('scrollable');

                } else {

                    $(this)
                        .closest('.b-table_overflow')
                        .removeClass('scrollable');
                }

            });

        }

    }

    function imagesOnRetinaDisplays(options) {

        options = !!options ? options : {};
        options.namespace = !!options.namespace ? options.namespace + ' ' : '.b-page ';

        if ('devicePixelRatio' in window && window.devicePixelRatio > 1) {

            var $images = $(options.namespace + 'img.js-2x');

            $images.each(function() {

                var lowRes = $(this).attr('src'),
                    highRes = $(this).data('@2x');

                $(this)
                    .data('@1x', lowRes)
                    .attr('src', highRes);

                $(this).on('error', function() {
                    $(this).attr('src', lowRes);
                });

            });

            // Set cookies
            helpers.cookies.set({
                key: 'devicePixelRatio',
                value: window.devicePixelRatio
            });

        }

    }

    function loadingOnRequire(options) {

        /**
         *
         * @param {String} [options.btn] - Class of the button
         * @param {Function} [options.onComplete] - Callback function
         */

        var $links = $(options.btn);

        // Set data
        $links.each(function() {

            $(this).data('page', $(this).data('page') || 1);

        });

        // Loading on require
        $links.on('click.loadingOnRequire', function(e) {

            e.preventDefault();

            var $link = $(this).toggleClass('loading', true),
                $target = $($link.data('loadingTarget')),

                qs = $link.attr('href').split('?'),
                qsObj = {};

            if (typeof qs[1] !== 'undefined') {

                qsObj = qs[1].split("&").reduce(function(prev, curr, i, arr) {

                    var p = curr.split("=");
                    prev[decodeURIComponent(p[0])] = decodeURIComponent(p[1]);

                    return prev;

                }, {});

            }

            $link.data('page', $link.data('page') || 2);

            _loadContent.call($target,
                {
                    url: $link.attr('href').split('?')[0],
                    method: $link.data('method') || 'get',
                    data: $.extend({}, { page: $link.data('page') }, qsObj),
                    onComplete: options.onComplete,
                    noWrapping: $(this).data('noWrapping')
                },
                function(response) {

                    setTimeout(function() {

                        $link.toggleClass('loading', false);

                    }, 300);

                    $link
                        .closest('.js-loading-on-require-wrap')
                        .toggleClass('fade', response.last);

                    $link
                        .attr('href', response.nextUrl || $link.attr('href'))
                        .data('page', $link.data('page') + 1);

                    if (!!response.btnText) {

                        $link.text(response.btnText);

                    }

                    if (!!response.info) {

                        $($link.data('loadingTarget') + '-info').text(response.info);

                    }

                }
            );

        });

        function _loadContent(options, callback) {

            var $target = this,
                $wrapper = $('<div class="js-loading-wrapper"></div>');

            $.ajax($.extend({}, {
                dataType: 'json',
                success: function(response) {

                    $wrapper.append(response.html);
                    $wrapper.css({ opacity: 0, transition: 'opacity 400ms' });

                    $target.append($wrapper);
                    $wrapper.slideUp(0);

                    setTimeout(function() {

                        $wrapper
                            .slideDown({ duration: 600, easing: 'easeOutQuart', complete: function() {

                                $(window).trigger('resize.flexRows');

                                if (!!options.onComplete) {

                                    options.onComplete.call($wrapper, response);

                                }

                                $wrapper.find('> *').unwrap();

                            }})
                            .css({ overflow: 'hidden', opacity: 1 });

                    }, 1);

                    if (!!callback) {

                        callback(response);

                    }

                }
            }, options));

        }

    }

    return {
        autoComplete: autoComplete,
        accordions: accordions,
        dropDown: dropDown,
        loadingOnRequire: loadingOnRequire,
        pockets: pockets,
        spoilers: spoilers,
        tabs: tabs,
        hashNav: hashNav,
        swipeOfTables: swipeOfTables,
        imagesOnRetinaDisplays: imagesOnRetinaDisplays
    };

})(window);
var sitePlugins = (function(window, undefined) {

    'use strict';

    function carousels(init) {

        init.selector = !!init.selector ? init.selector : '.b-carousel';
        init.namespace = !!init.namespace ? init.namespace + ' ' : '';

        init.options = !!init.options ? init.options : {};

        var $collection = $(init.namespace + init.selector);

        _init.call($collection);

        $(window).bind('resize.owlCarouselReInit', function() {

            helpers.delay.call($(window), function() {

                _init.call($collection);

            }, 250);

        });

        function _init() {

            if ($.isFunction($.fn.owlCarousel)) {

                this.each(function() {

                    var $carousel = $(this),
                        screens = !!$carousel.data('resolutions') ? $carousel.data('resolutions').split(',') : ['xs', 'sm', 'md', 'lg'];

                    if (screens.indexOf(helpers.screen()) >= 0 && $carousel.find('.b-carousel_item').length >= $carousel.data()[helpers.screen()]) {

                        $carousel
                            .toggleClass('owl-carousel', true)
                            .owlCarousel($.extend({

                                items: 1,
                                margin: typeof $carousel.data('margin') === 'number' ? $carousel.data('margin') : 20,

                                autoplay: $carousel.data('auto') || false,
                                autoplayTimeout: $carousel.data('interval') * 1000 || 10000,

                                autoHeight: typeof $carousel.data('autoHeight') !== 'object' ? $carousel.data('autoHeight') || false : false,
                                autoWidth: $carousel.data('autoWidth') || false,

                                loop: typeof $carousel.data('loop') !== 'undefined' ? $carousel.data('loop') : true,

                                mouseDrag: !!$carousel.data('mouseDrag') || false,
                                touchDrag: true, /*typeof $carousel.data('touchDrag') !== 'undefined' ? !!$carousel.data('touchDrag') : false,*/
                                pullDrag: false,
                                freeDrag: false,

                                dots: $carousel.data('dots') || false,
                                dotsEach: typeof $carousel.data('dotsEach') !== 'undefined' ? !! $carousel.data('dotsEach') : true,

                                //dotsSpeed: typeof $carousel.data('dotsEach') !== 'undefined' ? 250 : 125,

                                dotClass: 'b-carousel_paging_bullet',
                                dotsClass: 'b-carousel_paging',

                                dotsContainer: $carousel.data('dotsContainer') || false,

                                nav: $carousel.data('nav') || false,
                                navText: ['', ''],
                                navClass: $carousel.data('navClass') || ['b-carousel_arrow b-carousel_arrow__prev i-icon i-arrow-prev-sm', 'b-carousel_arrow b-carousel_arrow__next i-icon i-arrow-next-sm'],

                                navContainer: $carousel.data('navContainer') || false,

                                smartSpeed: $carousel.data('smartSpeed') || 250,

                                scrollBar: $carousel.data('scrollBar') || false,
                                scrollBarContainer: $carousel.data('scrollBarContainer') || false,

                                scrollBarClass: 'b-carousel_scroll_bar',
                                scrollBarHandleClass: 'b-carousel_scroll_bar_handle',

                                startPosition: typeof $carousel.data('startPosition') !== 'undefined' ? $carousel.data('startPosition') === 'last' ? $carousel.find(init.selector + '_item').length - 1 : $carousel.data('startPosition') : 0,

                                useCSS: !!$carousel.data('useCss'),
                                fallbackEasing: 'easeOutCubic',

                                responsive: {
                                    0: {
                                        items: $carousel.data('xs'),
                                        margin: typeof $carousel.data('margin') === 'object' ? $carousel.data('margin')[0] : $carousel.data('margin'),
                                        mergeFit: !!$carousel.data('mergeFit') ? $carousel.data('mergeFit').split(',')[0] : false,
                                        nav: _navShouldBe.call($carousel, $carousel.data('xs')),
                                        dots: _dotsShouldBe.call($carousel, $carousel.data('xs')),
                                        loop: _loopControl.call($carousel, $carousel.data('xs')),
                                        startPosition: typeof $carousel.data('startPositionXs') !== 'undefined' ? $carousel.data('startPositionXs') === 'last' ? $carousel.find(init.selector + '_item').length - 1 : $carousel.data('startPositionXs') : 0
                                    },
                                    480: {
                                        items: $carousel.data('sm'),
                                        margin: typeof $carousel.data('margin') === 'object' ? $carousel.data('margin')[1] : $carousel.data('margin'),
                                        mergeFit: !!$carousel.data('mergeFit') ? $carousel.data('mergeFit').split(',')[1] : false,
                                        nav: _navShouldBe.call($carousel, $carousel.data('sm')),
                                        dots: _dotsShouldBe.call($carousel, $carousel.data('sm')),
                                        loop: _loopControl.call($carousel, $carousel.data('sm')),
                                        startPosition: typeof $carousel.data('startPositionSm') !== 'undefined' ? $carousel.data('startPositionSm') === 'last' ? $carousel.find(init.selector + '_item').length - 1 : $carousel.data('startPositionSm') : 0
                                    },
                                    728: {
                                        items: $carousel.data('md'),
                                        margin: typeof $carousel.data('margin') === 'object' ? $carousel.data('margin')[2] : $carousel.data('margin'),
                                        mergeFit: !!$carousel.data('mergeFit') ? $carousel.data('mergeFit').split(',')[2] : false,
                                        nav: _navShouldBe.call($carousel, $carousel.data('md')),
                                        dots: _dotsShouldBe.call($carousel, $carousel.data('md')),
                                        loop: _loopControl.call($carousel, $carousel.data('md')),
                                        startPosition: typeof $carousel.data('startPositionMd') !== 'undefined' ? $carousel.data('startPositionMd') === 'last' ? $carousel.find(init.selector + '_item').length - 1 : $carousel.data('startPositionMd') : 0
                                    },
                                    1200: {
                                        items: $carousel.data('lg'),
                                        margin: typeof $carousel.data('margin') === 'object' ? $carousel.data('margin')[3] : $carousel.data('margin'),
                                        mergeFit: !!$carousel.data('mergeFit') ? $carousel.data('mergeFit').split(',')[3] : false,
                                        nav: _navShouldBe.call($carousel, $carousel.data('lg')),
                                        dots: _dotsShouldBe.call($carousel, $carousel.data('lg')),
                                        loop: _loopControl.call($carousel, $carousel.data('lg')),
                                        startPosition: typeof $carousel.data('startPositionLg') !== 'undefined' ? $carousel.data('startPositionLg') === 'last' ? $carousel.find(init.selector + '_item').length - 1 : $carousel.data('startPositionLg') : 0
                                    }
                                },
                                onInitialized: function() {

                                    this._direction = null;
                                    _itemsCounter.call(this);

                                },
                                onResized: function() {

                                    _itemsCounter.call(this);

                                },
                                onChange: function(e) {

                                    // Get direction
                                    if (e.property.name === 'position') {

                                        this._direction = e.property.value > e.item.index ? 'next' : 'prev';

                                    }

                                }
                            }, init.options));

                    } else {

                        if (!!$carousel.data('owlCarousel') || !!$carousel.data('owl.carousel')) {

                            $carousel.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
                            $carousel.find('.owl-stage-outer').children().unwrap();

                        }

                    }

                });

            } // isFunction end

        }  // end of init scope

        function _navShouldBe(limit) {

            var navOption = typeof this.data('nav') === 'undefined' ? true : !!this.data('nav'),
                itemsEnough = this.find('.b-carousel_item, > div').length > limit;

            return navOption && itemsEnough;

        }

        function _dotsShouldBe(limit) {

            var dotsOption = !!this.data('dots'),
                itemsEnough = this.find('.b-carousel_item, > div').length > limit;

            return dotsOption && itemsEnough;

        }

        function _loopControl(limit) {

            var loopOption = typeof this.data('loop') === 'undefined' ? true : !!this.data('loop'),
                //loopControlOption = !!this.data('loopControl'),

                itemsEnough = this.find('.b-carousel_item, > div').length > limit;

            return loopOption && itemsEnough/*(loopControlOption ? itemsEnough : true)*/;

        }

        function _itemsCounter() {

            if (this.$element.hasClass('b-carousel__counter')) {

                var amount = this.$element.find('.b-carousel_paging').find('.b-carousel_paging_bullet').length/*this._items.length*/;

                this.$element.find('.b-carousel_paging').attr('data-items-amount', amount);

            }

        }

    }

    function popUps() {

        var $page = $('.b-page'),

            $popUps = $('.js-popup'),

            $lightBoxes = $('.js-lightBox'),
            $videoBoxes = $('.js-videoBox'),

            settings = {
                animationStyleOfBox: 'scale',
                animationStyleOfChange: 'slide',

                boxHorizontalGutters: 10,
                boxVerticalGutters: 40,

                closeBtnLocation: 'overlay',
                closeBtnClass: 'i-icon i-cross',

                directionBtnLocation: 'overlay',
                directionBtnClass: ['i-icon i-arrow-prev', 'i-icon i-arrow-next'],

                overlayOpacity: .65,
                scrollLocker: $page
            };

        if ($.isFunction($.fn.leafLetPopUp)) {

            $popUps.leafLetPopUp($.extend({}, settings, {
                closeBtnLocation: 'box',
                animationStyleOfChange: 'fade',
                boxWidth: function() {

                    return this.data('boxWidth') || 416

                },
                beforeLoad: function(scroll, leaflet) {

                    $('.b-leaflet').data('triggerElement', leaflet.elements.link);

                },
                afterLoad: function() {

                    // Set backgrounds
                    site.setBackgrounds({
                        namespace: '.b-leaflet'
                    });

                    // Modules
                    siteModules.tabs({
                        selector: '.js-tabs',
                        namespace: '.b-leaflet'
                    });

                    // Forms
                    forms.init('.b-leaflet');

                }
            }));

            $lightBoxes.leafLetPopUp($.extend({}, settings, {
                animationStyleOfChange: 'fade',

                boxWidth: 1020,
                boxHorizontalGutters: 20,
                boxVerticalGutters: 20,

                closeBtnLocation: 'box',
                closeBtnClass: 'i-icon i-cross-sm',

                directionBtnLocation: 'box',
                directionBtnClass: ['i-icon i-arrow-prev', 'i-icon i-arrow-next'],

                afterLoad: function(scroll, type, leaflet) {

                    var $title = leaflet.elements.box.find('.b-leaflet_box_title'),

                        txt = $title.text(),
                        counter = (leaflet.groupCurrent + 1 ) + ' / ' + leaflet.group.length;

                    $title.html(txt + '<span>' + counter + '</span>');

                },

                maxHeight: function() {

                    return $(window).height() - ((parseInt($('.b-leaflet_inner').css('paddingTop')) + 60) * 2);

                }
            }));

            $videoBoxes.leafLetPopUp($.extend({}, settings, {
                boxWidth: 1200,
                boxHorizontalGutters: 30,
                boxVerticalGutters: 20,
                content: true,
                contentType: 'iframe'
            }));

            $('body').on('click', '.js-popup-close', function(e) {

                e.preventDefault();
                $popUps.leafLetPopUp('hide');

            });

        }

    }

    function scrollBars() {

        var $collection = $('.js-scrollBar');

        if ($.isFunction($.fn.perfectScrollbar)) {

            $collection.each(function() {

                var $scrollArea = $(this);

                $scrollArea.perfectScrollbar($scrollArea.data());

            });

        }

    }

    return {
        carousels: carousels,
        popUps: popUps,
        scrollBars: scrollBars
    };

})(window);
var YandexMaps = (function(window, undefined) {

    'use strict';

    function init() {

        // Simple map
        YandexMaps.regular({
            selector: '.b-map'
        });

    }

    function regular(settings) {

        settings = !!settings ? settings : {};

        settings.namespace = !!settings.namespace ? settings.namespace + ' ' : '';
        settings.selector = !!settings.selector ? settings.selector : '.b-map';

        settings.collection = !!settings.collection ? settings.collection : $(settings.namespace + settings.selector);

        if (ymaps !== 'undefined' && !!ymaps) {

            // Custom prototype functions
            ymaps.Map.prototype.setCenterWithOffset = function(horizontal, vertical) {

                var projection = this.options.get('projection'),
                    pixels = projection.toGlobalPixels(this.getCenter(), this.getZoom());

                pixels[0] = pixels[0] - horizontal;
                pixels[1] = pixels[1] - vertical;

                this.setCenter(projection.fromGlobalPixels(pixels, this.getZoom()));

            };

            ymaps.ready(function () {

                settings.collection.each(function() {

                    var $map = $(this).empty(),

                        map = new ymaps.Map($map.attr('id'), {
                            center: [0, 0],
                            zoom: $map.data('zoom') || 16,
                            controls: $map.data('controls') || !!$map.data('zoomOnly') ? [] : ['zoomControl', 'typeSelector', 'trafficControl']
                        }),

                        objectManager = new ymaps.ObjectManager();

                    map.element = $map;

                    $map
                        .toggleClass('initialized', true)
                        .data('yMapInstance', map);

                    // Map settings
                    if (helpers.mobile()) {

                        map.behaviors.disable('drag');

                    }
                    else {

                        map.behaviors.disable('scrollZoom');

                    }

                    if (!!$map.data('zoomOnly')) {

                        map.controls.add('zoomControl', {
                            float: 'none',
                            position: {
                                left: 15,
                                top: ($map.outerHeight() - 206) / 2
                            }
                        });

                        //map.controls.get('zoomControl').options.set('size', 'small');

                    }

                    // Search on map
                    var $searchForm = $($map.data('searchForm')),

                        $searchResults = $('.b-guide_search_results'),
                        $searchResultsClose = $('.b-guide_search_results_close', $searchResults),

                        $searchResultsList = $('.b-guide_search_results_response_list', $searchResults),
                        $searchResultsAmount = $('.b-guide_search_results_response_amount span', $searchResults),

                        searchedOnMap = new ymaps.GeoObjectCollection();

                    $searchForm.on('submit.searchOnMap', function(e) {

                        e.preventDefault();
                        _search($(this).find('input[type="text"]').first().val());

                    });

                    $searchResultsClose.on('click.searchClear', _searchClear);

                    // Get points data
                    if (!!$map.data('coordinates')) {

                        var point = processingPoint.call($map);

                        objectManager.add(point);
                        map.geoObjects.add(objectManager);

                    }
                    else if (!!$map.data('cards')) {

                        var collection = {
                            type: 'FeatureCollection',
                            features: []
                        };

                        $($map.data('cards')).each(function() {

                            collection.features.push(processingPoint.call($(this)));

                        });

                        objectManager.add(collection);
                        map.geoObjects.add(objectManager);

                        // Filtration
                        if (window.location.hash.length > 0) {

                            var activeLayers = window.location.hash.split('=')[1].split(',');

                            $('.js-map-filter input[type="checkbox"]').each(function() {

                                $(this).prop('checked', activeLayers.indexOf($(this).attr('name')) >= 0);

                            });

                        }

                        _filtration(objectManager);

                        $('.js-map-filter').on('change.mapFilter', 'input', function() {

                            _filtration(objectManager);

                        });

                    }

                    map.setBounds(map.geoObjects.getBounds());

                    if (/*objectManager.objects.getLength() === 1 && */!!map.element.data('zoom'))  {

                        map.setZoom(map.element.data('zoom'));

                    }

                    function _filtration(objectManager) {

                        var $checkboxes = $('.js-map-filter input:checked'),

                            filter = '',
                            hash = '#layer=';

                        $checkboxes.each(function(i) {

                            filter += 'properties.layer == "' + $(this).attr('name') + '"';
                            hash += $(this).attr('name');

                            if (i + 1 < $checkboxes.length) {

                                filter += ' || ';
                                hash += ',';

                            }

                        });

                        hash = hash !== '#layer=' ? hash : '#layer=hidden';
                        filter = filter.length ? filter : 'properties.layer == "default"';

                        window.location.hash = hash !== '#layer=' ? hash : '';
                        objectManager.setFilter(filter);

                    }

                    function _search(query) {

                        ymaps.geocode(query, { results: 10 }).then(
                            function(response) {

                                var geoObjects = response.geoObjects,
                                    meta = response.metaData.geocoder,

                                    amount = meta.found > 10 ? 10 : meta.found;

                                $searchResultsList.empty();
                                $searchResultsAmount.text(meta.found);

                                if (amount > 0) {

                                    for(var i = 0; i < amount; i++) {

                                        var item = geoObjects.get(i);

                                        $searchResultsList.append(_createResultsElement(item));

                                    }

                                    $searchResults.toggleClass('opened', true);

                                }
                                else {

                                    _searchErrCatch({});

                                }

                            },
                            _searchErrCatch
                        );

                    }

                    function _searchErrCatch(error) {

                        //console.log(error);

                        $searchResultsList.empty();
                        $searchResultsAmount.text('0');

                        $searchResults.toggleClass('opened', true);

                    }

                    function _searchClear() {

                        $searchResults.toggleClass('opened', false);
                        $searchForm[0].reset();

                        if (searchedOnMap.getLength() > 0) {

                            searchedOnMap.removeAll();
                            map.geoObjects.remove(searchedOnMap);

                        }

                        setTimeout(function() {

                            $searchResultsList.empty();
                            $searchResultsAmount.text('0');

                        }, 800);

                    }

                    function _createResultsElement(item) {

                        var data = item.properties,

                            name = data.get('name'),
                            text = data.get('text'),

                            $li = $('<li><br />' + text + '</li>'),
                            $link = $('<span class="b-guide_search_results_response_list_link">' + name.capitalizeFirstLetter() + '</span>').prependTo($li);

                        //console.log(data);

                        $link.on('click.showObjectOnMap', function(e) {

                            e.preventDefault();

                            if (searchedOnMap.getLength() > 0) {

                                searchedOnMap.removeAll();
                                map.geoObjects.remove(searchedOnMap);

                            }

                            item.options.set({ preset: 'islands#blueDotIcon' });
                            searchedOnMap.add(item);

                            map.geoObjects.add(searchedOnMap);

                            map.setCenter(item.geometry.getCoordinates(), 11);

                            var resultsH = $('.b-guide_search_results').outerHeight(),
                                offset = (($map.outerHeight() - resultsH) / 4) + (resultsH / 2);

                            map.setCenterWithOffset(0, offset);

                        });

                        return $li;

                    }

                });

            }); //ymaps.ready end scope

        }

    }

    function processingPoint() {

        var id = this.data('id') || helpers.randomString(6),
            color = this.data('color') || 'blue',

            data = {
                id: id,
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: this.data('coordinates') || [0, 0]
                },
                options: {
                    hideIconOnBalloonOpen: false,
                    balloonShadow: false,
                    balloonAutoPan: false
                },
                properties: {
                    id: id,
                    color: color,
                    layer: this.data('layer') || 'default',
                    balloonContent: !this.data('noBalloon') ? this.html() : false
                }
            },

            markerLayoutId = 'TicRK#marker' + color;

        // Marker
        if (!!this.data('customMark')) {

            ymaps.layout.storage.add(markerLayoutId, ymaps.templateLayoutFactory.createClass(
                '<div class="b-map_marker[if properties.color] $[properties.color][endif]"></div>'));

            $.extend(data.options, {
                iconLayout: markerLayoutId,
                iconShape: {
                    type: 'Rectangle',
                    coordinates: [
                        [-13, -36], [14, 0]
                    ]
                }
            });

        }
        else if (!!this.data('customMarkImg')) {

            $.extend(data.options, {
                iconLayout: 'default#image',
                iconImageHref: this.data('customMarkImg'),
                iconImageSize: [30, 30],
                iconImageOffset: [-15, -15]
            });

        }
        else {

            $.extend(data.options, {
                preset: 'islands#blueDotIcon'
            });

        }

        // Balloon
        if (!!this.data('customBalloon')) {

            var balloonLayout = ymaps.templateLayoutFactory.createClass(
                '<div class="b-map_balloon"><span class="b-map_balloon_close e-btn i-ico i-ico-cross-thin-grey"></span><div class="b-map_balloon_inner">$[[options.contentLayout observeSize minWidth=320 maxWidth=350]]</div></div>', {
                    build: function () {

                        this.constructor.superclass.build.call(this);
                        this._$element = $('.b-map_balloon', this.getParentElement());

                        this.applyElementOffset();

                        this._$element.find('.b-map_balloon_close')
                            .on('click', $.proxy(this.onCloseClick, this));

                    },
                    clear: function () {

                        this._$element.find('b-map_balloon_close').off('click');
                        this.constructor.superclass.clear.call(this);

                    },
                    onSublayoutSizeChange: function () {

                        balloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);

                        if(!this._isElement(this._$element)) {
                            return;
                        }

                        this.applyElementOffset();
                        this.events.fire('shapechange');

                    },
                    applyElementOffset: function () {

                        /*this._$element.css({
                            left: -(this._$element[0].offsetWidth / 2)/!*, top: -(this._$element[0].offsetHeight + 34)*!/
                        });*/

                    },
                    onCloseClick: function (e) {

                        e.preventDefault();
                        this.events.fire('userclose');

                    },
                    getShape: function () {

                        if(!this._isElement(this._$element)) {
                            return balloonLayout.superclass.getShape.call(this);
                        }

                        var position = this._$element.position();

                        return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                            [position.left, position.top], [
                                position.left + this._$element[0].offsetWidth,
                                position.top + this._$element[0].offsetHeight + 34
                            ]
                        ]));

                    },
                    _isElement: function (element) {
                        return element && element[0] && element.find('.b-map_balloon_arrow')[0];
                    }
                }),

                balloonContentLayout = ymaps.templateLayoutFactory.createClass('<div class="b-map_balloon_content">$[properties.balloonContent]</div>');

            $.extend(data.options, {
                balloonShadow: false,
                balloonLayout: balloonLayout,
                balloonContentLayout: balloonContentLayout,
                balloonPanelMaxMapArea: 0,
                hideIconOnBalloonOpen: false,
                openBalloonOnClick: true
            });

        }

        return data;

    }

    return {
        init: init,
        regular: regular
    };

})(window);

var helpers = (function(window, undefined) {

    function maxHeight($collection) {

        var max = 0;

        $collection.each(function() {

            max = ($(this).height() > max) ? $(this).height() : max;

        });

        return max;

    }

    function pixelsRatio() {

        return 'devicePixelRatio' in window && window.devicePixelRatio > 1;

    }

    function screen() {

        var deviceScreen = $(window).width();

        if (deviceScreen < 480) {
            return 'xs';
        }
        else if (deviceScreen >= 480 && deviceScreen < 728) {
            return 'sm';
        }
        else if (deviceScreen >= 728 && deviceScreen < 1200) {
            return 'md';
        }
        else if (deviceScreen >= 1200) {
            return 'lg';
        }

    }

    function mobile() {

        var uaTest = {

            android: function() {
                return navigator.userAgent.match(/Android/i);
            },

            blackBerry: function() {
                return navigator.userAgent.match(/BlackBerry/i);
            },

            iOS: function() {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            },

            opera: function() {
                return navigator.userAgent.match(/Opera Mini/i);
            },

            windows: function() {
                return navigator.userAgent.match(/IEMobile/i);
            }

        };

        return (uaTest.android() || uaTest.blackBerry() || uaTest.iOS() || uaTest.opera() || uaTest.windows())

    }

    function randomString(length) {

        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split(''),
            result = '';

        length = !length ? Math.floor(Math.random() * chars.length) : length;

        for (var i = 0; i < length; i++) {

            result += chars[Math.floor(Math.random() * chars.length)];

        }

        return result;

    }

    function editGetParams(url, paramKey, paramVal) {

        var hash = url.match(/#/gi) && url.indexOf('#') !== 0,

            urlParts, originalQueryString, resultQueryString;

        url = hash ? url.split('#') : [url, ''];

        urlParts = url[0].split('?');
        hash = hash ? '#' + url[1] : '';

        originalQueryString = urlParts[1];
        resultQueryString = '?';

        if (originalQueryString) {

            var params = originalQueryString.split('&');

            for (var i = 0; i < params.length; i++) {

                var keyVal = params[i].split("=");

                if (keyVal[0] !== paramKey) {

                    resultQueryString += params[i];

                } else {

                    resultQueryString += paramKey + '=' + paramVal;

                }

                resultQueryString += i < params.length - 1 ? '&' : ''

            }

        }

        return urlParts[0] + resultQueryString + hash;

    }

    function getPfx() {

        var element = document.createElement('div'),
            propsArray = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'],
            pfx = false;

        $.each(propsArray, function(key, val) {

            if (element.style[propsArray[key]] !== undefined) {

                pfx = '-' + (propsArray[key].replace('Perspective','').toLowerCase()) + '-';
                return false;

            }

        });

        return pfx;

    }

    function getNumEnding(num, endings) {

        var sEnding, i;

        num = num % 100;

        if (num>=11 && num<=19) {

            sEnding=endings[2];

        }
        else {

            i = num % 10;

            switch (i) {

                case (1):
                    sEnding = endings[0];
                    break;

                case (2):
                case (3):
                case (4):
                    sEnding = endings[1];
                    break;
                default:
                    sEnding = endings[2];

            }

        }

        return sEnding;

    }

    function getScrollBarWidth() {

        var $element = $('<div class="b-scrollBar-test"></div>').css({ position: 'absolute', left: -99999, top: -99999, overflowY: 'scroll', width: 50, height: 50, visibility: 'hidden' });

        $('body').append($element);

        var scrollBarWidth = $element[0].offsetWidth - $element[0].clientWidth;

        $element.remove();

        return scrollBarWidth;

    }

    function async(src) {

        // YouTube API
        var yt = document.createElement('script');

        yt.type = 'text/javascript';
        yt.src = src;
        yt.async = true;

        document.body.appendChild(yt);

    }

    function delay(func, duration) {

        if (this.data('timeout') !== 'undefined') {

            clearTimeout(this.data('timeout'));

        }

        this.data('timeout', setTimeout($.proxy(function() {

            if (!!func) {

                func();

            }

        }, this), duration || 500));

    }

    var cookies = {

        set: function(options) {

            var now = new Date,
                cookies = options.key + '=' + options.value;

            now.setDate(now.getDate() + (options.expires || 1));

            cookies += options.expires ? '; expires=' + now.toUTCString() : '';
            cookies += options.path ? '; path=' + options.path : '';

            return document.cookie = cookies;

        },

        get: function(key) {

            var matches = document.cookie.match(new RegExp(
                "(?:^|; )" + key.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));

            return matches ? decodeURIComponent(matches[1]) : false;

        },

        remove: function(key) {

            helpers.cookies.set({ key: key, value: '', expires: -1 });

        }

    };

    return {

        // Variables
        pfx: getPfx(),
        touches: {
            touchstart: {x: -1, y: -1 },
            touchmove: { x: -1, y: -1 }
        },
        reCaptchaKey: '6Lfp4iYTAAAAALL4XsWR5u_VzSPwK_7YD9d00Fb6',

        // Cookies
        cookies: cookies,

        // Functions
        async: async,
        delay: delay,
        mobile: mobile,
        maxHeight: maxHeight,
        editGetParams: editGetParams,
        getNumEnding: getNumEnding,
        getScrollBarWidth: getScrollBarWidth,
        getPfx: getPfx,
        pixelsRatio: pixelsRatio,
        randomString: randomString,
        screen: screen

    };

})(window);

// Swipe listeners
$(document).bind('touchstart.swipeControl touchmove.swipeControl', function(e) {

    var touch = e.originalEvent.touches[0];

    helpers.touches[e.type].x = touch.pageX;
    helpers.touches[e.type].y = touch.pageY;

});

// Расширение JQ-методов
(function($) {

    $.fn.rowSlideUp = function(duration, callback, easing) {

        var $td = this.find('> td'),
            pfx = helpers.pfx;

        this.toggleClass('slideUp', true);

        if ($td.length) {

            $td.each(function() {

                $(this)
                    .wrapInner('<div style="padding: ' + $(this).css('padding-top') + ' ' + $(this).css('padding-right') + ' ' + $(this).css('padding-bottom') + ' ' + $(this).css('padding-left') + ';"></div>')
                    .attr('style', 'padding: 0 !important;');

            });

            var $div = $td.find('> div');

            $td
                .css(pfx + 'transition', 'border 400ms')
                .css('transition', 'border 400ms');

            $div
                .css(pfx + 'transition', 'opacity 400ms')
                .css('transition', 'opacity 400ms');

            setTimeout(function() {

                $td
                    .css('border-color', 'transparent');

                $div
                    .css('opacity', 0)
                    .slideUp({ duration: duration, easing: !!easing ? easing : 'swing', complete: callback });

            }, 50);

            return this;

        }

    };

})(jQuery);

(function($) {

    $.fn.flexRows = function(options) {

        options = !!options ? options : {};
        options.selector = !!options.selector ? options.selector : '> *';

        options.auto = !!options.auto ? !!options.auto : false;
        options.strong = !!options.strong ? !!options.strong : false;
        options.handler = !!options.handler ? options.handler : false;
        options.breakpoints = !!options.breakpoints ? options.breakpoints : ['xs', 'sm', 'md', 'lg', 'xl'];

        var settings = $.extend(options, this.data());

        new FlexRows(this, settings);

        return this;

    };

    function FlexRows($this, options) {

        this.options = options;
        this.elements = $this.find(this.options.selector);

        if (this.options.breakpoints.indexOf(helpers.screen()) >= 0) {

            this.processing();

        }
        else {

            this.clear(this.elements);

        }

        $(window).bind('load.flexRows resize.flexRows', $.proxy(function() {

            helpers.delay.call($(this), $.proxy(function() {

                if (this.options.breakpoints.indexOf(helpers.screen()) >= 0) {

                    this.processing();

                }
                else {

                    this.clear(this.elements);

                }

            }, this), 500);

        }, this));

    }

    FlexRows.prototype.processing = function() {

        this.rows = this.splitUpIntoRows();

        if (this.options.handler) {

            for (var a = 0; a < this.rows.length; a++) {

                this.options.handler.call(this.rows[a]);

            }

        }
        else if (this.options.auto) {

            for (var b = 0; b < this.rows.length; b++) {

                this.alignment(this.rows[b]);

            }

        }
        else if (this.options.split) {

            for (var c = 0; c < this.rows.length; c++) {

                this.split(this.rows[c]);

            }

        }

        return true;

    };

    FlexRows.prototype.splitUpIntoRows = function() {

        var rows = {},
            result = [];

        this.elements.each(function(i) {

            if (typeof rows['top' + $(this).offset().top] === 'undefined') {

                rows['top' + $(this).offset().top] = [];

            }

            rows['top' + $(this).offset().top].push($(this));

        });

        $.each(rows, function() {

            var $col = $();

            $(this).each(function() {

                $col = $col.add($(this));

            });

            result.push($col);

        });

        return result;

    };

    FlexRows.prototype.alignment = function($collection) {

        var max = 0;

        if (this.options.strong) {

            $collection
                .css({ height: '' })
                .each(function() {

                    max = ($(this).outerHeight() > max) ? $(this).outerHeight() : max;

                });

            $collection.css({ height: max });

        } else {

            $collection
                .css({ minHeight: '' })
                .each(function() {

                    max = ($(this).outerHeight() > max) ? $(this).outerHeight() : max;

                });

            $collection.css({ minHeight: max });

        }

    };

    FlexRows.prototype.split = function($collection) {

        $collection
            .each(function(i) {

                $(this).removeClass('split');

                if (i > 0) {

                    $(this).addClass('split');

                }

            });

    };

    FlexRows.prototype.clear = function($collection) {

        $collection
            .css({ height: '' })
            .css({ minHeight: '' })
            .each(function() {

                $(this).removeClass('split');

            });

    };

})(jQuery);

$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

// Prototypes extend
if (!String.prototype.capitalizeFirstLetter) {

    String.prototype.capitalizeFirstLetter = function() {

        return this.charAt(0).toUpperCase() + this.slice(1);

    };

}

if (!String.prototype.discharge) {

    String.prototype.discharge = function(delimiter) {

        return this.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + delimiter);

    };

}

if (!Number.prototype.isInteger) {

    Number.prototype.isInteger = function() {

        return (this % 1) === 0;

    };

}

if (!Array.prototype.indexOf) {

    Array.prototype.indexOf = function(elt) {

        var len = this.length >>> 0,
            from = Number(arguments[1]) || 0;

        from = (from < 0) ? Math.ceil(from) : Math.floor(from);

        if (from < 0)
            from += len;

        for (; from < len; from++) {
            if (from in this &&
                this[from] === elt)
                return from;
        }

        return -1;

    };

}
