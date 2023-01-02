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

function JPCalendar(element,props)
{
	var self = this;
	JPView.call(this,element,$.extend(true,{
		weeks: [ '일','월','화','수','목','금','토'],
		mode: JPCalendar.Mode.Day,
		date: new Date(),
		minDate: new Date(1900,0,1, 0, 0, 0),
		maxDate: new Date(9999,11,31,23,59,59),
		header: true
	},props));
	this._currentDate = new Date();
	if ( !this.properties.time ) {
		this._currentDate.setHours(0,0,0,0);
	}
	this.element.addClass('calendar');

	if ( this.properties.header ) {
		this.children.header = $('<nav/>').addClass('calheader').appendTo(this.element);
		this.children.btnPrev = $('<div/>').addClass('before button').appendTo(this.children.header);
		this.children.title = $('<div/>').addClass('title').appendTo(this.children.header);
		this.children.btnNext = $('<div/>').addClass('next button').appendTo(this.children.header);
	}

	if ( this.properties.header ) {
		this.children.body = $('<div/>').addClass('calbody').JPSlideshow({
					initSelectedIndex: this._currentDate,
					item: function(v,offset)
					{
						var m = new Date(v.getTime());
						m.setDate(1);
						switch( self.properties.mode )
						{
							case JPCalendar.Mode.Day:
								m.setMonth( m.getMonth() + offset );	
								break;		
							case JPCalendar.Mode.Month:
								m.setFullYear( m.getFullYear() + offset );
								break;		
							case JPCalendar.Mode.Year:
								m.setFullYear( m.getFullYear() + offset * 10 );
								break;		
							case JPCalendar.Mode.Year10:
								m.setFullYear( m.getFullYear() + offset * 100 );
								break;		
						}
						return m;
					},
					distance: function(v,from){
						switch( self.properties.mode )
						{
							case JPCalendar.Mode.Day:
								return (v.getMonth() + v.getFullYear()*12) 
									- (from.getMonth() + from.getFullYear()*12);
								break;		
							case JPCalendar.Mode.Month:
								return v.getFullYear() - from.getFullYear();
								break;		
							case JPCalendar.Mode.Year:
								return parseInt(v.getFullYear() - from.getFullYear())/10;
								break;		
							case JPCalendar.Mode.Year10:
								return parseInt((v.getFullYear() - from.getFullYear())/100);
								break;		
						}
					}
				}).appendTo(this.element)
				.bind('slideshow.selectionChanged', function(e,date){
					self._checkNavButtons();
					self._drawTitle();
				});
		this.children.body.JPSlideshow('items', function(d){
			return self.draw(d,$('<div/>'));
		});
	} else {
		this.children.body = $('<div/>').addClass('calbody simple').appendTo(this.element);
		this.draw();
	}
	if ( this.properties.header ) {
		this.children.btnPrev.text('◄').mouseclick(function(e){
			if ( self.canGoBack() )
			{
				self.goBack();
			}
			return false;
		});
		this.children.btnNext.text('►').mouseclick(function(e){
			if ( self.canGoForward() )
			{
				self.goForward();
			}
			return false;
		});
		this.children.title.mouseclick(function(e){
			self._goUpperLevel();
			return false;
		});
	}
	if ( this.properties.time )
	{
		var timeBody = $('<div/>').addClass('time container').appendTo(this.element);
		this.children.time = $('<div/>').JPTime({
			format: this.properties.time 
		}).bind('valueChange',function(e,value){
			self._currentDate.setHours( value.getHours(),
				value.getMinutes(),
				value.getSeconds()
			);
			self.element.trigger('valueChange', [ self._currentDate, self.properties.mode] );
		});
		this.children.time.appendTo(timeBody);
		this.children.time.mouseclick(function(e){
			e.stopPropagation();
			return false;
		});
	}
}

JPCalendar.prototype = new JPView();

