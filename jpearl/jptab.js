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

function JPTabbar(element,props)
{
	JPView.call(this,element, $.extend(true,{
		data: null,
		icon:  undefined, // '&#x2603',
		fixed: true,
		showContextmenu: false,
		direction: 'horizontal',
		position: 'top',
		margin: 2,
		close: undefined
	}, props));
	this.element.addClass('tabbar ' + this.properties.direction + ' ' + this.properties.position);
	if ( this.properties.margin )
	{
		if ( this.properties.direction == 'horizontal' )
		{
			this.element.css({
				marginLeft: this.properties.margin,
				marginRight: this.properties.margin
			});
		}
		else
		{
			this.element.css({
				marginTop: this.properties.margin,
				marginBottom: this.properties.margin
			});
		}
	}

	this.children.container = this.element;
	var imgSrc = this.properties.data.icon || this.properties.icon;
	if ( imgSrc )
	{
		var icon = $('<div/>').addClass('icon').appendTo(this.children.container);
		if ( imgSrc.indexOf('.jpg') > 0 || imgSrc.indexOf('.png') > 0 )
		{
			$('<img/>', { src: imgSrc }).appendTo(icon);
		}
		else
		{
			icon.html( imgSrc );
		}
	}
	var txt = this.properties.data.title || this.properties.data.name;
	txt = txt.replace('/', '&#47' );
	var title = $('<div/>').addClass('title')
				.attr('title', txt)
				.html( txt ).appendTo(this.children.container);
	var self = this;
	if ( !this.properties.fixed && this.properties.close  )
	{
		var close = $('<div/>').addClass('close').appendTo(this.children.container);
		if ( this.properties.close.indexOf('.jpg') > 0
		   || this.properties.close.indexOf('.png') > 0 )
		{
			$('<img/>', { src: this.properties.icon }).appendTo(close);
		}
		else
		{
			close.html( this.properties.close );
		}

		close.click(function(e){
			self.element.trigger('tabbar.close');
			return false;
		});
	}

	this.children.container.bind('contextmenu', function(e){
		self.element.trigger('tabbar.contextmenu', self._getEventPosition(e) );
		return false;
	}).hover(function(){
		self.children.container.addClass('hover');	
	},function(){
		self.children.container.removeClass('hover');	
	});

	this.element.trigger('initiaized');
}

JPTabbar.prototype = new JPView();
$.plugin(JPTabbar);

function JPTab(element,props)
{
	var self = this;
	JPView.call(this,element,$.extend(true,{
		direction: 'horizontal',
		position: 'top',
		hasMore: true,
		fixed: true,
		tabbar: {
			icon: undefined,
			margin: 2,
			close: undefined
		}
	}, props));
	var tabs = this.element.children();
	this.element.empty();
	this.element.addClass('tab ' + this.properties.direction +  ' ' + this.properties.position);
	if ( this.properties.tabbar.margin == 0 )
	{
		this.element.addClass('nomargin');
	}
	this.children.tabbars = $('<div/>').addClass('tabbars').appendTo(this.element);
	if ( this.properties.hasMore )
	{
		this.children.more = $('<div/>').addClass('more')
					.click( function(e){
						self._showHiddenTabBarList();
						return false;
					});
	}
//	this.children.spare = $('<div/>').addClass('spare right').appendTo(this.element);
	this.children.buttonCloseAll = this.element.find('.closeall.button');
	if ( this.children.buttonCloseAll.length )
	{
		this.children.buttonCloseAll.appendTo(this.element).click(function(e){
										self.closeAll();										
									});
	}

	this._selectedIndex = -1;
	this._tabbars = [];

	if ( !this.properties.fixed && this.properties.showContextmenu )
	{
		this.children.contextmenu = $('<div/>').JPMenuView({
			direction: 'vertical',
			plugin: 'standard',
			data: [
				{ id:0, name: '닫기' },
				{ id:1, name: '다른탭 닫기'},
				{ id:2, name: '모든탭 닫기' },
				{ id:3, name: '왼쪽 모든탭 닫기' },
				{ id:4, name: '오른쪽 모든탭 닫기' },
			]
		}).addClass('contextmenu').bind('dismiss', function(e){
			self.element.find('.popup').removeClass('popup');
		}).bind('menu.itemClicked', function(e,item){
			var tabbar = $(this).data('item');
			var idx;
			switch( item.id )
			{
				case 0: // close it
					self.removeTabBar(tabbar,self.properties.animated);
					break;
				case 1: // close the others
					self.removeTabBarsExceptFor( [tabbar], self.properties.animated);
					break;
				case 2: // close all
					self.closeAll();
					break;
				case 3: // close left
					idx = self._tabbars.indexOf(tabbar);
					self.removeTabBarsExceptFor( self._tabbars.slice(idx), self.properties.animated);
					break;
				case 4: // close right
					idx = self._tabbars.indexOf(tabbar);
					self.removeTabBarsExceptFor( self._tabbars.slice(0,idx+1), self.properties.animated);
					break;
			}
		});
	}
	if ( this.properties.direction == 'horizontal' )
	{
		self._width = -1;
		NotificationCenter.addObserver( this, 'WindowResized', function(e){
			self._width = -1;
			self._layoutSubviews(true);
		});
	}
	if ( tabs.length > 0 )
	{
		tabs.each(function(){
			self.addTabBar({
				title: $(this).text()
			}, false, true);
		});	
	}
	this.element.trigger('initialized');
}

