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

function JPTreeview(element,props)
{
	if ( arguments.length == 0 ) return;
	JPTreeBase.call(this,element, $.extend(true,{
		icon: {
			open: '▼',
			close: '►',
			wait: {
				src: 'images/loading.gif',
				width: '14px'
			}
		},
		indent: 25,
		openAll: false,
		openSingleLeaf: false,
		checkable: false,
		columns: undefined // draw additional columns into tree items
	}, props));
	this.element.addClass('tree');
	if ( this.properties.data )
	{
		this.data(this.properties.data);
	}
	if ( this.properties.openAll )
	{
		this.openAll();
	}
	this.element.trigger('initialized');
}

JPTreeview.prototype = new JPTreeBase();
$.plugin(JPTreeview);

JPTreeview.prototype.openAll = function()
{
	var self = this;
	this._tree.traverse( function(item){
		self.open(item,false);
	});
}

JPTreeview.prototype.closeAll = function()
{
	var self = this;
	this._tree.traverse( function(item){
		if ( item._treeItem )
		{
			self.close(item,false);
		}
	});
}

JPTreeview.prototype.openRoot = function()
{
	if ( this._tree.children ) {
		for ( var i = 0 ; i < this._tree.children.length; i++ ) {
			this.open(this._tree.children[i],false);
		}
	}
}

JPTreeview.prototype._clearItem = function(item)
{
	if ( item._treeItem )
	{
		delete item._html;
		item._treeItem.empty();
		delete item._treeItem;
	}
	if (item._subtree)
	{
		item._subtree.empty();
		delete item._subtree;
	}
}

JPTreeview.prototype._openSubItems = function(item)
{
	if ( !item._treeItem ) return;
	item._treeItem.show();
	if ( item.children && item._treeItem.hasClass('open') )
	{
		item.children.forEach(function(v) {
			this._openSubItems(v);
		}, this);
	}
}

JPTreeview.prototype.open = function(item,animated)
{
	if ( item.children == null || item.children.length == 0 ) 
	{
		if ( this.properties.hasMore && this.properties.hasMore(item) )
		{
			var self = this;
			item._treeItem.addClass('wait');
			this._getIcon(item,'wait', item._treeItem.find('.icon:first'));
			this.properties.loadSubtree(item, function(subItems){
				if ( subItems ) {
					item.graft(subItems);
					self._tree.initNode(item);
					self.open(item,animated);	
				} else {
					item._treeItem.removeClass('wait');
				}
			});
		}
		return;
	}
	if ( this.properties.openSingleLeaf )
	{
		this.closeAll();
	}
	if ( !item._subtree && !item.children[0]._treeItem )
	{
		this.draw(item);
	}
	if( !item._treeItem ) return;
	item._treeItem.addClass('open').removeClass('wait');
	this._getIcon(item,'open', item._treeItem.find('.icon:first'));
	if ( this.properties.columns)
	{
		this._openSubItems(item);
	}
	else if ( item._treeItem && item._subtree )
	{
		item._subtree.show();
		if ( animated )
		{
			var h = item._subtree.height();
			item._subtree.height(0);
			item._subtree.stop().animate({
				height: h
			},{
				duration: 300,
				easing: 'backOut',
				complete: function(){
					item._subtree.css({ height: ''} );
				}
			});
		}
	}
}

JPTreeview.prototype.openParents = function(item,animated)
{
	item.parents().forEach( function(n){
		this.open(n,animated);	
	}, this);
}

JPTreeview.prototype.close = function(item, animated)
{
	if ( this.properties.columns )
	{
		if ( item._treeItem.hasClass('open') )
		{
			item._treeItem.removeClass('open');
			this._tree.traverse(function(pitem){
				if ( pitem == item || !pitem._treeItem ) return;
				pitem._treeItem.hide();
			},TreeTraversalOrder.Pre, item);
		}		
	}
	else if ( item._subtree && item._subtree.is(':visible') )
	{
		item._treeItem.removeClass('open');
		if ( animated )
		{
			item._subtree.stop().animate({
				height: 0
			},{
				duration: 300,
				easing: 'pow2Out',
				complete: function(){
					item._subtree.css({ height: ''} );
					item._subtree.hide();
				}
			});
		}
		else
		{
			item._subtree.css({ height: ''} );
			item._subtree.hide();
		}
	}		
	this._getIcon(item,'close', item._treeItem.find('.icon:first'));
}

