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

function JPScrollBar(element,props)
{
	JPView.call(this, element, $.extend(true,{
		direction: JPScrollBar.Direction.Vertical
	},props));
	this.element.addClass('scrollbar ' + this.properties.direction);
	this.children.indicator = $('<div/>').appendTo(this.element)
								.addClass('indicator');
	this.children.indicator.click( function(e) {
		return false;
	});
	var self = this;
	this.element.click( function(e){
		var off = self.children.indicator.position();
		if ( self.properties.direction == JPScrollBar.Direction.Vertical )
		{
			if ( e.offsetY < off.top )
			{
				self.element.trigger('pageDown');
		   	}
			else
			{
				self.element.trigger('pageUp');
			}
		}
		else
		{
			if ( e.offsetX < off.left )
			{
				self.element.trigger('pageDown');
		   	}
			else
			{
				self.element.trigger('pageUp');
			}
		}
		return false;
	});
	this._drag = new JPDrag( this.children.indicator, {
		horizontalEnabled: self.properties.direction == JPScrollBar.Direction.Horizontal,
		verticalEnabled: self.properties.direction == JPScrollBar.Direction.Vertical,
	});
	this.children.indicator.bind('dragging', function(e,ptr,delta,position){
		var v = 0;
		if ( self.properties.direction == JPScrollBar.Direction.Horizontal )
		{
			v = position.left / self._viewSize * self._contentSize;
		}
		else
		{
			v = position.top / self._viewSize * self._contentSize;
		}
		self.element.trigger('dragging', [v]);
		return false;
	});
}

JPScrollBar.Direction = {
	Horizontal: 'horizontal',
	Vertical: 'vertical'	
};

Object.freeze( JPScrollBar.Direction );

JPScrollBar.prototype = new JPView();
$.plugin(JPScrollBar);

JPScrollBar.prototype.sizes = function()
{
	return {
		contentSize: this._contentSize,
		viewSize: this._viewSize,
		pageSize: this._pageSize
	};
}

JPScrollBar.prototype.contentOffset = function(v,bounce)
{
	if ( arguments.length )
	{
		this._contentOffset = arguments[0];
		var p;
		var css = {};
		var page = this._pageSize;
		var max = this._viewSize - ( bounce ? 10 : this._pageSize );
		p = Math.max(0, Math.min( max,
				 this._contentOffset / this._contentSize * this._viewSize) );
		if ( bounce )
		{
			if ( v < 0 )
			{
				page = Math.max( 10, this._pageSize + v );	
			}
			else if ( v > this._contentSize - this._viewSize )
			{
				v -= this._contentSize - this._viewSize;
				page = Math.max(10, this._pageSize - v);
				p = this._viewSize - page;
			}
		}
		if( this.properties.direction == JPScrollBar.Direction.Horizontal )
		{
			css.left = p;
			css.width = page;
		}
		else
		{
			css.top = p;
			css.height = page;
		}
		this.children.indicator.css(css);
		return;
	}
	return this._contentOffset;
}

JPScrollBar.prototype.contentSize = function()
{
	if ( arguments.length )
	{
		this._viewSize = this.properties.direction == JPScrollBar.Direction.Horizontal
		   			? this.element.width() : this.element.height();
		this._contentSize = arguments[0];
		this._pageSize = this._viewSize / this._contentSize * this._viewSize;
		return;		
	}
	return this._contentSize;
}


