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

function JPPopoverContainer(element,props)
{
	JPView.call(this,element,$.extend(true,{
		arrowDirection: JPPopoverContainer.ArrowDirection.Top,
		borderWidth: 3,
		padding: 5,
		arrowWidth: 0,
		arrowHeight: 0,
		marginTop: 0,
		marginLeft: 0,
		deleteChildAfterDismiss: false,
		align: JPPopoverContainer.Align.Auto
	}, props));
	var self = this;
	this.element.addClass('popover').css({
		borderWidth: this.properties.borderWidth,
		padding: this.properties.padding
	});
	this.children = {};
	this.children.container = $('<div/>').addClass('container')
								.width('100%').height('100%')
								.appendTo(this.element);
	if ( this.properties.arrow ) {
		if ( this.properties.arrow ) {
			switch( typeof this.properties.arrow )
			{
				case 'function':
					this.children.arrow = this.properties.arrow();
					break;
				default:
					this.children.arrow = $(this.properties.arrow);
					break;
			}
			this.children.arrow.css({position:'absolute'}).appendTo(this.element);
		}
	}
	if ( this.properties.arrowDirection && !this.children.arrow ){
		this.children.arrow = $('<div/>').appendTo(this.element)
									.width( this.properties.arrowWidth )
									.height( this.properties.arrowHeight );
	}
	this.element.mousedown( function(e){
		if ( e.target.nodeName == 'INPUT' || e.target.nodeName == 'SELECT' ) {
			return true;
		}
		e.stopPropagation();
		return false;
	});
	this.element.mouseup(function(e){
		e.stopPropagation();
		return false;
	});
	
	this.element.bind('subviewLoaded', function(e){
		self.contentView( self._contentView, self.children.anchor , self.properties.arrowDirection );
	});

	this.element.trigger('initiaized');
}

JPPopoverContainer.ArrowDirection = {
	Top: 'arrowTop',
	Right: 'arrowRight',	
	Bottom: 'arrowBottom',
	Left: 'arrowLeft',
	Auto: 'auto',
	None: null
};

JPPopoverContainer.Align = {
	Auto: 0,
	Top: 1,
	Left: 2,
	Center: 4,
	Right: 8,
	Bottom: 16,
	Middle: 32
};

$.plugin(JPPopoverContainer);

Object.freeze( JPPopoverContainer.ArrowDirection );
Object.freeze( JPPopoverContainer.Align );

JPPopoverContainer.prototype = new JPView();

JPPopoverContainer.prototype._setPosition = function(target)
{
	if ( !this.properties.arrow && this.children.arrow ) {
		this.children.arrow.attr('class', '');
	}
	var padding = ( this.properties.borderWidth + this.properties.padding );
	var off = target.offset();					
	off.left -= this.properties.borderWidth;
	var width = this._maxWidth;
	var height = this._maxHeight;
	var eWidth = Math.max( this._contentView.width(), this.element.width() ) + padding * 2;
	var eHeight = Math.max( this._contentView.height(), this.element.height() ) +  padding * 2;
	
	var elementCSS = {};
	var arrowCSS = {};
	var arrowWidth = this.children.arrow ? (this.children.arrow.width() || this.properties.arrowWidth) : 0;
	var arrowHeight = this.children.arrow ? (this.children.arrow.height() || this.properties.arrowHeight) : 0;
	var scrollTop = $(window).scrollTop();
	var scrollLeft = $(window).scrollLeft();
	this.children.target = undefined;

	if ( !arrowHeight ){
		arrowHeight = arrowWidth;
	}
	var arrowDirection = JPPopoverContainer.ArrowDirection;
	var arrDir = this.properties.arrowDirection;
	if ( arrDir  == arrowDirection.Auto ) {
		var space = [
		    [ off.top - scrollTop, arrowDirection.Bottom ],
		    [ window.innerWidth - (off.left + eWidth - scrollLeft), arrowDirection.Left ],
		    [ window.innerHeight - (off.top + eHeight - scrollTop), arrowDirection.Top ],
		    [ off.left - scrollLeft, arrowDirection.Right ]
		];
		var mIdx = 0;
		for ( var i = 1 ; i < space.length; i++  )
		{
			if ( space[i][0] > space[mIdx][0] )
			{
				mIdx = i;
			}
		}
		arrDir = space[mIdx][1];
	}
	if ( !this.properties.arrow && this.children.arrow ) {
		this.children.arrow.addClass( arrDir );
	}
	switch( arrDir ) {
		case arrowDirection.Top:
			elementCSS.top = off.top + target.outerHeight();
			if ( !(this.properties.align & JPPopoverContainer.Align.Top) ) {
				elementCSS.top += arrowHeight;	
			}
			break;
		case arrowDirection.Bottom:
			elementCSS.top = off.top  - eHeight - arrowHeight;
			break;
		case arrowDirection.Left:
			elementCSS.left = off.left + target.outerWidth() + arrowWidth;
			break;
		case arrowDirection.Right:
			elementCSS.left = off.left - eWidth - arrowWidth/2;
			break;
		default:
			elementCSS.top = off.top + target.outerHeight();
			break;
	}
	if ( arrDir == arrowDirection.Top || arrDir == arrowDirection.Bottom ) {
		if ( this.properties.align == JPPopoverContainer.Align.Auto 
				|| (this.properties.align & JPPopoverContainer.Align.Center) )
		{
			elementCSS.left = off.left + target.outerWidth()/2 
			- ( this.properties.percent !== undefined ? 1-this.properties.percent : 0.5 ) * eWidth;
			if ( elementCSS.left + eWidth > width ) {
				elementCSS.left = width - eWidth;
				arrowCSS.left = Math.min( eWidth, off.left - elementCSS.left + target.outerWidth()/2 - padding*2);
			} else if ( elementCSS.left < arrowWidth ) {
				elementCSS.left = 10;
				arrowCSS.left = Math.max(0, off.left - elementCSS.left + target.outerWidth()/2 - padding*2);
			} else {
				arrowCSS.left = ( this.properties.percent !== undefined ? this.properties.percent : 0.5 ) 
								* eWidth - padding;
			}
			arrowCSS.left -= arrowWidth/2;
		}
		else if ( this.properties.align & JPPopoverContainer.Align.Left )
		{
			elementCSS.left = off.left + this.properties.marginLeft;
			arrowCSS.left = 0;
			elementCSS.top += this.properties.marginTop;
		}
		arrowCSS.top = '';
	}
	else {	
		if ( this.properties.align == JPPopoverContainer.Align.Auto 
			|| (this.properties.align & JPPopoverContainer.Align.Middle)  )
		{
			elementCSS.top = off.top + target.outerHeight()/2 
				- ( this.properties.percent !== undefined ? 1-this.properties.percent : 0.5 ) * eHeight;
			if ( elementCSS.top + eHeight > height ) {
				elementCSS.top = height - eHeight - padding;
				arrowCSS.top = Math.min( eHeight, off.top - elementCSS.top + target.outerHeight()/2 - padding);
			} else if ( elementCSS.top < arrowHeight ) {
				elementCSS.top = 10;
				arrowCSS.top = Math.max(0, off.top - elementCSS.top + target.outerHeight()/2 - padding*2);
			} else {
				arrowCSS.top = ( this.properties.percent !== undefined ? this.properties.percent : 0.5 ) 
								* eHeight - padding;
			}
			arrowCSS.top -= arrowHeight/2;
		}
		else if ( this.properties.align & JPPopoverContainer.Align.Top )
		{
			elementCSS.top = off.top + arrowHeight;
			arrowCSS.top = 0;
		}
		arrowCSS.left = '';
	}
	this.element.css(elementCSS);
	if ( this.children.arrow ) {
		this.children.arrow.css(arrowCSS);
	}
}