JPCalendar.Mode = {
	Day: 1,
	Month: 2,
	Year: 3,
	Year10: 4
};

Object.freeze( JPCalendar.Mode );

$.plugin( JPCalendar );

JPCalendar.prototype._parseDate = function(value)
{ 
	var date = null;
	if ( typeof value == 'string' )
	{
		value = value.trim().replace(' ','T');
		date = new Date(value);
	}
	else if ( value )
	{
		date = new Date( value );
	}
	return date;
}

JPCalendar.prototype.goToday = function()
{
	var now = new Date();
	now.setHours(0,0,0,0);
	if ( now != this._currentDate ) {
		this._currentDate = now;
		this._reload();
	}
}

JPCalendar.prototype.canGoForward = function()
{
	if ( !this.properties.maxDate ) return true;
	var m = new Date(this._currentDate.getTime());
	switch( this.properties.mode )
	{
		case JPCalendar.Mode.Day:
			m.setMonth(m.getMonth()+1, -1, 0, 0, 0, 0);
			break;		
		case JPCalendar.Mode.Month:
			m.setFullYear(m.getFullYear());
			break;		
		case JPCalendar.Mode.Year:
			m.setFullYear(  Math.floor(m.getFullYear()/10) * 10 + 9 );
			break;		
		case JPCalendar.Mode.Year10:
			m.setFullYear(  Math.floor(m.getFullYear()/100) * 100 + 99 );
			break;		
	}
	if ( this.properties.mode != JPCalendar.Mode.Day )
	{
		m.setMonth(12, 31, 0, 0, 0, 0);
	}
	return this.properties.maxDate > m;
}

JPCalendar.prototype.canGoBack = function()
{
	if ( !this.properties.minDate ) return true;
	var m = new Date(this._currentDate.getTime());
	switch( this.properties.mode )
	{
		case JPCalendar.Mode.Day:
			m.setMonth(m.getMonth(), -1, 0, 0, 0, 0);
			break;		
		case JPCalendar.Mode.Month:
			m.setFullYear(m.getFullYear()-1);
			break;		
		case JPCalendar.Mode.Year:
			m.setFullYear(Math.floor(m.getFullYear()/10) * 10 - 1);
			break;		
		case JPCalendar.Mode.Year10:
			m.setFullYear(Math.floor(m.getFullYear()/100) * 100 - 100);
			break;		
	}
	if ( this.properties.mode != JPCalendar.Mode.Day )
	{
		m.setMonth(12, 31, 0, 0, 0, 0);
	}
	return this.properties.minDate < m;
}

JPCalendar.prototype._checkNavButtons = function()
{
	if ( this.canGoForward() )
	{
		this.children.btnNext.removeClass('disabled');
	}
	else
	{
		this.children.btnNext.addClass('disabled');
	}
	if ( this.canGoBack() )
	{
		this.children.btnPrev.removeClass('disabled');
	}
	else
	{
		this.children.btnPrev.addClass('disabled');
	}
}

JPCalendar.prototype.nextDate = function()
{
	var m = new Date(this._currentDate.getTime());
	switch( this.properties.mode )
	{
		case JPCalendar.Mode.Day:
			m.setMonth( m.getMonth() + 1 , 1, 0, 0, 0, 0);
			break;		
		case JPCalendar.Mode.Month:
			m.setFullYear( m.getFullYear() + 1, m.getMonth(), 1, 0, 0, 0, 0 );
			break;		
		case JPCalendar.Mode.Year:
			m.setFullYear( Math.floor(m.getFullYear()/10) * 10 + 10, m.getMonth(), 1, 0, 0, 0, 0);
			break;		
		case JPCalendar.Mode.Year10:
			m.setFullYear(Math.floor(m.getFullYear()/100) * 100 + 100, m.getMonth(), 1, 0, 0, 0, 0);
			break;		
	}
	return m;
}

