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

function JPTextInput(element,props)
{
	if ( arguments.length == 0 ) return;
	JPTextfield.call( this, element, $.extend(true,{
		hasClear: true,
		required: false,
		autotrim: true,
		hasRearIcon: false,
		format: undefined,
		box: true
	},props));
	var self = this;
	this.element.addClass('textinput');
	this.element.removeClass('textbox');
	if ( this.properties.singleline ) {
		this.element.addClass('single');
	}
	if ( this.properties.underline ) {
		this.element.addClass('box');
	} 
	this.children.inputbox = $('<div/>').addClass('inputbox').appendTo(this.element);
	if ( this.children.front ) {
		this.children.inputbox.append( this.children.front );
	}
	this.children.inputbox.append( this.children.input );
	if ( this.children.rear ) {
		this.children.inputbox.append( this.children.rear );
	}
	this.children.label = $('<div/>', { html: this.properties.label }).addClass('label').appendTo(this.children.inputbox);
	this.children.message = $('<div/>', { html: this.properties.message }).addClass('message').appendTo(this.element);
	this.children.label.click(function(e){
		if ( !self.element.hasClass('focus') ) {
			self.focus();
		}
	});
}

JPTextInput.prototype = new JPTextfield();

$.plugin( JPTextInput );


JPTextInput.prototype.placeholder = function(v)
{
	this.children.label.html(v);
}


JPTextInput.prototype.label = function(v)
{
	this.children.label.html(v);
}

JPTextInput.prototype.value = function(v)
{
	var ret = JPTextfield.prototype.value.apply(this,arguments);
	if ( arguments.length ) {
		if ( this.length() > 0 ) {
		this.element.addClass('filled');
		} else {
			this.element.removeClass('filled');
		} 
	}
	return ret;
}

JPTextInput.prototype.message = function(v)
{
	if ( v != null && v.length > 0 ) {
		this.children.message.show().html(v);
	} else {
		this.children.message.html('').hide();
	} 
}

JPTextInput.prototype.blur = function(e)
{
	JPTextfield.prototype.blur.apply(this,arguments);
	if ( this.length() > 0 ) {
		this.element.addClass('filled');
	} else {
		this.element.removeClass('filled');
	} 
}

JPTextInput.prototype.clear = function()
{
	JPTextfield.prototype.clear.apply(this,arguments);
	this.element.removeClass('filled');
}


