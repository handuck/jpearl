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

function JPRadioButton(element,props)
{
	JPButton.call(this, element, $.extend(true,{
		radioGroup: '@siblings'
	},props));	
	this.element.addClass('radio input');
	var html = this.element.html();
	this.element.empty();
	
	this.children.button = $('<div/>').addClass('icon').appendTo(this.element);
	this.children.dot = $('<div/>').addClass('dot').appendTo(this.children.button);
	if (html)
	{
		this.children.label = $('<div/>').addClass('title').html(html).appendTo(this.element);
	}
	var self = this;
	this.element.keypress(function(e){
		if ( e.which == 0x20 ) {
			e.stopPropagation();
			self.checked(true, true);
			if ( self.element.hasClass('input') ) {
				self.element.trigger('valueChange', [ self.element.data('value') ]);
			}
			return false;
		}
	});
}

$.plugin(JPRadioButton);

JPRadioButton.prototype = new JPButton();

JPRadioButton.prototype.checked = function(value)
{
	if ( arguments.length )
	{
		for( var i = 0 ; i < this.properties.radioGroup.length; i++ )
		{
			$(this.properties.radioGroup[i]).instance().selected(false);
		}
	}
	var v = this.selected.apply( this, arguments );
	return v;
}


JPRadioButton.prototype.value = function(v)
{
	if ( arguments.length > 0 )
	{
		this.selected( this.element.data('value') == v ? $.consts['true'] : $.consts['false'] );
		return;
	}
	return this.properties.radioGroup.filter( function(){
		return $(this).hasClass('selected');
	}).data('value');
}

JPRadioButton.prototype.clear = function()
{
	this.properties.radioGroup.each( function(){
		$(this).instance().state(JPButton.State.Normal);
	});
}