JPCalendar.prototype.previousDate = function()
{
	var m = new Date(this._currentDate.getTime());
	switch( this.properties.mode )
	{
		case JPCalendar.Mode.Day:
			m.setMonth( m.getMonth() - 1, 1, 0, 0, 0, 0 );
			break;		
		case JPCalendar.Mode.Month:
			m.setFullYear( m.getFullYear() - 1, m.getMonth(), 1, 0, 0, 0, 0 );
			break;		
		case JPCalendar.Mode.Year:
			m.setDate(1);
			m.setFullYear( Math.floor(m.getFullYear()/10) * 10 - 10,  m.getMonth(), 1, 0, 0, 0, 0);
			break;		
		case JPCalendar.Mode.Year10:
			m.setDate(1);
			m.setFullYear(Math.floor(m.getFullYear()/100) * 100 - 100,  m.getMonth(), 1, 0, 0, 0, 0);
			break;		
	}
	return m;
}

JPCalendar.prototype.buildItems = function()
{
	var self = this;
	this.children.items = {};
	$('.container > .selected.item .item.date', this.children.body).each( (idx,obj) =>{
		var dt = $(obj).data('date');
		switch( self.properties.mode )
		{
			case JPCalendar.Mode.Day:
				self.children.items[dt.toString('md')] = $(obj);
				break;		
			case JPCalendar.Mode.Month:
				self.children.items[dt.getMonth()+1] = $(obj);
				break;
			case JPCalendar.Mode.Year:
			case JPCalendar.Mode.Year10:
				self.children.items[dt.getFullYear()] = $(obj);
				break;		
		}
	});
}

JPCalendar.prototype.goForward = function()
{
	this._currentDate = this.nextDate();
	if ( this.properties.header ) {
		this.children.body.JPSlideshow('selectedIndex', this._currentDate);
		this.buildItems();
	} else {
		this.draw();
	}
	this.element.trigger('dateChanged', [ this._currentDate, this.properties.mode] );	
}

JPCalendar.prototype.goBack = function()
{
	this._currentDate = this.previousDate();
	if ( this.properties.header ) {
		this.children.body.JPSlideshow('selectedIndex', this._currentDate);
		this.buildItems();
	} else {
		this.draw();
	}
	this.element.trigger('dateChanged', [ this._currentDate, this.properties.mode] );
}

JPCalendar.prototype._reload = function()
{
	this.children.body.JPSlideshow('selectedIndex', this._currentDate, true);
	this.element.trigger('dateChanged', [ this._currentDate, this.properties.mode] );	
}

JPCalendar.prototype._goUpperLevel = function()
{
	this.properties.mode = Math.min( JPCalendar.Mode.Year10, this.properties.mode + 1 );
	this._reload();
}

JPCalendar.prototype.date = function(value)
{
	if ( arguments.length )
	{
		value = value || new Date();
		this.properties.date = this._parseDate(value);
		value = this.properties.date;
		value.setHours(0,0,0,0);
		this.properties._currentDate = this.properties.date;
		if ( arguments.length == 2 )
		{
			this.properties.minDate = this._parseDate( arguments[1][0] );
			this.properties.maxDate = this._parseDate( arguments[1][1] );
		}
		if ( this.properties.time )
		{
			this.children.time.instance().value(this.properties.date);
		}
		if ( this.properties.header )
		{
			this.children.body.JPSlideshow('selectedIndex', value, true);
			this._currentDate = this.properties.date;
			this._drawTitle();
		} 
		else 
		{
			this.draw(this.properties.date);
		}
		return;	
	}
	return this.properties.date;
}

JPCalendar.prototype.mode = function(value)
{
	if ( arguments.length )
	{
		if ( this.properties.mode == value ) return;
		self.draw();	
		return;
	}
	return this.properties.mode;
}

