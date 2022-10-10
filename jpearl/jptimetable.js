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

function JPTimetable(element,props)
{
	JPView.call(this, element,$.extend({
		range: [ [09, 00], [21,00] ],
		minuteHeight: 20,
		padding: 7
	}, props));
	this.element.addClass('timetable');
	this.element.css({
		padding: this.properties.padding
	});
	this.children.now = $('<div/>').addClass('now').appendTo(this.element);
	this._schedules = [];
	this.range( this.properties.range, 10);
}

JPTimetable.prototype = new JPView();
$.plugin(JPTimetable);

JPTimetable.prototype.range = function(range,resolution,minHeight)
{
	this.properties.range = range;
	this.properties.rangeMins = [ range[0][0] * 60 + range[0][1], range[1][0] * 60 + range[1][1]];
	resolution = resolution ||  10;
	this.properties.resolution = resolution;
	if (this.children.body ) 
	{
		this.children.body.empty();
	} else {
		this.children.body = $('<div/>').addClass('body').appendTo(this.element);
	}
	if( this.children.schedule ) {
		this.children.schedule.empty();
	} else {
		this.children.schedule = $('<div/>').addClass('schedule').appendTo(this.element);
	}
	var ticks = $('<div/>').addClass('ticks').appendTo(this.children.body);
	var mins = $('<div/>').addClass('grid').appendTo(this.children.body);
	var numdivs = 60 / resolution;
	var dh = minHeight || this.properties.minuteHeight;
	var y = 0;
	for ( var h = range[0][0] ; h < range[1][0] ; h++ )
	{
		for ( var m = 0; m < 60 ; m += resolution, y+=dh ) 
		{
			var mdiv = $('<div/>',{
			}).data({
				hour: h,
				minute: m
			}).height(dh).appendTo(mins);			
			if ( m == 0 ) {
				$('<div/>',{ text: '%02d:00'.sprintf(h) }).appendTo(ticks)
					.css({ top: y } )
					.addClass('hour');
				mdiv.addClass('hour');
			}
			else if ( m == 30 ) {
				$('<div/>',{ text: '%02d:%02d'.sprintf(h,m) }).appendTo(ticks)
					.css({ top: y} );
				mdiv.addClass('minute half');
			}
			else {
				mdiv.addClass('minute');
			}
		}
	}
}

JPTimetable.prototype.minutesToY = function(mins)
{
	return (mins - this.properties.rangeMins[0])/this.properties.resolution *  this.properties.minuteHeight + this.properties.padding;
}

JPTimetable.prototype.yToMinutes = function(y)
{
	var rangeM = this.properties.rangeMins[1] - this.properties.rangeMins[0];
	y -= this.properties.padding;
	y = Math.max(0, Math.min(y, this.element.height() ));
	return y / this.element.height() * rangeM +  this.properties.rangeMins[0];
}

JPTimetable.prototype._drawSchedule = function(item)
{
	var self = this;
	var sY = this.minutesToY( item.minutes[0] );	
	var eY = this.minutesToY( item.minutes[1] );	
	item.view = this.drawTemplate(item);
	item.view.css({
		top: sY,
		left: this.properties.padding,
		height : eY - sY
	}).appendTo(this.children.schedule).addClass('item')
	.mouseclick(function(e){
		$('.selected', self.children.schedule).removeClass('selected');
		$(this).addClass('selected');
		self.element.trigger('itemClicked', [item,item.view]);
	});
	if ( this.properties.postdraw ) {
		this.properties.postdraw( item.view, item );
	}
	return item;
}

JPTimetable.prototype.reload = function(item)
{
	var isSelected = item.view.hasClass('selected');
	item.view.remove();
	this._drawSchedule(item);
	if ( isSelected ) {
		item.view.addClass('selected');
	}
}

JPTimetable.prototype.position = function(item)
{
	var sY = this.minutesToY( item.minutes[0] );	
	var eY = this.minutesToY( item.minutes[1] );	
	item.view.css({
		top: sY,
		height : eY - sY
	});
}

JPTimetable.prototype.add = function(item)
{
	this._schedules.push(item);
	this._schedules = this._schedules.sort(function(a,b){
		return a.minutes[0] - b.minutes[0];
	});
	return this._drawSchedule(item);
}

JPTimetable.prototype.schedules = function()
{
	return this._schedules;
}

JPTimetable.prototype.clear = function()
{
	this.children.schedule.empty();
	this._schedules = [];
}

JPTimetable.prototype.showNow = function()
{
	var now = new Date();
	var start = new Date();
	start.setHours( this.properties.range[0][0] );
	start.setMinutes( this.properties.range[0][1] );
	var diff = (now - start)/1000/60/this.properties.resolution;
	this.children.now.css({
		top: diff * this.properties.minuteHeight  + this.properties.padding
	}).show();
}

JPTimetable.prototype.addNewSchedule = function(sch)
{
	var start = this.properties.rangeMins[0];
	if (this._schedules.length) {
		start = this._schedules[this._schedules.length-1].minutes[1];
	}
	sch.minutes = [ start, Math.min( this.properties.rangeMins[1], start + 60) ];
	return this.add(sch);
}

JPTimetable.prototype.remove = function(sch)
{
	sch.view.remove();
	var idx = this._schedules.indexOf(sch);
	if ( idx !=-1 ) {
		this._schedules.splice(idx,1);
	}
}

