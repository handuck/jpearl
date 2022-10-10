// (function($){

$.js.plugins.menu.standard = function(menu, props){
	this.init(menu,props);
}

var cls = $.js.plugins.menu.standard;

cls.prototype.init = function(menu,props)
{
	this.menu = menu;
	this.properties = $.extend( {
		submenu: '►'
	},props);
	this.selectedItem = null;
	this.menu.element.addClass('standard');
}

cls.prototype.drawMenuItem = function(item)
{
	var self = this;
	var hobj = $('<table/>', {
					cellPadding: 5,
					cellSpacing: 0,
					width: '100%'
				}).addClass('menuItem').css({
					collapse: 'separate',
					fontSize: 'inherit',
					fontFamily: 'inherit'
				}).addClass(item.children ? 'node' : 'leaf')
				.data('item', item);
	if ( !item.children )
	{
		hobj.click( function(e){
			self.element.trigger('menu.itemClicked', [item]);
		});
	}
	var tr = $('<tr/>').appendTo(hobj);
	var icon = $('<td/>').addClass('icon').appendTo(tr);
	var txt = $('<td/>').addClass('text').html(item.name).appendTo(tr);
	if ( item.children )
	{
		var submark = $('<td/>', {
			align: 'right',
			width: '14pt'
		}).addClass('indicator').html(this.properties.submenu).appendTo(tr);
	}
	this.menu._getIcon(item,null,icon);

	item._menuItem = hobj;
	if ( item.disabled )
	{
		hobj.addClass('disabled'); 
	}
	return hobj;
}

cls.prototype.drawSubmenu = function(mitem)
{
	var self = this;
	mitem._submenu = $('<div/>').addClass('submenu');	
	var enterCallback = function(){
		var item = $(this).data('item');
		item._menuItem.addClass('hover');
		if ( this._timer )
		{
			clearTimeout(this._timer);
			this._timer = null;
		}
		if( item.children && item.children.length )
		{
			self.showSubmenu(item);	
			self.isHoverOverLeaf = false;
		}
		else
		{
			self.isHoverOverLeaf = true;
		}
	};
	var leaveCallback = function() {
		var item = $(this).data('item');
		item._menuItem.removeClass('hover');
		self.hideSubmenuAfter(500);
		self.isHoverOverLeaf = false;
	}
	for ( var i = 0 ; i < mitem.children.length; i++ )
	{
		var c = mitem.children[i];							
		this.drawMenuItem(c).appendTo(mitem._submenu);
		c._menuItem.hover(enterCallback, leaveCallback);
	}
	return mitem._submenu;
}

cls.prototype.showSubmenu = function(item)
{
	var p = this.selectedItem;
	while( p )
	{
		if ( this.menu.isAncestor( p, item ) )
		{
			break;
		}
		p._submenu.hide();
		p._menuItem.removeClass('selected');
		p = p.parent;
	}
	this.selectedItem = item;
	if ( this._timer )
	{
		clearTimeout(this._timer);
		this._timer = null;
	}
	if ( !item._submenu )
	{
		this.drawSubmenu(item).appendTo(this.menu.element);
	}		
	item._menuItem.addClass('selected');
	item._submenu.show();
	var offset = item._menuItem.offset();
	var off;
	if ( this.menu.properties.direction == 'horizontal' )
	{
		off = {
			left: item.parent == null ? offset.left :  (offset.left + item._menuItem.width()),
			top: item.parent == null ? this.menu.children.menuBar.outerHeight() : offset.top
		};
	}
	else
	{
		off = {
			left:  offset.left + item._menuItem.width(),
			top: offset.top
		};
	}
	item._submenu.css(off);		
}

cls.prototype.hideSubmenu = function(item)
{
	console.log('hide',item);
	if ( this._timer )
	{
		clearTimeout(this._timer);
		this._timer = null;
	}
	if ( item )
	{
		if ( item._submenu )
		{
			item._menuItem.removeClass('selected');
			item._submenu.hide();
		}
		var p = this.selectedItem;
		while( p )
		{
			if ( this.menu.isAncestor(p, item) )
			{
				break;
			}
			p._submenu.hide();
			p._menuItem.removeClass('selected');
			p = p.parent;
		}
	}
	else
	{
		var p = this.selectedItem;
		while ( p )
		{
			p._submenu.hide();
			p._menuItem.removeClass('selected');
			p = p.parent;
		}
		this.selectedItem = null;
	}
	this.isHoverOverLeaf = false;
}

cls.prototype.hideSubmenuAfter = function(sec, item)
{
	var self = this;
	if ( this._timer )
	{
		clearTimeout(this._timer);
		this._timer = null;
	}
	this._timer = setTimeout( function(){
		if ( self.isHoverOverLeaf ) return;
		self.hideSubmenu(item);		
	}, sec || 200);		
}


// })(jQuery);