JPCalendar.prototype.moveTo = function(d)
{
	if ( !(d instanceof Date) ) {
		var p = new Date();
		if ( arguments.length > 0 ) {
			p.setFullYear(arguments[0]);
		}
		if ( arguments.length > 1 ) {
			p.setMonth(arguments[1]-1);
		}
		if ( arguments.length > 2 ) {
			p.setMonth(arguments[2]);
		}
		d = p
	}
	this._currentDate = d;
	this.draw();
}

JPCalendar.prototype.currentDate = function()
{
	return this._currentDate;
}

JPCalendar.prototype.draw = function(date,body)
{
	var date = date || this._currentDate;
	var body = body || this.children.body;
	body.empty();
	var isCurrent = false;
	switch( this.properties.mode )
	{
		case JPCalendar.Mode.Day:
			isCurrent = this._drawInDayMode(date,body);
			break;		
		case JPCalendar.Mode.Month:
			isCurrent = this._drawInMonthMode(date,body);
			break;		
		case JPCalendar.Mode.Year:
			isCurrent = this._drawInYearMode(date,body);
			break;		
		case JPCalendar.Mode.Year10:
			isCurrent = this._drawInYear10Mode(date,body);
			break;		
	}


//	body.height( $('.calbody', this.element).height() );
	return body;
}

JPCalendar.prototype._drawTitle = function()
{
	var title = null;
	var date = this._currentDate;
	switch( this.properties.mode )
	{
		case JPCalendar.Mode.Day:
			title = '%04d년 %02d월'.sprintf( date.getFullYear(), date.getMonth() + 1 )
			break;		
		case JPCalendar.Mode.Month:
			title = date.getFullYear();
			break;		
		case JPCalendar.Mode.Year:
		{
			var y = date.getFullYear();
			y -= y%10;
			title = y + '~' + (y+9);
		}
			break;		
		case JPCalendar.Mode.Year10:
		{
			var century = Math.floor((date.getFullYear() + 10)/100) + 1;
			var suffix = 'th';
			switch( century % 10 )
			{
				case 1: suffix = 'st'; break;
				case 2: suffix = 'nd'; break;
				case 3: suffix = 'rd'; break;
			}
			title = century + suffix;
		}
			break;		
	}
	this.children.title.text(title);
}

JPCalendar.prototype._drawInDayMode = function(sDate, body)
{
	body = body || this.children.body;
	var m = sDate.getMonth();
	var date = new Date( sDate.getTime() );
	date.setDate(1, 0, 0, 0, 0);
	date.setDate( -date.getDay() + 1 );
	var isSelected = sDate.equals(this._currentDate, 'month');
	if ( isSelected )  {
		this.children.items = {};
	}
	var now = new Date();
	if ( !now.equals( sDate, 'month') )
	{
		now = null;	
	}
	
	var self = this;
	var clickEvent = function(e){
		self.element.trigger('itemClicked', [ e.data, JPCalendar.Mode.Day ] );
		return false;
	}
	var row = $('<div/>').addClass('header title').appendTo(body);
	for ( var w = 0 ; w < 7; w++ )
	{
		var col = $('<div/>').addClass('hcol title').appendTo(row)
				.text( this.properties.weeks[w] );
		if ( w == 0 )
		{
			col.addClass('sunday');
		}
		else if ( w == 6 )
		{
			col.addClass('saturday');
		}
	}
	var selectedDate = this.properties.date;	
	for ( var w = 0 ; w < 6; w++ )
	{
		var row = $('<div/>').addClass('row week').appendTo(body);
		for ( var c = 0; c < 7 ; c++ )
		{
			if ( date.getMonth() != m && w > 0 && c == 0 ) {
				break;
			}

			var d = date.getDate();
			var dclone = new Date(date); //.getFullYear(),date.getMonth(), date.getDate());
			var col = $('<div/>').addClass('col date item').data('date', dclone)
						.appendTo(row);
				
			if ( this.properties.minDate <= dclone && dclone <= this.properties.maxDate ) {
				col.mouseclick(dclone,clickEvent);
			} else {
				col.addClass('disabled');
			}		
			
			if ( isSelected ) {
				this.children.items[dclone.toString('md')] = col;
			}
			
			if ( this.properties.renderer )
			{
				col.append(this.properties.renderer( dclone, JPCalendar.Mode.Day ));
			}
			else
			{
				$('<div/>').addClass('title').text(d).appendTo(col);
			}
			if ( date.getMonth() != m )
			{
				col.addClass('not').addClass( w == 0 ? 'before' : 'next' );
				if ( w > 0 )
				{
					w = 6;
				}
			}
			else
			{
				switch( date.getDay() )
				{
					case 0:
						col.addClass('sunday');
						break;
					case 6:
						col.addClass('saturday');
						break;
					default:
						break;
				}
			}
			if ( selectedDate.getFullYear() == date.getFullYear() 
				&& selectedDate.getMonth() == date.getMonth() 
				&& selectedDate.getDate() == date.getDate() )
			{
				col.addClass('selected');
			}
			else if ( now && now.getFullYear() == date.getFullYear() && now.getMonth() == date.getMonth() && now.getDate() == date.getDate() )
			{
				col.addClass('now');
			}
			date.setDate(d+1);
		}
	}
	return isSelected;
}

