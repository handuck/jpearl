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

function JPSearchbox(element,props)
{
	JPTextfield.call( this, element, $.extend(true,{
		hasClear: false,
		hasRearIcon: true,
	},props));
	this.element.addClass('searchbox');
	var self = this;
	this.element.find('.rear').click(function(e){
		self.element.trigger('enter', self.value());
	})
}

JPSearchbox.prototype = new JPTextfield();

$.plugin( JPSearchbox );
