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

function JPFullPageViewController(element,props)
{
	JPView.call(this, element, $.extend({
		translateDelay: 1000
	}, props));
	this.element.addClass('fullpage');
	this._layout = {view: this.element, selectedPage: 0, parent: undefined}; 
	this._build(this._layout);
	this._selectedLayout = this._layout;
//	this.translate(0,0,this._layout, this._layout);
	this._events();
	this._swipe = new JPSwipe('body');
	var self = this;
	$('body').bind('swipeLeft', function(){
		if ( !self.properties.enabled ) return;
		self.pageRight();		
	}).bind('swipeRight', function(){
		if ( !self.properties.enabled ) return;
		self.pageLeft();		
	}).bind('swipeTop', function(){
		if ( !self.properties.enabled ) return;
		self.pageUp();		
	}).bind('swipeDown', function(){
		if ( !self.properties.enabled ) return;
		self.pageDown();		
	});
}

JPFullPageViewController.prototype = new JPView();

$.plugin(JPFullPageViewController);

JPFullPageViewController.prototype._events = function()
{
	var self = this;
	$(window).keyup(function(e){
		switch( e.which )
		{
			case 38: // up
				self.pageUp();
				break;
			case 40: //down
				self.pageDown();
				break;
			case 37: // left
				self.pageLeft();
				break;
			case 39: // right
				self.pageRight();
				break;
		}
	});
	$(window).resize(function(){
		var w = window.innerWidth;
		var h = window.innerHeight;
		self.element.height(h).width(w);
		self.element.find('.page').width(w);
		self.element.find('.container.horizontal').each(function(){
			$(this).width( $(this).children().length * w).height(h);
		});
	});

	$(window).mousewheel(function(e){
		if ( !self.properties.enabled ) return;
		var absX = Math.abs(e.deltaX);
		var absY = Math.abs(e.deltaY);
		if ( e.deltaFactor == 1 )
		{
			if ( !self._blocking && ( absX == 1 || absY == 1 )  )
			{
				var fn;
				if ( absX > absY )
				{
					fn = e.deltaX > 0 ? 'pageRight' : 'pageLeft';
				}
				else
				{
					fn = e.deltaY < 0 ? 'pageDown' : 'pageUp';
				}
				self._blocking = true;
				self[fn]();	
				setTimeout(function(){
					self._blocking = false;
				},1000);
			}
		}
		else 
		{
			var fn;
			if ( absX > absY )
			{
				fn = e.deltaX < 0 ? 'pageRight' : 'pageLeft';
			}
			else
			{
				fn = e.deltaY < 0 ? 'pageDown' : 'pageUp';
			}
			self[fn]();	
		}
		e.preventDefault();
		return false;
	});
	$(window).trigger('resize');
}

JPFullPageViewController.prototype.numberOfPages = function()
{
	return this._selectedLayout.pages.length;
}

JPFullPageViewController.prototype.selectedPage = function(p,dir)
{
	if ( arguments.length )
	{
		dir = dir || 'vertical';
		if ( dir == 'horizontal' )
		{
			var layout = this._selectedLayout.orient == 'horizontal' ? this._selectedLayout : this._selectedLayout.parent;
			if ( layout && layout.orient == 'horizontal')
			{
				layout.selectedPage = p;
				this.translate(-layout.selectedPage * 100/layout.pages.length, 0, layout, layout);
			}
		}
		else
		{
			var layout = this._selectedLayout.orient == 'horizontal' ? this._selectedLayout.parent : this._selectedLayout;
			if ( layout && layout.orient == 'vertical' )
			{
				layout.selectedPage = p;
				this.translate( 0, -p * 100, layout, layout);
			}
		}
		return;
	}
	return this._selectedLayout.pages[ this._selectedLayout.selectedPage ];
}

JPFullPageViewController.prototype._build = function(container)
{
	var self = this;
	container.orient = container.view.hasClass('horizontal') ? 'horizontal' : 'vertical';
	container.pages = container.view.children().map(function(){
		if ( $(this).hasClass('container') )
		{
			return self._build({ view: $(this), selectedPage: 0, parent: container});
		}
		return { view: $(this) }
	});
	if ( container.orient == 'horizontal' )
	{
		var unitX = 1/container.pages.length * 100;
		container.pages.each( function(idx,obj){
			$(this.view).css({ left:  (idx * unitX) + '%', top: 0});
		});
	}
	else
	{
		container.pages.each( function(idx,obj){
			$(this.view).css({ top: (100*idx) + '%', left: 0});
		});
	}
	return container;
}