JPPopoverContainer.prototype.contentView = function(content,button,arrowDir)
{
	if( arguments.length )
	{
		var self = this;
		this.children.anchor = button;
		if ( this._contentView && !this.properties.deleteChildAfterDismiss ) {
			this._contentView.appendTo('body').hide();
		}
		if ( this.properties.width > 0 ) {
			this.element.width( this.properties.width  + this.properties.widthAdjust );	
		} else {
			this.element.width( $(content).width() + this.properties.padding*2 + this.properties.widthAdjust );
		}
		this._maxWidth =  $(window).width() + $(window).scrollLeft(); // Math.max( $(document).width(), $(window).width());
		this._maxHeight = $(window).height() + $(window).scrollTop(); // Math.max( $(document).height(), $(window).height());
		if ( typeof content == 'string' )
		{
			this._contentView = $(content);
		}
		else if ( this._contentView != content )
		{
			this._contentView = content;
			this.children.container.empty();
		}
		var inst = this._contentView.instance();
		if ( inst instanceof JPViewController ) {
			if ( inst.parentViewController() != this ) {
				inst.parentViewController(this);
			} else {
				inst.viewWillAppear(false);
			}
		}
		this.children.container.append(this._contentView);
		this._contentView.show();
		if ( arrowDir ) {
			this.properties.arrowDirection = arrowDir;
		}
		setTimeout(function(){
			self._setPosition(button);
		},0);
		this.element.data('object', this);
		this.element.show();
		$.js.popup.show( this, this.properties.animated );
		return;	
	}
	return this._contentView;
}

JPPopoverContainer.prototype.toggle = function(animated)
{
	if ( this.element.is(':visible') )
	{
		this.dismiss(animated);
	}
	else
	{
		this.appear(animated);
	}
}

JPPopoverContainer.prototype.appear = function(animated)
{
	JPView.prototype.appear.call(this,animated);			
	if ( animated )
	{
		this.element.stop();
		this.element.css({opacity: 0}).animate({
			opacity: 1
		},{
			duration: 400
		});
	}
	else
	{
		this.element.css({opacity: 1}).show();
	}
}

JPPopoverContainer.prototype.dismiss = function(animated)
{
	var self = this;	
	if ( !this._contentView ) {
		return;
	}
	var inst = this._contentView.instance();
	if ( inst instanceof JPViewController ) {
		inst.viewWillDisappear(false);
	}
	if ( animated ) 
	{
		this.element.css({opacity: 1}).animate({
			opacity: 0
		},{
			duration: 400,
			complete: function(){
				if ( self.properties.deleteChildAfterDismiss )
				{
					if ( this._contentView )
					{
						this._contentView.remove();
						delete this._contentView;
					}
				}
				else if ( this._contentView )
				{
					this._contentView.appendTo('body').hide();
				}
				JPView.prototype.dismiss.call(self,animated);	
			}
		});
	}
	else 
	{
		this.element.hide();
		if ( self.properties.deleteChildAfterDismiss )
		{
			if ( this._contentView )
			{
				this._contentView.remove();
				delete this._contentView;
			}
		}
		else if ( this._contentView )
		{
			this._contentView.appendTo('body').hide();
		}
		JPView.prototype.dismiss.call(self,animated);	
	}
	this.element.trigger('dismiss');
}
