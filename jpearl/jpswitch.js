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

function JPSwitch(element,props)
{
	if ( arguments.length == 0 ) return;
	JPInput.call(this,element,$.extend(true,{
		selectedColor: 0xf9ce23, //  0x808080
	},props));
	this.element.addClass('switch input');	
	this.children.knob = $('<div/>').appendTo(this.element).addClass('knob');
	var self = this;
	this.element.mouseclick( function(e){
		if (!self.properties.enabled) return;
		e.stopPropagation();
		self.toggle(true);
		return false;
	});
	this._layoutSubviews();
	if ( this.element.text() == $.consts['true'] )
	{
		this.selected( $.consts['true'], false);		
	}
}

$.plugin(JPSwitch);

JPSwitch.prototype = new JPInput();

JPSwitch.prototype.toggle = function(sendEvent)
{
	var v = this.properties.selected == $.consts['true'] ? $.consts['false'] : $.consts['true'];
	this.selected(v);
	if ( sendEvent ) {
		this.element.trigger('valueChange', [v]);
	}
}

JPSwitch.prototype._measure = function()
{
	var css = {};
	css.top = 0;
	if ( this.properties.selected )
	{
		css.left = this.element.width() - this.children.knob.width() - css.top - 2;
	}
	else
	{
		css.left = css.top;
		css.backgroundColor = '';
	}
	return css;
}

JPSwitch.prototype._layoutSubviews = function()
{
	this.children.knob.css( this._measure() );
}

JPSwitch.prototype.selected = function(value,animated)
{
	if( arguments.length )
	{
		if ( this.properties.selected == value ) return;
		this.properties.selected = value;
		var ani = this.properties.animated;
		if ( arguments.length == 2 ) {
			ani = animated;
		}
		if ( ani )
		{
			var self = this;
			this.children.knob.stop();
			this.children.knob.animate( this._measure(), {
				duration: 300,
				complete: function(){
					self.element[ $.consts['true'] == value?'addClass':'removeClass']('selected');
					self._layoutSubviews();
				}
			});
			var color = this.properties.selected ? (this.properties.selectedColor || 0x0000ff) : 0xffffff;
			if ( typeof color == 'string' ) {
				if ( color[0] == '#' ) {
					color = parseInt( color.substring(1), 16 );
				}
			}
			this.element.colorAnimate( color, {
				duration: 300	
			});
		}
		else
		{
			this.children.knob.stop();
			this.element[ $.consts['true'] ==  value?'addClass':'removeClass']('selected');
			this._layoutSubviews();
		}
		return;
	}
	return this.properties.selected;
}

JPSwitch.prototype.value = function()
{
	return this.selected.apply(this,arguments);	
}

JPSwitch.prototype.clear = function()
{
	this.selected($.consts['false']);
}

JPSwitch.prototype.validate = function()
{
	return true;
}
