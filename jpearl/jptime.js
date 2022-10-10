/*
 Copyright (C) 2018 Sang-Gook Han(handuckjs@gmail.com)
 This file is part of JPearl

 JPearl is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 JPearl is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License  
 along with this program. If not, see http://www.gnu.org/licenses/.
*/

function JPTime(element,props)
{
	if ( arguments.length == 0 ) return;
	JPView.call( this, element, $.extend({
		format: 'H:i:s',
		hourStep: 1,
		hourRange: [0, 23],
		minuteStep: 1,
		secondStep: 1
	}, props));
	var self = this;
	this.element.addClass('time input');
	if ( this.properties.format.indexOf('A') >= 0 )
	{
		this.children.ampm = $('<select/>').addClass('ampm').appendTo(this.element);
		$('<option/>', {
			text: 'AM',
			value: 'am'
		}).appendTo( this.children.ampm );
		$('<option/>', {
			text: 'PM',
			value: 'pm'
		}).appendTo( this.children.ampm );
		$('<div/>').addClass('separator').appendTo(this.element);
	}
	var changeCB = function(e,value) {
		e.stopPropagation();
		if ( !self._time ) {
			self._time = new Date();
			self._time.setHours(0, 0, 0, 0);
		}
		self.element.trigger('valueChange', [self.value()] );	
		return false;
	}
	if ( this.properties.format.indexOf('h') >= 0
		|| this.properties.format.indexOf('H') >= 0 )
	{
		if ( typeof this.properties.hourRange == 'string'  ) {
			this.properties.hourRange = this.properties.hourRange.split(',').map( (v) => parseInt(v) );
		}
		this.properties.hourRange[0] = Math.max( 0,  Math.min( 23,  this.properties.hourRange[0]) );
		this.properties.hourRange[1] = Math.min( 23,  Math.max( 0,  this.properties.hourRange[1]) );
		var c = $('<div/>').appendTo(this.element);
		this.children.hour = $('<div/>').JPSpin({
			min: this.children.ampm ? 1 : this.properties.hourRange[0], 
			max: this.children.ampm ? 12 : this.properties.hourRange[1],
			step: this.properties.hourStep
		}).appendTo(c).bind('valueChange', changeCB);
	}
	if ( this.properties.format.indexOf('i') >= 0 )
	{
		if ( this.children.hour )
		{
			$('<div/>').text(':').addClass('separator').appendTo(this.element);
		}
		var c = $('<div/>').appendTo(this.element);
		this.children.minute = $('<div/>').JPSpin({
			max: 59,
			step: this.properties.minuteStep
		}).appendTo(c).bind('valueChange', changeCB );
	}
	if ( this.properties.format.indexOf('s') >= 0 )
	{
		if ( this.children.minute )
		{
			$('<div/>').text(':').addClass('separator').appendTo(this.element);
		}
		var c = $('<div/>').appendTo(this.element);
		this.children.second = $('<div/>').JPSpin({
			max: 59,
			step: this.properties.secondStep
		}).appendTo(c).bind('valueChange', changeCB );
	}	
}

$.plugin(JPTime);

JPTime.prototype = new JPView();

JPTime.prototype.value = function(v)
{
	if (arguments.length)
	{
		if ( !v ) {
			if ( this.children.hour ) {
				this.children.hour.instance().value(null);
			}
			if ( this.children.minute ) {
				this.children.minute.instance().value(null);
			}
			if ( this.children.second ) {
				this.children.second.instance().value(null);
			}
			return;
		}
		else if ( typeof v == 'string' )
		{
			v = v.parse('time');
		}
		else if ( typeof v == 'number' ) {
			var d = new Date(0);
			var h = Math.floor(v/3600);
			v %= 3600;
			var m = Math.floor(v/60);
			var s = v % 60;
			d.setHours(h,m,s);
			v = d;
		} else {
			v = new Date(v.getTime());
		}
		this._time = v;
		if ( this.children.hour ) {
			var h = v.getHours();
			if ( this.children.ampm ) {
				var am = h <= 12;
				h = h % 12;
				if ( h == 0 ) h = 12;
				this.children.ampm.val( am ? 'am' : 'pm');
			}
			this.children.hour.instance().value( h );
		}
		if ( this.children.minute ) {
			this.children.minute.instance().value( v.getMinutes() );
		}
		if ( this.children.second ) {
			this.children.second.instance().value( v.getSeconds() );
		}
		return;
	}
	if ( !this._time ) return null;
	var h = this.children.hour ? this.children.hour.instance().value() : 0;
	if ( this.children.ampm )
	{
		if ( this.children.ampm.val() == 'pm') 
		{
			h = h == 12 ? h : (h+12);
		}
		else
		{
			h %= 12;
		}
	}
	this._time = new Date(  this._time );
	this._time.setHours(h,
		 this.children.minute ? this.children.minute.instance().value() : 0,
		 this.children.second ? this.children.second.instance().value() : 0
	);
	return this._time;
}

JPTime.prototype.validate = function()
{
	return ( this.children.hour ? this.children.hour.instance().validate() : true )
	&& ( this.children.minute ? this.children.minute.instance().validate() : true )
	&& ( this.children.second ? this.children.second.instance().validate() : true );
}

JPTime.prototype.focus = function()
{
	( this.children.hour ? this.children.hour.instance().focus() : false)
	|| ( this.children.minute ? this.children.minute.instance().focus() : false)
	|| ( this.children.second ? this.children.second.instance().focus() : false);
}

JPTime.prototype.blur = function()
{
	this.children.hour ? this.children.hour.instance().blur() : false;
	this.children.minute ? this.children.minute.instance().blur() : false;
	this.children.second ? this.children.second.instance().blur() : false;
}

JPTime.prototype.clear = function()
{
	this.children.hour ? this.children.hour.instance().clear() : false;
	this.children.minute ? this.children.minute.instance().clear() : false;
	this.children.second ? this.children.second.instance().clear() : false;
}