JPTreeview.prototype.toggle = function(item)
{
	if ( item._treeItem.hasClass('open') )
	{
		this.close(item,this.properties.animated);				
	}	
	else
	{
		this.open(item,this.properties.animated);
	}
}


JPTreeview.prototype._drawItem = function(item)
{
	var self = this;
	var node = $('<div/>').addClass('item').data('item', item);
	var container = $('<div/>').appendTo(node).addClass('content');
	var num = item._depth - this.properties.startDepth;
	if ( num )
	{
		var w = this.properties.indent;
		for( var i = 0 ; i < num; i++ )
		{
			container.append($('<div/>').addClass('pad').width(w));	
		}
	}
	var icon = this._getIcon(item,'close');
	if ( icon )
	{
		icon.appendTo(container).addClass('icon');
	}
	node.addClass( item.children ? 'node' : 'leaf' );
	if ( this.properties.checkable )
	{
	//	var checkbox = $('<input/>', { type: 'checkbox' }).appendTo(container)
		var checkbox = $('<div/>').JPCheckbox().appendTo(container)
			.click( function(e){
				e.stopPropagation();
				item._checked = $(this).JPCheckbox('checked');
				if ( item.children )
				{
					self._tree.traverse( function( child ){
						if ( child == item ) return;
						child._checked = item._checked;
						if ( child._treeItem )
						{
							child._treeItem
								.find('.content > .checkbox')
								.JPCheckbox('checked', child._checked);
						}
					}, TreeTraversalOrder.Pre, item );
				}		
				var plist;
				if ( item instanceof TreeNode )
				{
					plist = item.parents();
				}
				else if ( item._parent )
				{
					plist = [];
					var p = item._parent;
					while( p )
					{
						plist.unshift(p);
						p = p._parent;
					}
				}
				var halfChecked = false;
				for( var i = plist.length - 1 ; i >= 0 ; i-- )
				{
					var p = plist[i];
					var chkbox = p._treeItem.find('.content > .checkbox');
					if ( halfChecked )
					{
						chkbox.JPCheckbox('halfChecked', true);
						continue;	
					}
					var cnt = 0;
					p._checked = p.children.forEach( function(c){
						if ( c._checked ) cnt++;
					});
					if ( cnt == 0 )
					{
						chkbox.JPCheckbox('checked', false);
					}
					else if ( cnt == p.children.length )
					{
						p._checked = true;
						chkbox.JPCheckbox('checked', true);
					}
					else
					{
						chkbox.JPCheckbox('halfChecked', true);
						halfChecked = true;
					}
				}	
			});
		if ( this.properties.hideCheckboxes ) {
			checkbox.hide();
		}
		if ( item._checked )
		{
			checkbox.prop( 'checked', item._checked );
		}
	}
	var title = null;
	if ( this.properties.template )
	{
		title = this.drawTemplate(item);
	}
	else
	{
		title = $('<div/>').html(item.name)
	}
	title.addClass('name').appendTo(container);
	node.click( function(e){
		var nodeOpen = (item._children && item._children.length) || ( self.properties.hasMore && self.properties.hasMore(item)  );
		if ( nodeOpen && self.properties.selectable && self.properties.selectable != 'leaf' ) {
			if ( !$(e.target).hasClass('icon') ) {
				nodeOpen = false;
			}
 		}
		if ( nodeOpen )
		{
			self.toggle(item);
			if ( item._treeItem.hasClass('open') )
			{
				self.element.trigger('itemOpened', [item]);	
			}
			else if ( item._treeItem.hasClass('wait') )
			{
				self.element.trigger('itemWaiting', [item]);	
			}	
			else
			{
				if ( item._children == null || item._children.length == 0 )
				{
					if ( self.properties.selectable ) {
						self.selectedItem(item);
					}
					self.element.trigger('itemClicked', [item]);	
				}
				else
				{
					self.element.trigger('itemClosed', [item]);	
				}
			}
		}
		else
		{
			if ( self.properties.selectable ) {
				self.selectedItem(item);
			}
			self.element.trigger('itemClicked', [item]);
		}
	});
	if ( item._children == null || item._children.length == 0 ) {
		node.dblclick(function(e){
			self.element.trigger('itemDblclicked', [item]);	
		});
	}
	if ( this.properties.columns )
	{
		node.append( this.properties.columns(item) );								
	}
	if ( this.properties.postdraw )
	{
		this.properties.postdraw(item,node);
	}
	return node;
}

