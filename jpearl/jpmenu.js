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

function JPMenuview(element,props)
{
	if ( arguments.length == 0 ) return;
	JPTreeBase.call(this,element, $.extend(true,{
		indent: 25,
		plugin: 'standard',
		direction: 'horizontal',
		submenuHeight: 300 }, props));
	if ( typeof this.properties.plugin == 'string' )
	{
		var plugin = $.js.plugins.menu[this.properties.plugin] ? this.properties.plugin : "standard";
		this.properties.plugin = new $.js.plugins.menu[plugin](this, this.properties.pluginOptions );
	}
	else if ( this.properties.plugin )
	{
		this.properties.plugin.init( this, this.properties.pluginOptions );
	}
	this.element.addClass('menu ' + this.properties.direction);
	if ( this.properties.data )
	{
		this.data(this.properties.data);
	}
	this.element.trigger('initialized');
}

JPMenuview.prototype = new JPTreeBase();
$.plugin(JPMenuview);

JPMenuview.prototype._clearItem = function(item)
{
	if (item._submenu)
	{
		item._submenu.empty();
		delete item._submenu;
	}		
}

JPMenuview.prototype._drawMenuItem = function(item)
{
	var self = this;
	return $('<div/>').addClass('menuItem top')
				.html(item.name)
				.hover(function(){
						if ( item.children )
						{
							self.properties.plugin.showSubmenu(item);
						}
						else
						{
							self.properties.plugin.hideSubmenu();
							item._menuItem.addClass('hover');
						}
					},function(){
						self.properties.plugin.hideSubmenuAfter(200);
						item._menuItem.removeClass('hover');
				}).click(function(e){
					if ( !item.disabled )
					{
						self.element.trigger('menu.itemClicked', [item]);
					}
				});
}

JPMenuview.prototype.draw = function()
{
	this.element.empty();					
	this.children.menuBar = $('<div/>').addClass('menubar').appendTo(this.element);
	for ( var i = 0 ; i < this._tree.children.length; i++ )
	{
		var item = this._tree.children[i];
		if ( !item._hidden ) 
		{
			item._menuItem = this._drawMenuItem(item).appendTo(this.children.menuBar);
		}
	}	
}

JPMenuview.prototype.itemDisabled = function(item, value)
{
	if ( arguments.length == 1 ) value = true;
	if ( value )
	{
		item._menuItem.addClass('disabled');
	}
	else
	{
		item._menuItem.removeClass('disabled');
	}
}

JPMenuview.prototype.itemDisabledAt = function(indexes)
{
	if ( !Array.isArray(indexes) )
	{
		indexes = [indexes]; 
	}
	var children = this._tree.children;
	for ( var i = 0 ; i < indexes.length; i++ )
	{
		var idx = indexes[i];
		children[idx]._menuItem.addClass('disabled');
	}
}

JPMenuview.prototype.allItemsEnabled = function()
{
	this.element.find('.disabled').removeClass('disabled');
}