JPTab.prototype = new JPView();

$.plugin(JPTab);

JPTab.prototype.destroy = function()
{
	JPView.prototype.destroy.call(this);
	NotificationCenter.removeObserver( this );
}

JPTab.prototype.closeAll = function()
{
	this.removeTabBarsExceptFor( [], this.properties.animated);
	this.element.trigger('closeAll');
	this._selectedIndex = -1;
}

JPTab.prototype.frame = function(value)
{
	if ( this.properties.direction == 'vertical' )
	{
		return JPView.prototype.frame.apply(this,arguments);
	}
	if ( arguments.length )
	{
		if ( typeof arguments[0] == 'object' )
		{
			this._width = value.width || -1;
		}
		else 
		{
			this._width = arguments[2] || -1;	
		}	
		return JPView.prototype.frame.apply(this,arguments);
	}
	return JPView.prototype.frame.call(this);
}

JPTab.prototype._layoutSubviews = function(forcefully,firstItemAnimated)
{
	if ( this.properties.direction == 'vertical' || !this.properties.hasMore ) 
	{
		this.shownTabbars = this._tabbars.map( function(v){
			return v._tabbar;
		});
		return;
	}
	if ( this._width == -1 )
	{
		this._width = this.element.width();
	}
	var width = this._width - this.children.more.outerWidth() 
				- this.children.buttonCloseAll.width() 
				- 40;
//	this.children.spare.width('inherit');
	if ( !forcefully && this._lastWidth == width ) return;
	this._lastWidth = width;
	var i;
	var p;
	this.hiddenTabbars = [];
	this.shownTabbars = [];
	/*
	this._tabbars.forEach( function(v){
		v._tabbar.stop(false, true).css({ width:  '' } ).show();
	});
	*/
	this.children.more.detach();
	var cnt = 0;
	for ( i = 0 ; i < this._tabbars.length; i++ )
	{
		var tbar = this._tabbars[i]._tabbar;
		if ( !tbar ) continue;
		tbar.show();
		var right = tbar.position().left + tbar.width();
		if ( right > width )
		{
			var tbar = this._tabbars[i]._tabbar;
			tbar.hide();
			this.hiddenTabbars.push(this._tabbars[i]);
			cnt++;
		}
		else
		{
			this.shownTabbars.push(tbar);
		}
	}
	if ( cnt > 0 )
	{
		this.children.tabbars.append( this.children.more );
		this.children.more.html(cnt + '개');
	}
	if ( firstItemAnimated )
	{
		var self = this;
		var tab = self._tabbars[0]._tabbar;
		var tcon = tab.find('.container');
		var w = tcon.width();
		tcon.width(0).height(0);
		tcon.animate({
			width: w
		},{
			duration: 200
		}).animate({
			height: '100%'
		},{
			duration: 200
		});
	}
}

