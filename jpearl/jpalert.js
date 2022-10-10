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


function JPAlert(element,props)
{
	if ( arguments.length == 0 ) return;
	var self = this;
	if ( !props.cancelButton ) {
		props.cancelButton = "Close";
	} 
	if ( !props.buttons )
	{
		props.buttons = [ props.cancelButton || "Close" ];
		props.buttons = props.buttons.concat( props.otherButtons );
	}
	if ( typeof props.buttons[0] == 'string' )
	{
		props.buttons[0] = $('<div/>').JPButton({
			normalTitle: props.cancelButton
		});
	} 
	props.buttons[0].addClass('close');
	props.cancelButton = props.buttons[0];
	JPDialog.call(this, element, $.extend(true, props,{
		icon: undefined,
		message: undefined,
		otherButtons: undefined,
		createChildren: function() {
			var body = $('<section/>').addClass('body').appendTo(self.element);
			body.html(self.properties.message);
		}	
	}));
	this.element.addClass('alert');
}


$.plugin(JPAlert);

JPAlert.prototype = new JPDialog();

JPAlert.prototype.icon = function(img, w, h)
{
	var icon = this.children.header.find('.icon');
	icon.attr( {
		src: img,
		width: w,
		height: h
	});
}

JPAlert.prototype.title = function(txt)
{
	this.children.header.find('.title').html(txt);
}

JPAlert.prototype.message = function(msg)
{
	if ( typeof msg == 'string' )
	{
		this.children.body.html(html);	
	}
	else 
	{
		this.children.body.empty();
		this.children.body.append(msg);
	}
}

/*
JPAlert.prototype.dismiss = function(args,animated)
{
	JPDialog.prototype.dismiss.apply(this,arguments);
}
*/