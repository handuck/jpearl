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

function JPTemplate(element,properties)
{
    if (arguments.length == 0) return;
	this.element = $(element);	
	this.properties = $.extend({}, properties);
	this._text = this.element.html().trim();
	var list = this._text.match(/[\$@]\{[^\}]+/g);
	if ( this.element.data('base') )
	{
		this.properties.basePath = this.element.data('base').split('.');	
	}
	if ( list && list.length > 0 )
	{
		this.data = {};
		for ( var i = 0 ; i < list.length; i++ )
		{
			var k = list[i].substr(2);
			if ( !this.data[k] )
			{
				var v = k.replace(/\[(\w+)\]/g, '.$1');;
				this.data[k] = {
					path: v.split('.'),
					regexp: new RegExp("[\$@]\{" + k + "\}", 'g')
				}
			}
		}
	}
}

$.plugin(JPTemplate);

JPTemplate.prototype.apply = function(item,converter)
{
	var text = this._text;
	if ( !item )
	{
		return $(text);
	}
	var base = item;
	if ( this.properties.basePath )	
	{
		for ( var i = 0 ; i < this.properties.basePath.length; i++ )
		{
			var k = this.properties.basePath[i];
			item = item[k];
		}
	}
	var conv = converter || this.properties.converter;
	for ( var k in this.data )
	{
		var paths = this.data[k].path;
		var obj = item;
		for ( var i = 0 ; i	< paths.length ; i++ )
		{
			obj = obj[paths[i]];
			if ( obj === undefined ) {
				break;
			}
		}
		if ( conv && conv[k] )
		{
			obj = conv[k](obj,item, base);		
		}
		if ( obj === undefined || obj === null ) {
			obj = '';
		}
 		text = text.replace( this.data[k].regexp, obj);
	}	
	var txt = $(text);
	return txt;
}

JPTemplate.prototype.value = function(item,converter)
{
	var html = this.apply(item,converter);
	this.element.html(html);
}