function JPScrollView(element,props)
{
	if ( !arguments.length ) return;
	JPView.call( this, element, $.extend(true,{
		horizontalScrollEnabled: true,
		verticalScrollEnabled: true,
		showHorizontalScrollIndicator: true,	
		showVerticalScrollIndicator: true,	
		horizontalMousewheel: false,
		pagingEnabled: false,
		velocityCoeff: 0.9,
		mouseWheelMultiply: 3,
		draggable: true,
		mousewheelStopPropagation: true
	},props));
	var self = this;
	this.element.addClass('scroll');
	this._contentOffset = new Point(0,0);
	this._contentSize = new Size(0,0);
	var container;
	if ( this.element.children().length > 1 )
	{
		container = this.element.children('.container');
	}
	else if ( this.element.children().length == 1 ) {
		container = this.element.children().eq(0);
	}
	else
	{
		container = $('<div/>').addClass('container').appendTo(this.element);
	}
	this.children = {
		child: container,
		horizontalScrollIndicator: 
					$('<div/>').JPScrollBar({
						direction: JPScrollBar.Direction.Horizontal
					}).appendTo(this.element),
		verticalScrollIndicator:
					$('<div/>').JPScrollBar({
						direction: JPScrollBar.Direction.Vertical
					}).appendTo(this.element)
	};
	if ( !this.properties.showHorizontalScrollIndicator )
	{
		this.children.horizontalScrollIndicator.hide();
	}
	else
	{
		this.children.horizontalScrollIndicator.bind('pageUp', function(e){
			self.pageUp(true,false);
			self.element.trigger('offsetChanged', self._contentOffset);
			return false;
		}).bind('pageDown', function(e){
			self.pageDown(true,false);
			self.element.trigger('offsetChanged', self._contentOffset);
			return false;
		}).bind('dragging', function(e,v){
			self.contentOffset( v, self._contentOffset.y );
			self.element.trigger('offsetChanged', self._contentOffset);
			return false;
		});
	}
	if ( !this.properties.showVerticalScrollIndicator )
	{
		this.children.verticalScrollIndicator.hide();
	}
	else
	{
		this.children.verticalScrollIndicator.bind('pageUp', function(e){
			self.pageUp(false,true);
			self.element.trigger('offsetChanged', self._contentOffset);
			return false;
		}).bind('pageDown', function(e){
			self.pageDown(false,true);
			self.element.trigger('offsetChanged', self._contentOffset);
			return false;
		}).bind('dragging', function(e,v){
			self.contentOffset( self._contentOffset.x, v);
			self.element.trigger('offsetChanged', self._contentOffset);
			return false;
		});
	}
	this.element.mousewheel(function(e){
		var mul = self.properties.mouseWheelMultiply;
		var deltaY = e.deltaY;
		var deltaX = e.deltaX;
		deltaY = isNaN(deltaY) ? 0 : deltaY;
		deltaX = isNaN(deltaX) ? 0 : deltaX;
		var pos = {
			x: self._contentOffset.x,
			y: self._contentOffset.y
		};
		if ( ( self.properties.horizontalMousewheel || self.properties.pagingEnabled ) 
			&& self.properties.horizontalScrollEnabled )
		{
			var delta = deltaX != 0 ? -deltaX : deltaY;
			if ( self.properties.pagingEnabled )
			{
				if ( self._ismoving ) return false;
				if ( e.deltaFactor >= 100 )
				{
					self._paging({ x: delta, y:0}, true);
				}
				else 
				{
					self._moveBy(-delta/e.deltaFactor * mul, 0);
					if ( self._wheelTimer )
					{
						clearTimeout( self._wheelTimer );
						delete self._wheelTimer;
					}
					self._wheelTimer = setTimeout(function(){
						self._paging({ x: delta, y:0} );
						delete self._wheelTimer;
					},100);
				}
				return false;
			}
			self._moveBy(-delta*mul, 0);
			self.element.trigger('offsetChanged', self._contentOffset);
			if ( pos.x == self._contentOffset.x )
			{
				return !self.properties.mousewheelStopPropagation;
			}
			return false;
		}
		else if ( (deltaX != 0 || deltaY != 0) && (self.properties.horizontalScrollEnabled || self.properties.verticalScrollEnabled ))
		{
			if ( self.properties.pagingEnabled )
			{
				if ( self._ismoving ) return;
				self._moveBy( deltaX*mul, -deltaY*mul);
				self._paging({ x: deltaX, y: deltaY}, true);
				return false;
			}
			self._moveBy( deltaX*mul, -deltaY*mul);
			self.element.trigger('offsetChanged', self._contentOffset);
			if (  pos.x == self._contentOffset.x &&  pos.y == self._contentOffset.y )
			{
				return !self.properties.mousewheelStopPropagation;
			}
			return false;
		}
	});
	if ( this.properties.draggable )
	{	
		this._drag = new JPDrag( this.element, {
			binding: false  
		});		
		var lastTime;
		var dragging = false;
		var draggingPos;	
		this._timer = undefined;

		this.children.child.mouseup(function(e){
			if ( $.js.dragObject ) {
				$.js.dragObject.dragDone(e.clientX,e.clientY, e);
				delete $.js.dragObject;
				return !dragging;
			}
		});

		this.element.bind('dragStart', function(e,ptr,obj){
			lastTime = Date.now();
			draggingPos = ptr;
			return false;
		}).bind('dragging', function(e,ptr,delta,position){
			dragging = true;
			var mul = self.properties.mouseWheelMultiply;
			self._stopKineticScroll();
			self._moveBy( -delta.x * mul, -delta.y * mul , true);		
			self.element.trigger('offsetChanged', self._contentOffset);
			return false;
		}).bind('dragDone', function(e,ptr,delta,position,lastDelta){
			if ( !dragging || !delta || !self.properties.draggable || !draggingPos || !ptr ) return;
			if( self.properties.pagingEnabled )
			{
				self._paging(delta);
				return false;
			}
			var sec = (Date.now() - lastTime)/1000;
			if ( sec > 0.5 ) {
				self._checkBounce();
				return;
			}
			var diff = Math.max(10, sec);
			var lastVelocity = {
					x: (draggingPos.x - ptr.x)/diff,
					y: (draggingPos.y - ptr.y)/diff 
			};
			if ( !self.properties.horizontalScrollEnabled )
			{
				lastVelocity.x = 0;		
			}
			if ( !self.properties.verticalScrollEnabled )
			{
				lastVelocity.y = 0;
			}
			self._kineticScroll(lastVelocity);	
			dragging = false;
			return false;
		}).mouseleave(function(e){
			if ( !self.properties.draggable ) return;
			$(this).trigger('dragDone',e.clientX,e.clientY, e);
		});
	}
	this._animate = new Animation();
	setTimeout(function(){
		self.measureContentSize();
	},0);
}