JPTab.prototype.addTabBar = function(item, animated, append, noSelection )
{
	this._stopEffectOnSelectedItem();
	$.js.popup.hide();

	var idx = this._tabbars.indexOf(item);
	if ( idx >= 0 )
	{
		if ( this._tabbars[idx]._tabbar.is(':visible') )
		{
			this.selectedIndex(idx);
		}
		else
		{
			this.unshiftTabBar(item);
		}
		return;
	}
	this.hiddenTabbars = [];
	this.shownTabbars = [];

	var self = this;
	var tbar = $('<div/>').JPTabbar({
					data: item,
					fixed: this.properties.fixed,
					direction: this.properties.direction,
					position: this.properties.position,
					icon: this.properties.tabbar.icon,
					margin: this.properties.tabbar.margin,
					close: this.properties.tabbar.close
				}).mouseclick(function(e){
					var idx = self._tabbars.indexOf(item);
					self.selectedIndex(idx);
				}).data('item', item)
				.bind('tabbar.close',function(e){
					var idx = self._tabbars.indexOf(item);
					$(this).stop(false,true);
					self.removeTabBarAt(idx, self.properties.animated);
					return false;
				});
	var dragTabbar = new JPDrag(tbar, {
		verticalEnabled: false,
		copy: true
	});
	tbar.bind('dragStart', function(e, p, target){
		tbar.width( tbar.width() ).height( tbar.height() );
		tbar.children().hide();
		target.css({
			display:'inline-block', 
			zIndex: 1
		});
		tbar.addClass('dragging');
	}).bind('dragging', function(e, ptr, delta, position){
		var loc = position.left;
		if ( delta.left > 0 )
		{	
			var pos, t, i;
			var pos = tbar.position();
			pos.right = pos.left + tbar.width();
			pos.left += tbar.width()/3;
			if ( pos.left < loc && loc < pos.right )
			{
				pos.left = loc + tbar.width();
				for( var i = 0 ; i < self.shownTabbars.length; i++ )
				{
					t = self.shownTabbars[i];
					if ( tbar == t ) continue;
					var p = t.position();					
					p.right = p.left + t.width();
					if ( p.left <= pos.left && pos.left <= p.right  )
					{
						tbar.insertAfter( t );
						break;
					}
				}
			}
		}
		else if ( delta.left < 0 )
		{
			for( var i = 0 ; i < self.shownTabbars.length; i++ )
			{
				var t = self.shownTabbars[i];
				if ( tbar == t ) continue;
				var pos = t.position();
				pos.right = pos.left + t.width()/3 * 2;
				if ( pos.left < loc && loc < pos.right )
				{
					tbar.insertBefore(t);
					break;
				}		
			}
		}
	}).bind('dragDone', function(e) {
		tbar.children().show();
		tbar.removeClass('dragging');
		tbar.css({
			width: '',
			height: ''	
		});
		self.shownTabbars = self.shownTabbars.sort( function(arg1,arg2){
			return arg1.position().left - arg2.position().left;
		});
	});

	if ( !append )
	{
		tbar.prependTo(this.children.tabbars)
		this._tabbars.unshift(item);
	}
	else
	{
		tbar.appendTo(this.children.tabbars)
		this._tabbars.push(item);
	}
				
	if ( this.properties.showContextmenu )
	{	
		tbar.bind('tabbar.contextmenu', function(e, x, y){
			var offset = tbar.offset();
			var pos = {
				left: x + 5 + offset.left,
				top: y + 5 + self.element.offset().top
			};
			self.children.contextmenu.css(pos);
			self.children.contextmenu.data('item', item);
			var idx = self._tabbars.indexOf(item);
			self.children.contextmenu.JPMenuView('allItemsEnabled');
			if ( self._tabbars.length == 1 )
			{
				self.children.contextmenu.JPMenuView('itemDisabledAt', [1,3,4] );
			}
			else if ( idx == 0 )
			{
				self.children.contextmenu.JPMenuView('itemDisabledAt', 3 );
			}
			else if (idx == self._tabbars.length -1 )
			{
				self.children.contextmenu.JPMenuView('itemDisabledAt', 4 );
			}
			$.js.popup.show( self.children.contextmenu );
			item._tabbar.addClass('popup');
		});
	}
	item._tabbar = tbar;
	this._layoutSubviews(true, animated);
	this.children.tabbars.find('.selected').removeClass('selected');
	if ( !noSelection )
	{
		this.selectedIndex(0);
	}
}