JPTreeview.prototype.showCheckboxes = function()
{
	this.properties.hideCheckboxes = false;
	$('.checkbox', this.element).show();
}

JPTreeview.prototype.hideCheckboxes = function()
{
	this.properties.hideCheckboxes = true;
	$('.checkbox', this.element).hide();
}

JPTreeview.prototype.toggleCheckboxes = function()
{
	if ( this.properties.hideCheckboxes ) {
		this.showCheckboxes();
	} else {
		this.hideCheckboxes();
	}
}

JPTreeview.prototype.selectedItem = function(item)
{
	if ( arguments.length ) {
		if ( typeof item == 'function' ) {
			this._tree.traverse( function( child ){
				if ( item(child) == 0 ) {
					item = child;
					return false;
				}
			}, TreeTraversalOrder.Pre );
		}
		if ( item ==  this.properties.selectedItem ) return;
		if ( this.properties.selectedItem ) {
			if ( this.properties.selectedItem._treeItem ) {
				this.properties.selectedItem._treeItem.removeClass('selected');
			} 
		}
		if ( item._treeItem ) {
			item._treeItem.addClass('selected');
		}
		this.properties.selectedItem = item;
		return;
	}
	return this.properties.selectedItem;
}


JPTreeview.prototype.draw = function(parentNode)
{
	if ( arguments.length )
	{
		if ( parentNode.children && parentNode.children.length > 0 )
		{
			var depth = parentNode._depth+1;
			var cnt = 0;
			var item;
			if ( this.properties.columns )
			{
				for( var i = parentNode.children.length - 1 ; i >= 0 ; i-- )
				{
					item = parentNode.children[i];
					item.parent = parentNode;
					if ( item._hidden ) continue;
					var left = this.properties.indent* depth;
					var tItem = this._drawItem(item);
					item._treeItem = tItem;
					tItem.insertAfter( parentNode._treeItem);
					if ( cnt == 0 )
					{
						tItem.addClass('last');
					}
					cnt++;
				}
			}
			else
			{
				parentNode._subtree = $('<div/>').addClass('subtree depth' + depth );
				for( var i = 0 ; i < parentNode.children.length ; i++ )
				{
					item = parentNode.children[i];
					item.parent = parentNode;
					if ( item._hidden ) continue;
					var left = this.properties.indent* depth;
					var tItem = this._drawItem(item);
					item._treeItem = tItem;
					parentNode._subtree.append( tItem );	
					cnt++;
				}	
				if ( item._treeItem )
				{
					item._treeItem.addClass('last');
				}
				if ( !this.properties.columns )
				{
					if ( cnt > 0 )
					{
						parentNode._subtree.insertAfter(parentNode._treeItem);
					}
					else
					{
						parentNode._subtree.remove();
						delete parentNode._subtree;
					}
				}
			}
		}
	}
	else
	{
		this.element.empty();
		var children = this._tree.children;
		if ( children && children.length )
		{
			this.properties.startDepth = children[0]._depth;
			for ( var i = 0 ; i < children.length ; i++ )
			{
				var item = children[i];
				if ( item._hidden ) continue;
				var tItem = this._drawItem(item);
				children[i]._treeItem = tItem;
				this.element.append(tItem);
			}
		}
	}
}