JPScrollView.prototype = new JPView();
$.plugin(JPScrollView);

JPScrollView.prototype.frame = function()
{
	JPView.prototype.frame.apply(this, arguments);
	this.contentSize(this._contentSize.width, this._contentSize.height);
	this.contentOffset(this._contentOffset.x, this._contentOffset.y);
}

JPScrollView.prototype._stopKineticScroll = function()
{
	this._animate.stop();
}

JPScrollView.prototype._paging = function(delta,ignoreThreshold)
{
	var self = this;
	var percent;
	var size;
	var dir = 0;
	var page = 0;
	var originalPage = 0;
	if ( self.properties.horizontalScrollEnabled && delta.x != 0 )
	{
		var w = this._sizes.horizontal.contentSize - this._sizes.horizontal.viewSize;
		if ( this._contentOffset.x < 0 || self._contentOffset.x > w )
		{
			self._checkBounce();
			return false;
		}
		size = self.element.width();
		dir = delta.x < 0 ? 1 : -1;
		if ( ignoreThreshold )
		{
			percent = dir == 1 ? 0.25 : 0.75;
		}
		else
		{
			percent = (self._contentOffset.x % size) / size;
		}
		page = self._contentOffset.x/size;
	}
	else if ( self.properties.verticalScrollEnabled && delta.y != 0 )
	{
		var h = this._sizes.vertical.contentSize - this._sizes.vertical.viewSize;
		if ( this._contentOffset.y < 0 || this._contentOffset.y > h )
		{
			self._checkBounce();
			return false;
		}
		size = self.element.height();
		dir = delta.y < 0 ? 1 : -1;
		if ( ignoreThreshold )
		{
			percent = dir == 1 ? 0.25 : 0.75;
		}
		else
		{
			percent = (self._contentOffset.y % size) / size;
		}
		page = self._contentOffset.y/size;
	}
	if ( dir == -1 )
	{
		originalPage = page = Math.ceil(page);
		if ( ignoreThreshold )
		{
			page = (page-1)*size;
		}
		else
		{
			page = (percent > 0.75 ? page : (page-1)) * size;
		}
	}
	else if ( dir == 1 )
	{
		originalPage = page = Math.floor(page);
		if ( ignoreThreshold )
		{
			page = (page+1)*size;
		}
		else
		{
			page = (percent < 0.25 ? page : (page+1)) * size;
		}
	}
	if ( self.properties.horizontalScrollEnabled && delta.x != 0 )
	{
		self.contentOffset(page,0, true, Math.abs(this._contentOffset.x - page)/size  * 300);
	}
	else if ( self.properties.verticalScrollEnabled && delta.y != 0 )
	{
		self.contentOffset(0,page,true, Math.abs(this._contentOffset.y - page)/size * 300);
	}
	self.element.trigger('pageChanged', [page, originalPage]);
	return false;
}

