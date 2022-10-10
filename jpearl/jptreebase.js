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

function JPTreeBase(element,props)
{
	if ( arguments.length == 0 ) return;

	if ( !props.template ) {
		var tmpl = $(element).find('script[type$=dataTemplate]');
		if (tmpl.length) {
			tmpl.detach();
		}
		props.template = tmpl;
	}
	
	JPView.call(this,element,$.extend({
		hasMore: undefined,
		loadSubtree: undefined
	},props));
}


JPTreeBase.prototype = new JPView();

JPTreeBase.prototype.data = function(value)
{
	if ( arguments.length )
	{
		if ( this._tree == value ) return;
		if ( this._tree )
		{
			this.reset(true);
		}
		if ( value instanceof Tree )
		{
			this._tree = value;
		}
		else
		{
			this._tree = new Tree();
			this._tree.root(value);
		}
		this.draw();
		return;
	}
	return this._tree;		
}

JPTreeBase.prototype.isAncestor = function(qItem, item)
{
	var p = item.parent;
	while(p)
	{
		if ( p == qItem ) return true;
		p = p.parent;
	}
	return false;
}

JPTreeBase.prototype.reset = function(notDraw){
	var self = this;
	this._tree.traverse( function(item){
	 	self._clearItem(item); 
		delete item._hidden;
	}, TreeTraversalOrder.Post );
	if ( !notDraw )
	{
		this.draw();
	}
	else
	{
		this.element.empty();
	}
}

JPTreeBase.prototype.filter = function(cb)
{
	this.reset(false);
	this._tree.traverse( function(item){
		item._hidden = !cb(item);
	});
	this._tree.traverse( function(item){
		if ( !item._hidden && item._parent )
		{
			item._parent._hidden = false;
		}
	}, TreeTraversalOrder.Post);
	this._tree.traverse( function(item){
		if ( !item._treeItem ) {
			return;
		}
		if ( item._hidden )
		{
			item._treeItem.hide();
		}
		else
		{
			if ( item._html )
			{
				item._treeItem.find('.name').html( item._html );
			}			
			item._treeItem.show();
		}
	});
}

JPTreeBase.prototype._getIcon = function(item,state,hobj)
{
	var icon = null;
	if ( typeof this.properties.icon == 'function' )
	{
		return this.properties.icon(item, state, hobj);
	}
    else if ( $.isPlainObject(this.properties.icon) ) 
	{
		if ( hobj ) hobj.empty();
		icon = hobj ? hobj : $('<div/>').addClass('icon');
		var imgInfo = null;
		if ( item.children || ( this.properties.hasMore && this.properties.hasMore(item) ) )
		{
			imgInfo = this.properties.icon[state];;
		}
		else if ( this.properties.icon.leaf )
		{
			imgInfo = this.properties.icon.leaf;
		}

		if (imgInfo)
		{
			if ( typeof imgInfo == 'function' )
			{
				imgInfo = imgInfo(item);
			}
			if ( $.isPlainObject(imgInfo) )
			{
				$('<img/>',imgInfo).appendTo(icon);
			}
			else if ( imgInfo.search(/\.(jpg|png|gif)$/) > 0 )
			{
				$('<img/>',{src:imgInfo}).appendTo(icon);
			}
			else
			{
				icon.html( imgInfo );
			}
		}	
	}
	return icon;
}
