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

function JPSlideshow(element,props)
{
	JPView.call(this, element, $.extend(true,{
		plugin: 'horizontal',
		items: undefined,
		initSelectedIndex: 0
	}, props));
	this.element.addClass('slideshow');
	this.children.items = [];
	this.children.container = $('<div/>').appendTo(this.element)
								.addClass('container');
	if ( typeof this.properties.plugin == 'string' )
	{
		var plugin = $.js.plugins.slideshow[this.properties.plugin] ? this.properties.plugin : 'horizontal';
		this.properties.plugin = new $.js.plugins.slideshow[plugin](this,this.properties.pluginOptions);
	}
	else if (this.properties.plugin)
	{
		this.properties.plugin.init(this,this.properties.pluginOptions);
	}
}

JPSlideshow.prototype = new JPView();

$.plugin(JPSlideshow);

JPSlideshow.prototype._layoutSubview = function()
{
	this.properties.plugin._reset();
}

JPSlideshow.prototype._createItemFactory = function(idx)
{
	var item = null;
	if ( typeof this._items == 'function' )
	{
		return this._items(idx)
				.addClass('item')
				.appendTo(this.children.container);
	}
	else
	{
		item = this._items[idx];
	}
	if ( item == null ) return null;
	var obj;
	if ( this.properties.template )
	{
		obj = this.drawTemplate(item);
	}
	else if ( typeof this.properties.itemFactory == 'function' )
	{
		obj = this.properties.itemFactory(item,idx);
	}
	else
	{
		obj = this._items[idx];
	}
	return obj.addClass('item').appendTo(this.children.container);
}


JPSlideshow.prototype.items = function()
{
	if ( arguments.length )
	{
		this.children.items.forEach( function(v){
			v.remove();
		});
		this.children.container.empty();
		this._items = arguments[0];
		this._selectedIndex = -1;
		this.selectedIndex( this.properties.initSelectedIndex );
		return;	
	}
	return this._items;
}

JPSlideshow.prototype.itemAt = function(idx)
{
	if ( typeof this._items == 'function' )
	{
		return this._items(idx);
	}
	else
	{
		if ( this.properties.rotate )
		{
			idx = this._rotationIndex(idx);
		}
		return 0 <= idx && idx < this._items.length ?  this._items[idx] : null;
	}
}

JPSlideshow.prototype.canGoForward = function()
{
	return this.itemAt(this._selectedIndex+1) != null;
}
 
JPSlideshow.prototype.canGoBack = function()
{
	return this.itemAt(this._selectedIndex-1) != null;
}

JPSlideshow.prototype.goForward = function()
{
	if ( this.canGoForward() )
	{
		this.selectedIndex(this._selectedIndex + 1);								
	}		
}

JPSlideshow.prototype.goBack = function()
{
	if ( this.canGoBack() )
	{
		this.selectedIndex(this._selectedIndex - 1);
	}
}

JPSlideshow.prototype._rotationIndex = function(idx,offset)
{
	offset = offset || 0;
	if ( !Array.isArray(this._items) ) 
	{
		return this.properties.item(idx,offset);
	}
	idx += offset;
	if ( idx < 0 )
	{
		return this._items.length + idx;
	}
	return idx % this._items.length;
}

JPSlideshow.prototype.selectedIndex = function(idx, forcefully)
{
	if ( arguments.length )
	{
		if ( forcefully )
		{
			this._selectedIndex = -1;
		}
		if ( Array.isArray(this._items) ) 
		{
			idx = this._rotationIndex(idx);
		}
		var dir = this._selectedIndex != -1 && this.properties.distance ? 
					this.properties.distance(idx,this._selectedIndex) : (idx - this._selectedIndex);
		if ( dir == 0 ) return;
		if ( Array.isArray(this._items) )
		{
			if ( this._selectedIndex != -1
				&& this.properties.rotate && Math.abs(dir) == this._items.length -1  )
			{
				dir = dir > 0 ? -1 : 1;
			}
		}
		if ( this._selectedIndex == -1 || Math.abs(dir) > 1 )
		{
			this.children.items.forEach( function(v){
				v.remove();
			});
			this.children.items[0] = this._createItemFactory( this._rotationIndex(idx,-1) );
			this.children.items[1] = this._createItemFactory( idx );
			this.children.items[2] = this._createItemFactory( this._rotationIndex(idx,1) );
			
			this.children.items[0].removeClass('selected');
			this.children.items[2].removeClass('selected');
			this.children.items[1].addClass('selected');
			dir = dir > 0 ? 2 : -2;
		}
		else if ( dir == 1 ) // forward
		{
			this.children.container.stop(false,true);
			this.children.items[0].remove();
			this.children.items[0] = this.children.items[1];
			this.children.items[1] = this.children.items[2];
			this.children.items[2] = this._createItemFactory( this._rotationIndex(idx,1) );
		
			this.children.items[0].removeClass('selected');
			this.children.items[2].removeClass('selected');
			this.children.items[1].addClass('selected');
		}
		else if ( dir == -1 ) // backword
		{
			this.children.container.stop(false,true);
			this.children.items[2].remove();
			this.children.items[2] = this.children.items[1];
			this.children.items[1] = this.children.items[0];
			this.children.items[0] = this._createItemFactory( this._rotationIndex(idx,-1) );

			this.children.items[0].removeClass('selected');
			this.children.items[2].removeClass('selected');
			this.children.items[1].addClass('selected');
		}
		this._selectedIndex = idx;
		this.properties.plugin.transition(dir);
		this.element.trigger('slideshow.selectionChanged', [idx]);
	}
	return this._selectedIndex;
}