JPScrollView.prototype.contentSize = function(width,height)
{
	if ( arguments.length )
	{
		this._contentSize = new Size(width,height);
		this._sizes = { };
		this._bounceRange = {};
		if ( this.properties.showHorizontalScrollIndicator )
		{
			if ( this.element.width() >= width )
			{
				this.element.removeClass('horizontal');
				this.children.horizontalScrollIndicator.hide();
				this._bounceRange.x = [ 0, 0 ];
			}
			else
			{
				this.element.addClass('horizontal');
				this.children.horizontalScrollIndicator.show();
				this.children.horizontalScrollIndicator.JPScrollBar('contentSize', width );
				this._sizes.horizontal = this.children.horizontalScrollIndicator.JPScrollBar('sizes');
				var hpad = this._sizes.horizontal.viewSize*2/3;
				this._bounceRange.x = [ -hpad, 
					this._sizes.horizontal.contentSize - this._sizes.horizontal.viewSize + hpad];
			}
		}
		else
		{
			this._bounceRange.x = [ 0, 0 ];
		}
		if ( this.properties.showVerticalScrollIndicator )
		{
			if ( this.element.height() >= height )
			{
				this.element.removeClass('vertical');
				this.children.verticalScrollIndicator.hide();
				this._bounceRange.y = [ 0, 0 ];
			}
			else
			{
				this.element.addClass('vertical');
				this.children.verticalScrollIndicator.show();
				this.children.verticalScrollIndicator.JPScrollBar('contentSize', height );
				this._sizes.vertical = this.children.verticalScrollIndicator.JPScrollBar('sizes');
				var vpad = this._sizes.vertical.viewSize*2/3;
				this._bounceRange.y = [ -vpad, 
					this._sizes.vertical.contentSize - this._sizes.vertical.viewSize + vpad];
			}
		}
		else
		{
			this._bounceRange.y = [ 0, 0 ];
		}
		this.properties.verticalScrollEnabled = this._contentSize.height > this.element.height(),
		this.properties.horizontalScrollEnabled = this._contentSize.width > this.element.width()
		this._layoutSubviews();
		this.contentOffset(this._contentOffset.x, this._contentOffset.y, false);

		if ( this.properties.pagingEnabled )
		{
			this.children.horizontalScrollIndicator.hide();
			this.children.verticalScrollIndicator.hide();
		}
		return;
	}
	return this._contentSize;
}


JPScrollView.prototype.measureContentSize = function()
{
	this.contentSize( this.children.child.width(), this.children.child.height() );
}


JPScrollView.prototype.contentOffset = function(x,y,animated,duration)
{
	if ( arguments.length )
	{
		this._stopKineticScroll();
		if( animated )
		{
			var self = this;
			this._ismoving = true;
			var vsize = this._sizes.vertical || { viewSize: this._contentSize.height };
			var hsize = this._sizes.horizontal || { viewSize: this._contentSize.width };
			x = Math.min( Math.max(0, x), this._contentSize.width - (hsize.viewSize || this._contentSize.width) );
			y = Math.min( Math.max(0, y), this._contentSize.height - (vsize.viewSize || this._contentSize.height) );
			this.children.child.stop(true,false).animate({
				marginTop: this.properties.verticalScrollEnabled ? -y : undefined,
				marginLeft: this.properties.horizontalScrollEnabled ? -x : undefined
			},{
				duration: duration || 300,
				step: function(n,tween){
					if ( tween.prop == 'marginLeft' ) {
						self.children.horizontalScrollIndicator
							.JPScrollBar('contentOffset', -n, true);
					}
					else if ( tween.prop == 'marginTop' ) {
						self.children.verticalScrollIndicator
							.JPScrollBar('contentOffset', -n, true);
					}
				},
				complete: function(){
					self._contentOffset.x = parseInt(-self.children.child.css('marginLeft').replace('px', ''));
					self._contentOffset.y = parseInt(-self.children.child.css('marginTop').replace('px', ''));
					self._ismoving = false;
				}
			});
		}
		else
		{
			this._moveTo(x,y);
		}
		return;
	}
	return this._contentOffset;			
}

JPScrollView.prototype.pageUp = function(x,y,animated)
{
	this._stopKineticScroll();
	if ( x )
	{
		this.contentOffset( this._contentOffset.x + this._sizes.horizontal.viewSize, 
							this._contentOffset.y, animated ); 
	}	
	if ( y )
	{
		this.contentOffset( this._contentOffset.x, 
							this._contentOffset.y + this._sizes.vertical.viewSize,
							animated ); 
	}
}

JPScrollView.prototype.pageDown = function(x,y,animated)
{
	this._stopKineticScroll();
	if ( x )
	{
		this.contentOffset( this._contentOffset.x - this._sizes.horizontal.viewSize, 
							this._contentOffset.y, animated ); 
	}	
	if ( y )
	{
		this.contentOffset( this._contentOffset.x, 
							this._contentOffset.y - this._sizes.vertical.viewSize, 
							animated ); 
	}
}