JPCalendar.prototype._drawInMonthMode = function(sDate,body)
{
	body = body || this.children.body;
	var year = this._currentDate.getFullYear()
	var date = new Date();
	date.setFullYear( sDate.getFullYear(), 0, 1, 0, 0, 0, 0 );
	var isSelected = sDate.equals(this._currentDate, 'year');
	if ( isSelected )  {
		this.children.items = {};
	}
	var now = new Date();
	if ( now.getFullYear() != sDate.getFullYear() )
	{
		now = null;	
	}
	
	var self = this;
	var clickEvent = function(e){
		self._currentDate = e.data;
		self.properties.mode = JPCalendar.Mode.Day;
		self._reload();
		return false;
	}
	var selectedDate = this.properties.date;	

	for ( var q = 0 ; q < 4; q++ )
	{
		var row = $('<div/>').addClass('row quarter').appendTo(body);
		for ( var c = 0; c < 3 ; c++ )
		{
			var m = date.getMonth();
			var dclone = new Date(date.getFullYear(),date.getMonth(),1);
			var col = $('<div/>').addClass('col month item').data('date', dclone)
				.appendTo(row);
				
			if ( this.properties.minDate <= dclone && dclone <= this.properties.maxDate ) {
				col.mouseclick(dclone,clickEvent);
			} else {
				col.addClass('disabled');
			}		
			
			if ( isSelected ) {
				this.children.items[ m+1 ] = col;
			}
			
			if ( this.properties.renderer )
			{
				col.append(this.properties.renderer( dclone, JPCalendar.Mode.Month ));
			}
			else
			{
				$('<span/>').text( "%02d월".sprintf(m+1)).addClass('title').appendTo(col);
			}
			if ( selectedDate.getFullYear() == date.getFullYear() && selectedDate.getMonth() == date.getMonth() )
			{
				col.addClass('selected');
			}
			else if ( now && now.getMonth() == date.getMonth() )
			{
				col.addClass('now');
			}
			date.setMonth(m+1);
		}
	}
	return isSelected;
}