JPFullPageViewController.prototype.getSurroundPages = function(layout)
{
	var list = [ undefined, undefined, undefined, undefined ];	
	if ( layout.orient == 'horizontal' )
	{
		if ( layout.parent )
		{
			var playout = layout.parent;
			list[0] = playout.selectedPage > 0 ? playout.pages[playout.selectedPage-1] : undefined;
			list[2] = playout.selectedPage < (playout.selectedPage - 1) ? playout.pages[playout.selectedPage+1] : undefined;
		}
		list[1] = layout.selectedPage > (layout.selectedPage - 1) ? layout.pages[layout.selectedPage+1] : undefined;
		list[3] = layout.selectedPage > 0 ? layout.pages[layout.selectedPage-1] : undefined;
	}
	else
	{
		if ( layout.parent )
		{
			var playout = layout.parent;
			list[1] = playout.selectedPage < (playout.selectedPage - 1) ? playout.pages[playout.selectedPage+1] : undefined;
			list[3] = playout.selectedPage > 0 ? playout.pages[playout.selectedPage-1] : undefined;
		}
		list[0] = layout.selectedPage > 0 ? layout.pages[layout.selectedPage-1] : undefined;
		list[2] = layout.selectedPage > (layout.selectedPage - 1) ? layout.pages[layout.selectedPage+1] : undefined;
	}
	for( var i = 0 ; i < list.length; i++ )
	{
		if ( list[i] && list[i].pages )
		{
			list[i] = list[i].pages[list[i].selectedPage];
		}
	}
	return list;
}

JPFullPageViewController.prototype._translateView = function(view,x,y,target)
{
	view.instance().viewWillAppear();
	target.view.css({
		transform: 'translate(%f%,%d%)'.sprintf(x,y)
	});
	this._translateAppearTimer = setTimeout(function(){
		view.instance().viewDidAppear();
	},this.properties.translateDelay);
}

JPFullPageViewController.prototype.translate = function(x,y, layout, target)
{
	$(window).scrollTop(0);
	var self = this;
	var page = layout.pages[layout.selectedPage];		
	if ( page.pages ) {
		layout = page;
		page = layout.pages[layout.selectedPage];					
		this._selectedLayout = layout;
	}
	else 
	{
		this._selectedLayout = layout;
	}
	if ( this._selectedPage == page ) return;
	if ( this._selectedPage && this._selectedPage.view.instance() )
	{
		this._selectedPage.view.instance().viewWillDisappear();
	}
	this._selectedPage = page;
	if ( this._translateAppearTimer )
	{
		clearTimeout( this._translateAppearTimer );	
	}
	if ( !page.view.instance() )
	{
		$(page.view).JPViewController().bind('viewLoaded', function(){
			self._translateView(page.view,x,y,target)
		});
	}
	else
	{
		self._translateView(page.view,x,y,target);
	}
	this.getSurroundPages(this._selectedLayout).forEach(function(p){
		if ( p && !p.view.instance() )
		{
			$(p.view).JPViewController();
		}
	});
	this.element.trigger('pageChanged', [ this._selectedLayout] );
}

JPFullPageViewController.prototype.pageUp = function()
{
	var self = this;
	var layout = this._selectedLayout.orient == 'horizontal' ? this._selectedLayout.parent : this._selectedLayout;
	if ( layout && layout.orient == 'vertical' && layout.selectedPage > 0 )
	{
		layout.selectedPage--;
		this.translate(0, -layout.selectedPage * 100, layout, layout);
		try { localStorage._brainnowPage = layout.selectedPage; } catch(ex) { }
		/*
		$.url.open({
			page: layout.selectedPage
		},true);
		*/
	}
}

JPFullPageViewController.prototype.pageDown = function()
{
	var layout = this._selectedLayout.orient == 'horizontal' ? this._selectedLayout.parent : this._selectedLayout;
	if ( layout && layout.orient == 'vertical' && layout.selectedPage < layout.pages.length - 1 )
	{
		layout.selectedPage++;
		this.translate(0, -layout.selectedPage * 100, layout, layout);
		try { localStorage._brainnowPage = layout.selectedPage; } catch(ex) { }
		/*
		$.url.open({
			page: layout.selectedPage
		},true);
		*/
	}
}

JPFullPageViewController.prototype.pageLeft = function()
{
	var layout = this._selectedLayout.orient == 'horizontal' ? this._selectedLayout : this._selectedLayout.parent;
	if ( layout && layout.orient == 'horizontal' && layout.selectedPage >  0)
	{
		layout.selectedPage--;
		this.translate(-layout.selectedPage * 100/layout.pages.length, 0, layout, layout);
/*
		$.url.open({
			subpage: layout.selectedPage
		});
*/
	}
}

JPFullPageViewController.prototype.pageRight = function()
{
	var layout = this._selectedLayout.orient == 'horizontal' ? this._selectedLayout : this._selectedLayout.parent;
	if ( layout && layout.orient == 'horizontal' && layout.selectedPage < layout.pages.length - 1 )
	{
		layout.selectedPage++;
		this.translate(-layout.selectedPage * 100/layout.pages.length, 0, layout, layout);
/*
		$.url.open({
			subpage: layout.selectedPage
		});
*/
	}
}

