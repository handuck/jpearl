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

function JPInput(element,props)
{
	if ( !arguments.length ) return;
	JPView.call(this, element, props);
	this.element.addClass('input');	
}


JPInput.prototype = new JPView();


JPInput.prototype.clear = function()
{
			
}

JPInput.prototype.validate = function()
{
	var v = this.value();
	var success = false;
	if ( !this.properties.required && (v == null || v.length == 0 ) )
	{
		return false;
	}
	else if ( typeof this.properties.validator == 'function' )
	{
		success = this.properties.validator(v);
	}
	else if ( this.properties.validator )
	{
		success = this.properties.validator.test(v)
	}
	else
	{
		success = true;
	}
	if ( success )
	{
		this.element.removeClass('error');
		this.element.removeClass('empty');
	}
	else 
	{
		this.element.addClass('error');
	}
	return success;
}

JPInput.prototype.value = function()
{
	
}