JPTab.prototype.removeTabBar = function(item, animated)
{
	this.removeTabBarAt( this._tabbars.indexOf(item), animated );
}

JPTab.prototype.removeTabBarsExceptFor = function(itemsExcluded, animated)
{
	var self = this;
	itemsExcluded.forEach( function(v){
		v._tabbar.addClass('remain');
	});
	var tlist = self.children.tabbars.find('.tabbar').not('.remain');
	if ( animated )
	{
		var cnt = 0;
		tlist.animate({
			height: 0
		},{
			duration: 300,
			complete: function(){
				cnt++;
				var item = $(this).data('item');
				self.element.trigger('close', [item]);
				$(this).remove();
				delete item._tabbar;
				if ( cnt == tlist.length )
				{
					self._tabbars = itemsExcluded;
					self.selectedIndex(0);
					self.children.tabbars.find('.tabbar').removeClass('remain');
					self._layoutSubviews();
				}
			}
		});	
	}
	else
	{
		tlist.each( function(idx,v){
			var item = $(v).data('item');
			self.element.trigger('close', [item]);
			item._tabbar.remove();
			delete item._tabbar;
		});
		self._tabbars = itemsExcluded;
		self.selectedIndex(0);
		self.children.tabbars.children().removeClass('remain');
		self._layoutSubviews();
	}
	if ( this._tabbars.length == 0 )
	{
		this.element.trigger('closeAll');
	}
}

JPTab.prototype.removeTabBarAt = function(idx, animated)
{
	$.js.popup.hide();
	var self = this;
	var item = this._tabbars[idx];
	this._tabbars.splice(idx,1);
	if ( this._tabbars.length == 0 )
	{
		this.element.trigger('closeAll');
		return;
	}
	animated = false;
	if ( animated )
	{
		item._tabbar.animate({
			height: 0
		},{
			duration: 200,
			easing: 'pow2In'
		}).animate({
			width: 0
		},{
			duration: 100,
			easing: 'pow2Out',
			complete: function(){
				self.element.trigger('close', [item]);
				item._tabbar.remove();
				delete item._tabbar;
				if ( self._selectedIndex == idx )
				{
					idx = Math.min( idx, self._tabbars.length-1);
					self.selectedIndex( idx );
				}
				self._layoutSubviews(true);
			}
		});
	}
	else
	{
		self.element.trigger('close', [item]);
		item._tabbar.remove();
		delete item._tabbar;
		this.selectedIndex( Math.min( idx, this._tabbars.length-1) );
		self._layoutSubviews(true);
	}
}

JPTab.prototype.selectedIndex = function(idx)
{
	if ( arguments.length )
	{
		this.children.tabbars.find('.tabbar.selected').removeClass('selected').stop(false, true);
		if ( idx < this._tabbars.length )
		{
			if ( idx >= 0 )
			{
				this._selectedIndex = idx;			
				this._tabbars[this._selectedIndex]._tabbar.addClass('selected');
			}
			this.element.trigger('selectionChanged', [idx, this._tabbars[idx]]);
		}
		else
		{
			this._selectedIndex = -1;
		}
		return;
	}
	return this._selectedIndex;
}

JPTab.prototype.tabbars = function()
{
	return this._tabbars;
}

