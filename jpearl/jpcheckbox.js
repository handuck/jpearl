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

function JPCheckbox(element,props)
{
	JPButton.call(this, element, $.extend(true,{
		toggle: true
	},props));	
	this.element.addClass('checkbox input');
	var html = this.element.html();
	this.element.empty();
	
	this.children.button = $('<div/>').addClass('icon').appendTo(this.element);
	if (html )
	{
		this.children.label = $('<div/>').addClass('title').html(html).appendTo(this.element);
	}
	this.checked(this.properties.checked);
		var self = this;
	this.element.keypress(function(e){
		if ( e.which == 0x20 ) {
			e.stopPropagation();
			self.checked( !self.checked() ? $.consts['true'] : $.consts['false'] ,  true);
			return false;
		}
	});
}

$.plugin(JPCheckbox);

JPCheckbox.prototype = new JPButton();

JPCheckbox.prototype.halfChecked = function(value)
{
	if ( value )
	{
		this.element.addClass('halfchecked');	
	}
	else
	{
		this.element.removeClass('halfchecked');	
	}
}

JPCheckbox.prototype.checked = function(value)
{
	if ( arguments.length )
	{
		this.element.removeClass('halfchecked');	
	}
	return this.selected.apply( this, arguments ) ? true : false;
}

JPCheckbox.prototype.value = function()
{
	if ( arguments.length && typeof arguments[0] == 'string' )
	{
		arguments[0] = $.consts['true'].toString() == arguments[0];
	}
	return this.selected.apply(this,arguments) ? $.consts['true'] : $.consts['false'];
}


JPCheckbox.prototype.clear = function()
{
	this.selected($.consts['false']);
}
