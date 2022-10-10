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

function JPDrag(element, props)
{
	this.element = $(element);
	this.properties = $.extend( true, {
		threshold: 5,
		binding: true,
		enabled: true,
		horizontalEnabled: true,
		verticalEnabled: true,
		scrollView: undefined, // when target is attached to the scrollview, it should consider the scorll position to find current location.
		copy: undefined,
		dropZone: undefined,
		data: undefined
	}, props );
	var self = this;
	this.target = this.element;
	this.element.css({
		cursor: this.properties.cursor || 'default'
	})
	this.target.addClass('draggable');
	
	var mouseDownCb = function(e){
		if ( !self.properties.enabled ) return;
		if ( !(e.originalEvent instanceof TouchEvent) && e.which != 1 ) return;
		if ( $(e.target).hasClass('draggable') && e.target != e.currentTarget ) return true;
		var x, y;
		if ( e.originalEvent instanceof TouchEvent ) {
		    var touchLocation = e.targetTouches[0];
			x = touchLocation.pageX;
			y = touchLocation.pageY;				
		} else {
			x = e.clientX;
			y = e.clientY;
		}
		self.resetDrag(x, y);	
	}
	
	this.element.mousedown(mouseDownCb);
	
	if ( $.configure.isMobile ) {
		this.element.bind('touchstart', mouseDownCb);
	}
	
	if ( this.properties.binding )
	{
		this.element.bind('dragging', function(e,ptr,delta,position){
			self.target.css(position);
			if ( self._group )
			{
				var sleft = 0;
				var stop = 0;
				if ( self.properties.scrollView )
				{
					sleft = self.properties.scrollView.scrollLeft();	
					stop = self.properties.scrollView.scrollTop();	
				}
				self._group.forEach( function(v){
					var off = v.position();
					if ( self.properties.scrollView )
					{
						off.left += sleft;
						off.top += stop;
					}
					v.css({
						left: off.left + delta.x,
						top: off.top + delta.y
					});
				});
			}
			return false;
		}).bind('dragDone', function(e,ptr,delta,position,lastDelta){
			self.target.removeClass('dragging');
			return false;
		});
	}
}

JPDrag.prototype.destroy = function()
{
    this.target.removeClass('draggable');
	this.element.unbind('mousedown dragging dragDone dragStart');
}

JPDrag.prototype.enabled = function(value)
{
	if ( arguments.length )
	{
		this.properties.enabled = value;
		if ( !value )
		{
			$.js.dragObject = null;
			this._startPoint = null;
			this._lastPoint = null;
			this._isDragging = false;
		}
		return;
	}
	return this.properties.enabled;
}

JPDrag.prototype.group = function(value)
{
	this._group = value;
}

JPDrag.prototype.resetDrag = function(x,y)
{
	$.js.dragObject = this;
	this._startPoint = new Point( x,y );
	this._lastPoint = null;
	this._isDragging = false;
	if ( this.target )
	{
		this.target.removeClass('dragging');
	}
}

JPDrag.prototype.dragDone = function(x,y)
{
	if ( !this._lastPoint ) return;
	if ( x === undefined ) {
		x = this._lastPoint.x;
		y = this._lastPoint.y;
	}
	var ptr = new Point(x,y);
	var off = this.target.position();
	if ( this.properties.scrollView )
	{
		off.left += this.properties.scrollView.scrollLeft();	
		off.top += this.properties.scrollView.scrollTop();	
	}
	var delta = ptr['-'](this._lastPoint);
	var startDelta = ptr['-'](this._startPoint);
	var position = { left: off.left + delta.x, top: off.top + delta.y };
	this.target.removeClass('dragging copy');
	this.element.trigger('dragDone', [ ptr, startDelta, position, delta]);			
	this.element.removeClass('source');
	this._startPoint = null;	
	this._lastPoint = null;
	this._isDragging = false;
	if ( this.properties.copy )
	{
		this.target.remove();
		this.target = null;
	}
	return false;
}

JPDrag.prototype.dragging = function(x,y)
{
	if ( !this.properties.enabled ) return;
	var ptr = new Point(x,y);
	if ( !this._isDragging )
	{
		if ( this._startPoint.distance(ptr) > this.properties.threshold )
		{
			this._lastPoint = new Point( this._startPoint );
			this._isDragging = true;
			if ( this.properties.copy )
			{
				if ( typeof this.properties.copy == 'function' )
				{
					this.target = this.properties.copy(this.element);
				}
				else if ( this.properties.copy )
				{
					this.target = this.element.clone();
				}
				this.target.appendTo( this.element.parent() );
				var pos = this.element.position();
				if ( this.properties.scrollView )
				{
					pos.left += this.properties.scrollView.scrollLeft();	
					pos.top += this.properties.scrollView.scrollTop();	
				}
				this.target.css({
					position: 'absolute',
					left: pos.left,
					top: pos.top
				});
			}
			this.target.addClass('dragging copy');
			this.element.addClass('source');
			this.element.trigger( 'dragStart', [ptr, this.target]);
		}
		else
		{
			return;
		}
	}
	var off = this.target.position();
	if ( this.properties.scrollView )
	{
		off.left += this.properties.scrollView.scrollLeft();	
		off.top += this.properties.scrollView.scrollTop();	
	}
	var delta = ptr['-'](this._lastPoint);
	delta.x = this.properties.horizontalEnabled ? delta.x : 0;
	delta.y = this.properties.verticalEnabled ? delta.y : 0;
	var position = { left: off.left + delta.x, top: off.top + delta.y };
	this.element.trigger( 'dragging', [ptr,delta,position]);			
	this._lastPoint = ptr;
	return false;
}