JPCalendar.prototype._drawInYearMode = function(sDate,body)
{
	body = body || this.children.body;
	var date = new Date();
	date.setFullYear( Math.floor(sDate.getFullYear()/10) * 10 - 1);
	date.setMonth(0);
	var isSelected = Math.floor( this._currentDate.getFullYear() / 10 ) == Math.floor(sDate.getFullYear()/10); 
	if ( isSelected )  {
		this.children.items = {};
	}
	var now = new Date();
	
	var self = this;
	var clickEvent = function(e){
		self._currentDate = e.data;
		self.properties.mode = JPCalendar.Mode.Month;
		self._reload();
		return false;
	}
	var selectedDate = this.properties.date;	

	for ( var q = 0 ; q < 3; q++ )
	{
		var row = $('<div/>').addClass('row year').appendTo(body);
		for ( var c = 0; c < 4 ; c++ )
		{
			var y = date.getFullYear();
			var dclone = new Date(date.getFullYear(),1,1,0,0,0,0);
			var col = $('<div/>').addClass('col year item').data('date', dclone)
				.appendTo(row);
				
			if ( this.properties.minDate.getFullYear() <= dclone.getFullYear() && dclone.getFullYear() <= this.properties.maxDate.getFullYear() ) {
				col.mouseclick(dclone,clickEvent);
			} else {
				col.addClass('disabled');
			}		
				
			if ( isSelected ) {
				this.children.items[y] = col;
			}
			if ( this.properties.renderer )
			{
				col.append(this.properties.renderer( dclone, JPCalendar.Mode.Year ));
			}
			else
			{
				$('<span/>').text(y).addClass('title').appendTo(col);
			}
			if ( selectedDate.getFullYear() == date.getFullYear() )
			{
				col.addClass('selected');
			}
			else if ( now.getFullYear() == y )
			{
				col.addClass('now');
			}
			date.setFullYear(y+1);
		}
	}
	return isSelected;
}

JPCalendar.prototype._drawInYear10Mode = function(sDate,body)
{
	body = body || this.children.body;
	var date = new Date();
	date.setFullYear( Math.floor(sDate.getFullYear()/100) * 100 - 10);
	date.setMonth(0, 1, 0, 0, 0, 0);
	var isSelected =  Math.floor(sDate.getFullYear()/100) == Math.floor( this._currentDate.getFullYear()/100);
	if ( isSelected )  {
		this.children.items = {};
	}

	var now = new Date();
	
	var self = this;
	var clickEvent = function(e){
		self._currentDate = e.data;
		self.properties.mode = JPCalendar.Mode.Year;
		self._reload();
		return false;
	}
	
	for ( var q = 0 ; q < 3; q++ )
	{
		var row = $('<div/>').addClass('row year10').appendTo(body);
		for ( var c = 0; c < 4 ; c++ )
		{
			var y = date.getFullYear();
			var dclone = new Date(date.getFullYear(),1,1);
			var col = $('<div/>').addClass('col year10 item').data('date', dclone).appendTo(row);
				
			if ( this.properties.minDate.getFullYear() <= dclone.getFullYear() && dclone.getFullYear() + 10 <= this.properties.maxDate.getFullYear() ) {
				col.mouseclick(dclone,clickEvent);
			} else {
				col.addClass('disabled');
			}	
			
			if (  isSelected ) {
				this.children.items[y] = col;
			}			
			if ( this.properties.renderer ) {
				col.append(this.properties.renderer( dclone, JPCalendar.Mode.Year10 ));
			} else {
				$('<div/>').html(y + '-<br>' + (y+9)).addClass('title').appendTo(col);
			}
			if ( y <= now.getFullYear() && now.getFullYear() < y+10  )
			{
				col.addClass('now');
			}
			date.setFullYear(y+10);
		}
	}
	return isSelected;
}

JPCalendar.prototype.getDateView = function(dt)
{
	switch( this.properties.mode )
	{
		case JPCalendar.Mode.Day:
			return this.children.items[typeof dt == 'string' ? dt :  dt.toString('md')];
		case JPCalendar.Mode.Month:
			return this.children.items[typeof dt == 'string' ? dt : (dt.getMonth()+1)];
		case JPCalendar.Mode.Year:
			return this.children.items[typeof dt == 'string' ? dt : dt.getFullYear() ];
		case JPCalendar.Mode.Year10:
			return this.children.items[typeof dt == 'string' ? dt : (Math.floor(dt.getFullYear()/100) * 100 - 10) ];
	}
}
