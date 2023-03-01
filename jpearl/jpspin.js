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

function JPSpin(element,props)
{
	if ( arguments.length == 0 ) return;
	JPView.call( this, element, $.extend({
		min: 0, 
		max: 100,
		step: 1,
		rotate: true,
		value: 0
	}, props));
	this.element.addClass('spin input textbox');
	if ( this.properties.required == true )
	{
		this.element.addClass('required');	
	}
	var self = this;
	this.children.input = $('<input/>').appendTo(this.element);
	var box = $('<div/>').addClass('buttons').appendTo(this.element);
	this.children.increase = $('<div/>').html("&#x25B2;").addClass('increase').appendTo(box);
	this.children.decrease = $('<div/>').html("&#x25BC;").addClass('decrease').appendTo(box);
	this._updateInputSize();
	if ( this.properties.inputWidth ) {
		this.children.input.width(this.properties.inputWidth);
	} 

	this.children.increase.click(function(e){
		if ( self.properties.enabled ) {
			self.increase();
		}
	});
	this.children.decrease.click(function(e){
		if ( self.properties.enabled ) {
			self.decrease();
		}
	});

	this.children.input.keydown(function(e){
		if ( !self.properties.enabled ) {
			return;
		}
		switch( e.which )
		{
			case 37: // left, 
			case 39: // right, 
				return true;
			case 38: // up, 
				self.increase();
				break;
			case 40: // down, 
				self.decrease();
				break;
			default:
				if ( e.which < 0x30 || e.metaKey || ( 112 <= e.which && e.which <= 123 ) ) return true;
				return (0x30 <= e.which && e.which <= 0x39) 
				  || (0x60 <= e.which && e.which <= 0x69)
				  || e.which == 187 || e.which == 189   // +, -
				  || e.which == 190; // comma
		}
	}).change(function(e){
		self.properties.value = parseInt( $(this).val() );
		self.element.trigger('valueChange', $(this).val());
	}).focus(function(e){
		self.element.addClass('focus');	
	}).blur(function(e){
		self.element.removeClass('focus');	
	});
	this.children.input.val(this.properties.value);
}

$.plugin(JPSpin);

JPSpin.prototype = new JPView();

JPSpin.prototype.increase = function()
{
	if ( this.properties.value === null || this.properties.value === undefined ) {
		this.properties.value = this.property.min || 0;
	}
	this.properties.value += this.properties.step;	
	if ( this.properties.rotate && this.properties.value > this.properties.max )
	{
		this.properties.value = this.properties.min;
	}
	else
	{
		this.properties.value = Math.min( this.properties.max, this.properties.value );
	}
	this.children.input.val(this.properties.value);
	this.element.trigger('valueChange', [ this.properties.value  ] );			
}

JPSpin.prototype._updateInputSize = function()
{
	var size = 0;
	if ( this.properties.size ) {
		size = this.properties.size;
	} else {
		size = Math.abs(Math.floor(Math.log10( this.properties.max ))) + 1;
		if (this.properties.max < 0 || this.properties.min < 0 ) 
		{
			size++;
		}
		if ( this.properties.step < 1 ) 
		{
			size += Math.abs(Math.floor(Math.log10( this.properties.step ))) + 1;	
		}
	}
	this.children.input.attr('size', size);
	this.children.input.attr('maxlength', size);

}

JPSpin.prototype.property = function()
{
	var ret = JPView.prototype.property.apply(this,arguments);
	if ( arguments.length ){
		this._updateInputSize();
	}
	return ret;
}


JPSpin.prototype.decrease = function()
{
	if ( this.properties.value === null || this.properties.value === undefined ) {
		this.properties.value = this.property.min || 0;
	}
	this.properties.value -= this.properties.step;	
	if ( this.properties.rotate && this.properties.value < this.properties.min )
	{
		this.properties.value = this.properties.max - (this.properties.step-1);
	}
	else
	{
		this.properties.value = Math.max( this.properties.min, this.properties.value );
	}
	this.children.input.val(this.properties.value);
	this.element.trigger('valueChange', [ this.properties.value  ] );			
}

JPSpin.prototype.value = function(v)
{
	if ( arguments.length )
	{
		if ( v === null || v === undefined ) {
			this.properties.value = undefined;
			this.children.input.val('');
		} else {
			var v = Math.max( this.properties.min, Math.min( this.properties.max, v) );
			this.properties.value = parseFloat(v);
			this.children.input.val(v);
		}
		return;
	}
	var p = this.children.input.val();
	return p.length > 0 ? parseFloat(p) : null;
}

JPSpin.prototype.focus = function()
{
	this.children.input.focus();
}

JPSpin.prototype.blur = function()
{
	this.children.input.blur();
}

JPSpin.prototype.clear = function()
{
	this.value(0);
}

JPSpin.prototype.validate = function(e)
{
	if ( !this.properties.required && this.properties.value === undefined) {
		return true;
	}
	var success = !isNaN(this.properties.value) 
				&& this.properties.min <= this.properties.value &&
				  this.properties.value <= this.properties.max;
	if ( !success )
	{
		this.element.addClass('error');
		return false;
	}
	this.element.removeClass('error');
	return true;
}
