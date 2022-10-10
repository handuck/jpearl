// (function($){

$.js.plugins.menu.multicolumn = function(menu, props){
	this.init(menu,props);
}

var cls = $.js.plugins.menu.multicolumn;

cls.prototype.init = function(menu,props)
{
	this.menu = menu;
	this.properties = $.extend( {
	  	minColumnWidth: 200 
	},props);
	this.menu.element.addClass('multicolumn');
}

cls.prototype.drawSubmenu = function(mitem)
{
	var self = this;
	mitem._depth = 0;
	mitem._submenu = $('<div/>').JSMultiColumnView({
		  	minColumnWidth: this.properties.minColumnWidth
		}).addClass('submenu').hover(function(){
			self.showSubmenu(mitem);
		}, function(){
			self.hideSubmenu();
		});
	
	this.menu._tree.traverse(function(item){
		if ( mitem == item ) return;
		item._depth = item._parent ? (item._parent._depth+1) : 0;
		var indent = item._depth > 1 ? self.menu.properties.indent * (item._depth-1) : 0;
		if ( item.children )
		{
			if ( !item._menuItem )
			{
				item._menuItem = $('<div/>').addClass('node menuItem')
									.html(item.name);
			}
		}
		else
		{
			item._menuItem = $('<div/>').addClass('leaf menuItem')
								.html(item.name)
								.hover(function(){
									item._menuItem.addClass('hover');																
								},function(){
									item._menuItem.removeClass('hover');																
								}).click( function(e){
									self.menu.element.trigger('menu.itemClicked', [item]);
									self.hideSubmenu();
								});
		}
		item._menuItem.css({
			paddingLeft : indent
		}).addClass('depth' + item._depth);
		mitem._submenu.JSMultiColumnView('append',item._menuItem);
	}, TreeTraversalOrder.Pre , mitem);
	return mitem._submenu;
}

cls.prototype.showSubmenu = function(item, animated)
{
	if ( this._selectedMenuItem != null && this._selectedMenuItem != item )
	{
		this._selectedMenuItem._menuItem.removeClass('selected');
		this._selectedMenuItem._submenu.hide();
		if ( this.menu.properties.animated )
		{
			animated = true;
		}
	}
	else
	{
		if ( this.menu.properties.animated )
		{
			animated = this._selectedMenuItem == null;
		}
	}
	if ( this._timer )
	{
		clearTimeout(this._timer);
		this._timer = null;
	}
	if ( !item._submenu )
	{
		this.drawSubmenu(item).appendTo(this.menu.element);
		item._submenu.JSMultiColumnView('frame', new Size('100%',300)).width('99%');
	}		
	this._selectedMenuItem = item;
	item._menuItem.addClass('selected');
	item._submenu.show();
	var offset = {
		left: 0,
		top: this.menu.children.menuBar.outerHeight(),
		zIndex: 1000
	};
	if ( animated )
	{
		item._submenu.css({
			top: offset.top + 10
		});
		offset.opacity = 1;
		item._submenu.animate( offset, {
			duration: 300,
			easing: 'backOut'
		});
	}
	else
	{
		item._submenu.css(offset);		
	}
}

cls.prototype.hideSubmenu = function(item)
{
	if ( this._timer )
	{
		clearTimeout(this._timer);
		this._timer = null;
	}
	if ( this._selectedMenuItem )
	{
		this._selectedMenuItem._menuItem.removeClass('selected');
		this._selectedMenuItem._submenu.hide();
		this._selectedMenuItem = null;
	}
}

cls.prototype.hideSubmenuAfter = function(item, sec)
{
	var self = this;
	this._timer = setTimeout( function(){
		self.hideSubmenu();		
	}, sec || 300);		
}


// })(jQuery);