JPTab.prototype._showHiddenTabBarList = function()
{
	if ( this.properties.popover.is(":visible") ) return;
	var self = this;
	if ( this.children.hiddenList )
	{
		this.children.hiddenList.empty();
		delete this.children.hiddenList;
	}
	this.children.hiddenList = $('<div/>').JPListView({
		plugin: 'detail',
		pluginOptions: {
			style: 'div',
		}
	}).bind('listview.itemClicked', function(e, item, view){
		$.js.popup.hide(true);
		self.unshiftTabBar(item,view);
	}).addClass('tab');
	this.children.hiddenList.JPListView('items',  this.hiddenTabbars.sort() );
	this.properties.popover.JPPopoverContainer('contentView',
		this.children.hiddenList, 
		this.children.more,
		JPPopoverContainer.ArrowDirection.Top
	);
}

JPTab.prototype.unshiftTabBar = function(item)
{
	this._stopEffectOnSelectedItem();
	var idx = this._tabbars.indexOf(item);
	this._tabbars.splice( idx, 1 );
	this.children.tabbars.prepend( item._tabbar );
	this._tabbars.unshift(item);
	this._layoutSubviews(true,true);
	this.children.tabbars.find('.selected').removeClass('selected');
	this.selectedIndex(0);
}

JPTab.prototype.prependTabBar = function(item,animated)
{
	this.addTabBar(item,animated,false);
}

JPTab.prototype._stopEffectOnSelectedItem = function()
{
	if ( this._selectedIndex == -1 || this._tabbars.length == 0 ) return;
	var item = this._tabbars[this._selectedIndex]._tabbar;
	item.find('.container').stop(false, true);
	item.stop(false,true);
}

function JPFixedTab(element,props)
{
	JPView.call(this,element,$.extend({
		tabbody : element,
		tabchange: true
	}, props));
	this.element.addClass('fixedtab');
	var self = this;
	if ( typeof this.properties.tabbody == 'string') {
		this.properties.tabbody = $(this.properties.tabbody, this.element);
	} else if ( !this.properties.tabbody ) {
		this.properties.tabbody = this.element.children('.container');
	}
	$('.tabbars .tabbar', this.element).click(function(e){
		var isChagned = !$(this).hasClass('selected'); 
		if( self.properties.tabchange ) {
			self.selectedTab($(this).data('tab'));
		}
		if ( isChagned  ) {
			self.element.trigger('tabChanged', [ $(this).data('tab'), self.selectedTabBody() ]);
		}
		self.element.trigger('tabClicked', [ $(this).data('tab'), self.selectedTabBody() ]);
	});
}

JPFixedTab.prototype = new JPView();
$.plugin(JPFixedTab);

JPFixedTab.prototype.selectedTab = function(tab)
{
	if ( tab ) {
		var selectedTab = $('.tabbars .tabbar.selected', this.element);
		if ( selectedTab ) {
			if ( selectedTab.data('tab') == tab ) return;
			selectedTab.removeClass('selected');
		}
		var currentTab = $('.tabbars .tabbar[data-tab="%s"]'.sprintf(tab), this.element);
		var tview = $('.tabbody.selected', this.properties.tabbody);
		if ( tview.length == 1 ) {
			tview.removeClass('selected');
			var tInst = tview.instance();
			if ( tInst != null && tInst instanceof JPViewController ) {
				tInst.viewWillDisappear();
			}
		}
		currentTab.addClass('selected');
		$('.tabbody.selected', this.properties.tabbody).removeClass('selected');
		tview = $('.tabbody[data-tab="%s"]'.sprintf(tab) , this.properties.tabbody);
		if ( tview.length == 1 ) {
			tview.addClass('selected');
			var tInst = tview.instance();
			if ( tInst instanceof JPViewController ) {
				tInst.url( tInst.element.data('url') );
				tInst.viewWillAppear();
			}
		}		
		return;
	} 
	return $('.tabbars .tabbar.selected', this.element).data('tab');
}

JPFixedTab.prototype.selectedTabBody = function()
{
	var tab = this.selectedTab();
	return $('.tabbody[data-tab="%s"]'.sprintf(tab) , this.properties.tabbody);
}