JPScrollView.prototype._layoutSubviews = function()
{

}

JPScrollView.prototype._moveTo = function(x,y, bounce)
{
	var vsize = this._sizes.vertical || { viewSize: this._contentSize.height };
	var hsize = this._sizes.horizontal || { viewSize: this._contentSize.width };
	if ( bounce )
	{
		this._contentOffset.x = Math.max( this._bounceRange.x[0],
									Math.min( x, this._bounceRange.x[1]));
		this._contentOffset.y = Math.max( this._bounceRange.y[0],
									Math.min( y, this._bounceRange.y[1]));
	}
	else
	{
		this._contentOffset.y = Math.min( Math.max(0, y), this._contentSize.height - (vsize.viewSize || this._contentSize.height) );
		this._contentOffset.x = Math.min( Math.max(0, x), this._contentSize.width - (hsize.viewSize || this._contentSize.width) );
	}
	this.children.child.css({
		marginTop: this.properties.verticalScrollEnabled ? -this._contentOffset.y : undefined,
		marginLeft: this.properties.horizontalScrollEnabled ? -this._contentOffset.x : undefined
	});	
	if ( this.properties.showHorizontalScrollIndicator )
	{
		this.children.horizontalScrollIndicator
			.JPScrollBar('contentOffset', x, bounce);
	}
	if ( this.properties.showVerticalScrollIndicator )
	{
		this.children.verticalScrollIndicator
			.JPScrollBar('contentOffset', y, bounce);
	}
}

JPScrollView.prototype._moveBy = function(dx,dy, bounce)
{
	this._moveTo( this._contentOffset.x + dx, this._contentOffset.y + dy, bounce );
}

JPScrollView.prototype._kineticScroll = function(velocity)
{
	var self = this;
	var coeff = this.properties.velocityCoeff;
	this._animate.start(function(){
		if( Math.abs( velocity.x ) >= 2 || Math.abs( velocity.y ) >= 2 )
		{
			velocity.x *= coeff;
			velocity.y *= coeff;
			velocity.x = Math.abs(velocity.x) >= 1 ? velocity.x : 0;
			velocity.y = Math.abs(velocity.y) >= 1 ? velocity.y : 0;
			self._moveBy( velocity.x, velocity.y, true );
			if ( Math.abs(velocity.x) > 0 && 
				( self._contentOffset.x <= self._bounceRange.x[0]
				  || self._contentOffset.x >= self._bounceRange.x[1] ) )
			{
				velocity.x = 0;
			}
			if ( Math.abs(velocity.y) > 0 && 
				( self._contentOffset.y <= self._bounceRange.y[0]
				  || self._contentOffset.y >= self._bounceRange.y[1] ) )
			{
				velocity.y = 0;
			}
		}
		else
		{
			self._stopKineticScroll();
			self._checkBounce();
		}		
	});
}

JPScrollView.prototype._checkBounce = function()
{
	var self = this;
	var vsize = this._sizes.vertical || { viewSize: this._contentSize.height };
	var hsize = this._sizes.horizontal || { viewSize: this._contentSize.width };
	var targetX = self._contentOffset.x;
	var targetY = self._contentOffset.y;
	if ( self._contentOffset.x < 0 )
	{
		targetX = 0;
	}
	else if ( self._contentOffset.x > hsize.contentSize - hsize.viewSize )
	{
		targetX = hsize.contentSize - (hsize.viewSize || this._contentSize.width);
	}
	if ( self._contentOffset.y < 0 )
	{
		targetY = 0;
	}
	else if ( self._contentOffset.y > vsize.contentSize - vsize.viewSize )
	{
		targetY = vsize.contentSize - (vsize.viewSize || this._contentSize.height);
	}
	if ( targetX != self._contentOffset.x || targetY != self._contentOffset.y )
	{
		var roomX = self._contentOffset.x - targetX;
		var roomY = self._contentOffset.y - targetY;
		var duration = Math.max(Math.abs(roomX)/hsize.viewSize, 
								Math.abs(roomY)/vsize.viewSize) * 400;
		var startTime = Date.now();	
		var beginPoint = {
			x: self._contentOffset.x,
			y: self._contentOffset.y
		};
		this._animate.start( function(time){
			var p = (Date.now()- startTime)/duration;	
			if ( p >= 1 )
			{
				self._stopKineticScroll();
				self._moveTo(targetX, targetY, true);
			}
			else
			{
				self._moveTo( beginPoint.x - roomX * p, 
							  beginPoint.y - roomY * p, true);
			}
		});
	}
}
